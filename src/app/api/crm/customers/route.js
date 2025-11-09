import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/crm/customers - Get all customers
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:get`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 100, 60) // 100 requests per minute
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset
        }, 
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const industry = searchParams.get('industry') || ''
    
    const skip = (page - 1) * limit
    
    // Build cache key based on filters
    const cacheKey = {
      tenantId: session.user.tenantId,
      page,
      limit,
      search,
      status,
      industry
    }
    
    // Try to get cached data first
    const cachedData = await crmCache.getCustomerList(session.user.tenantId, cacheKey)
    if (cachedData) {
      console.log('📦 Serving customers from cache')
      return NextResponse.json(cachedData)
    }
    
    // Build where clause
    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && status !== 'all' && { status }),
      ...(industry && industry !== 'all' && { industry })
    }
    
    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true
            }
          },
          creator: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const responseData = {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
    
    // Cache the response for 30 minutes
    await crmCache.setCustomerList(session.user.tenantId, cacheKey, responseData, 1800)
    console.log('💾 Cached customers data')
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/crm/customers - Create new customer
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Debug: Session object:', session)
    console.log('🔍 Debug: Session user:', session?.user)
    console.log('🔍 Debug: Session user ID:', session?.user?.id)
    console.log('🔍 Debug: Session tenant ID:', session?.user?.tenantId)
    
    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'No session found - please log in again' }, { status: 401 })
    }
    
    if (!session.user) {
      console.log('❌ No user in session')
      return NextResponse.json({ error: 'No user in session - please log in again' }, { status: 401 })
    }
    
    if (!session.user.id) {
      console.log('❌ No user ID in session')
      return NextResponse.json({ error: 'No user ID in session - please log in again' }, { status: 401 })
    }
    
    if (!session.user.tenantId) {
      console.log('❌ No tenant ID in session')
      return NextResponse.json({ error: 'No tenant ID in session - please log in again' }, { status: 401 })
    }
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:post`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 50, 60) // 50 requests per minute
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset
        }, 
        { status: 429 }
      )
    }
    
    const body = await request.json()
    console.log('🔍 Debug: Request body:', body)
    
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      website,
      industry,
      value,
      status = 'active',
      lastContact
    } = body
    
    // Validate required fields
    if (!companyName || !contactPerson || !email) {
      return NextResponse.json(
        { error: 'Company name, contact person, and email are required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Debug: About to create customer with data:', {
      tenantId: session.user.tenantId,
      companyName,
      contactPerson,
      email,
      createdBy: session.user.id
    })
    
    // Create customer
    const customer = await prisma.customer.create({
      data: {
        tenantId: session.user.tenantId,
        companyName,
        contactPerson,
        email,
        phone,
        address,
        website,
        industry,
        value: value ? parseFloat(value) : null,
        status,
        lastContact: lastContact ? new Date(lastContact) : null,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    console.log('✅ Customer created successfully:', customer.id)
    
    // Invalidate customer cache for this tenant
    await crmCache.invalidateCustomer(session.user.tenantId)
    console.log('🗑️ Invalidated customer cache after creation')
    
    return NextResponse.json({ 
      message: 'Customer created successfully',
      customer 
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating customer:', error)
    console.error('❌ Error stack:', error.stack)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
} 