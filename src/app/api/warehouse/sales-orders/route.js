import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import { getAssignedWarehouseId } from '@/lib/warehouse-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/warehouse/sales-orders - Get sales orders for warehouse operator
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (currentUser.role || '').toUpperCase();
    
    // Check if user has warehouse access
    const hasWarehouseAccess = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.WAREHOUSE_OPERATOR,
      ROLES.INVENTORY_USER,
      ROLES.INVENTORY_MANAGER
    ].includes(userRole);

    if (!hasWarehouseAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get warehouse ID for warehouse operator
    let warehouseId = null;
    if (userRole === ROLES.WAREHOUSE_OPERATOR) {
      warehouseId = await getAssignedWarehouseId(currentUser.id);
      if (!warehouseId) {
        return NextResponse.json({ 
          error: 'No warehouse assigned to this operator',
          orders: []
        }, { status: 200 });
      }
    }

    // For admins/managers, allow filtering by warehouse
    const { searchParams } = new URL(req.url);
    const filterWarehouseId = searchParams.get('warehouseId');
    const status = searchParams.get('status');

    // Build where clause
    const where = {};
    
    // Warehouse filter
    if (warehouseId) {
      where.warehouseId = warehouseId;
    } else if (filterWarehouseId && filterWarehouseId !== 'all') {
      where.warehouseId = filterWarehouseId;
    }

    // Status filter - only show pending and confirmed orders for dispatch
    if (status && status !== 'all') {
      where.status = status;
    } else {
      // Default: show pending and confirmed orders (ready for dispatch)
      where.status = { in: ['pending', 'confirmed'] };
    }

    const orders = await prisma.salesOrder.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        dispatchedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching warehouse sales orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales orders', details: error.message },
      { status: 500 }
    );
  }
}

