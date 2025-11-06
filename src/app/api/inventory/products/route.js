import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'

// GET /api/inventory/products - Get all products
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:products:get`
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
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const trackQuantity = searchParams.get('trackQuantity')
    
    const skip = (page - 1) * limit
    
    // Build cache key based on filters
    const cacheKey = { page, limit, search, category, status }
    
    // Try to get cached data first
    const cachedData = await crmCache.getCustomerList('inventory-products', cacheKey)
    if (cachedData) {
      console.log('📦 Serving products from cache')
      return NextResponse.json(cachedData)
    }
    
    // Build where clause
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && category !== 'all' && { category }),
      ...(status && status !== 'all' && { isActive: status === 'active' })
    }
    
    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          inventoryItems: {
            include: {
              warehouse: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              },
              // location is a scalar string in current schema; no relation include
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const responseData = {
      products,
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
    await crmCache.setCustomerList('inventory-products', cacheKey, responseData, 1800)
    console.log('💾 Cached products data')
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/inventory/products - Create new product
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:products:post`
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
    console.log('🔍 Debug: categoryId received:', body.categoryId)
    
    const {
      name,
      sku,
      barcode,
      description,
      price,
      cost,
      categoryId,
      unitOfMeasure,
      weight,
      trackQuantity = true,
      allowNegativeStock = false,
      reorderPoint = 0,
      maxStock,
      minStock,
      isActive = true,
      warehouseId
    } = body
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Require warehouse for tracked products
    if (trackQuantity && !warehouseId) {
      return NextResponse.json(
        { error: 'Warehouse is required when tracking quantity' },
        { status: 400 }
      )
    }
    
    // Check for duplicate SKU if provided
    if (sku) {
      const existingSku = await prisma.product.findFirst({
        where: { sku, tenantId: session.user.tenantId }
      })
      if (existingSku) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        )
      }
    }
    
    // Check for duplicate barcode if provided
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { barcode, tenantId: session.user.tenantId }
      })
      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Product with this barcode already exists' },
          { status: 409 }
        )
      }
    }
    
    // Validate categoryId if provided
    if (categoryId) {
      const category = await prisma.productCategory.findFirst({
        where: { 
          id: categoryId, 
          tenantId: session.user.tenantId 
        }
      })
      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category selected' },
          { status: 400 }
        )
      }
    }
    
    console.log('🔍 Debug: About to create product with data:', {
      tenantId: session.user.tenantId,
      name,
      sku,
      barcode
    })
    
    // Create product
    const product = await prisma.product.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        sku,
        barcode,
        description,
        price: price ? parseFloat(price) : 0,
        cost: cost ? parseFloat(cost) : null,
        categoryId: categoryId || null,
        unitOfMeasure,
        weight: weight ? parseFloat(weight) : null,
        trackQuantity,
        allowNegativeStock,
        reorderPoint: parseInt(reorderPoint) || 0,
        maxStock: maxStock ? parseInt(maxStock) : null,
        minStock: minStock ? parseInt(minStock) : null,
        isActive
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    console.log('✅ Product created successfully:', product.id)

    // If tracked and warehouse provided, create initial inventory item row
    if (trackQuantity && warehouseId) {
      // Validate warehouse belongs to tenant
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, tenantId: session.user.tenantId }
      })
      if (!warehouse) {
        return NextResponse.json(
          { error: 'Invalid warehouse selected' },
          { status: 400 }
        )
      }

      await prisma.inventoryItem.upsert({
        where: {
          productId_warehouseId_locationId: {
            productId: product.id,
            warehouseId,
            locationId: null
          }
        },
        update: {},
        create: {
          tenantId: session.user.tenantId,
          productId: product.id,
          warehouseId,
          quantityOnHand: 0,
          quantityReserved: 0,
          quantityAvailable: 0,
          reorderPoint: parseInt(reorderPoint) || 0,
          maxStock: maxStock ? parseInt(maxStock) : null,
          minStock: minStock ? parseInt(minStock) : null
        }
      })
    }
    
    // Invalidate product cache for this tenant
    await crmCache.invalidateCustomer(session.user.tenantId)
    console.log('🗑️ Invalidated product cache after creation')
    
    return NextResponse.json({ 
      message: 'Product created successfully',
      product 
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating product:', error)
    console.error('❌ Error stack:', error.stack)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Product with this SKU or barcode already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
