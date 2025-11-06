import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';

export async function GET(request) {
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
    const canAccessWarehouse = ['INVENTORY_USER', 'SUPER_ADMIN'].includes(currentUser.role);
    
    if (!canAccessWarehouse) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    let whereClause = {};
    
    if (status) {
      if (status.includes(',')) {
        // Multiple statuses (e.g., "processed,rejected")
        whereClause.status = {
          in: status.split(',')
        };
      } else {
        whereClause.status = status;
      }
    }

    // Only show shipments that are assigned to warehouses (not pending)
    whereClause.warehouseId = {
      not: null
    };

    const shipments = await prisma.incomingShipment.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const shapedShipments = shipments.map(shipment => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: shapedShipments,
      count: shapedShipments.length
    });

  } catch (error) {
    console.error('Error fetching warehouse shipments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


