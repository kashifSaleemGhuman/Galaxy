import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
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

    const role = (currentUser.role || '').toUpperCase()
    // Check permissions
    const canViewPO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER, ROLES.PURCHASE_USER].includes(role);
    if (!canViewPO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const po = await prisma.purchaseOrder.findUnique({ 
      where: { poId: id }, 
      include: { 
        lines: {
          include: {
            product: true
          }
        }, 
        supplier: true 
      } 
    });

    if (!po) {
      return NextResponse.json({ 
        success: false, 
        error: 'Purchase Order not found' 
      }, { status: 404 });
    }

    const totalAmount = po.lines.reduce((sum, line) => 
      sum + (line.quantityOrdered * line.price), 0
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        po_id: po.poId,
        rfq_id: po.rfqId,
        supplier_id: po.supplierId,
        supplier_name: po.supplier?.name,
        supplier_email: po.supplier?.email,
        supplier_phone: po.supplier?.phone,
        date_created: po.dateCreated.toISOString().split('T')[0],
        status: po.status,
        total_amount: totalAmount,
        lines: po.lines.map(line => ({
          po_line_id: line.poLineId,
          product_id: line.productId,
          product_name: line.product.name,
          product_description: line.product.description,
          quantity_ordered: line.quantityOrdered,
          quantity_received: line.quantityReceived,
          price: line.price,
          line_total: line.quantityOrdered * line.price
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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

    const role = (currentUser.role || '').toUpperCase()
    // Check permissions
    const canUpdatePO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER, ROLES.PURCHASE_USER].includes(role);
    if (!canUpdatePO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { rfq_id, supplier_id, status, lines } = body;

    // Validate supplier if provided
    if (supplier_id) {
      const supplier = await prisma.supplier.findUnique({
        where: { supplierId: supplier_id }
      });

      if (!supplier) {
        return NextResponse.json({ 
          success: false, 
          error: 'Supplier not found' 
        }, { status: 404 });
      }
    }

    // Update purchase order
    const updated = await prisma.purchaseOrder.update({
      where: { poId: id },
      data: {
        rfqId: rfq_id ?? undefined,
        supplierId: supplier_id ?? undefined,
        status: status ?? undefined,
      },
    });

    // Update lines if provided
    if (lines && lines.length > 0) {
      // Delete existing lines
      await prisma.pOLine.deleteMany({
        where: { poId: id }
      });

      // Create new lines
      await Promise.all(
        lines.map(async (line) => {
          return await prisma.pOLine.create({
            data: {
              poLineId: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              poId: id,
              productId: line.product_id,
              quantityOrdered: line.quantity_ordered,
              quantityReceived: line.quantity_received || 0,
              price: line.price
            }
          });
        })
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        po_id: updated.poId, 
        rfq_id: updated.rfqId, 
        supplier_id: updated.supplierId, 
        date_created: updated.dateCreated.toISOString().split('T')[0], 
        status: updated.status 
      } 
    });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'Purchase Order not found' 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const role = (currentUser.role || '').toUpperCase()
    // Check permissions - only admins and purchase managers can delete
    const canDeletePO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(role);
    if (!canDeletePO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if PO exists and get its status
    const po = await prisma.purchaseOrder.findUnique({
      where: { poId: id }
    });

    if (!po) {
      return NextResponse.json({ 
        success: false, 
        error: 'Purchase Order not found' 
      }, { status: 404 });
    }

    // Prevent deletion of sent/confirmed purchase orders
    if (['sent', 'confirmed', 'received'].includes(po.status)) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete purchase order with status: ${po.status}` 
      }, { status: 400 });
    }

    // Delete in transaction to handle foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete PO lines first
      await tx.pOLine.deleteMany({
        where: { poId: id }
      });

      // Delete the purchase order
      await tx.purchaseOrder.delete({
        where: { poId: id }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase Order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'Purchase Order not found' 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
