import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/crm/customers/stats - Get customer statistics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:stats`
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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const includeTrends = searchParams.get('trends') === 'true'
    const includeCharts = searchParams.get('charts') === 'true'

    // Build cache key (tenantId removed - single tenant mode)
    const cacheKey = {
      period,
      includeTrends,
      includeCharts
    }

    // Try to get from cache
    const cachedStats = await crmCache.getCustomerStats('default', cacheKey)
    if (cachedStats) {
      console.log('📦 Serving customer stats from cache')
      return NextResponse.json(cachedStats)
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get basic stats
    const [
      totalCustomers,
      activeCustomers,
      newCustomers,
      totalValue,
      avgValue,
      statusDistribution,
      industryDistribution
    ] = await Promise.all([
      prisma.customer.count({
        where: { tenantId: session.user.tenantId }
      }),
      prisma.customer.count({
        where: { 
          tenantId: session.user.tenantId,
          status: 'active'
        }
      }),
      prisma.customer.count({
        where: {
          tenantId: session.user.tenantId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.customer.aggregate({
        where: { 
          tenantId: session.user.tenantId,
          value: { not: null }
        },
        _sum: { value: true }
      }),
      prisma.customer.aggregate({
        where: { 
          tenantId: session.user.tenantId,
          value: { not: null }
        },
        _avg: { value: true }
      }),
      prisma.customer.groupBy({
        by: ['status'],
        where: { tenantId: session.user.tenantId },
        _count: { status: true }
      }),
      prisma.customer.groupBy({
        by: ['industry'],
        where: { 
          tenantId: session.user.tenantId,
          industry: { not: null }
        },
        _count: { industry: true }
      })
    ])

    // Calculate conversion rate (customers with orders)
    const customersWithOrders = await prisma.customer.count({
      where: {
        tenantId: session.user.tenantId,
        orders: { some: {} }
      }
    })

    const conversionRate = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0

    // Get top customers by value
    const topCustomers = await prisma.customer.findMany({
      where: {
        tenantId: session.user.tenantId,
        value: { not: null }
      },
      select: {
        id: true,
        companyName: true,
        value: true,
        status: true,
        lastContact: true
      },
      orderBy: { value: 'desc' },
      take: 10
    })

    // Get recent activity
    const recentActivity = await prisma.customer.findMany({
      where: {
        tenantId: session.user.tenantId
      },
      select: {
        id: true,
        companyName: true,
        status: true,
        lastContact: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    let trends = null
    if (includeTrends) {
      // Get monthly trends for the last 12 months
      const monthlyTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "created_at") as month,
          COUNT(*) as new_customers,
          SUM(COALESCE(value, 0)) as total_value
        FROM customers 
        WHERE "tenant_id" = ${session.user.tenantId}
          AND "created_at" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "created_at")
        ORDER BY month ASC
      `

      trends = {
        monthly: monthlyTrends
      }
    }

    let charts = null
    if (includeCharts) {
      // Get data for charts
      const [statusChart, industryChart, valueChart] = await Promise.all([
        prisma.customer.groupBy({
          by: ['status'],
          where: { tenantId: session.user.tenantId },
          _count: { status: true },
          _sum: { value: true }
        }),
        prisma.customer.groupBy({
          by: ['industry'],
          where: { 
            tenantId: session.user.tenantId,
            industry: { not: null }
          },
          _count: { industry: true },
          _sum: { value: true }
        }),
        prisma.customer.findMany({
          where: {
            tenantId: session.user.tenantId,
            value: { not: null }
          },
          select: {
            value: true,
            status: true
          }
        })
      ])

      charts = {
        status: statusChart,
        industry: industryChart,
        valueDistribution: valueChart
      }
    }

    const stats = {
      overview: {
        totalCustomers,
        activeCustomers,
        newCustomers,
        totalValue: totalValue._sum.value || 0,
        avgValue: avgValue._avg.value || 0,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      distribution: {
        status: statusDistribution,
        industry: industryDistribution
      },
      topCustomers,
      recentActivity,
      period,
      ...(trends && { trends }),
      ...(charts && { charts })
    }

    // Cache the stats for 30 minutes
    await crmCache.setCustomerStats(session.user.tenantId, cacheKey, stats, 1800)
    console.log('💾 Cached customer stats')

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching customer stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 