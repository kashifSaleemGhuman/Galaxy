import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// POST /api/inventory/incoming-shipments/[id]/assign-warehouse - Assign warehouse to incoming shipment
export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to assign warehouses
    const canAssignWarehouse = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PURCHASE_MANAGER].includes(currentUser.role);
    if (!canAssignWarehouse) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const { warehouseId, notes } = await req.json();

    if (!warehouseId) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 });
    }

    // Get the incoming shipment
    const shipment = await prisma.incomingShipment.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: true
          }
        },
        purchaseOrder: {
          include: {
            supplier: true
          }
        }
      }
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Incoming shipment not found' }, { status: 404 });
    }

    // Check if shipment is in a valid state for warehouse assignment
    if (shipment.status !== 'pending') {
      return NextResponse.json({ 
        error: `Shipment cannot be assigned to warehouse. Current status: ${shipment.status}` 
      }, { status: 400 });
    }

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Update shipment with warehouse assignment
    // Note: Using sequential operations instead of transaction because Prisma Accelerate doesn't support transactions
    const us = await prisma.incomingShipment.update({
      where: { id },
      data: {
        warehouseId,
        status: 'assigned',
        assignedAt: new Date(),
        assignedBy: currentUser.id,
        notes: notes || shipment.notes
      },
      include: {
        warehouse: true,
        lines: {
          include: {
            product: true
          }
        },
        purchaseOrder: {
          include: {
            supplier: true
          }
        }
      }
    })

    // Update PO status to confirmed (post-assignment) - non-blocking
    if (us.poId) {
      try {
        await prisma.purchaseOrder.update({
          where: { poId: us.poId },
          data: { status: 'confirmed' }
        })
      } catch (poError) {
        console.warn('Failed to update PO status after warehouse assignment:', poError)
        // Continue - shipment was successfully assigned
      }
    }

    const updatedShipment = us

    return NextResponse.json({
      success: true,
      message: 'Warehouse assigned successfully',
      data: {
        shipmentId: updatedShipment.id,
        shipmentNumber: updatedShipment.shipmentNumber,
        status: updatedShipment.status,
        warehouse: {
          id: updatedShipment.warehouse.id,
          name: updatedShipment.warehouse.name,
          code: updatedShipment.warehouse.code
        },
        assignedAt: updatedShipment.assignedAt,
        assignedBy: updatedShipment.assignedBy,
        lines: updatedShipment.lines.map(line => ({
          id: line.id,
          productName: line.product.name,
          quantityExpected: line.quantityExpected,
          unitPrice: line.unitPrice
        }))
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error assigning warehouse:', error);
    return NextResponse.json({ 
      error: 'Failed to assign warehouse',
      details: error.message 
    }, { status: 500 });
  }
}