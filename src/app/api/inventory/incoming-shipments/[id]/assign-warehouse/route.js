import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to assign warehouses
    if (session.user.role.name !== 'Admin' && session.user.role.name !== 'Inventory Manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params
    const { warehouseId } = await request.json()

    if (!warehouseId) {
      return NextResponse.json(
        { error: 'Warehouse ID is required' },
        { status: 400 }
      )
    }

    // Verify shipment exists and belongs to tenant
    const shipment = await prisma.incomingShipment.findFirst({
      where: {
        id: id,
        tenantId: session.user.tenantId
      }
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      )
    }

    // Verify warehouse exists and belongs to tenant
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        tenantId: session.user.tenantId
      }
    })

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Invalid warehouse selected' },
        { status: 400 }
      )
    }

    // Update shipment with warehouse assignment
    const updatedShipment = await prisma.incomingShipment.update({
      where: { id: id },
      data: {
        warehouseId: warehouseId,
        status: 'Assigned',
        assignedBy: session.user.id,
        assignedAt: new Date()
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true
          }
        },
        warehouse: true,
        lines: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Warehouse assigned successfully',
      shipment: updatedShipment
    })

  } catch (error) {
    console.error('Error assigning warehouse:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

