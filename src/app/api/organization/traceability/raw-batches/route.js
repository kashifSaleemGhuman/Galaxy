import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/raw-batches
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const igpId = searchParams.get('igpId');

    if (id) {
      // Get single raw batch with full traceability chain
      const rawBatch = await prisma.rawBatch.findUnique({
        where: { id },
        include: {
          igp: true,
          wetBlueBatches: {
            include: {
              reTanningBatches: {
                include: {
                  finishedBatches: true
                }
              },
              gradeAssortments: true
            }
          },
          jobCards: true,
          batchCards: true
        }
      });

      if (!rawBatch) {
        return NextResponse.json({ error: 'Raw batch not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: rawBatch });
    }

    // Get all raw batches or filter by IGP
    const where = igpId ? { igpId } : {};
    const rawBatches = await prisma.rawBatch.findMany({
      where,
      include: {
        igp: {
          select: {
            id: true,
            igpNumber: true,
            supplierName: true,
            deliveryDate: true
          }
        },
        wetBlueBatches: {
          select: {
            id: true,
            wbCode: true,
            status: true
          }
        }
      },
      orderBy: { receivedDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: rawBatches });
  } catch (error) {
    console.error('Error fetching raw batches:', error);
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

// POST /api/organization/traceability/raw-batches
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      batchCode,
      igpId,
      supplierId,
      supplierName,
      region,
      receivedDate,
      quantity,
      unit,
      status
    } = body;

    if (!batchCode || !igpId || !supplierName || !receivedDate) {
      return NextResponse.json(
        { error: 'Batch Code, IGP ID, Supplier Name, and Received Date are required' },
        { status: 400 }
      );
    }

    // Check if batch code already exists
    const existingBatch = await prisma.rawBatch.findUnique({
      where: { batchCode }
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch Code already exists' },
        { status: 400 }
      );
    }

    // Verify IGP exists
    const igp = await prisma.inwardGatePass.findUnique({
      where: { id: igpId }
    });

    if (!igp) {
      return NextResponse.json({ error: 'IGP not found' }, { status: 404 });
    }

    const rawBatch = await prisma.rawBatch.create({
      data: {
        batchCode,
        igpId,
        supplierId: supplierId || igp.supplierId || '',
        supplierName,
        region: region || igp.region,
        receivedDate: new Date(receivedDate),
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        status: status || 'pending'
      },
      include: {
        igp: true
      }
    });

    return NextResponse.json({ success: true, data: rawBatch }, { status: 201 });
  } catch (error) {
    console.error('Error creating raw batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/raw-batches
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

    // Convert receivedDate to Date if provided
    if (updateData.receivedDate) {
      updateData.receivedDate = new Date(updateData.receivedDate);
    }

    // Convert quantity to Decimal if provided
    if (updateData.quantity !== undefined) {
      updateData.quantity = updateData.quantity ? parseFloat(updateData.quantity) : null;
    }

    const rawBatch = await prisma.rawBatch.update({
      where: { id },
      data: updateData,
      include: {
        igp: true
      }
    });

    return NextResponse.json({ success: true, data: rawBatch });
  } catch (error) {
    console.error('Error updating raw batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

