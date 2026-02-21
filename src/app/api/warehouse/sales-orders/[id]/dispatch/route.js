import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import { isAuthorizedForWarehouse } from '@/lib/warehouse-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/warehouse/sales-orders/[id]/dispatch - Dispatch a sales order
export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

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

    // Get the sales order
    const order = await prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: {
        warehouse: true,
        items: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 });
    }

    // Check if user is authorized for this warehouse
    const isAuthorized = await isAuthorizedForWarehouse(currentUser, order.warehouseId);
    if (!isAuthorized) {
      return NextResponse.json({ 
        error: 'Not authorized to dispatch orders from this warehouse' 
      }, { status: 403 });
    }

    // Check if order is in a valid state for dispatch
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be dispatched. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order status to dispatched
    const updatedOrder = await prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        status: 'dispatched',
        dispatchedAt: new Date(),
        dispatchedBy: currentUser.id
      },
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
      }
    });

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'DISPATCH_SALES_ORDER',
          details: `Dispatched sales order ${order.orderNumber} from warehouse ${order.warehouse.name}`
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
      // Continue - dispatch was successful
    }

    return NextResponse.json({
      success: true,
      message: 'Sales order dispatched successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error dispatching sales order:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch sales order', details: error.message },
      { status: 500 }
    );
  }
}




