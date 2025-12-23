import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/cycle-counts - Create a cycle count (which becomes an adjustment)
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

    const canCreateCycleCounts = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(currentUser.role);

    if (!canCreateCycleCounts) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body first
    const body = await request.json();
    const { warehouseId, locationId, countDate, notes, lines, reference } = body;

    if (!warehouseId) {
      return NextResponse.json({ 
        error: 'Warehouse is required' 
      }, { status: 400 });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ 
        error: 'At least one cycle count line is required' 
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

    // Convert cycle count lines to adjustment format (expectedQuantity from inventory, actualQuantity from count)
    const adjustmentLines = await Promise.all(
      lines.map(async (line) => {
        // Get current inventory quantity as expected
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: warehouseId
            }
          }
        });

        return {
          productId: line.productId,
          expectedQuantity: inventoryItem?.quantity || 0,
          actualQuantity: line.actualQuantity || 0,
          locationId: line.locationId || locationId || null,
          notes: line.notes || notes || 'Cycle count'
        };
      })
    );

    // Create the request as an adjustment type (cycle counts are essentially adjustments)
    // ALL cycle counts require approval
    const createdRequest = await prisma.stockMovementRequest.create({
      data: {
        requestType: 'adjustment', // Cycle counts are treated as adjustments
        status: 'pending',
        requestedBy: currentUser.id,
        requestData: { 
          warehouseId, 
          reason: 'Cycle Count', 
          lines: adjustmentLines, 
          reference: reference || `CC-${Date.now()}`,
          countDate,
          notes
        },
        warehouseId,
        reason: 'Cycle Count',
        adjustmentLines: adjustmentLines,
        reference: reference || `CC-${Date.now()}`
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
      message: 'Cycle count request created successfully and pending approval',
      data: createdRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating cycle count:', error);
    return NextResponse.json({ 
      error: 'Failed to create cycle count',
      details: error.message 
    }, { status: 500 });
  }
}

