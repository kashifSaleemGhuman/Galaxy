import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/crm/leads - Get all leads
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:leads:get`
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
    const source = searchParams.get('source') || ''
    
    const skip = (page - 1) * limit
    
    // Build cache key based on filters
    const cacheKey = {
      tenantId: session.user.tenantId,
      page,
      limit,
      search,
      status,
      source
    }
    
    // Try to get cached data first
    const cachedData = await crmCache.getCustomerList(session.user.tenantId, cacheKey)
    if (cachedData) {
      console.log('📦 Serving leads from cache')
      return NextResponse.json(cachedData)
    }
    
    // Build where clause
    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { customer: { companyName: { contains: search, mode: 'insensitive' } } }
        ]
      }),
      ...(status && { status }),
      ...(source && { source })
    }
    
    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              email: true
            }
          }
        }
      }),
      prisma.lead.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const responseData = {
      leads,
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
    console.log('💾 Cached leads data')
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/crm/leads - Create new lead
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:leads:post`
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
    const {
      title,
      description,
      value,
      source,
      status = 'new',
      customerId,
      assignedTo,
      priority = 'medium'
    } = body
    
    // Validate required fields
    if (!title || !source) {
      return NextResponse.json(
        { error: 'Title and source are required' },
        { status: 400 }
      )
    }
    
    // Create lead
    const lead = await prisma.lead.create({
      data: {
        tenantId: session.user.tenantId,
        title,
        description,
        value: value ? parseFloat(value) : null,
        source,
        status,
        customerId,
        assignedTo,
        priority,
        createdBy: session.user.id
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true
          }
        }
      }
    })
    
    // Invalidate leads cache for this tenant
    await crmCache.invalidateCustomer(session.user.tenantId)
    console.log('🗑️ Invalidated leads cache after creation')
    
    return NextResponse.json({ 
      message: 'Lead created successfully',
      lead 
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating lead:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Lead with this title already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 