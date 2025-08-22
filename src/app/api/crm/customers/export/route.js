import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/redis'

// POST /api/crm/customers/export - Export customer data
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:export`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 10, 60) // 10 exports per minute
    
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
      format = 'csv',
      filters = {},
      fields = [],
      includeRelated = false
    } = body

    // Validate format
    if (!['csv', 'json', 'xlsx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: csv, json, xlsx' },
        { status: 400 }
      )
    }

    // Build where clause
    const where = {
      tenantId: session.user.tenantId
    }

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status
    }

    if (filters.industry && filters.industry !== 'all') {
      where.industry = filters.industry
    }

    if (filters.dateRange) {
      if (filters.dateRange.from) {
        where.createdAt = { ...where.createdAt, gte: new Date(filters.dateRange.from) }
      }
      if (filters.dateRange.to) {
        where.createdAt = { ...where.createdAt, lte: new Date(filters.dateRange.to) }
      }
    }

    // Define default fields if none specified
    const defaultFields = [
      'id', 'companyName', 'contactPerson', 'email', 'phone', 
      'address', 'website', 'industry', 'value', 'status', 
      'lastContact', 'createdAt', 'updatedAt'
    ]

    const selectedFields = fields.length > 0 ? fields : defaultFields

    // Get customers
    const customers = await prisma.customer.findMany({
      where,
      select: {
        ...(selectedFields.includes('id') && { id: true }),
        ...(selectedFields.includes('companyName') && { companyName: true }),
        ...(selectedFields.includes('contactPerson') && { contactPerson: true }),
        ...(selectedFields.includes('email') && { email: true }),
        ...(selectedFields.includes('phone') && { phone: true }),
        ...(selectedFields.includes('address') && { address: true }),
        ...(selectedFields.includes('website') && { website: true }),
        ...(selectedFields.includes('industry') && { industry: true }),
        ...(selectedFields.includes('value') && { value: true }),
        ...(selectedFields.includes('status') && { status: true }),
        ...(selectedFields.includes('lastContact') && { lastContact: true }),
        ...(selectedFields.includes('createdAt') && { createdAt: true }),
        ...(selectedFields.includes('updatedAt') && { updatedAt: true }),
        ...(includeRelated && {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true
            }
          },
          leads: {
            select: {
              id: true,
              title: true,
              value: true,
              stage: true
            }
          }
        })
      },
      orderBy: { createdAt: 'desc' }
    })

    if (customers.length === 0) {
      return NextResponse.json(
        { error: 'No customers found matching the criteria' },
        { status: 404 }
      )
    }

    let exportData
    let contentType
    let filename

    switch (format) {
      case 'csv':
        exportData = generateCSV(customers, selectedFields, includeRelated)
        contentType = 'text/csv'
        filename = `customers_${new Date().toISOString().split('T')[0]}.csv`
        break
      
      case 'json':
        exportData = JSON.stringify(customers, null, 2)
        contentType = 'application/json'
        filename = `customers_${new Date().toISOString().split('T')[0]}.json`
        break
      
      case 'xlsx':
        // For XLSX, we'll return a JSON response with instructions
        // In a real implementation, you'd use a library like 'xlsx' to generate the file
        return NextResponse.json({
          message: 'XLSX export not yet implemented. Please use CSV or JSON format.',
          supportedFormats: ['csv', 'json']
        })
      
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        )
    }

    // Create response with appropriate headers
    const response = new NextResponse(exportData)
    response.headers.set('Content-Type', contentType)
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    response.headers.set('Cache-Control', 'no-cache')

    return response

  } catch (error) {
    console.error('Error exporting customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSV(customers, fields, includeRelated) {
  // Define CSV headers
  const headers = [...fields]
  
  if (includeRelated) {
    headers.push('totalOrders', 'totalLeads', 'totalOrderValue')
  }

  // Generate CSV content
  const csvRows = [headers.join(',')]

  for (const customer of customers) {
    const row = []
    
    for (const field of fields) {
      let value = customer[field]
      
      // Handle different data types
      if (value instanceof Date) {
        value = value.toISOString().split('T')[0]
      } else if (value === null || value === undefined) {
        value = ''
      } else if (typeof value === 'string' && value.includes(',')) {
        // Escape commas in strings
        value = `"${value}"`
      }
      
      row.push(value)
    }

    // Add related data if requested
    if (includeRelated) {
      const totalOrders = customer.orders ? customer.orders.length : 0
      const totalLeads = customer.leads ? customer.leads.length : 0
      const totalOrderValue = customer.orders 
        ? customer.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        : 0
      
      row.push(totalOrders, totalLeads, totalOrderValue)
    }

    csvRows.push(row.join(','))
  }

  return csvRows.join('\n')
} 