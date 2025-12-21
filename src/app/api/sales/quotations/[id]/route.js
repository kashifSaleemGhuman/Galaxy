import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/sales/quotations/[id] - Get single quotation
export async function GET(req, { params }) {
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
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        },
        items: true,
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

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Check if user can view this quotation
    const canView = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER].includes(currentUser.role) 
        || quotation.createdById === currentUser.id;

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 });
  }
}

// PUT /api/sales/quotations/[id] - Update quotation
export async function PUT(req, { params }) {
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

    // Get existing quotation
    const existingQuotation = await prisma.salesQuotation.findUnique({
      where: { id },
      include: { createdBy: true, items: true }
    });

    if (!existingQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Check permissions - only draft or rejected quotations can be edited
    if (!['draft', 'rejected'].includes(existingQuotation.status)) {
      return NextResponse.json(
        { error: 'Only draft or rejected quotations can be edited' },
        { status: 400 }
      );
    }

    // Only creator or managers can edit
    const canEdit = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER].includes(currentUser.role) 
                   || existingQuotation.createdById === currentUser.id;

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const {
      validityDate,
      customerName,
      customerEmail,
      customerPhone,
      customerCompanyName,
      termsAndConditions,
      items
    } = body;

    // Validate required fields
    if (!validityDate || !customerName || !customerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalAmount = 0;
    let totalTax = 0;
    let totalFreight = 0;

    const quotationItems = items.map(item => {
      const exFactory = parseFloat(item.exFactoryPrice) || 0;
      const tax = parseFloat(item.taxCharges) || 0;
      const freight = parseFloat(item.freightCharges) || 0;
      const quantity = parseInt(item.quantity) || 1;
      
      // Final price = (exFactoryPrice + tax + freight) * quantity
      const itemTotal = (exFactory + tax + freight) * quantity;
      const itemTax = tax * quantity;
      const itemFreight = freight * quantity;

      totalAmount += exFactory * quantity;
      totalTax += itemTax;
      totalFreight += itemFreight;

      return {
        productId: item.productId || null,
        productName: item.productName,
        quantity: quantity,
        exFactoryPrice: exFactory,
        taxCharges: tax,
        freightCharges: freight,
        discountAmount: 0, // Not used in calculation, but kept for schema compatibility
        finalNetPrice: itemTotal
      };
    });

    // Final price = totalAmount + totalTax + totalFreight
    const finalNetPrice = totalAmount + totalTax + totalFreight;

    // Update quotation with items
    const quotation = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.salesQuotationItem.deleteMany({
        where: { quotationId: id }
      });

      // Update quotation
      const updated = await tx.salesQuotation.update({
        where: { id },
        data: {
          validityDate: new Date(validityDate),
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          customerCompanyName: customerCompanyName || null,
          termsAndConditions: termsAndConditions || null,
          totalAmount,
          taxAmount: totalTax,
          discountAmount: 0, // Not used in calculation
          freightCharges: totalFreight,
          finalNetPrice,
          status: 'draft', // Reset to draft when edited
          items: {
            create: quotationItems
          }
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
          action: 'UPDATE_SALES_QUOTATION',
          details: `Updated quotation ${updated.quotationNumber}`
        }
      });

      return updated;
    });

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
  }
}

// DELETE /api/sales/quotations/[id] - Delete quotation
export async function DELETE(req, { params }) {
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

    // Only admins or creators can delete (if draft or rejected)
    const existingQuotation = await prisma.salesQuotation.findUnique({
      where: { id }
    });

    if (!existingQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const canDelete = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(currentUser.role) 
                     || (existingQuotation.createdById === currentUser.id && 
                         ['draft', 'rejected'].includes(existingQuotation.status));

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.salesQuotation.delete({
        where: { id }
      });

      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'DELETE_SALES_QUOTATION',
          details: `Deleted quotation ${existingQuotation.quotationNumber}`
        }
      });
    });

    return NextResponse.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
  }
}

