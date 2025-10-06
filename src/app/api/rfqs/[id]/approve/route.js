import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// POST /api/rfqs/[id]/approve - Approve or reject RFQ
export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    // Only managers and admins can approve/reject RFQs
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { action, comments } = await req.json(); // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    // Get existing RFQ
    const existingRfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!existingRfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Check if RFQ is in a state that can be approved/rejected
    if (!['received', 'sent'].includes(existingRfq.status)) {
      return NextResponse.json({ 
        error: `RFQ cannot be ${action}d. Current status: ${existingRfq.status}` 
      }, { status: 400 });
    }

    // Update RFQ and create approval record
    const updatedRfq = await prisma.$transaction(async (tx) => {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      // Update RFQ
      const rfq = await tx.rFQ.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          approvedById: currentUser.id,
          approvedAt: new Date(),
          ...(action === 'reject' && comments ? { rejectionReason: comments } : {})
        },
        include: {
          vendor: true,
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          approvedBy: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Create approval record
      await tx.rFQApproval.create({
        data: {
          rfqId: params.id,
          approvedBy: currentUser.id,
          status: newStatus,
          comments: comments || null
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: action.toUpperCase() + '_RFQ',
          details: `${action}d RFQ ${rfq.rfqNumber} for vendor ${rfq.vendor.name}${comments ? `: ${comments}` : ''}`
        }
      });

      return rfq;
    });

    return NextResponse.json({ 
      rfq: updatedRfq,
      message: `RFQ ${action}d successfully` 
    });
  } catch (error) {
    console.error(`Error ${action}ing RFQ:`, error);
    return NextResponse.json({ error: `Failed to ${action} RFQ` }, { status: 500 });
  }
}
