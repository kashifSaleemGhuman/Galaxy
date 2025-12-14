import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/transfers - Create a transfer (stock movement between warehouses)
export async function POST(request) {
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

    const canCreateTransfers = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(currentUser.role);

    if (!canCreateTransfers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body first
    const body = await request.json();
    const { fromWarehouseId, toWarehouseId, lines, notes, reference } = body;

    if (!fromWarehouseId || !toWarehouseId) {
      return NextResponse.json({ 
        error: 'From warehouse and to warehouse are required' 
      }, { status: 400 });
    }

    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json({ 
        error: 'From and to warehouses must be different' 
      }, { status: 400 });
    }

    // Check if user needs approval (WAREHOUSE_OPERATOR and INVENTORY_MANAGER need approval)
    const needsApproval = [
      ROLES.WAREHOUSE_OPERATOR,
      ROLES.INVENTORY_MANAGER
    ].includes(currentUser.role);

    // If user needs approval, create a request instead
    if (needsApproval) {
      // Verify warehouses exist
      const [fromWarehouse, toWarehouse] = await Promise.all([
        prisma.warehouse.findUnique({ where: { id: fromWarehouseId } }),
        prisma.warehouse.findUnique({ where: { id: toWarehouseId } })
      ]);

      if (!fromWarehouse) {
        return NextResponse.json({ error: 'From warehouse not found' }, { status: 404 });
      }

      if (!toWarehouse) {
        return NextResponse.json({ error: 'To warehouse not found' }, { status: 404 });
      }

      // Create the request
      const createdRequest = await prisma.stockMovementRequest.create({
        data: {
          requestType: 'transfer',
          status: 'pending',
          requestedBy: currentUser.id,
          requestData: { fromWarehouseId, toWarehouseId, lines, notes, reference },
          fromWarehouseId,
          toWarehouseId,
          transferLines: lines,
          reference: reference || null
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Request created successfully and pending approval',
        data: createdRequest
      }, { status: 201 });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ 
        error: 'At least one transfer line is required' 
      }, { status: 400 });
    }

    // Verify warehouses exist
    const [fromWarehouse, toWarehouse] = await Promise.all([
      prisma.warehouse.findUnique({ where: { id: fromWarehouseId } }),
      prisma.warehouse.findUnique({ where: { id: toWarehouseId } })
    ]);

    if (!fromWarehouse) {
      return NextResponse.json({ error: 'From warehouse not found' }, { status: 404 });
    }

    if (!toWarehouse) {
      return NextResponse.json({ error: 'To warehouse not found' }, { status: 404 });
    }

    const transferReference = reference || `TR-${Date.now()}`;
    const createdMovements = [];

    // Process each transfer line
    for (const line of lines) {
      const { productId, quantity, fromLocationId, toLocationId, reason } = line;

      if (!productId || !quantity || quantity <= 0) {
        continue; // Skip invalid lines
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        continue; // Skip if product doesn't exist
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

      // Create stock out movement from source warehouse (inventory already exists)
      const outMovement = await prisma.stockMovement.create({
        data: {
          productId,
          warehouseId: fromWarehouseId,
          locationId: fromLocationId || null,
          type: 'transfer',
          quantity: -Math.abs(quantity), // Negative for out
          reason: reason || `Transfer to ${toWarehouse.name}`,
          reference: transferReference,
          createdBy: currentUser.id
        }
      });

      // Create stock in movement to destination warehouse (inventory now exists)
      const inMovement = await prisma.stockMovement.create({
        data: {
          productId,
          warehouseId: toWarehouseId,
          locationId: toLocationId || null,
          type: 'transfer',
          quantity: Math.abs(quantity), // Positive for in
          reason: reason || `Transfer from ${fromWarehouse.name}`,
          reference: transferReference,
          createdBy: currentUser.id
        }
      });

      // Update source warehouse inventory
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

      // Update destination warehouse inventory (now it definitely exists)
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

      createdMovements.push({ outMovement, inMovement });
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        reference: transferReference,
        movements: createdMovements,
        fromWarehouse: fromWarehouse.name,
        toWarehouse: toWarehouse.name
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json({ 
      error: 'Failed to create transfer',
      details: error.message 
    }, { status: 500 });
  }
}

