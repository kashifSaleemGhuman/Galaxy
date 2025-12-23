import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'

// GET /api/inventory/warehouses - Get all warehouses
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
  const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && status !== 'all' && { isActive: status === 'active' })
    }
    
    // Get warehouses with pagination
    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              inventoryItems: true,
              locations: true
            }
          }
        }
      }),
      prisma.warehouse.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const responseData = {
      warehouses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/inventory/warehouses - Create new warehouse
// Only SUPER_ADMIN can create warehouses
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = (currentUser.role || '').toUpperCase()
    if (userRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Only Super Admin can create warehouses' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    console.log('🔍 Debug: Request body:', body)
    
    const { name, code, address, isActive = true } = body 
    
    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Warehouse name and code are required' },
        { status: 400 }
      )
    }
    
    // Check for duplicate code
    const existingCode = await prisma.warehouse.findFirst({ where: { code } })
    if (existingCode) {
      return NextResponse.json(
        { error: 'Warehouse with this code already exists' },
        { status: 409 }
      )
    }
    
    console.log('🔍 Debug: About to create warehouse with data:', { name, code })
    
    // Create warehouse
    const warehouse = await prisma.warehouse.create({
      data: { name, code, address, isActive }
    })
    
    console.log('✅ Warehouse created successfully:', warehouse.id)
    
    return NextResponse.json({ 
      message: 'Warehouse created successfully',
      warehouse 
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating warehouse:', error)
    console.error('❌ Error stack:', error.stack)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Warehouse with this code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
