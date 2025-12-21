import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/sales/quotations/[id]/submit - Submit quotation for approval
export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get quotation
    const quotation = await prisma.salesQuotation.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Only creator can submit
    if (quotation.createdById !== currentUser.id) {
      return NextResponse.json({ error: 'Only the creator can submit this quotation' }, { status: 403 });
    }

    // Only draft or rejected quotations can be submitted
    if (!['draft', 'rejected'].includes(quotation.status)) {
      return NextResponse.json(
        { error: `Quotation cannot be submitted. Current status: ${quotation.status}` },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!quotation.customerName || !quotation.customerEmail || !quotation.items || quotation.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields. Please ensure customer details and items are filled.' },
        { status: 400 }
      );
    }

    // Update status to submitted
    const updated = await prisma.$transaction(async (tx) => {
      const updatedQuotation = await tx.salesQuotation.update({
        where: { id },
        data: {
          status: 'submitted'
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          items: true
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'SUBMIT_SALES_QUOTATION',
          details: `Submitted quotation ${updatedQuotation.quotationNumber} for approval`
        }
      });

      return updatedQuotation;
    });

    return NextResponse.json({ quotation: updated });
  } catch (error) {
    console.error('Error submitting quotation:', error);
    return NextResponse.json(
      { error: 'Failed to submit quotation' },
      { status: 500 }
    );
  }
}

