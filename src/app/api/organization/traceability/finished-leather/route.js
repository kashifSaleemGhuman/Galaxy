import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/finished-leather
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const rtBatchId = searchParams.get('rtBatchId');

    if (id) {
      const finishedBatch = await prisma.finishedLeatherBatch.findUnique({
        where: { id },
        include: {
          rtBatch: {
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
          },
          jobCards: true,
          batchCards: true
        }
      });

      if (!finishedBatch) {
        return NextResponse.json({ error: 'Finished leather batch not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: finishedBatch });
    }

    const where = rtBatchId ? { rtBatchId } : {};
    const finishedBatches = await prisma.finishedLeatherBatch.findMany({
      where,
      include: {
        rtBatch: {
          select: {
            id: true,
            rtCode: true,
            wbCode: true,
            rawBatchCode: true
          }
        }
      },
      orderBy: { completionDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: finishedBatches });
  } catch (error) {
    console.error('Error fetching finished leather batches:', error);
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

// POST /api/organization/traceability/finished-leather
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      batchNumber,
      rtBatchId,
      completionDate,
      quantity,
      unit,
      thickness,
      color,
      weight,
      pieces,
      areaM2,
      customerOrderNumber,
      vendorCode,
      status
    } = body;

    if (!batchNumber || !rtBatchId || !completionDate) {
      return NextResponse.json(
        { error: 'Batch Number, RT Batch ID, and Completion Date are required' },
        { status: 400 }
      );
    }

    // Check if batch number already exists
    const existingBatch = await prisma.finishedLeatherBatch.findUnique({
      where: { batchNumber }
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch Number already exists' },
        { status: 400 }
      );
    }

    // Verify re-tanning batch exists
    const rtBatch = await prisma.reTanningBatch.findUnique({
      where: { id: rtBatchId },
      include: {
        wbBatch: {
          include: {
            rawBatch: true
          }
        }
      }
    });

    if (!rtBatch) {
      return NextResponse.json({ error: 'Re-tanning batch not found' }, { status: 404 });
    }

    const finishedBatch = await prisma.finishedLeatherBatch.create({
      data: {
        batchNumber,
        rtBatchId,
        rtCode: rtBatch.rtCode,
        wbBatchId: rtBatch.wbBatchId,
        wbCode: rtBatch.wbCode,
        rawBatchId: rtBatch.rawBatchId,
        rawBatchCode: rtBatch.rawBatchCode,
        completionDate: new Date(completionDate),
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        thickness: thickness ? parseFloat(thickness) : null,
        color,
        weight: weight ? parseFloat(weight) : null,
        pieces: pieces ? parseInt(pieces) : null,
        areaM2: areaM2 ? parseFloat(areaM2) : null,
        customerOrderNumber,
        vendorCode,
        status: status || 'pending'
      },
      include: {
        rtBatch: {
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
        }
      }
    });

    return NextResponse.json({ success: true, data: finishedBatch }, { status: 201 });
  } catch (error) {
    console.error('Error creating finished leather batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/finished-leather
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
    if (updateData.completionDate) {
      updateData.completionDate = new Date(updateData.completionDate);
    }
    if (updateData.quantity !== undefined) {
      updateData.quantity = updateData.quantity ? parseFloat(updateData.quantity) : null;
    }
    if (updateData.thickness !== undefined) {
      updateData.thickness = updateData.thickness ? parseFloat(updateData.thickness) : null;
    }
    if (updateData.weight !== undefined) {
      updateData.weight = updateData.weight ? parseFloat(updateData.weight) : null;
    }
    if (updateData.areaM2 !== undefined) {
      updateData.areaM2 = updateData.areaM2 ? parseFloat(updateData.areaM2) : null;
    }
    if (updateData.pieces !== undefined) {
      updateData.pieces = updateData.pieces ? parseInt(updateData.pieces) : null;
    }

    const finishedBatch = await prisma.finishedLeatherBatch.update({
      where: { id },
      data: updateData,
      include: {
        rtBatch: {
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
        }
      }
    });

    return NextResponse.json({ success: true, data: finishedBatch });
  } catch (error) {
    console.error('Error updating finished leather batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

