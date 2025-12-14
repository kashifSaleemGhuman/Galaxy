import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { crmCache, rateLimit } from '@/lib/redis'
import { ROLES } from '@/lib/constants/roles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/inventory/warehouses/[id] - Get a single warehouse
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            inventoryItems: true,
            locations: true
          }
        }
      }
    })

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }

    return NextResponse.json({ warehouse })
    
  } catch (error) {
    console.error('Error fetching warehouse:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// PUT /api/inventory/warehouses/[id] - Update a warehouse
// Only SUPER_ADMIN can update warehouses
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = (currentUser.role || '').toUpperCase()
    if (userRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Only Super Admin can update warehouses' },
        { status: 403 }
      )
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:warehouses:put`
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

    const { id } = params
    const body = await request.json()
    const { name, code, address, isActive, managerId } = body

    // Verify warehouse exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id }
    })

    if (!existingWarehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }

    // Check for duplicate code if code is being changed
    if (code && code !== existingWarehouse.code) {
      const duplicateCode = await prisma.warehouse.findFirst({ 
        where: { 
          code,
          id: { not: id }
        } 
      })
      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Warehouse with this code already exists' },
          { status: 409 }
        )
      }
    }

    // Update warehouse
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive }),
        ...(managerId !== undefined && { managerId: managerId || null })
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Invalidate warehouse cache
    await crmCache.invalidateCustomer('inventory-warehouses')
    console.log('🗑️ Invalidated warehouse cache after update')

    return NextResponse.json({ 
      message: 'Warehouse updated successfully',
      warehouse: updatedWarehouse 
    })
    
  } catch (error) {
    console.error('Error updating warehouse:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Warehouse with this code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/warehouses/[id] - Delete a warehouse
// Only SUPER_ADMIN can delete warehouses
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = (currentUser.role || '').toUpperCase()
    if (userRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Only Super Admin can delete warehouses' },
        { status: 403 }
      )
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:${session.user.id}:warehouses:delete`
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

    const { id } = params

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventoryItems: true,
            locations: true
          }
        }
      }
    })

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }

    // Check if warehouse has inventory items or locations
    if (warehouse._count.inventoryItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse with inventory items. Please remove all items first.' },
        { status: 400 }
      )
    }

    if (warehouse._count.locations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse with locations. Please remove all locations first.' },
        { status: 400 }
      )
    }

    // Delete warehouse
    await prisma.warehouse.delete({
      where: { id }
    })

    // Invalidate warehouse cache
    await crmCache.invalidateCustomer('inventory-warehouses')
    console.log('🗑️ Invalidated warehouse cache after deletion')

    return NextResponse.json({ 
      message: 'Warehouse deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete warehouse due to existing references' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

