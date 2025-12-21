import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import { getAssignedWarehouseId } from '@/lib/warehouse-auth';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';

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

    // For warehouse operators, only show shipments for their assigned warehouse
    if (role === ROLES.WAREHOUSE_OPERATOR) {
      const assignedWarehouseId = await getAssignedWarehouseId(currentUser.id);
      if (!assignedWarehouseId) {
        // Warehouse operator not assigned to any warehouse
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No warehouse assigned. Please contact administrator.'
        });
      }
      whereClause.warehouseId = assignedWarehouseId;
    }

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


