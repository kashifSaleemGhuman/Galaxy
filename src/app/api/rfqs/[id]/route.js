import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/rfqs/[id] - Get single RFQ
export async function GET(req, { params }) {
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
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Check if user can view this RFQ
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role) 
        && rfq.createdById !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ rfq });
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return NextResponse.json({ error: 'Failed to fetch RFQ' }, { status: 500 });
  }
}

// PUT /api/rfqs/[id] - Update RFQ
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const {
      status,
      vendorPrice,
      expectedDelivery,
      vendorNotes,
      rejectionReason
    } = await req.json();

    // Get existing RFQ
    const existingRfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { createdBy: true }
    });

    if (!existingRfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Check permissions
    const canEdit = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role) 
                   || existingRfq.createdById === currentUser.id;

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare update data
    const updateData = {};
    
    if (status) {
      updateData.status = status;
      
      // Set sent date when status changes to 'sent'
      if (status === 'sent' && existingRfq.status !== 'sent') {
        updateData.sentDate = new Date();
      }
    }

    if (vendorPrice !== undefined) updateData.vendorPrice = parseFloat(vendorPrice);
    if (expectedDelivery) updateData.expectedDelivery = new Date(expectedDelivery);
    if (vendorNotes !== undefined) updateData.vendorNotes = vendorNotes;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

    // Update RFQ
    // Note: Using sequential operations instead of transaction because Prisma Accelerate doesn't support transactions
    const rfq = await prisma.rFQ.update({
      where: { id: params.id },
      data: updateData,
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

    // Create audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'UPDATE_RFQ',
          details: `Updated RFQ ${rfq.rfqNumber}: ${Object.keys(updateData).join(', ')}`
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for RFQ update:', auditError);
      // Continue - RFQ was successfully updated
    }

    const updatedRfq = rfq;

    return NextResponse.json({ rfq: updatedRfq });
  } catch (error) {
    console.error('Error updating RFQ:', error);
    return NextResponse.json({ error: 'Failed to update RFQ' }, { status: 500 });
  }
}

// DELETE /api/rfqs/[id] - Delete RFQ
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    // Only admins can delete RFQs
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const existingRfq = await prisma.rFQ.findUnique({
      where: { id: params.id }
    });

    if (!existingRfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Note: Using sequential operations instead of transaction because Prisma Accelerate doesn't support transactions
    await prisma.rFQ.delete({
      where: { id: params.id }
    });

    // Create audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'DELETE_RFQ',
          details: `Deleted RFQ ${existingRfq.rfqNumber}`
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for RFQ deletion:', auditError);
      // Continue - RFQ was successfully deleted
    }

    return NextResponse.json({ message: 'RFQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting RFQ:', error);
    return NextResponse.json({ error: 'Failed to delete RFQ' }, { status: 500 });
  }
}
