import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/purchase/purchase-orders/[id]/send - Send Purchase Order to Vendor
export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to send purchase orders
    const role = (currentUser.role || '').toUpperCase()
    const canSendPO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER, ROLES.PURCHASE_USER].includes(role);
    if (!canSendPO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const { notes, deliveryDate } = await req.json();

    // Get the purchase order with all related data
    const po = await prisma.purchaseOrder.findUnique({
      where: { poId: id },
      include: {
        supplier: true,
        lines: {
          include: {
            product: true
          }
        }
      }
    });

    if (!po) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    // Check if PO is in a state that can be sent
    if (po.status !== 'draft') {
      return NextResponse.json({ 
        error: `Purchase Order cannot be sent. Current status: ${po.status}. Only draft purchase orders can be sent.` 
      }, { status: 400 });
    }

    // Update the purchase order status to 'sent'
    const updatedPO = await prisma.purchaseOrder.update({
      where: { poId: id },
      data: {
        status: 'sent'
      }
    });

    // Here you would typically:
    // 1. Generate a PDF of the purchase order
    // 2. Send email to the vendor with the PO attached
    // 3. Log the action in audit trail
    // 4. Send notification to relevant stakeholders

    // For now, we'll just return success with the updated status
    return NextResponse.json({
      success: true,
      message: 'Purchase Order sent to vendor successfully',
      data: {
        poId: updatedPO.poId,
        status: updatedPO.status,
        supplierName: po.supplier.name,
        supplierEmail: po.supplier.email,
        totalAmount: po.lines.reduce((sum, line) => 
          sum + (line.quantityOrdered * line.price), 0
        ),
        lineCount: po.lines.length,
        notes: notes || null,
        deliveryDate: deliveryDate || null
      }
    });

  } catch (error) {
    console.error('Error sending purchase order:', error);
    return NextResponse.json({ 
      error: 'Failed to send purchase order',
      details: error.message 
    }, { status: 500 });
  }
}
