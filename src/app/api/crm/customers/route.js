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
      page,
      limit,
      search,
      status,
      industry
    }
    
    // Try to get cached data first
    const cachedData = await crmCache.getCustomerList('default', cacheKey)
    if (cachedData) {
      console.log('📦 Serving customers from cache')
      return NextResponse.json(cachedData)
    }
    
    // Since Customer model doesn't exist in schema, we'll use Vendor model as a workaround
    // This is a temporary solution - in production you'd want to add Customer model to schema
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    }
    
    // Get vendors as customers (temporary workaround)
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vendor.count({ where })
    ])
    
    // Transform vendors to customer-like structure
    const customers = vendors.map(vendor => ({
      id: vendor.id,
      companyName: vendor.name,
      contactPerson: vendor.name, // Using name as contact person
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      status: vendor.isActive ? 'active' : 'inactive',
      industry: 'Unknown', // Default since not in vendor model
      value: null,
      lastContact: null,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt
    }))
    
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
    await crmCache.setCustomerList('default', cacheKey, responseData, 1800)
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
    if (!companyName || !email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
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
    
    console.log('🔍 Debug: About to create vendor as customer with data:', {
      companyName,
      email,
      phone,
      address
    })
    
    // Create vendor as customer (temporary workaround)
    const vendor = await prisma.vendor.create({
      data: {
        name: companyName,
        email,
        phone,
        address,
        isActive: status === 'active'
      }
    })
    
    // Transform vendor to customer-like structure
    const customer = {
      id: vendor.id,
      companyName: vendor.name,
      contactPerson: companyName, // Using company name as contact person
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      status: vendor.isActive ? 'active' : 'inactive',
      industry: industry || 'Unknown',
      value: value ? parseFloat(value) : null,
      lastContact: lastContact ? new Date(lastContact) : null,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt
    }
    
    console.log('✅ Customer (vendor) created successfully:', customer.id)
    
    // Invalidate customer cache
    await crmCache.invalidateCustomer('default')
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