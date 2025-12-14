import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'
import { ROLES } from '@/lib/constants/roles'

// GET /api/inventory/products/[id] - Get product by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:products:get:${params.id}`
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

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        inventoryItems: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            location: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
    
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// PUT /api/inventory/products/[id] - Update product
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update products
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = (currentUser.role || '').toUpperCase()
    const canManageProducts = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PURCHASE_MANAGER,
      ROLES.PURCHASE_USER
    ].includes(userRole)

    if (!canManageProducts) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Products can only be updated by Purchase Managers or Admins.' 
      }, { status: 403 })
    }
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:products:put:${params.id}`
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
    console.log('🔍 Debug: Update request body:', body)
    
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
      trackQuantity,
      allowNegativeStock,
      reorderPoint,
      maxStock,
      minStock,
      isActive
    } = body
    
    // Check if product exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check for duplicate SKU if provided and different from current
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { 
          sku, 
          tenantId: session.user.tenantId,
          id: { not: params.id }
        }
      })
      if (existingSku) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        )
      }
    }
    
    // Check for duplicate barcode if provided and different from current
    if (barcode && barcode !== existingProduct.barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { 
          barcode, 
          tenantId: session.user.tenantId,
          id: { not: params.id }
        }
      })
      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Product with this barcode already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(sku !== undefined && { sku }),
        ...(barcode !== undefined && { barcode }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(cost !== undefined && { cost: cost ? parseFloat(cost) : null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(unitOfMeasure !== undefined && { unitOfMeasure }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(trackQuantity !== undefined && { trackQuantity }),
        ...(allowNegativeStock !== undefined && { allowNegativeStock }),
        ...(reorderPoint !== undefined && { reorderPoint: parseInt(reorderPoint) || 0 }),
        ...(maxStock !== undefined && { maxStock: maxStock ? parseInt(maxStock) : null }),
        ...(minStock !== undefined && { minStock: minStock ? parseInt(minStock) : null }),
        ...(isActive !== undefined && { isActive })
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
    
    console.log('✅ Product updated successfully:', updatedProduct.id)
    
    // Invalidate product cache for this tenant
    await crmCache.invalidateCustomer(session.user.tenantId)
    console.log('🗑️ Invalidated product cache after update')
    
    return NextResponse.json({ 
      message: 'Product updated successfully',
      product: updatedProduct 
    })
    
  } catch (error) {
    console.error('❌ Error updating product:', error)
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

// DELETE /api/inventory/products/[id] - Delete product
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete products
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = (currentUser.role || '').toUpperCase()
    const canManageProducts = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PURCHASE_MANAGER,
      ROLES.PURCHASE_USER
    ].includes(userRole)

    if (!canManageProducts) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Products can only be deleted by Purchase Managers or Admins.' 
      }, { status: 403 })
    }
    
    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:products:delete:${params.id}`
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
    
    // Check if product exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        inventoryItems: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check if product has inventory items
    if (existingProduct.inventoryItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing inventory items. Please remove all inventory first.' },
        { status: 409 }
      )
    }
    
    // Delete product
    await prisma.product.delete({
      where: { id: params.id }
    })
    
    console.log('✅ Product deleted successfully:', params.id)
    
    // Invalidate product cache for this tenant
    await crmCache.invalidateCustomer(session.user.tenantId)
    console.log('🗑️ Invalidated product cache after deletion')
    
    return NextResponse.json({ 
      message: 'Product deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ Error deleting product:', error)
    console.error('❌ Error stack:', error.stack)
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
