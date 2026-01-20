import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/inventory/products/[id]/stock-availability - Get stock availability for a product
export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId');

    // Get all inventory items for this product
    const where = { productId };
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Calculate total available across all warehouses
    const totalAvailable = inventoryItems.reduce((sum, item) => sum + (item.available || 0), 0);

    // Create warehouse breakdown
    const warehouseBreakdown = inventoryItems.map(item => ({
      warehouseId: item.warehouse.id,
      warehouseName: item.warehouse.name,
      warehouseCode: item.warehouse.code,
      available: item.available || 0,
      quantity: item.quantity || 0,
      reserved: item.reserved || 0
    }));

    return NextResponse.json({
      totalAvailable,
      warehouseBreakdown
    });

  } catch (error) {
    console.error('Error fetching stock availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock availability' },
      { status: 500 }
    );
  }
}
