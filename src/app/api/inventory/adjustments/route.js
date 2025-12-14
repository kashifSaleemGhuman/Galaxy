import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/adjustments - Create an adjustment (stock correction)
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

    const canCreateAdjustments = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(currentUser.role);

    if (!canCreateAdjustments) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body first
    const body = await request.json();
    const { warehouseId, reason, lines, reference } = body;

    if (!warehouseId) {
      return NextResponse.json({ 
        error: 'Warehouse is required' 
      }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ 
        error: 'Adjustment reason is required' 
      }, { status: 400 });
    }

    // Check if user needs approval (WAREHOUSE_OPERATOR and INVENTORY_MANAGER need approval)
    const needsApproval = [
      ROLES.WAREHOUSE_OPERATOR,
      ROLES.INVENTORY_MANAGER
    ].includes(currentUser.role);

    // If user needs approval, create a request instead
    if (needsApproval) {
      // Verify warehouse exists
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId }
      });

      if (!warehouse) {
        return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
      }

      // Create the request
      const createdRequest = await prisma.stockMovementRequest.create({
        data: {
          requestType: 'adjustment',
          status: 'pending',
          requestedBy: currentUser.id,
          requestData: { warehouseId, reason, lines, reference },
          warehouseId,
          reason,
          adjustmentLines: lines,
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
        error: 'At least one adjustment line is required' 
      }, { status: 400 });
    }

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    const adjustmentReference = reference || `ADJ-${Date.now()}`;
    const createdMovements = [];

    // Process each adjustment line
    for (const line of lines) {
      const { productId, expectedQuantity, actualQuantity, locationId, notes } = line;

      if (!productId || expectedQuantity === undefined || actualQuantity === undefined) {
        continue; // Skip invalid lines
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        continue; // Skip if product doesn't exist
      }

      const difference = actualQuantity - expectedQuantity;

      if (difference === 0) {
        continue; // Skip if no adjustment needed
      }

      // Get current inventory
      let inventoryItem = await prisma.inventoryItem.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        }
      });

      // Ensure inventory item exists before creating stock movement
      // (StockMovement requires InventoryItem to exist due to foreign key constraint)
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
      }

      // Create adjustment movement (inventory now exists)
      const movement = await prisma.stockMovement.create({
        data: {
          productId,
          warehouseId,
          locationId: locationId || null,
          type: 'adjustment',
          quantity: difference, // Can be positive or negative
          reason: `${reason}${notes ? ` - ${notes}` : ''}`,
          reference: adjustmentReference,
          createdBy: currentUser.id
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

      createdMovements.push(movement);
    }

    return NextResponse.json({
      success: true,
      message: 'Adjustment completed successfully',
      data: {
        reference: adjustmentReference,
        movements: createdMovements,
        warehouse: warehouse.name
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating adjustment:', error);
    return NextResponse.json({ 
      error: 'Failed to create adjustment',
      details: error.message 
    }, { status: 500 });
  }
}

