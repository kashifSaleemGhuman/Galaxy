import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// POST /api/crm/customers/search - Advanced search
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:search`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 100, 60)
    
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
      query = '',
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      includeStats = false
    } = body

    const skip = (page - 1) * limit

    // Build where clause (tenantId removed - single tenant mode)
    const where = {}

    // Text search across multiple fields
    if (query) {
      where.OR = [
        { companyName: { contains: query, mode: 'insensitive' } },
        { contactPerson: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { industry: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status
    }

    if (filters.industry && filters.industry !== 'all') {
      where.industry = filters.industry
    }

    if (filters.valueRange) {
      if (filters.valueRange.min !== undefined) {
        where.value = { ...where.value, gte: parseFloat(filters.valueRange.min) }
      }
      if (filters.valueRange.max !== undefined) {
        where.value = { ...where.value, lte: parseFloat(filters.valueRange.max) }
      }
    }

    if (filters.dateRange) {
      if (filters.dateRange.from) {
        where.createdAt = { ...where.createdAt, gte: new Date(filters.dateRange.from) }
      }
      if (filters.dateRange.to) {
        where.createdAt = { ...where.createdAt, lte: new Date(filters.dateRange.to) }
      }
    }

    if (filters.lastContactRange) {
      if (filters.lastContactRange.from) {
        where.lastContact = { ...where.lastContact, gte: new Date(filters.lastContactRange.from) }
      }
      if (filters.lastContactRange.to) {
        where.lastContact = { ...where.lastContact, lte: new Date(filters.lastContactRange.to) }
      }
    }

    if (filters.hasOrders !== undefined) {
      if (filters.hasOrders) {
        where.orders = { some: {} }
      } else {
        where.orders = { none: {} }
      }
    }

    if (filters.hasLeads !== undefined) {
      if (filters.hasLeads) {
        where.leads = { some: {} }
      } else {
        where.leads = { none: {} }
      }
    }

    // Validate sort fields
    const allowedSortFields = [
      'companyName', 'contactPerson', 'email', 'industry', 
      'value', 'status', 'createdAt', 'updatedAt', 'lastContact'
    ]
    
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort field' },
        { status: 400 }
      )
    }

    // Validate sort order
    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { error: 'Invalid sort order. Must be "asc" or "desc"' },
        { status: 400 }
      )
    }

    // Build cache key
    const cacheKey = {
      tenantId: session.user.tenantId,
      query,
      filters,
      sortBy,
      sortOrder,
      page,
      limit,
      includeStats
    }

    // Try to get from cache
    const cachedData = await crmCache.getCustomerSearch(session.user.tenantId, cacheKey)
    if (cachedData) {
      console.log('📦 Serving customer search from cache')
      return NextResponse.json(cachedData)
    }

    // Execute search
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true
            }
          },
          leads: {
            select: {
              id: true,
              value: true,
              stage: true
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

    // Get additional stats if requested
    let stats = null
    if (includeStats) {
      const [statusStats, industryStats, valueStats] = await Promise.all([
        prisma.customer.groupBy({
          by: ['status'],
          where: { tenantId: session.user.tenantId },
          _count: { status: true }
        }),
        prisma.customer.groupBy({
          by: ['industry'],
          where: { tenantId: session.user.tenantId },
          _count: { industry: true }
        }),
        prisma.customer.aggregate({
          where: { tenantId: session.user.tenantId },
          _avg: { value: true },
          _sum: { value: true },
          _min: { value: true },
          _max: { value: true }
        })
      ])

      stats = {
        statusDistribution: statusStats,
        industryDistribution: industryStats,
        valueMetrics: {
          average: valueStats._avg.value,
          total: valueStats._sum.value,
          min: valueStats._min.value,
          max: valueStats._max.value
        }
      }
    }

    const responseData = {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        applied: filters,
        totalResults: total
      },
      sort: {
        field: sortBy,
        order: sortOrder
      },
      ...(stats && { stats })
    }

    // Cache the response for 15 minutes
    await crmCache.setCustomerSearch(session.user.tenantId, cacheKey, responseData, 900)
    console.log('💾 Cached customer search data')

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error in customer search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 