import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
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

    // Check permissions using unified permission system
    if (!hasPermission(currentUser.role, PERMISSIONS.PURCHASE.APPROVE_RFQ)) {
      return NextResponse.json({ error: 'Insufficient permissions. You need approval permissions to approve/reject RFQs.' }, { status: 403 });
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

    // Update RFQ status
    // Note: Using sequential operations instead of transaction because Prisma Accelerate doesn't support transactions
    const updated = await prisma.rFQ.update({
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

    // Create approval record (non-blocking)
    try {
      await prisma.rFQApproval.create({
        data: {
          rfqId: rfqId,
          approvedBy: currentUser.id,
          status: action === 'approve' ? 'approved' : 'rejected',
          comments: comments || null
        }
      });
    } catch (approvalError) {
      console.warn('Failed to create RFQ approval record:', approvalError);
      // Continue - RFQ was successfully updated
    }

    // Create audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: action === 'approve' ? 'APPROVE_RFQ' : 'REJECT_RFQ',
          details: `RFQ ${rfq.rfqNumber} ${action}d by ${currentUser.name}${comments ? ` - ${comments}` : ''}`
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for RFQ approval:', auditError);
      // Continue - RFQ was successfully updated
    }

    const updatedRfq = updated;

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