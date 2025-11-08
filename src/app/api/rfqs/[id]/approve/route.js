import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, comments } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to approve/reject
    const canApprove = ['super_admin', 'admin', 'purchase_manager'].includes(currentUser.role);
    if (!canApprove) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { 
        vendor: true, 
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Check if RFQ is in a state that can be approved/rejected
    if (rfq.status !== 'received') {
      return NextResponse.json({ 
        error: `RFQ cannot be ${action}d. Current status: ${rfq.status}. Only RFQs with recorded quotes can be approved/rejected.` 
      }, { status: 400 });
    }

    const updatedRfq = await prisma.$transaction(async (tx) => {
      // Update RFQ status
      const updated = await tx.rFQ.update({
        where: { id: params.id },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedById: currentUser.id,
          approvedAt: new Date(),
          rejectionReason: action === 'reject' ? comments : null
        },
        include: {
          vendor: true,
          createdBy: { select: { id: true, name: true, email: true } },
          approvedBy: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } }
        }
      });

      // Create approval record
      await tx.rFQApproval.create({
        data: {
          rfqId: params.id,
          approvedBy: currentUser.id,
          status: action === 'approve' ? 'approved' : 'rejected',
          comments: comments || null
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: action === 'approve' ? 'APPROVE_RFQ' : 'REJECT_RFQ',
          details: `RFQ ${rfq.rfqNumber} ${action}d by ${currentUser.name}${comments ? ` - ${comments}` : ''}`
        }
      });

      return updated;
    });

    return NextResponse.json({ 
      rfq: updatedRfq,
      message: `RFQ ${action}d successfully` 
    });

  } catch (error) {
    console.error('Error approving/rejecting RFQ:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}