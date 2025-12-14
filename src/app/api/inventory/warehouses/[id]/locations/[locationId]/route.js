import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import { crmCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// PUT /api/inventory/warehouses/[id]/locations/[locationId] - Update a location
export async function PUT(request, { params }) {
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

    const canUpdateLocations = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER
    ].includes(currentUser.role);

    if (!canUpdateLocations) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id, locationId } = params;
    const body = await request.json();
    const { code, name, description, isActive } = body;

    // Verify location exists and belongs to the warehouse
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location || location.warehouseId !== id) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (code && code !== location.code) {
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
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        ...(code && { code }),
        ...(name !== undefined && { name: name || null }),
        ...(description !== undefined && { description: description || null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Invalidate warehouse cache to refresh location count
    await crmCache.invalidateCustomer('inventory-warehouses');
    console.log('🗑️ Invalidated warehouse cache after location update');

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      data: updatedLocation
    });

  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json({ 
      error: 'Failed to update location',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/inventory/warehouses/[id]/locations/[locationId] - Delete a location
export async function DELETE(request, { params }) {
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

    const canDeleteLocations = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER
    ].includes(currentUser.role);

    if (!canDeleteLocations) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id, locationId } = params;

    // Verify location exists and belongs to the warehouse
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        inventoryItems: {
          take: 1
        }
      }
    });

    if (!location || location.warehouseId !== id) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if location has inventory items
    if (location.inventoryItems.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete location with inventory items. Please move or remove items first.' 
      }, { status: 400 });
    }

    await prisma.location.delete({
      where: { id: locationId }
    });

    // Invalidate warehouse cache to refresh location count
    await crmCache.invalidateCustomer('inventory-warehouses');
    console.log('🗑️ Invalidated warehouse cache after location deletion');

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ 
      error: 'Failed to delete location',
      details: error.message 
    }, { status: 500 });
  }
}

