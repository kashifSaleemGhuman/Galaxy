import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/warehouses
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Prisma client has the model (server restart may be needed)
    if (!prisma.supplierLeatherWarehouse) {
      console.error('Prisma model supplierLeatherWarehouse not found. Server restart required.');
      return NextResponse.json({ 
        error: 'Database model not available',
        message: 'Please restart the Next.js development server to load the updated Prisma client.',
        hint: 'Run: npm run dev (after stopping the current server)'
      }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const supplierId = searchParams.get('supplierId');

    if (id) {
      // Check if model exists
      if (!prisma.supplierLeatherWarehouse) {
        console.error('Prisma model supplierLeatherWarehouse not found');
        return NextResponse.json({ error: 'Warehouse model not available' }, { status: 503 });
      }
      
      // Get single warehouse with related IGPs
      const warehouse = await prisma.supplierLeatherWarehouse.findUnique({
        where: { id },
        include: {
          igps: {
            include: {
              rawBatches: {
                select: {
                  id: true,
                  batchCode: true,
                  status: true
                }
              }
            }
          }
        }
      });

      if (!warehouse) {
        return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: warehouse });
    }

    // Get all warehouses or filter by supplier
    const where = supplierId ? { supplierId } : {};
    
    // Check if model exists
    if (!prisma.supplierLeatherWarehouse) {
      console.error('Prisma model supplierLeatherWarehouse not found');
      return NextResponse.json({ success: true, data: [] });
    }
    
    const warehouses = await prisma.supplierLeatherWarehouse.findMany({
      where,
      include: {
        _count: {
          select: {
            igps: true
          }
        }
      },
      orderBy: { warehouseName: 'asc' }
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Check if Prisma client has the model
    if (!prisma.supplierLeatherWarehouse) {
      console.error('Prisma client does not have supplierLeatherWarehouse model. Please restart the server.');
      return NextResponse.json({ 
        error: 'Database model not available. Please restart the server.',
        details: 'The Prisma client needs to be regenerated and the server restarted.'
      }, { status: 503 });
    }
    
    // If model doesn't exist yet (migration not run), return empty array
    const errorMessage = error.message || '';
    if (
      errorMessage.includes('Unknown model') || 
      errorMessage.includes('does not exist') ||
      errorMessage.includes('P2001') ||
      errorMessage.includes('P2025') ||
      error.code === 'P2001' ||
      error.code === 'P2025'
    ) {
      return NextResponse.json({ success: true, data: [] });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organization/traceability/warehouses
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      warehouseName,
      supplierId,
      supplierName,
      location,
      region,
      lwgCertified,
      capacity,
      capacityUnit,
      contactPerson,
      contactPhone,
      contactEmail,
      notes,
      status
    } = body;

    if (!warehouseName) {
      return NextResponse.json(
        { error: 'Warehouse Name is required' },
        { status: 400 }
      );
    }

    // Check if warehouse name already exists
    const existingWarehouse = await prisma.supplierLeatherWarehouse.findUnique({
      where: { warehouseName }
    });

    if (existingWarehouse) {
      return NextResponse.json(
        { error: 'Warehouse Name already exists' },
        { status: 400 }
      );
    }

    const warehouse = await prisma.supplierLeatherWarehouse.create({
      data: {
        warehouseName,
        supplierId: supplierId || '',
        supplierName: supplierName || '',
        location,
        region,
        lwgCertified: lwgCertified || false,
        capacity: capacity ? parseFloat(capacity) : null,
        capacityUnit,
        contactPerson,
        contactPhone,
        contactEmail,
        notes,
        status: status || 'active'
      }
    });

    return NextResponse.json({ success: true, data: warehouse }, { status: 201 });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/warehouses
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Convert capacity to Decimal if provided
    if (updateData.capacity !== undefined) {
      updateData.capacity = updateData.capacity ? parseFloat(updateData.capacity) : null;
    }

    const warehouse = await prisma.supplierLeatherWarehouse.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/organization/traceability/warehouses
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if warehouse has associated IGPs
    const warehouse = await prisma.supplierLeatherWarehouse.findUnique({
      where: { id },
      include: { igps: true }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    if (warehouse.igps.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse with associated IGPs' },
        { status: 400 }
      );
    }

    await prisma.supplierLeatherWarehouse.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

