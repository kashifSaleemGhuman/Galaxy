import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/wet-blue-batches
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const rawBatchId = searchParams.get('rawBatchId');

    if (id) {
      // Get single wet blue batch with full traceability
      const wbBatch = await prisma.wetBlueBatch.findUnique({
        where: { id },
        include: {
          rawBatch: {
            include: {
              igp: true
            }
          },
          reTanningBatches: {
            include: {
              finishedBatches: true
            }
          },
          gradeAssortments: true,
          jobCards: true,
          batchCards: true
        }
      });

      if (!wbBatch) {
        return NextResponse.json({ error: 'Wet Blue batch not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: wbBatch });
    }

    // Get all wet blue batches or filter by raw batch
    const where = rawBatchId ? { rawBatchId } : {};
    const wbBatches = await prisma.wetBlueBatch.findMany({
      where,
      include: {
        rawBatch: {
          select: {
            id: true,
            batchCode: true,
            supplierName: true
          }
        },
        reTanningBatches: {
          select: {
            id: true,
            rtCode: true,
            status: true
          }
        },
        gradeAssortments: true
      },
      orderBy: { receivedDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: wbBatches });
  } catch (error) {
    console.error('Error fetching wet blue batches:', error);
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

// POST /api/organization/traceability/wet-blue-batches
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      wbCode,
      rawBatchId,
      receivedDate,
      quantity,
      unit,
      status
    } = body;

    if (!wbCode || !rawBatchId || !receivedDate) {
      return NextResponse.json(
        { error: 'W/B Code, Raw Batch ID, and Received Date are required' },
        { status: 400 }
      );
    }

    // Check if W/B code already exists
    const existingWB = await prisma.wetBlueBatch.findUnique({
      where: { wbCode }
    });

    if (existingWB) {
      return NextResponse.json(
        { error: 'W/B Code already exists' },
        { status: 400 }
      );
    }

    // Verify raw batch exists
    const rawBatch = await prisma.rawBatch.findUnique({
      where: { id: rawBatchId }
    });

    if (!rawBatch) {
      return NextResponse.json({ error: 'Raw batch not found' }, { status: 404 });
    }

    const wbBatch = await prisma.wetBlueBatch.create({
      data: {
        wbCode,
        rawBatchId,
        rawBatchCode: rawBatch.batchCode,
        receivedDate: new Date(receivedDate),
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        status: status || 'pending'
      },
      include: {
        rawBatch: {
          include: {
            igp: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: wbBatch }, { status: 201 });
  } catch (error) {
    console.error('Error creating wet blue batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/wet-blue-batches
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

    // Convert dates and numbers
    if (updateData.receivedDate) {
      updateData.receivedDate = new Date(updateData.receivedDate);
    }
    if (updateData.quantity !== undefined) {
      updateData.quantity = updateData.quantity ? parseFloat(updateData.quantity) : null;
    }

    const wbBatch = await prisma.wetBlueBatch.update({
      where: { id },
      data: updateData,
      include: {
        rawBatch: {
          include: {
            igp: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: wbBatch });
  } catch (error) {
    console.error('Error updating wet blue batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

