import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/igp
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Prisma client has the model (server restart may be needed)
    if (!prisma.inwardGatePass) {
      console.error('Prisma model inwardGatePass not found. Server restart required.');
      return NextResponse.json({ 
        error: 'Database model not available',
        message: 'Please restart the Next.js development server to load the updated Prisma client.',
        hint: 'Run: npm run dev (after stopping the current server)'
      }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single IGP with related batches
      const igp = await prisma.inwardGatePass.findUnique({
        where: { id },
        include: {
          rawBatches: {
            include: {
              wetBlueBatches: {
                include: {
                  reTanningBatches: {
                    include: {
                      finishedBatches: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!igp) {
        return NextResponse.json({ error: 'IGP not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: igp });
    }

    // Get all IGPs
    // Check if model exists
    if (!prisma.inwardGatePass) {
      console.error('Prisma model inwardGatePass not found');
      return NextResponse.json({ success: true, data: [] });
    }
    
    const igps = await prisma.inwardGatePass.findMany({
      include: {
        warehouse: {
          select: {
            id: true,
            warehouseName: true,
            supplierName: true
          }
        },
        rawBatches: {
          select: {
            id: true,
            batchCode: true,
            status: true
          }
        }
      },
      orderBy: { deliveryDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: igps });
  } catch (error) {
    console.error('Error fetching IGPs:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Check if Prisma client has the model
    if (!prisma.inwardGatePass) {
      console.error('Prisma client does not have inwardGatePass model. Please restart the server.');
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
      errorMessage.includes('P2001') || // Record not found
      errorMessage.includes('P2025') || // Record to update not found
      error.code === 'P2001' ||
      error.code === 'P2025'
    ) {
      return NextResponse.json({ success: true, data: [] });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organization/traceability/igp
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      igpNumber,
      supplierId,
      supplierName,
      warehouseId,
      warehouseName,
      region,
      deliveryDate,
      truckLoadNumber,
      batchNumber,
      lwgCertified,
      notes,
      status
    } = body;

    if (!igpNumber || !supplierName || !deliveryDate) {
      return NextResponse.json(
        { error: 'IGP Number, Supplier Name, and Delivery Date are required' },
        { status: 400 }
      );
    }

    // Check if IGP number already exists
    const existingIGP = await prisma.inwardGatePass.findUnique({
      where: { igpNumber }
    });

    if (existingIGP) {
      return NextResponse.json(
        { error: 'IGP Number already exists' },
        { status: 400 }
      );
    }

    const igp = await prisma.inwardGatePass.create({
      data: {
        igpNumber,
        supplierId: supplierId || '',
        supplierName,
        warehouseId: warehouseId || null,
        warehouseName: warehouseName || null,
        region,
        deliveryDate: new Date(deliveryDate),
        truckLoadNumber,
        batchNumber,
        lwgCertified: lwgCertified || false,
        notes,
        status: status || 'pending'
      },
      include: {
        warehouse: true
      }
    });

    return NextResponse.json({ success: true, data: igp }, { status: 201 });
  } catch (error) {
    console.error('Error creating IGP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/igp
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

    // Convert deliveryDate to Date if provided
    if (updateData.deliveryDate) {
      updateData.deliveryDate = new Date(updateData.deliveryDate);
    }

    const igp = await prisma.inwardGatePass.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: igp });
  } catch (error) {
    console.error('Error updating IGP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/organization/traceability/igp
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

    // Check if IGP has associated raw batches
    const igp = await prisma.inwardGatePass.findUnique({
      where: { id },
      include: { rawBatches: true }
    });

    if (!igp) {
      return NextResponse.json({ error: 'IGP not found' }, { status: 404 });
    }

    if (igp.rawBatches.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete IGP with associated raw batches' },
        { status: 400 }
      );
    }

    await prisma.inwardGatePass.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'IGP deleted successfully' });
  } catch (error) {
    console.error('Error deleting IGP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

