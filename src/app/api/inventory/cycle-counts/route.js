import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/inventory/cycle-counts - Fetch cycle counts aggregated from movements and pending requests
export async function GET(request) {
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

    const canViewCycleCounts = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.INVENTORY_USER
    ].includes(currentUser.role);

    if (!canViewCycleCounts) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const search = searchParams.get('search');

    const where = {
      type: 'adjustment',
      OR: [
        { reason: { contains: 'cycle count', mode: 'insensitive' } },
        { reference: { startsWith: 'CC-' } }
      ],
      ...(warehouseId && { warehouseId }),
      ...(search && {
        OR: [
          { product: { name: { contains: search, mode: 'insensitive' } } },
          { product: { id: { contains: search, mode: 'insensitive' } } },
          { warehouse: { name: { contains: search, mode: 'insensitive' } } },
          { reference: { contains: search, mode: 'insensitive' } },
          { reason: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, category: true, unit: true }
        },
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        location: {
          select: { id: true, name: true, code: true }
        },
        request: {
          select: { id: true, status: true, reference: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const userIds = [...new Set(movements.map(m => m.createdBy).filter(Boolean))];
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    }) : [];

    const userMap = new Map(users.map(u => [u.id, u]));
    const cycleCountMap = new Map();

    movements.forEach(movement => {
      const ref = movement.reference || movement.request?.reference || `CC-${movement.id}`;
      if (!cycleCountMap.has(ref)) {
        const user = movement.createdBy ? userMap.get(movement.createdBy) : null;
        cycleCountMap.set(ref, {
          id: ref,
          countNumber: ref,
          warehouse: movement.warehouse,
          location: movement.location || null,
          status: movement.request?.status || 'completed',
          notes: movement.reason || '',
          countDate: movement.createdAt,
          createdAt: movement.createdAt,
          user: user ? {
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email
          } : {
            firstName: 'System',
            lastName: '',
            email: 'system@galaxy.com'
          },
          lines: []
        });
      }

      const cycleCount = cycleCountMap.get(ref);
      cycleCount.lines.push({
        id: movement.id,
        product: movement.product,
        location: movement.location || null,
        expectedQuantity: movement.quantity < 0 ? Math.abs(movement.quantity) : 0,
        countedQuantity: movement.quantity > 0 ? movement.quantity : 0,
        difference: movement.quantity,
        notes: movement.reason || ''
      });
    });

    // Include pending/approved requests that have not yet produced movements
    const requests = await prisma.stockMovementRequest.findMany({
      where: {
        requestType: 'adjustment',
        status: { in: ['pending', 'approved'] },
        OR: [
          { reason: { contains: 'cycle count', mode: 'insensitive' } },
          { reference: { startsWith: 'CC-' } }
        ]
      },
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
        requester: { select: { name: true, email: true } }
      },
      orderBy: { requestedAt: 'desc' }
    });

    requests.forEach(request => {
      const ref = request.reference || `CC-${request.id}`;
      if (cycleCountMap.has(ref)) return;

      const requesterName = request.requester?.name || '';
      const requesterFirst = requesterName.split(' ')[0] || '';
      const requesterLast = requesterName.split(' ').slice(1).join(' ') || '';
      const adjustmentLines = Array.isArray(request.adjustmentLines) ? request.adjustmentLines : [];

      cycleCountMap.set(ref, {
        id: ref,
        countNumber: ref,
        warehouse: request.warehouse,
        location: null,
        status: request.status,
        notes: request.reason || '',
        countDate: request.requestedAt,
        createdAt: request.requestedAt,
        user: {
          firstName: requesterFirst,
          lastName: requesterLast,
          email: request.requester?.email || ''
        },
        lines: adjustmentLines.map((line, idx) => ({
          id: `${ref}-${idx}`,
          product: line.productId ? { id: line.productId, name: '', sku: line.productId } : null,
          location: null,
          expectedQuantity: line.expectedQuantity ?? 0,
          countedQuantity: line.actualQuantity ?? 0,
          difference: typeof line.actualQuantity === 'number' && typeof line.expectedQuantity === 'number'
            ? line.actualQuantity - line.expectedQuantity
            : 0,
          notes: line.notes || ''
        }))
      });
    });

    return NextResponse.json({
      success: true,
      data: Array.from(cycleCountMap.values())
    });
  } catch (error) {
    console.error('Error fetching cycle counts:', error);
    return NextResponse.json({ error: 'Failed to fetch cycle counts' }, { status: 500 });
  }
}

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

      // Create the request as an adjustment type (cycle counts are treated as adjustments)
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
    }

    // For admins, process cycle count directly as adjustment
    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    const adjustmentReference = reference || `CC-${Date.now()}`;
    const createdMovements = [];

    // Process each cycle count line as an adjustment
    for (const line of lines) {
      const { productId, actualQuantity, locationId: lineLocationId, notes: lineNotes } = line;

      if (!productId || actualQuantity === undefined) {
        continue; // Skip invalid lines
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        continue; // Skip if product doesn't exist
      }

      // Get current inventory quantity as expected
      let inventoryItem = await prisma.inventoryItem.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        }
      });

      const expectedQuantity = inventoryItem?.quantity || 0;
      const difference = actualQuantity - expectedQuantity;

      if (difference === 0) {
        continue; // Skip if no adjustment needed
      }

      // Ensure inventory item exists before creating stock movement
      if (!inventoryItem) {
        const initialQuantity = difference > 0 ? actualQuantity : 0;
        inventoryItem = await prisma.inventoryItem.create({
          data: {
            productId,
            warehouseId,
            locationId: lineLocationId || locationId || null,
            quantity: initialQuantity,
            available: initialQuantity,
            reserved: 0
          }
        });
      }

      // Create adjustment movement
      const movement = await prisma.stockMovement.create({
        data: {
          productId,
          warehouseId,
          locationId: lineLocationId || locationId || null,
          type: 'adjustment',
          quantity: difference,
          reason: `Cycle Count${lineNotes ? ` - ${lineNotes}` : notes ? ` - ${notes}` : ''}`,
          reference: adjustmentReference,
          createdBy: currentUser.id
        }
      });

      // Update inventory with actual quantity
      await prisma.inventoryItem.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        data: {
          quantity: Math.max(0, actualQuantity),
          available: Math.max(0, actualQuantity - (inventoryItem.reserved || 0)),
          locationId: lineLocationId || locationId || inventoryItem.locationId
        }
      });

      createdMovements.push(movement);
    }

    return NextResponse.json({
      success: true,
      message: 'Cycle count completed successfully',
      data: {
        reference: adjustmentReference,
        movements: createdMovements,
        warehouse: warehouse.name
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating cycle count:', error);
    return NextResponse.json({ 
      error: 'Failed to create cycle count',
      details: error.message 
    }, { status: 500 });
  }
}


