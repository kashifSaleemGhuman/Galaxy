import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

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

    // Check if user has permission to view incoming shipments
    const role = (currentUser.role || '').toUpperCase()
    const canViewShipments = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PURCHASE_MANAGER].includes(role);
    if (!canViewShipments) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const warehouseId = searchParams.get('warehouse_id');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }

    const shipments = await prisma.incomingShipment.findMany({
      where: whereClause,
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            lines: {
              include: {
                product: true
              }
            }
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
      },
      take: limit
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
      lines: shipment.lines.map(line => ({
        id: line.id,
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
    console.error('Error fetching incoming shipments:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch incoming shipments',
      details: error.message 
    }, { status: 500 });
  }
}