import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/requests/[id]/approve - Approve a stock movement request
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only Super Admin and Admin can approve requests
    const canApprove = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN
    ].includes(currentUser.role);

    if (!canApprove) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: requestId } = params;
    const body = await request.json();
    const { notes } = body;

    // Get the request
    const stockRequest = await prisma.stockMovementRequest.findUnique({
      where: { id: requestId },
      include: {
        product: true,
        warehouse: true,
        fromWarehouse: true,
        toWarehouse: true,
        location: true
      }
    });

    if (!stockRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (stockRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: `Request is already ${stockRequest.status}` 
      }, { status: 400 });
    }

    // Update request status
    await prisma.stockMovementRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        approvedBy: currentUser.id,
        approvedAt: new Date(),
        notes: notes || stockRequest.notes
      }
    });

    // Execute the movement based on request type
    if (stockRequest.requestType === 'movement') {
      // Handle simple movement (in/out)
      const { productId, warehouseId, locationId, type, quantity, reason, reference } = stockRequest;

      if (!productId || !warehouseId || !type || !quantity) {
        return NextResponse.json({ 
          error: 'Invalid movement request data' 
        }, { status: 400 });
      }

      // Verify product and warehouse exist
      const [product, warehouse] = await Promise.all([
        prisma.product.findUnique({ where: { id: productId } }),
        prisma.warehouse.findUnique({ where: { id: warehouseId } })
      ]);

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (!warehouse) {
        return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
      }

      // Create stock movement
      const movement = await prisma.stockMovement.create({
        data: {
          productId,
          warehouseId,
          locationId: locationId || null,
          type,
          quantity: parseInt(quantity),
          reason: reason || null,
          reference: reference || null,
          createdBy: stockRequest.requestedBy,
          requestId: requestId
        }
      });

      // Update inventory item
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        }
      });

      if (inventoryItem) {
        const newQuantity = type === 'in' 
          ? inventoryItem.quantity + parseInt(quantity)
          : inventoryItem.quantity - Math.abs(parseInt(quantity));
        
        await prisma.inventoryItem.update({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId
            }
          },
          data: {
            quantity: Math.max(0, newQuantity),
            available: Math.max(0, newQuantity - (inventoryItem.reserved || 0)),
            locationId: locationId || inventoryItem.locationId
          }
        });
      } else if (type === 'in') {
        await prisma.inventoryItem.create({
          data: {
            productId,
            warehouseId,
            locationId: locationId || null,
            quantity: parseInt(quantity),
            available: parseInt(quantity),
            reserved: 0
          }
        });
      }

    } else if (stockRequest.requestType === 'transfer') {
      // Handle transfer
      const { fromWarehouseId, toWarehouseId, transferLines, reference } = stockRequest;

      if (!fromWarehouseId || !toWarehouseId || !transferLines) {
        return NextResponse.json({ 
          error: 'Invalid transfer request data' 
        }, { status: 400 });
      }

      const transferReference = reference || `TR-${Date.now()}`;
      
      // Handle transferLines - could be array, JSON string, or null
      let lines = [];
      if (Array.isArray(transferLines)) {
        lines = transferLines;
      } else if (typeof transferLines === 'string') {
        try {
          lines = JSON.parse(transferLines);
        } catch (e) {
          return NextResponse.json({ 
            error: 'Invalid transfer lines format' 
          }, { status: 400 });
        }
      } else if (transferLines) {
        lines = [transferLines];
      }
      
      if (!Array.isArray(lines) || lines.length === 0) {
        return NextResponse.json({ 
          error: 'No valid transfer lines found' 
        }, { status: 400 });
      }

      for (const line of lines) {
        const { productId, quantity, fromLocationId, toLocationId, reason } = line;

        if (!productId || !quantity || quantity <= 0) {
          continue;
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          continue;
        }

        // Check if source warehouse has enough stock
        const sourceInventory = await prisma.inventoryItem.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: fromWarehouseId
            }
          }
        });

        if (!sourceInventory || sourceInventory.quantity < quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for product ${product.name} in source warehouse. Available: ${sourceInventory?.quantity || 0}, Required: ${quantity}` 
          }, { status: 400 });
        }

        // Ensure destination inventory item exists before creating stock movement
        // (StockMovement requires InventoryItem to exist due to foreign key constraint)
        let destInventory = await prisma.inventoryItem.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: toWarehouseId
            }
          }
        });

        if (!destInventory) {
          // Create destination inventory item with 0 quantity first
          destInventory = await prisma.inventoryItem.create({
            data: {
              productId,
              warehouseId: toWarehouseId,
              locationId: toLocationId || null,
              quantity: 0,
              available: 0,
              reserved: 0
            }
          });
        }

        // Create stock out movement (source warehouse - inventory already exists)
        await prisma.stockMovement.create({
          data: {
            productId,
            warehouseId: fromWarehouseId,
            locationId: fromLocationId || null,
            type: 'transfer',
            quantity: -Math.abs(quantity),
            reason: reason || `Transfer to ${toWarehouseId}`,
            reference: transferReference,
            createdBy: stockRequest.requestedBy,
            requestId: requestId
          }
        });

        // Create stock in movement (destination warehouse - inventory now exists)
        await prisma.stockMovement.create({
          data: {
            productId,
            warehouseId: toWarehouseId,
            locationId: toLocationId || null,
            type: 'transfer',
            quantity: Math.abs(quantity),
            reason: reason || `Transfer from ${fromWarehouseId}`,
            reference: transferReference,
            createdBy: stockRequest.requestedBy,
            requestId: requestId
          }
        });

        // Update source inventory
        await prisma.inventoryItem.update({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: fromWarehouseId
            }
          },
          data: {
            quantity: sourceInventory.quantity - quantity,
            available: Math.max(0, (sourceInventory.available || sourceInventory.quantity) - quantity)
          }
        });

        // Update destination inventory (now it definitely exists)
        await prisma.inventoryItem.update({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: toWarehouseId
            }
          },
          data: {
            quantity: destInventory.quantity + quantity,
            available: (destInventory.available || destInventory.quantity) + quantity,
            locationId: toLocationId || destInventory.locationId
          }
        });
      }

    } else if (stockRequest.requestType === 'adjustment') {
      // Handle adjustment
      const { warehouseId, adjustmentLines, reason, reference } = stockRequest;

      if (!warehouseId || !adjustmentLines) {
        return NextResponse.json({ 
          error: 'Invalid adjustment request data' 
        }, { status: 400 });
      }

      const adjustmentReference = reference || `ADJ-${Date.now()}`;
      
      // Handle adjustmentLines - could be array, JSON string, or null
      let lines = [];
      if (Array.isArray(adjustmentLines)) {
        lines = adjustmentLines;
      } else if (typeof adjustmentLines === 'string') {
        try {
          lines = JSON.parse(adjustmentLines);
        } catch (e) {
          return NextResponse.json({ 
            error: 'Invalid adjustment lines format' 
          }, { status: 400 });
        }
      } else if (adjustmentLines) {
        lines = [adjustmentLines];
      }
      
      if (!Array.isArray(lines) || lines.length === 0) {
        return NextResponse.json({ 
          error: 'No valid adjustment lines found' 
        }, { status: 400 });
      }

      for (const line of lines) {
        const { productId, expectedQuantity, actualQuantity, locationId, notes } = line;

        if (!productId || expectedQuantity === undefined || actualQuantity === undefined) {
          continue;
        }

        const product = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          continue;
        }

        const difference = actualQuantity - expectedQuantity;

        if (difference === 0) {
          continue;
        }

        // Ensure inventory item exists before creating stock movement
        // (StockMovement requires InventoryItem to exist due to foreign key constraint)
        let inventoryItem = await prisma.inventoryItem.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId
            }
          }
        });

        if (!inventoryItem) {
          // Create inventory item with expected quantity first (if difference is positive, use actual; if negative, use 0)
          const initialQuantity = difference > 0 ? actualQuantity : Math.max(0, actualQuantity);
          inventoryItem = await prisma.inventoryItem.create({
            data: {
              productId,
              warehouseId,
              locationId: locationId || null,
              quantity: initialQuantity,
              available: initialQuantity,
              reserved: 0
            }
          });
          
          // If difference is negative and we created with actual quantity, we need to adjust
          if (difference < 0) {
            // The movement will handle the adjustment
          }
        }

        // Create adjustment movement (inventory now exists)
        await prisma.stockMovement.create({
          data: {
            productId,
            warehouseId,
            locationId: locationId || null,
            type: 'adjustment',
            quantity: difference,
            reason: `${reason}${notes ? ` - ${notes}` : ''}`,
            reference: adjustmentReference,
            createdBy: stockRequest.requestedBy,
            requestId: requestId
          }
        });

        // Update inventory with actual quantity
        const newQuantity = actualQuantity; // Use actual quantity as the new quantity
        await prisma.inventoryItem.update({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId
            }
          },
          data: {
            quantity: Math.max(0, newQuantity),
            available: Math.max(0, newQuantity - (inventoryItem.reserved || 0)),
            locationId: locationId || inventoryItem.locationId
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Request approved and movement executed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({ 
      error: 'Failed to approve request',
      details: error.message 
    }, { status: 500 });
  }
}


