import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// POST /api/purchase/purchase-orders/[id]/approve - Approve a Purchase Order
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

    // Check if user has permission to approve purchase orders
    const role = (currentUser.role || '').toUpperCase()
    const canApprovePO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(role);
    if (!canApprovePO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const { notes } = await req.json();

    // Get the purchase order with all related data
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
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    // Check if PO is in a valid state for approval
    if (po.status !== 'sent' && po.status !== 'confirmed') {
      return NextResponse.json({ 
        error: `Purchase Order cannot be approved. Current status: ${po.status}` 
      }, { status: 400 });
    }

    // Update PO status to approved
    const updatedPO = await prisma.purchaseOrder.update({
      where: { poId: id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: currentUser.id
      }
    });

    // Create incoming shipment automatically
    const shipmentNumber = `SH-${Date.now()}`;
    const incomingShipment = await prisma.incomingShipment.create({
      data: {
        shipmentNumber,
        poId: po.poId,
        status: 'pending',
        notes: notes || `Auto-created from approved PO ${po.poId}`
      }
    });

    // Create incoming shipment lines from PO lines
    const shipmentLines = await Promise.all(
      po.lines.map(async (line) => {
        return await prisma.incomingShipmentLine.create({
          data: {
            shipmentId: incomingShipment.id,
            productId: line.productId,
            quantityExpected: line.quantityOrdered,
            quantityReceived: 0,
            quantityAccepted: 0,
            quantityRejected: 0,
            unitPrice: line.price
          }
        });
      })
    );

    // Fetch shipment lines with product relation for response
    const shipmentLinesWithProducts = await prisma.incomingShipmentLine.findMany({
      where: { shipmentId: incomingShipment.id },
      include: {
        product: true
      }
    });

    // Return the updated PO with shipment info
    const result = await prisma.purchaseOrder.findUnique({
      where: { poId: id },
      include: {
        lines: {
          include: {
            product: true
          }
        },
        supplier: true,
        incomingShipments: {
          include: {
            lines: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase Order approved successfully',
      data: {
        poId: result.poId,
        status: result.status,
        approvedAt: result.approvedAt,
        approvedBy: result.approvedBy,
        incomingShipment: {
          id: incomingShipment.id,
          shipmentNumber: incomingShipment.shipmentNumber,
          status: incomingShipment.status,
          lines: shipmentLinesWithProducts.map(line => ({
            id: line.id,
            productName: line.product?.name || 'Unknown Product',
            quantityExpected: line.quantityExpected,
            unitPrice: line.unitPrice
          }))
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error approving purchase order:', error);
    return NextResponse.json({ 
      error: 'Failed to approve purchase order',
      details: error.message 
    }, { status: 500 });
  }
}
