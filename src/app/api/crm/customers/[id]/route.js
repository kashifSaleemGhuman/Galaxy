import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'

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
    const cacheKey = `customer:default:${id}`
    const cachedCustomer = await crmCache.get(cacheKey)
    if (cachedCustomer) {
      console.log('📦 Serving customer from cache')
      return NextResponse.json(cachedCustomer)
    }

    // Get vendor as customer (temporary workaround)
    const vendor = await prisma.vendor.findUnique({
      where: { id }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Transform vendor to customer-like structure
    const customer = {
      id: vendor.id,
      companyName: vendor.name,
      contactPerson: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      status: vendor.isActive ? 'active' : 'inactive',
      industry: 'Unknown',
      value: null,
      lastContact: null,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      orders: [], // Empty since no orders model in schema
      leads: [], // Empty since no leads model in schema
      creator: {
        firstName: 'System',
        lastName: 'User',
        email: 'system@example.com'
      }
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

    // Check if vendor exists (using as customer)
    const existingVendor = await prisma.vendor.findUnique({
      where: { id }
    })

    if (!existingVendor) {
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

    if (email !== undefined && !email) {
      return NextResponse.json(
        { error: 'Email cannot be empty' },
        { status: 400 }
      )
    }

    // Validate email format if updating
    if (email && email !== existingVendor.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Update vendor (using as customer)
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(companyName !== undefined && { name: companyName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(status !== undefined && { isActive: status === 'active' })
      }
    })

    // Transform vendor to customer-like structure
    const updatedCustomer = {
      id: updatedVendor.id,
      companyName: updatedVendor.name,
      contactPerson: updatedVendor.name,
      email: updatedVendor.email,
      phone: updatedVendor.phone,
      address: updatedVendor.address,
      status: updatedVendor.isActive ? 'active' : 'inactive',
      industry: industry || 'Unknown',
      value: value ? parseFloat(value) : null,
      lastContact: lastContact ? new Date(lastContact) : null,
      createdAt: updatedVendor.createdAt,
      updatedAt: updatedVendor.updatedAt
    }

    // Invalidate caches
    await crmCache.invalidateCustomer('default')
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

    // Check if vendor exists (using as customer)
    console.log('🔍 Debug: Checking if vendor exists...')
    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rfqs: true
          }
        }
      }
    })

    if (!existingVendor) {
      console.log('❌ Customer not found:', id)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Debug: Customer found:', {
      id: existingVendor.id,
      name: existingVendor.name,
      rfqsCount: existingVendor._count.rfqs
    })

    // Check if vendor has related records
    if (existingVendor._count.rfqs > 0) {
      console.log('❌ Customer has related records, cannot delete')
      return NextResponse.json(
        { 
          error: 'Cannot delete customer with existing RFQs. Consider deactivating instead.',
          relatedRecords: {
            rfqs: existingVendor._count.rfqs
          }
        },
        { status: 400 }
      )
    }

    // Delete vendor (using as customer)
    console.log('🔍 Debug: Deleting customer from database...')
    await prisma.vendor.delete({
      where: { id }
    })
    console.log('✅ Customer deleted from database successfully')

    // Invalidate caches
    console.log('🔍 Debug: Invalidating caches...')
    await crmCache.invalidateCustomer('default')
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