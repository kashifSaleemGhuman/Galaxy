import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';

// POST /api/inventory/incoming-shipments/[id]/process - Process incoming shipment (warehouse operator)
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

    // Check if user has permission to process shipments
    const role = (currentUser.role || '').toUpperCase()
    const canProcessShipment = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INVENTORY_MANAGER].includes(role);
    if (!canProcessShipment) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const { lines, notes } = await req.json();

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'Shipment lines are required' }, { status: 400 });
    }

    // Get the incoming shipment
    const shipment = await prisma.incomingShipment.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: true
          }
        },
        warehouse: true,
        purchaseOrder: {
          include: {
            lines: true
          }
        }
      }
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Incoming shipment not found' }, { status: 404 });
    }

    // Check if shipment is in a valid state for processing
    if (shipment.status !== 'assigned') {
      return NextResponse.json({ 
        error: `Shipment cannot be processed. Current status: ${shipment.status}` 
      }, { status: 400 });
    }

    if (!shipment.warehouseId) {
      return NextResponse.json({ 
        error: 'Shipment must be assigned to a warehouse before processing' 
      }, { status: 400 });
    }

    // Process the shipment
    // Note: Using sequential operations instead of transaction because Prisma Accelerate doesn't support transactions
    // Update shipment lines with received quantities
    const updatedLines = [];
    for (const lineData of lines) {
      const { lineId, quantityReceived, quantityAccepted, quantityRejected, lineNotes } = lineData;
      
      if (quantityAccepted + quantityRejected !== quantityReceived) {
        throw new Error(`Line ${lineId}: Accepted + Rejected must equal Received quantity`);
      }

      const updatedLine = await prisma.incomingShipmentLine.update({
        where: { id: lineId },
        data: {
          quantityReceived: quantityReceived,
          quantityAccepted: quantityAccepted,
          quantityRejected: quantityRejected,
          notes: lineNotes || undefined
        },
        include: {
          product: true
        }
      });
      updatedLines.push(updatedLine);
    }

    // Update shipment status
    const updatedShipment = await prisma.incomingShipment.update({
      where: { id },
      data: {
        status: 'received',
        receivedAt: new Date(),
        notes: notes || shipment.notes
      }
    });

    // Create inventory items and stock movements for accepted quantities
    for (const line of updatedLines) {
      if (line.quantityAccepted > 0) {
        try {
          // Check if inventory item exists
          let inventoryItem = await prisma.inventoryItem.findUnique({
            where: {
              productId_warehouseId: {
                productId: line.productId,
                warehouseId: shipment.warehouseId
              }
            }
          });

          if (inventoryItem) {
            // Update existing inventory item
            inventoryItem = await prisma.inventoryItem.update({
              where: {
                productId_warehouseId: {
                  productId: line.productId,
                  warehouseId: shipment.warehouseId
                }
              },
              data: {
                quantity: inventoryItem.quantity + line.quantityAccepted,
                available: inventoryItem.available + line.quantityAccepted
              }
            });
          } else {
            // Create new inventory item
            inventoryItem = await prisma.inventoryItem.create({
              data: {
                productId: line.productId,
                warehouseId: shipment.warehouseId,
                quantity: line.quantityAccepted,
                available: line.quantityAccepted,
                reserved: 0
              }
            });
          }

          // Create stock movement
          await prisma.stockMovement.create({
            data: {
              productId: line.productId,
              warehouseId: shipment.warehouseId,
              shipmentId: shipment.id,
              type: 'in',
              quantity: line.quantityAccepted,
              reason: 'Incoming shipment',
              reference: shipment.shipmentNumber,
              createdBy: currentUser.id
            }
          });
        } catch (invError) {
          console.error(`Failed to process inventory for line ${line.id}:`, invError);
          // Continue processing other lines
        }
      }
    }

    // Update PO lines with received quantities
    if (shipment.poId) {
      try {
        for (const line of updatedLines) {
          const poLine = await prisma.pOLine.findFirst({
            where: {
              poId: shipment.poId,
              productId: line.productId
            }
          });

          if (poLine) {
            await prisma.pOLine.update({
              where: { poLineId: poLine.poLineId },
              data: {
                quantityReceived: poLine.quantityReceived + line.quantityAccepted
              }
            });
          }
        }

        // Check if all PO lines are fully received
        const allPOLines = await prisma.pOLine.findMany({
          where: { poId: shipment.poId }
        });

        const allReceived = allPOLines.every(line => 
          line.quantityReceived >= line.quantityOrdered
        );

        if (allReceived) {
          // Update PO status to received
          await prisma.purchaseOrder.update({
            where: { poId: shipment.poId },
            data: { status: 'received' }
          });

          // Update shipment status to processed
          await prisma.incomingShipment.update({
            where: { id },
            data: { 
              status: 'processed',
              processedAt: new Date()
            }
          });
        }
      } catch (poError) {
        console.error('Failed to update PO lines/status:', poError);
        // Continue - shipment was successfully processed
      }
    }

    const result = { updatedShipment, updatedLines };

    return NextResponse.json({
      success: true,
      message: 'Shipment processed successfully',
      data: {
        shipmentId: result.updatedShipment.id,
        shipmentNumber: result.updatedShipment.shipmentNumber,
        status: result.updatedShipment.status,
        receivedAt: result.updatedShipment.receivedAt,
        processedAt: result.updatedShipment.processedAt,
        lines: result.updatedLines.map(line => ({
          id: line.id,
          productName: line.product.name,
          quantityExpected: line.quantityExpected,
          quantityReceived: line.quantityReceived,
          quantityAccepted: line.quantityAccepted,
          quantityRejected: line.quantityRejected,
          unitPrice: line.unitPrice
        }))
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing shipment:', error);
    return NextResponse.json({ 
      error: 'Failed to process shipment',
      details: error.message 
    }, { status: 500 });
  }
}
