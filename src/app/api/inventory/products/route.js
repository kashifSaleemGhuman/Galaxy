import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'

// GET /api/inventory/products - Get all products
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const trackQuantity = searchParams.get('trackQuantity')
    
    const skip = (page - 1) * limit
    
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

    // Check if user has permission to create products
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = (currentUser.role || '').toUpperCase()
    const canCreateProducts = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PURCHASE_MANAGER,
      ROLES.PURCHASE_USER
    ].includes(userRole)

    if (!canCreateProducts) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Products can only be created by Purchase Managers or Admins.' 
      }, { status: 403 })
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
        where: { 
          sku, 
          ...(session.user.tenantId && { tenantId: session.user.tenantId })
        }
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
        where: { 
          barcode, 
          ...(session.user.tenantId && { tenantId: session.user.tenantId })
        }
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
          ...(session.user.tenantId && { tenantId: session.user.tenantId })
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
      tenantId: session.user.tenantId || null,
      name,
      sku,
      barcode
    })
    
    // Create product
    const product = await prisma.product.create({
      data: {
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
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
        where: { 
          id: warehouseId, 
          ...(session.user.tenantId && { tenantId: session.user.tenantId })
        }
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
          ...(session.user.tenantId && { tenantId: session.user.tenantId }),
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
