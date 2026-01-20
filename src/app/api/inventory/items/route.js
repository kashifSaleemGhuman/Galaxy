import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/items - Create or update inventory item
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (currentUser.role || '').toUpperCase();
    // Allow SUPER_ADMIN, ADMIN, and WAREHOUSE_OPERATOR to manage inventory
    const canManage = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(userRole);

    if (!canManage) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage inventory' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { productId, warehouseId, quantity, minLevel, maxLevel, locationId } = body;

    // Validate required fields
    if (!productId || !warehouseId || quantity === undefined) {
      return NextResponse.json(
        { error: 'productId, warehouseId, and quantity are required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    // Check if inventory item exists
    const existing = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId
        }
      }
    });

    let inventoryItem;
    const quantityNum = parseInt(quantity);
    const available = quantityNum - (existing?.reserved || 0);

    if (existing) {
      // Update existing inventory item
      inventoryItem = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          quantity: quantityNum,
          available: Math.max(0, available),
          minLevel: minLevel !== undefined ? parseInt(minLevel) : existing.minLevel,
          maxLevel: maxLevel !== undefined ? parseInt(maxLevel) : existing.maxLevel,
          locationId: locationId || existing.locationId
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true }
          },
          warehouse: {
            select: { id: true, name: true, code: true }
          }
        }
      });
    } else {
      // Create new inventory item
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          productId,
          warehouseId,
          quantity: quantityNum,
          available: Math.max(0, available),
          reserved: 0,
          minLevel: minLevel !== undefined ? parseInt(minLevel) : 0,
          maxLevel: maxLevel !== undefined ? parseInt(maxLevel) : 0,
          locationId: locationId || null
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true }
          },
          warehouse: {
            select: { id: true, name: true, code: true }
          }
        }
      });
    }

    // Create stock movement record
    const quantityChange = existing 
      ? quantityNum - existing.quantity 
      : quantityNum;

    if (quantityChange !== 0) {
      await prisma.stockMovement.create({
        data: {
          productId,
          warehouseId,
          type: quantityChange > 0 ? 'in' : 'out',
          quantity: Math.abs(quantityChange),
          reason: existing ? 'Manual inventory adjustment' : 'Initial stock entry',
          reference: `MANUAL-${Date.now()}`,
          createdBy: session.user.id
        }
      });
    }

    return NextResponse.json({
      message: existing ? 'Inventory updated successfully' : 'Inventory created successfully',
      inventoryItem
    });

  } catch (error) {
    console.error('Error managing inventory:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Inventory item already exists for this product and warehouse' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to manage inventory' },
      { status: 500 }
    );
  }
}

// GET /api/inventory/items - List inventory items
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const warehouseId = searchParams.get('warehouseId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    const where = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            select: { id: true, name: true, sku: true }
          },
          warehouse: {
            select: { id: true, name: true, code: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.inventoryItem.count({ where })
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}
