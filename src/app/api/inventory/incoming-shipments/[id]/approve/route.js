import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to approve shipments
    if (session.user.role.name !== 'Admin' && session.user.role.name !== 'Warehouse Operator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params

    // Get shipment with all related data
    const shipment = await prisma.incomingShipment.findFirst({
      where: {
        id: id,
        tenantId: session.user.tenantId
      },
      include: {
        lines: {
          include: {
            product: true
          }
        },
        warehouse: true,
        purchaseOrder: true
      }
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      )
    }

    if (shipment.status !== 'Assigned') {
      return NextResponse.json(
        { error: 'Only assigned shipments can be approved' },
        { status: 400 }
      )
    }

    // Update shipment status and process stock movements
    const result = await prisma.$transaction(async (tx) => {
      // Update shipment status
      const updatedShipment = await tx.incomingShipment.update({
        where: { id: id },
        data: {
          status: 'Received',
          receivedAt: new Date(),
          receivedBy: session.user.id
        }
      })

      // Process each shipment line
      for (const line of shipment.lines) {
        // Find or create inventory item
        let inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            productId: line.productId,
            warehouseId: shipment.warehouseId,
            tenantId: session.user.tenantId
          }
        })

        if (!inventoryItem) {
          // Create new inventory item
          inventoryItem = await tx.inventoryItem.create({
            data: {
              tenantId: session.user.tenantId,
              productId: line.productId,
              warehouseId: shipment.warehouseId,
              quantityOnHand: line.expectedQuantity,
              quantityReserved: 0,
              quantityAvailable: line.expectedQuantity,
              reorderPoint: 0,
              maxStock: null,
              minStock: null
            }
          })
        } else {
          // Update existing inventory item
          inventoryItem = await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantityOnHand: inventoryItem.quantityOnHand + line.expectedQuantity,
              quantityAvailable: (inventoryItem.quantityOnHand + line.expectedQuantity) - inventoryItem.quantityReserved
            }
          })
        }

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            tenantId: session.user.tenantId,
            productId: line.productId,
            warehouseId: shipment.warehouseId,
            movementType: 'in',
            quantity: line.expectedQuantity,
            reference: `SH-${shipment.shipmentId}`,
            referenceType: 'incoming_shipment',
            referenceId: shipment.id,
            createdBy: session.user.id
          }
        })

        // Update shipment line with received quantity
        await tx.incomingShipmentLine.update({
          where: { id: line.id },
          data: {
            receivedQuantity: line.expectedQuantity
          }
        })
      }

      // Update related purchase order status
      if (shipment.purchaseOrder) {
        await tx.purchaseOrder.update({
          where: { id: shipment.purchaseOrder.id },
          data: {
            status: 'Received'
          }
        })
      }

      return updatedShipment
    })

    return NextResponse.json({
      message: 'Shipment approved successfully',
      shipment: result
    })

  } catch (error) {
    console.error('Error approving shipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

