import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view inventory
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions - inventory managers and admins can view inventory
    const role = (currentUser.role || '').toUpperCase()
    const canViewInventory = [ROLES.INVENTORY_MANAGER, ROLES.INVENTORY_USER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role);
    
    if (!canViewInventory) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const status = searchParams.get('status');

    // Build where clause
    const where = {};
    if (warehouseId && warehouseId !== 'all') {
      where.warehouseId = warehouseId;
    }

    // Get inventory items with related data
    const inventoryItems = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Get warehouses for filtering
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true }
    });

    // Transform data for frontend
    const shapedItems = inventoryItems.map(item => {
      const lastMovement = item.stockMovements[0];
      
      // Determine stock status
      let stockStatus = 'in_stock';
      if (item.quantity <= 0) {
        stockStatus = 'out_of_stock';
      } else if (item.quantity <= item.minLevel) {
        stockStatus = 'low_stock';
      } else if (item.quantity >= item.maxLevel * 0.9) {
        stockStatus = 'high_stock';
      }

      return {
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.id, // Using ID as SKU for now
          barcode: item.product.id, // Using ID as barcode for now
          category: { name: item.product.category || 'Uncategorized' }
        },
        warehouse: {
          id: item.warehouse.id,
          name: item.warehouse.name,
          code: item.warehouse.code
        },
        location: {
          id: item.location || 'default',
          name: item.location || 'Default Location',
          code: item.location || 'DEFAULT'
        },
        quantityOnHand: item.quantity,
        quantityReserved: item.reserved,
        quantityAvailable: item.available,
        reorderPoint: item.minLevel,
        maxStock: item.maxLevel,
        minStock: item.minLevel,
        averageCost: 0, // TODO: Calculate from stock movements
        lastCost: 0, // TODO: Get from last stock movement
        lastMovementDate: lastMovement?.createdAt || item.updatedAt,
        status: stockStatus
      };
    });

    // Filter by status if specified
    let filteredItems = shapedItems;
    if (status && status !== 'all') {
      filteredItems = shapedItems.filter(item => item.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredItems,
      warehouses,
      count: filteredItems.length
    });

  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

