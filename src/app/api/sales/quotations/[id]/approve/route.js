import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/sales/quotations/[id]/approve - Approve/reject quotation
export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, comments } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to approve/reject
    const canApprove = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER].includes(currentUser.role);
    if (!canApprove) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const quotation = await prisma.salesQuotation.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        items: true
      }
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Check if quotation is in a state that can be approved/rejected
    if (quotation.status !== 'submitted') {
      return NextResponse.json({
        error: `Quotation cannot be ${action}d. Current status: ${quotation.status}. Only submitted quotations can be approved/rejected.`
      }, { status: 400 });
    }

    // Update quotation status and create approval record
    const updatedQuotation = await prisma.$transaction(async (tx) => {
      // Update quotation status
      const updated = await tx.salesQuotation.update({
        where: { id },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedById: currentUser.id
        }
      });

      // Create approval record
      await tx.salesQuotationApproval.create({
        data: {
          quotationId: id,
          approvedBy: currentUser.id,
          status: action === 'approve' ? 'approved' : 'rejected',
          comments: comments || null
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: action === 'approve' ? 'APPROVE_SALES_QUOTATION' : 'REJECT_SALES_QUOTATION',
          details: `Sales quotation ${quotation.quotationNumber} ${action}d by ${currentUser.name}${comments ? ` - ${comments}` : ''}`
        }
      });

      return updated;
    });

    // Fetch the updated quotation with all relations
    const quotationWithDetails = await prisma.salesQuotation.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        items: true,
        approvals: {
          include: {
            approver: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({ quotation: quotationWithDetails });
  } catch (error) {
    console.error('Error approving/rejecting quotation:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}

