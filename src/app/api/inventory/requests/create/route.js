import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/requests/create - Create a stock movement request
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

    const body = await request.json();
    const { requestType, ...requestData } = body;

    if (!requestType || !['movement', 'transfer', 'adjustment'].includes(requestType)) {
      return NextResponse.json({ 
        error: 'Invalid request type. Must be: movement, transfer, or adjustment' 
      }, { status: 400 });
    }

    // Check if user needs approval (WAREHOUSE_OPERATOR and INVENTORY_MANAGER need approval)
    const needsApproval = [
      ROLES.WAREHOUSE_OPERATOR,
      ROLES.INVENTORY_MANAGER
    ].includes(currentUser.role);

    // Super Admin and Admin can create movements directly (no approval needed)
    const canCreateDirectly = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN
    ].includes(currentUser.role);

    if (canCreateDirectly) {
      // For Super Admin and Admin, create the movement directly
      // This will be handled by the existing endpoints
      return NextResponse.json({ 
        error: 'Use the direct movement endpoints for Super Admin and Admin roles' 
      }, { status: 400 });
    }

    if (!needsApproval) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to create requests' 
      }, { status: 403 });
    }

    // Create the request
    let requestPayload = {
      requestType,
      status: 'pending',
      requestedBy: currentUser.id,
      requestData: requestData
    };

    if (requestType === 'movement') {
      const { productId, warehouseId, locationId, type, quantity, reason, reference } = requestData;

      if (!productId || !warehouseId || !type || !quantity) {
        return NextResponse.json({ 
          error: 'Missing required fields: productId, warehouseId, type, quantity' 
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

      requestPayload = {
        ...requestPayload,
        productId,
        warehouseId,
        locationId: locationId || null,
        type,
        quantity: parseInt(quantity),
        reason: reason || null,
        reference: reference || null
      };

    } else if (requestType === 'transfer') {
      const { fromWarehouseId, toWarehouseId, lines, reference } = requestData;

      if (!fromWarehouseId || !toWarehouseId || !lines || lines.length === 0) {
        return NextResponse.json({ 
          error: 'Missing required fields: fromWarehouseId, toWarehouseId, lines' 
        }, { status: 400 });
      }

      if (fromWarehouseId === toWarehouseId) {
        return NextResponse.json({ 
          error: 'Source and destination warehouses cannot be the same' 
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

      requestPayload = {
        ...requestPayload,
        fromWarehouseId,
        toWarehouseId,
        transferLines: lines,
        reference: reference || null
      };

    } else if (requestType === 'adjustment') {
      const { warehouseId, reason, lines, reference } = requestData;

      if (!warehouseId || !reason || !lines || lines.length === 0) {
        return NextResponse.json({ 
          error: 'Missing required fields: warehouseId, reason, lines' 
        }, { status: 400 });
      }

      // Verify warehouse exists
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId }
      });

      if (!warehouse) {
        return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
      }

      requestPayload = {
        ...requestPayload,
        warehouseId,
        reason,
        adjustmentLines: lines,
        reference: reference || null
      };
    }

    const createdRequest = await prisma.stockMovementRequest.create({
      data: requestPayload,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Request created successfully and pending approval',
      data: createdRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ 
      error: 'Failed to create request',
      details: error.message 
    }, { status: 500 });
  }
}


