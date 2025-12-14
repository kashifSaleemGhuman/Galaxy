import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/inventory/movements - Get all stock movements
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

    const canViewMovements = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.INVENTORY_USER,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(currentUser.role);

    if (!canViewMovements) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const warehouseId = searchParams.get('warehouseId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(type && type !== 'all' && { type }),
      ...(warehouseId && warehouseId !== 'all' && { warehouseId }),
      ...(search && {
        OR: [
          { product: { name: { contains: search, mode: 'insensitive' } } },
          { product: { id: { contains: search, mode: 'insensitive' } } },
          { warehouse: { name: { contains: search, mode: 'insensitive' } } },
          { reference: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Get movements with relations
    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              unit: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          shipment: {
            select: {
              id: true,
              shipmentNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ]);

    // Get user info for createdBy
    const userIds = [...new Set(movements.map(m => m.createdBy).filter(Boolean))];
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true
      }
    }) : [];

    const userMap = new Map(users.map(u => [u.id, u]));

    // Get inventory items to fetch location data
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        productId: { in: movements.map(m => m.productId) },
        warehouseId: { in: movements.map(m => m.warehouseId) }
      },
      include: {
        warehouseLocation: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    // Create a map for quick lookup: productId-warehouseId -> location
    const locationMap = new Map();
    inventoryItems.forEach(item => {
      const key = `${item.productId}-${item.warehouseId}`;
      if (item.warehouseLocation) {
        locationMap.set(key, item.warehouseLocation);
      }
    });

    // Format response
    const formattedMovements = movements.map(movement => {
      const user = movement.createdBy ? userMap.get(movement.createdBy) : null;
      const locationKey = `${movement.productId}-${movement.warehouseId}`;
      const location = locationMap.get(locationKey);
      
      return {
        id: movement.id,
        product: {
          id: movement.product.id,
          name: movement.product.name,
          sku: movement.product.id,
          category: movement.product.category,
          unit: movement.product.unit
        },
        warehouse: {
          id: movement.warehouse.id,
          name: movement.warehouse.name,
          code: movement.warehouse.code
        },
        location: location ? {
          id: location.id,
          name: location.name || location.code,
          code: location.code
        } : {
          name: 'N/A',
          code: 'N/A'
        },
        movementType: movement.type,
        quantity: movement.quantity,
        unitCost: null, // Would need to calculate from related records
        totalCost: null, // Would need to calculate from related records
        referenceType: movement.reference ? 'purchase' : null, // Infer from reference format
        referenceId: movement.reference,
        notes: movement.reason,
        movementDate: movement.createdAt,
        createdAt: movement.createdAt,
        user: user ? {
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email
        } : {
          firstName: 'System',
          lastName: '',
          email: 'system@galaxy.com'
        }
      };
    });

    // Calculate stats
    const stats = {
      total: total,
      stockIn: await prisma.stockMovement.count({ where: { ...where, type: 'in' } }),
      stockOut: await prisma.stockMovement.count({ where: { ...where, type: 'out' } }),
      transfers: await prisma.stockMovement.count({ where: { ...where, type: 'transfer' } }),
      adjustments: await prisma.stockMovement.count({ where: { ...where, type: 'adjustment' } })
    };

    return NextResponse.json({
      success: true,
      data: formattedMovements,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 });
  }
}

// POST /api/inventory/movements - Create a new stock movement
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

    const canCreateMovements = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.WAREHOUSE_OPERATOR
    ].includes(currentUser.role);

    if (!canCreateMovements) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body first
    const body = await request.json();
    const { productId, warehouseId, locationId, type, quantity, reason, reference, shipmentId } = body;

    if (!productId || !warehouseId || !type || !quantity) {
      return NextResponse.json({ 
        error: 'Missing required fields: productId, warehouseId, type, quantity' 
      }, { status: 400 });
    }

    // Check if user needs approval (WAREHOUSE_OPERATOR and INVENTORY_MANAGER need approval)
    const needsApproval = [
      ROLES.WAREHOUSE_OPERATOR,
      ROLES.INVENTORY_MANAGER
    ].includes(currentUser.role);

    // If user needs approval, create a request instead
    if (needsApproval) {
      // Verify product and warehouse exist
      const [product, warehouse] = await Promise.all([
        prisma.product.findUnique({ where: { id: productId } }),
        prisma.warehouse.findUnique({ where: { id: warehouseId } })
      ]);

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (!warehouse) {
        return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
      }

      // Create the request
      const createdRequest = await prisma.stockMovementRequest.create({
        data: {
          requestType: 'movement',
          status: 'pending',
          requestedBy: currentUser.id,
          requestData: body,
          productId,
          warehouseId,
          locationId: locationId || null,
          type,
          quantity: parseInt(quantity),
          reason: reason || null,
          reference: reference || null
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
        message: 'Request created successfully and pending approval',
        data: createdRequest
      }, { status: 201 });
    }

    if (!['in', 'out', 'transfer', 'adjustment'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid movement type. Must be: in, out, transfer, or adjustment' 
      }, { status: 400 });
    }

    // Verify product and warehouse exist
    const [product, warehouse] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.warehouse.findUnique({ where: { id: warehouseId } })
    ]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Create stock movement
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        warehouseId,
        shipmentId: shipmentId || null,
        locationId: locationId || null,
        type,
        quantity: parseInt(quantity),
        reason: reason || null,
        reference: reference || null,
        createdBy: currentUser.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Update inventory item if it exists, or create it
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId
        }
      }
    });

    if (inventoryItem) {
      // Update existing inventory item
      const newQuantity = type === 'in' || type === 'adjustment' 
        ? inventoryItem.quantity + parseInt(quantity)
        : inventoryItem.quantity - Math.abs(parseInt(quantity));
      
      await prisma.inventoryItem.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        data: {
          quantity: Math.max(0, newQuantity),
          available: Math.max(0, newQuantity - (inventoryItem.reserved || 0)),
          locationId: locationId || inventoryItem.locationId
        }
      });
    } else if (type === 'in' || type === 'adjustment') {
      // Create new inventory item for incoming stock
      await prisma.inventoryItem.create({
        data: {
          productId,
          warehouseId,
          locationId: locationId || null,
          quantity: parseInt(quantity),
          available: parseInt(quantity),
          reserved: 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock movement created successfully',
      data: movement
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json({ 
      error: 'Failed to create stock movement',
      details: error.message 
    }, { status: 500 });
  }
}


