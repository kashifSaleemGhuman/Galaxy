import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import emailService from '@/lib/email';

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
    const canSend = rfq.createdById === currentUser.id || ['super_admin', 'admin', 'purchase_manager'].includes(currentUser.role);
    if (!canSend) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if vendor has email
    if (!rfq.vendor?.email) {
      return NextResponse.json({ 
        error: 'Vendor email is required to send RFQ' 
      }, { status: 400 });
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

    // Send email to vendor
    let emailResult = null;
    let emailError = null;
    try {
      emailResult = await emailService.sendRFQEmail(updated);
      console.log('Email result:', JSON.stringify(emailResult, null, 2));
      
      if (emailResult?.success) {
        console.log(`✓ RFQ email sent successfully to ${updated.vendor?.email} via ${emailResult.provider}`);
      } else {
        // Email service returned failure but didn't throw
        emailError = {
          message: emailResult?.message || 'Email sending failed',
          errors: emailResult?.errors || [],
          providersAttempted: emailResult?.providersAttempted || []
        };
        console.error('✗ Email sending failed:', emailError);
      }
    } catch (err) {
      emailError = {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        response: err.response?.body || err.response,
      };
      console.error('Error sending RFQ email:', err);
      console.error('Error details:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      rfq: updated,
      message: 'RFQ sent to vendor successfully',
      emailSent: !!emailResult?.success,
      emailError: emailError,
      emailProvider: emailResult?.provider || null,
      emailDetails: emailResult ? {
        success: emailResult.success,
        provider: emailResult.provider,
        message: emailResult.message,
        errors: emailResult.errors,
        providersAttempted: emailResult.providersAttempted
      } : null
    });
  } catch (error) {
    console.error('Error sending RFQ:', error);
    return NextResponse.json({ 
      error: 'Failed to send RFQ',
      details: error.message 
    }, { status: 500 });
  }
}
