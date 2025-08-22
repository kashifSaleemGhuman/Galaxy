import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// GET /api/crm/customers/[id] - Get customer by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:get:${id}`
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

    // Try to get from cache first
    const cacheKey = `customer:${session.user.tenantId}:${id}`
    const cachedCustomer = await crmCache.get(cacheKey)
    if (cachedCustomer) {
      console.log('📦 Serving customer from cache')
      return NextResponse.json(cachedCustomer)
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        leads: {
          select: {
            id: true,
            title: true,
            value: true,
            stage: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Cache the customer for 15 minutes
    await crmCache.set(cacheKey, customer, 900)
    console.log('💾 Cached customer data')

    return NextResponse.json(customer)

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/crm/customers/[id] - Update customer
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:put:${id}`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 50, 60)
    
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
      companyName,
      contactPerson,
      email,
      phone,
      address,
      website,
      industry,
      value,
      status,
      lastContact
    } = body

    // Check if customer exists and belongs to tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate required fields if updating
    if (companyName !== undefined && !companyName) {
      return NextResponse.json(
        { error: 'Company name cannot be empty' },
        { status: 400 }
      )
    }

    if (contactPerson !== undefined && !contactPerson) {
      return NextResponse.json(
        { error: 'Contact person cannot be empty' },
        { status: 400 }
      )
    }

    if (email !== undefined && !email) {
      return NextResponse.json(
        { error: 'Email cannot be empty' },
        { status: 400 }
      )
    }

    // Validate email format if updating
    if (email && email !== existingCustomer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website }),
        ...(industry !== undefined && { industry }),
        ...(value !== undefined && { value: value ? parseFloat(value) : null }),
        ...(status !== undefined && { status }),
        ...(lastContact !== undefined && { lastContact: lastContact ? new Date(lastContact) : null }),
        updatedAt: new Date()
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

    // Invalidate caches
    await crmCache.invalidateCustomer(session.user.tenantId)
    // Remove the incorrect crmCache.delete call since invalidateCustomer handles it
    console.log('🗑️ Invalidated customer caches after update')

    return NextResponse.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    })

  } catch (error) {
    console.error('Error updating customer:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/crm/customers/[id] - Delete customer
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    console.log('🔍 Debug: Attempting to delete customer:', id)
    console.log('🔍 Debug: User ID:', session.user.id)
    console.log('🔍 Debug: Tenant ID:', session.user.tenantId)
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:customers:delete:${id}`
    const rateLimitResult = await rateLimit.check(rateLimitKey, 20, 60)
    
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

    // Check if customer exists and belongs to tenant
    console.log('🔍 Debug: Checking if customer exists...')
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
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

    if (!existingCustomer) {
      console.log('❌ Customer not found:', id)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Debug: Customer found:', {
      id: existingCustomer.id,
      companyName: existingCustomer.companyName,
      ordersCount: existingCustomer._count.orders,
      leadsCount: existingCustomer._count.leads
    })

    // Check if customer has related records
    if (existingCustomer._count.orders > 0 || existingCustomer._count.leads > 0) {
      console.log('❌ Customer has related records, cannot delete')
      return NextResponse.json(
        { 
          error: 'Cannot delete customer with existing orders or leads. Consider deactivating instead.',
          relatedRecords: {
            orders: existingCustomer._count.orders,
            leads: existingCustomer._count.leads
          }
        },
        { status: 400 }
      )
    }

    // Delete customer
    console.log('🔍 Debug: Deleting customer from database...')
    await prisma.customer.delete({
      where: { id }
    })
    console.log('✅ Customer deleted from database successfully')

    // Invalidate caches
    console.log('🔍 Debug: Invalidating caches...')
    await crmCache.invalidateCustomer(session.user.tenantId)
    // Remove the incorrect crmCache.delete call since invalidateCustomer handles it
    console.log('🗑️ Invalidated customer caches after deletion')

    return NextResponse.json({
      message: 'Customer deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting customer:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error code:', error.code)
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Customer not found or already deleted' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete customer due to foreign key constraints' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
} 