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

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ 
        error: 'At least one adjustment line is required' 
      }, { status: 400 });
    }

    // ALL users (including SUPER_ADMIN and ADMIN) must create a request for approval
    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Create the request - ALL adjustments require approval
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
      message: 'Adjustment request created successfully and pending approval',
      data: createdRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating adjustment:', error);
    return NextResponse.json({ 
      error: 'Failed to create adjustment',
      details: error.message 
    }, { status: 500 });
  }
}

