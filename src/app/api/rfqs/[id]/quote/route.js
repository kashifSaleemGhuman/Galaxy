import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vendorPrice, expectedDeliveryDate, vendorNotes } = await req.json();

    if (vendorPrice === undefined || !expectedDeliveryDate) {
      return NextResponse.json({ error: 'vendorPrice and expectedDeliveryDate are required' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { vendor: true, createdBy: true }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Creator, manager, or admin can record quote
    const canRecord = rfq.createdById === currentUser.id || ['super_admin', 'admin', 'purchase_manager'].includes(currentUser.role);
    if (!canRecord) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedRfq = await tx.rFQ.update({
        where: { id: params.id },
        data: {
          vendorPrice: parseFloat(vendorPrice),
          expectedDelivery: new Date(expectedDeliveryDate),
          vendorNotes: vendorNotes || null,
          status: 'received'
        },
        include: {
          vendor: true,
          createdBy: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'RECORD_RFQ_QUOTE',
          details: `Recorded vendor quote for RFQ ${updatedRfq.rfqNumber}`
        }
      });

      return updatedRfq;
    });

    // For approvals screen, 'received' is considered pending manager approval
    return NextResponse.json({ success: true, rfq: updated });
  } catch (error) {
    console.error('Error recording vendor quote:', error);
    return NextResponse.json({ error: 'Failed to record vendor quote' }, { status: 500 });
  }
}
