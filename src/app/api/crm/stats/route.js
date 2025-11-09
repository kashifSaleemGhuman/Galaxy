import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { dashboardCache, rateLimit } from '@/lib/redis'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/crm/stats - Get CRM statistics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:stats:get`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 200, 60) // 200 requests per minute
    
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
    const period = searchParams.get('period') || 'month' // week, month, quarter, year
    
    // Try to get cached stats first
    const cacheKey = `crm:stats:${session.user.tenantId}:${period}`
    const cachedStats = await dashboardCache.getMetrics(session.user.tenantId, cacheKey)
    
    if (cachedStats) {
      console.log('📦 Serving CRM stats from cache')
      return NextResponse.json(cachedStats)
    }
    
    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }
    
    // Get CRM statistics
    const [
      totalCustomers,
      activeCustomers,
      totalLeads,
      activeLeads,
      totalValue,
      customerGrowth,
      leadGrowth,
      topIndustries,
      leadSources,
      statusDistribution
    ] = await Promise.all([
      // Total customers
      prisma.customer.count({
        where: { tenantId: session.user.tenantId }
      }),
      
      // Active customers
      prisma.customer.count({
        where: { 
          tenantId: session.user.tenantId,
          status: 'active'
        }
      }),
      
      // Total leads
      prisma.lead.count({
        where: { tenantId: session.user.tenantId }
      }),
      
      // Active leads (not converted)
      prisma.lead.count({
        where: { 
          tenantId: session.user.tenantId,
          status: { not: 'converted' }
        }
      }),
      
      // Total pipeline value
      prisma.lead.aggregate({
        where: { 
          tenantId: session.user.tenantId,
          status: { not: 'converted' }
        },
        _sum: { value: true }
      }),
      
      // Customer growth (previous period comparison)
      prisma.customer.count({
        where: {
          tenantId: session.user.tenantId,
          createdAt: { lt: startDate }
        }
      }),
      
      // Lead growth (previous period comparison)
      prisma.lead.count({
        where: {
          tenantId: session.user.tenantId,
          createdAt: { lt: startDate }
        }
      }),
      
      // Top industries
      prisma.customer.groupBy({
        by: ['industry'],
        where: { tenantId: session.user.tenantId },
        _count: { industry: true },
        orderBy: { _count: { industry: 'desc' } },
        take: 5
      }),
      
      // Lead sources
      prisma.lead.groupBy({
        by: ['source'],
        where: { tenantId: session.user.tenantId },
        _count: { source: true },
        orderBy: { _count: { source: 'desc' } }
      }),
      
      // Status distribution
      prisma.lead.groupBy({
        by: ['status'],
        where: { tenantId: session.user.tenantId },
        _count: { status: true }
      })
    ])
    
    // Calculate growth percentages
    const customerGrowthPercent = customerGrowth > 0 
      ? ((totalCustomers - customerGrowth) / customerGrowth * 100).toFixed(1)
      : 0
    
    const leadGrowthPercent = leadGrowth > 0
      ? ((totalLeads - leadGrowth) / leadGrowth * 100).toFixed(1)
      : 0
    
    // Calculate conversion rate
    const convertedLeads = await prisma.lead.count({
      where: { 
        tenantId: session.user.tenantId,
        status: 'converted'
      }
    })
    
    const conversionRate = totalLeads > 0 
      ? ((convertedLeads / totalLeads) * 100).toFixed(1)
      : 0
    
    const stats = {
      overview: {
        totalCustomers,
        activeCustomers,
        totalLeads,
        activeLeads,
        totalValue: totalValue._sum.value || 0,
        conversionRate: parseFloat(conversionRate)
      },
      growth: {
        customers: parseFloat(customerGrowthPercent),
        leads: parseFloat(leadGrowthPercent)
      },
      analytics: {
        topIndustries: topIndustries.map(item => ({
          industry: item.industry || 'Unknown',
          count: item._count.industry
        })),
        leadSources: leadSources.map(item => ({
          source: item.source || 'Unknown',
          count: item._count.source
        })),
        statusDistribution: statusDistribution.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      },
      period,
      lastUpdated: new Date().toISOString()
    }
    
    // Cache the stats for 5 minutes
    await dashboardCache.setMetrics(session.user.tenantId, cacheKey, stats, 300)
    console.log('💾 Cached CRM stats data')
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Error fetching CRM stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 