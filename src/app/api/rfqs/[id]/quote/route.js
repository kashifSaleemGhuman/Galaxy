import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vendorNotes, items } = await req.json();

    // Validate items array is provided
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array with pricing and delivery dates is required' }, { status: 400 });
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.productId) {
        return NextResponse.json({ error: 'Each item must have a productId' }, { status: 400 });
      }
      if (item.unitPrice === undefined || item.unitPrice === null || item.unitPrice === '') {
        return NextResponse.json({ error: 'Each item must have a unitPrice' }, { status: 400 });
      }
      if (!item.expectedDeliveryDate) {
        return NextResponse.json({ error: 'Each item must have an expectedDeliveryDate' }, { status: 400 });
      }
    }

    // Calculate total price and earliest date for RFQ-level fields (for backwards compatibility)
    const totalPrice = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0));
    }, 0);
    
    const allDates = items
      .map(item => item.expectedDeliveryDate)
      .filter(date => date)
      .sort();
    const earliestDeliveryDate = allDates[0];

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { 
        vendor: true, 
        createdBy: true,
        items: { include: { product: true } }
      }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Creator, manager, or admin can record quote
    const canRecord = rfq.createdById === currentUser.id || ['super_admin', 'admin', 'purchase_manager'].includes(currentUser.role);
    if (!canRecord) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedRfq = await tx.rFQ.update({
        where: { id: params.id },
        data: {
          vendorPrice: parseFloat(totalPrice),
          expectedDelivery: new Date(earliestDeliveryDate),
          vendorNotes: vendorNotes || null,
          status: 'received'
        },
        include: {
          vendor: true,
          createdBy: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } }
        }
      });

      // Update RFQ items with per-item pricing and delivery dates
      await Promise.all(
        items.map(async (item) => {
          // Find the RFQ item by productId
          const rfqItem = updatedRfq.items.find(
            rfqItem => rfqItem.productId === item.productId
          );
          
          if (rfqItem) {
            await tx.rFQItem.update({
              where: { id: rfqItem.id },
              data: {
                unitPrice: parseFloat(item.unitPrice),
                expectedDeliveryDate: new Date(item.expectedDeliveryDate)
              }
            });
          } else {
            console.warn(`RFQ item not found for productId: ${item.productId}`);
          }
        })
      );

      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'RECORD_RFQ_QUOTE',
          details: `Recorded vendor quote for RFQ ${updatedRfq.rfqNumber}`
        }
      });

      return updatedRfq;
    });

    // For approvals screen, 'received' is considered pending manager approval
    return NextResponse.json({ success: true, rfq: updated });
  } catch (error) {
    console.error('Error recording vendor quote:', error);
    return NextResponse.json({ error: 'Failed to record vendor quote' }, { status: 500 });
  }
}
