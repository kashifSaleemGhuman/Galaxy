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

    const { action, comments } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
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

    // Check if user has permission to approve/reject
    const canApprove = ['super_admin', 'admin', 'purchase_manager'].includes(currentUser.role);
    if (!canApprove) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
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

    // Use transaction with increased timeout and optimize queries
    const updatedRfq = await prisma.$transaction(async (tx) => {
      // Update RFQ status (without complex includes to speed up transaction)
      await tx.rFQ.update({
        where: { id: rfqId },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedById: currentUser.id,
          approvedAt: new Date(),
          rejectionReason: action === 'reject' ? comments : null
        }
      });

      // Create approval record
      await tx.rFQApproval.create({
        data: {
          rfqId: rfqId,
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

      return rfqId; // Return just the ID
    }, {
      maxWait: 10000, // Maximum time to wait for a transaction slot
      timeout: 10000, // Maximum time the transaction can run (10 seconds)
    });

    // Fetch the updated RFQ with all relations after transaction completes
    const updatedRfqWithRelations = await prisma.rFQ.findUnique({
      where: { id: updatedRfq },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    return NextResponse.json({ 
      rfq: updatedRfqWithRelations,
      message: `RFQ ${action}d successfully` 
    });

  } catch (error) {
    console.error('Error approving/rejecting RFQ:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}