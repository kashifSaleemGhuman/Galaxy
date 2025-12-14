import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
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

    // Only warehouse operators and super admins can reject shipments
    const role = (currentUser.role || '').toUpperCase()
    const canRejectShipments = [ROLES.INVENTORY_USER, ROLES.SUPER_ADMIN].includes(role);
    
    if (!canRejectShipments) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const { notes } = await request.json();

    // Get the incoming shipment
    const shipment = await prisma.incomingShipment.findUnique({
      where: { id },
      include: {
        purchaseOrder: true
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
      message: 'Shipment rejected successfully',
      data: {
        shipment: updatedShipment
      }
    });

  } catch (error) {
    console.error('Error rejecting shipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


