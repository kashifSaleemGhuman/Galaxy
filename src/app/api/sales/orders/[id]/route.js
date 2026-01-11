import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/sales/orders/[id] - Get single sales order
export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

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

    // Check permissions
    const userRole = (currentUser.role || '').toUpperCase();
    const canViewOrders = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.SALES_MANAGER,
      ROLES.SALES_USER
    ].includes(userRole);

    if (!canViewOrders) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
            items: true
          }
        },
        warehouse: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 });
    }

    // For sales users, only allow viewing their own orders
    if (userRole === ROLES.SALES_USER && order.createdById !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get related stock movements for this order
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        reference: order.orderNumber
      },
      include: {
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
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      order: {
        ...order,
        stockMovements
      }
    });
  } catch (error) {
    console.error('Error fetching sales order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales order' },
      { status: 500 }
    );
  }
}
