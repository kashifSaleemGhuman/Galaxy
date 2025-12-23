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

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ 
        error: 'At least one transfer line is required' 
      }, { status: 400 });
    }

    // ALL users (including SUPER_ADMIN and ADMIN) must create a request for approval
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

    // Create the request - ALL transfers require approval
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
      message: 'Transfer request created successfully and pending approval',
      data: createdRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json({ 
      error: 'Failed to create transfer',
      details: error.message 
    }, { status: 500 });
  }
}

