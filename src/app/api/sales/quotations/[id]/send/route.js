import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import emailService from '@/lib/email';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/sales/quotations/[id]/send - Send quotation to customer
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

    // Check permissions - creator or managers can send
    const canSend = quotation.createdById === currentUser.id ||
                    [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER].includes(currentUser.role);
    
    if (!canSend) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if quotation is approved
    if (quotation.status !== 'approved') {
      return NextResponse.json({
        error: `Quotation cannot be sent. Current status: ${quotation.status}. Only approved quotations can be sent.`
      }, { status: 400 });
    }

    // Check if customer email exists
    if (!quotation.customerEmail) {
      return NextResponse.json({
        error: 'Customer email is required to send quotation'
      }, { status: 400 });
    }

    // Update status to sent
    const updated = await prisma.$transaction(async (tx) => {
      const updatedQuotation = await tx.salesQuotation.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'SEND_SALES_QUOTATION',
          details: `Sent quotation ${quotation.quotationNumber} to ${quotation.customerEmail}`
        }
      });

      return updatedQuotation;
    });

    // Send email to customer
    try {
      const quotationWithDetails = await prisma.salesQuotation.findUnique({
        where: { id },
        include: {
          items: true
        }
      });
      
      await emailService.sendSalesQuotationEmail(quotationWithDetails);
      console.log(`Sales quotation email sent successfully to ${quotation.customerEmail}`);
    } catch (emailError) {
      console.error('Error sending quotation email:', emailError);
      // Don't fail the request if email fails, but log it
    }

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
    console.error('Error sending quotation:', error);
    return NextResponse.json(
      { error: 'Failed to send quotation' },
      { status: 500 }
    );
  }
}

