import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// GET /api/purchase/rfqs/approved - Get approved RFQs that can be converted to Purchase Orders
export async function GET(req) {
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

    // Check if user has permission to view approved RFQs
    const canViewApprovedRFQs = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER, ROLES.PURCHASE_USER].includes(currentUser.role);
    if (!canViewApprovedRFQs) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const vendorId = searchParams.get('vendor_id');

    let whereClause = {
      status: 'approved'
    };

    if (vendorId) {
      whereClause.vendorId = vendorId;
    }

    const approvedRFQs = await prisma.rFQ.findMany({
      where: whereClause,
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
      },
      orderBy: { approvedAt: 'desc' },
      take: limit
    });

    // Check which RFQs already have purchase orders
    const rfqIds = approvedRFQs.map(rfq => rfq.id);
    const existingPOs = await prisma.purchaseOrder.findMany({
      where: {
        rfqId: { in: rfqIds }
      },
      select: {
        rfqId: true,
        poId: true,
        status: true
      }
    });

    const poMap = new Map();
    existingPOs.forEach(po => {
      poMap.set(po.rfqId, { poId: po.poId, status: po.status });
    });

    const shapedRFQs = approvedRFQs.map(rfq => {
      const totalAmount = rfq.vendorPrice || 0;
      const existingPO = poMap.get(rfq.id);

      return {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        vendorId: rfq.vendorId,
        vendorName: rfq.vendor.name,
        vendorEmail: rfq.vendor.email,
        createdByName: rfq.createdBy.name,
        approvedByName: rfq.approvedBy?.name,
        approvedAt: rfq.approvedAt,
        vendorPrice: rfq.vendorPrice,
        expectedDelivery: rfq.expectedDelivery,
        vendorNotes: rfq.vendorNotes,
        totalAmount,
        itemCount: rfq.items.length,
        items: rfq.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unit: item.unit
        })),
        hasPurchaseOrder: !!existingPO,
        purchaseOrderId: existingPO?.poId || null,
        purchaseOrderStatus: existingPO?.status || null
      };
    });

    return NextResponse.json({
      success: true,
      data: shapedRFQs,
      count: shapedRFQs.length
    });

  } catch (error) {
    console.error('Error fetching approved RFQs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch approved RFQs',
      details: error.message 
    }, { status: 500 });
  }
}
