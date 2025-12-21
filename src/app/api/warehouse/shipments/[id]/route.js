import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import { isAuthorizedForWarehouse } from '@/lib/warehouse-auth';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
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

    // Only warehouse operators and super admins can access warehouse module
    const role = (currentUser.role || '').toUpperCase()
    const canAccessWarehouse = [
      ROLES.INVENTORY_USER, 
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(role);
    
    if (!canAccessWarehouse) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    const shipment = await prisma.incomingShipment.findUnique({
      where: { id },
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
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Check if warehouse operator is authorized for this specific warehouse
    if (shipment.warehouseId && role === ROLES.WAREHOUSE_OPERATOR) {
      const isAuthorized = await isAuthorizedForWarehouse(currentUser, shipment.warehouseId)
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'You are not authorized to view shipments for this warehouse. Only the assigned warehouse manager can view shipments for their warehouse.' },
          { status: 403 }
        )
      }
    }

    const shapedShipment = {
      id: shipment.id,
      shipmentNumber: shipment.shipmentNumber,
      poId: shipment.poId,
      status: shipment.status,
      warehouse: shipment.warehouse ? {
        id: shipment.warehouse.id,
        name: shipment.warehouse.name,
        code: shipment.warehouse.code
      } : null,
      supplier: shipment.purchaseOrder.supplier ? {
        name: shipment.purchaseOrder.supplier.name,
        email: shipment.purchaseOrder.supplier.email
      } : null,
      assignedAt: shipment.assignedAt,
      receivedAt: shipment.receivedAt,
      processedAt: shipment.processedAt,
      createdAt: shipment.createdAt,
      notes: shipment.notes,
      lines: shipment.lines.map(line => ({
        id: line.id,
        productId: line.productId,
        productName: line.product.name,
        quantityExpected: line.quantityExpected,
        quantityReceived: line.quantityReceived,
        quantityAccepted: line.quantityAccepted,
        quantityRejected: line.quantityRejected,
        unitPrice: line.unitPrice
      })),
      totalItems: shipment.lines.length,
      totalValue: shipment.lines.reduce((sum, line) => 
        sum + (line.quantityAccepted * line.unitPrice), 0
      )
    };

    return NextResponse.json({
      success: true,
      data: shapedShipment
    });

  } catch (error) {
    console.error('Error fetching warehouse shipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


