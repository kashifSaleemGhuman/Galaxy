import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'

// GET /api/inventory/receipts - Get all goods receipts
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.INVENTORY.RECEIPT_READ)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
          { receiptId: { contains: search, mode: 'insensitive' } },
          { purchaseOrder: { poId: { contains: search, mode: 'insensitive' } } }
        ]
      }),
      ...(status && status !== 'all' && { status })
    }
    
    // Get receipts with pagination
    const [receipts, total] = await Promise.all([
      prisma.goodsReceipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateReceived: 'desc' },
        include: {
          purchaseOrder: {
            include: {
              supplier: {
                select: {
                  name: true,
                  email: true
                }
              },
              lines: {
                include: {
                  product: {
                    select: {
                      name: true,
                      sku: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.goodsReceipt.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const responseData = {
      receipts,
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
    console.error('Error fetching receipts:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/inventory/receipts - Create new goods receipt
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.INVENTORY.RECEIPT_CREATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const { poId, status = 'Draft', dateReceived } = body
    
    // Validate required fields
    if (!poId) {
      return NextResponse.json(
        { error: 'Purchase Order ID is required' },
        { status: 400 }
      )
    }
    
    // Check if PO exists
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { poId },
      include: {
        lines: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase Order not found' },
        { status: 404 }
      )
    }
    
    // Create goods receipt
    const receipt = await prisma.goodsReceipt.create({
      data: {
        receiptId: `GR-${Date.now()}`,
        poId,
        status,
        dateReceived: dateReceived ? new Date(dateReceived) : new Date()
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            lines: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })
    
    console.log('✅ Goods receipt created successfully:', receipt.receiptId)
    
    return NextResponse.json({ 
      message: 'Goods receipt created successfully',
      receipt 
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating goods receipt:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
