import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'

// POST /api/crm/customers/bulk - Bulk operations
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:bulk`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 30, 60)
    
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
    const { operation, customerIds, data } = body

    if (!operation || !customerIds || !Array.isArray(customerIds)) {
      return NextResponse.json(
        { error: 'Operation, customerIds array, and data are required' },
        { status: 400 }
      )
    }

    if (customerIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one customer ID is required' },
        { status: 400 }
      )
    }

    if (customerIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 customers can be processed at once' },
        { status: 400 }
      )
    }

    // Verify all customers belong to the tenant
    const existingCustomers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        tenantId: session.user.tenantId
      },
      select: { id: true }
    })

    if (existingCustomers.length !== customerIds.length) {
      return NextResponse.json(
        { error: 'Some customers not found or do not belong to your tenant' },
        { status: 400 }
      )
    }

    let result

    switch (operation.toLowerCase()) {
      case 'update':
        result = await handleBulkUpdate(customerIds, data, session.user.tenantId)
        break
      
      case 'delete':
        result = await handleBulkDelete(customerIds, session.user.tenantId)
        break
      
      case 'status':
        result = await handleBulkStatusUpdate(customerIds, data.status, session.user.tenantId)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported operations: update, delete, status' },
          { status: 400 }
        )
    }

    // Invalidate customer cache for this tenant
    await crmCache.invalidateCustomer(session.user.tenantId)
    console.log('🗑️ Invalidated customer cache after bulk operation')

    return NextResponse.json({
      message: `Bulk ${operation} completed successfully`,
      ...result
    })

  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleBulkUpdate(customerIds, data, tenantId) {
  const updateData = {}
  
  // Only include fields that are provided
  if (data.industry !== undefined) updateData.industry = data.industry
  if (data.status !== undefined) updateData.status = data.status
  if (data.value !== undefined) updateData.value = data.value ? parseFloat(data.value) : null
  if (data.lastContact !== undefined) updateData.lastContact = data.lastContact ? new Date(data.lastContact) : null
  
  updateData.updatedAt = new Date()

  const result = await prisma.customer.updateMany({
    where: {
      id: { in: customerIds },
      tenantId
    },
    data: updateData
  })

  return {
    updatedCount: result.count,
    updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
  }
}

async function handleBulkDelete(customerIds, tenantId) {
  // Check if any customers have related records
  const customersWithRelations = await prisma.customer.findMany({
    where: {
      id: { in: customerIds },
      tenantId
    },
    include: {
      _count: {
        select: {
          orders: true,
          leads: true
        }
      }
    }
  })

  const customersToDelete = []
  const customersWithRelationsList = []

  for (const customer of customersWithRelations) {
    if (customer._count.orders > 0 || customer._count.leads > 0) {
      customersWithRelationsList.push({
        id: customer.id,
        orders: customer._count.orders,
        leads: customer._count.leads
      })
    } else {
      customersToDelete.push(customer.id)
    }
  }

  let deletedCount = 0
  if (customersToDelete.length > 0) {
    const result = await prisma.customer.deleteMany({
      where: {
        id: { in: customersToDelete },
        tenantId
      }
    })
    deletedCount = result.count
  }

  return {
    deletedCount,
    customersWithRelations: customersWithRelationsList,
    message: customersWithRelationsList.length > 0 
      ? 'Some customers could not be deleted due to existing orders or leads'
      : 'All customers deleted successfully'
  }
}

async function handleBulkStatusUpdate(customerIds, status, tenantId) {
  if (!status) {
    throw new Error('Status is required for status update operation')
  }

  const validStatuses = ['active', 'inactive', 'prospect', 'churned']
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Must be one of: active, inactive, prospect, churned')
  }

  const result = await prisma.customer.updateMany({
    where: {
      id: { in: customerIds },
      tenantId
    },
    data: {
      status,
      updatedAt: new Date()
    }
  })

  return {
    updatedCount: result.count,
    newStatus: status
  }
} 