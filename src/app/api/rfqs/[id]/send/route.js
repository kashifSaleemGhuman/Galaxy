import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const role = (currentUser.role || '').toUpperCase()
    const canSend = rfq.createdById === currentUser.id || [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(role);
    if (!canSend) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update status to sent
    // Note: Using sequential operations instead of transaction because Prisma Accelerate doesn't support transactions
    const updatedRfq = await prisma.rFQ.update({
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

    // Create audit log (non-blocking - if this fails, RFQ is still sent)
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'SEND_RFQ',
          details: `RFQ ${updatedRfq.rfqNumber} sent to vendor ${rfq.vendor?.name || rfq.vendorId}`
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for RFQ send:', auditError);
      // Continue - RFQ was successfully sent
    }

    const updated = updatedRfq;

    // Simulate email send success
    return NextResponse.json({ success: true, rfq: updated });
  } catch (error) {
    console.error('Error sending RFQ:', error);
    return NextResponse.json({ error: 'Failed to send RFQ' }, { status: 500 });
  }
}
