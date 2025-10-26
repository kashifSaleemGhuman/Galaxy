import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { vendor: true }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Only creator, manager, or admin can send
    const canSend = rfq.createdById === currentUser.id || ['super_admin', 'admin', 'purchase_manager'].includes(currentUser.role);
    if (!canSend) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update status to sent
    const updated = await prisma.$transaction(async (tx) => {
      const updatedRfq = await tx.rFQ.update({
        where: { id: params.id },
        data: {
          status: 'sent',
          sentDate: new Date()
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
          action: 'SEND_RFQ',
          details: `RFQ ${updatedRfq.rfqNumber} sent to vendor ${rfq.vendor?.name || rfq.vendorId}`
        }
      });

      return updatedRfq;
    });

    // Simulate email send success
    return NextResponse.json({ success: true, rfq: updated });
  } catch (error) {
    console.error('Error sending RFQ:', error);
    return NextResponse.json({ error: 'Failed to send RFQ' }, { status: 500 });
  }
}
