import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { isAuthorizedForWarehouse } from '@/lib/warehouse-auth';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { notes } = await request.json();

    // Check if user has permission to reject shipments
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions - warehouse operators and inventory managers can reject
    const canReject = ['INVENTORY_USER', 'INVENTORY_MANAGER', 'SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_OPERATOR'].includes(currentUser.role);
    
    if (!canReject) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the incoming shipment
    const shipment = await prisma.incomingShipment.findUnique({
      where: { id },
      include: {
        purchaseOrder: true,
        lines: { include: { product: true } },
        warehouse: true
      }
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Incoming shipment not found' }, { status: 404 });
    }

    if (shipment.status !== 'assigned') {
      return NextResponse.json({ 
        error: 'Shipment must be assigned to a warehouse before it can be rejected' 
      }, { status: 400 });
    }

    // Check if warehouse operator is authorized for this specific warehouse
    if (shipment.warehouseId) {
      const isAuthorized = await isAuthorizedForWarehouse(currentUser, shipment.warehouseId)
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'You are not authorized to reject shipments for this warehouse. Only the assigned warehouse manager can process shipments for their warehouse.' },
          { status: 403 }
        )
      }
    }

    // Update shipment status to rejected
    const updatedShipment = await prisma.incomingShipment.update({
      where: { id },
      data: {
        status: 'rejected',
        processedAt: new Date(),
        notes: notes || 'Rejected by warehouse operator'
      }
    });

    // Update PO status to cancelled
    await prisma.purchaseOrder.update({
      where: { poId: shipment.poId },
      data: {
        status: 'cancelled'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Incoming shipment rejected successfully',
      data: {
        shipment: updatedShipment
      }
    });

  } catch (error) {
    console.error('Error rejecting incoming shipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}