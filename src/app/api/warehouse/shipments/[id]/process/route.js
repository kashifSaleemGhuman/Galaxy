import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export async function POST(request, { params }) {
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

    // Only warehouse operators and super admins can process shipments
    const role = (currentUser.role || '').toUpperCase()
    const canProcessShipments = [ROLES.INVENTORY_USER, ROLES.SUPER_ADMIN].includes(role);
    
    if (!canProcessShipments) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const { notes } = await request.json();

    // Get the incoming shipment
    const shipment = await prisma.incomingShipment.findUnique({
      where: { id },
      include: {
        purchaseOrder: true,
        lines: { include: { product: true } },
        warehouse: true
      }
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Incoming shipment not found' }, { status: 404 });
    }

    if (shipment.status !== 'assigned') {
      return NextResponse.json({ 
        error: 'Shipment must be assigned to a warehouse before it can be processed' 
      }, { status: 400 });
    }

    if (!shipment.warehouseId) {
      return NextResponse.json({ 
        error: 'Shipment must be assigned to a warehouse before processing' 
      }, { status: 400 });
    }

    // Update shipment status to processed
    const updatedShipment = await prisma.incomingShipment.update({
      where: { id },
      data: {
        status: 'processed',
        processedAt: new Date(),
        notes: notes || 'Processed by warehouse operator'
      }
    });

    // Update shipment lines with received quantities (assuming all expected quantities are received)
    await Promise.all(
      shipment.lines.map(async (line) => {
        return await prisma.incomingShipmentLine.update({
          where: { id: line.id },
          data: {
            quantityReceived: line.quantityExpected,
            quantityAccepted: line.quantityExpected,
            quantityRejected: 0
          }
        });
      })
    );

    // Create or update inventory items
    await Promise.all(
      shipment.lines.map(async (line) => {
        const existingItem = await prisma.inventoryItem.findUnique({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: shipment.warehouseId
            }
          }
        });

        if (existingItem) {
          // Update existing inventory item
          await prisma.inventoryItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + line.quantityExpected,
              available: existingItem.available + line.quantityExpected
            }
          });
        } else {
          // Create new inventory item
          await prisma.inventoryItem.create({
            data: {
              productId: line.productId,
              warehouseId: shipment.warehouseId,
              quantity: line.quantityExpected,
              reserved: 0,
              available: line.quantityExpected,
              minLevel: 5,
              maxLevel: 100,
              location: 'A-01-01' // Default location
            }
          });
        }

        // Create stock movement record
        await prisma.stockMovement.create({
          data: {
            productId: line.productId,
            warehouseId: shipment.warehouseId,
            shipmentId: shipment.id,
            type: 'in',
            quantity: line.quantityExpected,
            reason: 'Goods receipt from incoming shipment',
            reference: shipment.shipmentNumber,
            createdBy: currentUser.email
          }
        });
      })
    );

    // Update PO status to received
    await prisma.purchaseOrder.update({
      where: { poId: shipment.poId },
      data: {
        status: 'received'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Shipment processed successfully',
      data: {
        shipment: updatedShipment
      }
    });

  } catch (error) {
    console.error('Error processing shipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


