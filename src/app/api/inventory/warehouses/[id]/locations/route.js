import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import { crmCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/inventory/warehouses/[id]/locations - Get all locations for a warehouse
export async function GET(request, { params }) {
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

    const canViewLocations = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.INVENTORY_USER,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(currentUser.role);

    if (!canViewLocations) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    const locations = await prisma.location.findMany({
      where: { warehouseId: id },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: locations
    });

  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

// POST /api/inventory/warehouses/[id]/locations - Create a new location
export async function POST(request, { params }) {
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

    const canCreateLocations = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER
    ].includes(currentUser.role);

    if (!canCreateLocations) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { code, name, description, isActive = true } = body;

    if (!code) {
      return NextResponse.json({ error: 'Location code is required' }, { status: 400 });
    }

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Check if location code already exists in this warehouse
    const existingLocation = await prisma.location.findUnique({
      where: {
        warehouseId_code: {
          warehouseId: id,
          code: code
        }
      }
    });

    if (existingLocation) {
      return NextResponse.json({ 
        error: `Location with code "${code}" already exists in this warehouse` 
      }, { status: 409 });
    }

    const location = await prisma.location.create({
      data: {
        warehouseId: id,
        code,
        name: name || null,
        description: description || null,
        isActive
      }
    });

    // Invalidate warehouse cache to refresh location count
    await crmCache.invalidateCustomer('inventory-warehouses');
    console.log('🗑️ Invalidated warehouse cache after location creation');

    return NextResponse.json({
      success: true,
      message: 'Location created successfully',
      data: location
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json({ 
      error: 'Failed to create location',
      details: error.message 
    }, { status: 500 });
  }
}

