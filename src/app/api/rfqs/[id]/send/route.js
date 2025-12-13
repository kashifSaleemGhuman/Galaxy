import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await params;
    const rfqId = resolvedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!rfqId) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
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

    // Check if RFQ is in a valid state to be sent
    if (rfq.status !== 'draft') {
      return NextResponse.json({ 
        error: `RFQ cannot be sent. Current status: ${rfq.status}. Only draft RFQs can be sent.` 
      }, { status: 400 });
    }

    // Update status to sent (optimize transaction by removing complex includes)
    const updatedRfqId = await prisma.$transaction(async (tx) => {
      await tx.rFQ.update({
        where: { id: rfqId },
        data: {
          status: 'sent',
          sentDate: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'SEND_RFQ',
          details: `RFQ ${rfq.rfqNumber} sent to vendor ${rfq.vendor?.name || rfq.vendorId}`
        }
      });

      return rfqId;
    }, {
      maxWait: 10000, // Maximum time to wait for a transaction slot
      timeout: 10000, // Maximum time the transaction can run (10 seconds)
    });

    // Fetch the updated RFQ with all relations after transaction completes
    const updatedRfq = await prisma.rFQ.findUnique({
      where: { id: updatedRfqId },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    // Simulate email send success
    return NextResponse.json({ success: true, rfq: updatedRfq });
  } catch (error) {
    console.error('Error sending RFQ:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Failed to send RFQ',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
