import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/re-tanning-batches
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const wbBatchId = searchParams.get('wbBatchId');

    if (id) {
      const rtBatch = await prisma.reTanningBatch.findUnique({
        where: { id },
        include: {
          wbBatch: {
            include: {
              rawBatch: {
                include: {
                  igp: true
                }
              }
            }
          },
          finishedBatches: true,
          jobCards: true,
          batchCards: true
        }
      });

      if (!rtBatch) {
        return NextResponse.json({ error: 'Re-tanning batch not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: rtBatch });
    }

    const where = wbBatchId ? { wbBatchId } : {};
    const rtBatches = await prisma.reTanningBatch.findMany({
      where,
      include: {
        wbBatch: {
          select: {
            id: true,
            wbCode: true,
            rawBatchCode: true
          }
        },
        finishedBatches: {
          select: {
            id: true,
            batchNumber: true,
            status: true
          }
        }
      },
      orderBy: { receivedDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: rtBatches });
  } catch (error) {
    console.error('Error fetching re-tanning batches:', error);
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

// POST /api/organization/traceability/re-tanning-batches
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      rtCode,
      wbBatchId,
      receivedDate,
      quantity,
      unit,
      recipe,
      technicianId,
      technicianName,
      status
    } = body;

    if (!rtCode || !wbBatchId || !receivedDate) {
      return NextResponse.json(
        { error: 'RT Code, W/B Batch ID, and Received Date are required' },
        { status: 400 }
      );
    }

    // Check if RT code already exists
    const existingRT = await prisma.reTanningBatch.findUnique({
      where: { rtCode }
    });

    if (existingRT) {
      return NextResponse.json(
        { error: 'RT Code already exists' },
        { status: 400 }
      );
    }

    // Verify wet blue batch exists
    const wbBatch = await prisma.wetBlueBatch.findUnique({
      where: { id: wbBatchId },
      include: {
        rawBatch: true
      }
    });

    if (!wbBatch) {
      return NextResponse.json({ error: 'Wet Blue batch not found' }, { status: 404 });
    }

    const rtBatch = await prisma.reTanningBatch.create({
      data: {
        rtCode,
        wbBatchId,
        wbCode: wbBatch.wbCode,
        rawBatchId: wbBatch.rawBatchId,
        rawBatchCode: wbBatch.rawBatchCode,
        receivedDate: new Date(receivedDate),
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        recipe,
        technicianId,
        technicianName,
        status: status || 'pending'
      },
      include: {
        wbBatch: {
          include: {
            rawBatch: {
              include: {
                igp: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: rtBatch }, { status: 201 });
  } catch (error) {
    console.error('Error creating re-tanning batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/re-tanning-batches
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

    const rtBatch = await prisma.reTanningBatch.update({
      where: { id },
      data: updateData,
      include: {
        wbBatch: {
          include: {
            rawBatch: {
              include: {
                igp: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: rtBatch });
  } catch (error) {
    console.error('Error updating re-tanning batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

