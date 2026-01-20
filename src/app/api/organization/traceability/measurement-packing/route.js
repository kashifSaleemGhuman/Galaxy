import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/measurement-packing
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const finishedBatchId = searchParams.get('finishedBatchId');

    if (id) {
      const record = await prisma.measurementPacking.findUnique({
        where: { id },
        include: {
          finishedBatch: {
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
          },
          dispatches: true
        }
      });

      if (!record) {
        return NextResponse.json({ error: 'Measurement/Packing record not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: record });
    }

    const where = finishedBatchId ? { finishedBatchId } : {};
    const records = await prisma.measurementPacking.findMany({
      where,
      include: {
        finishedBatch: {
          select: {
            id: true,
            batchNumber: true,
            rtCode: true,
            wbCode: true,
            rawBatchCode: true
          }
        }
      },
      orderBy: { measurementDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching measurement/packing records:', error);
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

// POST /api/organization/traceability/measurement-packing
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      recordNumber,
      finishedBatchId,
      measurementDate,
      batchNumberMeas,
      customerOrderNumber,
      vendorCode,
      thickness,
      color,
      weight,
      pieces,
      areaDm2,
      areaM2,
      packedDate,
      packingStatus,
      packingNotes,
      qcStatus,
      qcNotes,
      qcDate,
      status
    } = body;

    if (!recordNumber || !finishedBatchId || !measurementDate) {
      return NextResponse.json(
        { error: 'Record Number, Finished Batch ID, and Measurement Date are required' },
        { status: 400 }
      );
    }

    // Check if record number already exists
    const existingRecord = await prisma.measurementPacking.findUnique({
      where: { recordNumber }
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Record Number already exists' },
        { status: 400 }
      );
    }

    // Verify finished batch exists and get traceability info
    const finishedBatch = await prisma.finishedLeatherBatch.findUnique({
      where: { id: finishedBatchId },
      include: {
        rtBatch: {
          include: {
            wbBatch: {
              include: {
                rawBatch: true
              }
            }
          }
        }
      }
    });

    if (!finishedBatch) {
      return NextResponse.json({ error: 'Finished leather batch not found' }, { status: 404 });
    }

    // Convert areaDm2 to areaM2 if provided (1 m² = 100 dm²)
    let calculatedAreaM2 = areaM2;
    if (areaDm2 && !areaM2) {
      calculatedAreaM2 = parseFloat(areaDm2) / 100;
    }

    const record = await prisma.measurementPacking.create({
      data: {
        recordNumber,
        finishedBatchId,
        batchNumber: finishedBatch.batchNumber,
        rtCode: finishedBatch.rtCode,
        wbCode: finishedBatch.wbCode,
        rawBatchCode: finishedBatch.rawBatchCode,
        measurementDate: new Date(measurementDate),
        batchNumberMeas,
        customerOrderNumber,
        vendorCode,
        thickness: thickness ? parseFloat(thickness) : null,
        color,
        weight: weight ? parseFloat(weight) : null,
        pieces: pieces ? parseInt(pieces) : null,
        areaDm2: areaDm2 ? parseFloat(areaDm2) : null,
        areaM2: calculatedAreaM2 ? parseFloat(calculatedAreaM2) : null,
        packedDate: packedDate ? new Date(packedDate) : null,
        packingStatus: packingStatus || 'pending',
        packingNotes,
        qcStatus,
        qcNotes,
        qcDate: qcDate ? new Date(qcDate) : null,
        status: status || 'pending'
      },
      include: {
        finishedBatch: {
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
        }
      }
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('Error creating measurement/packing record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/measurement-packing
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
    if (updateData.measurementDate) {
      updateData.measurementDate = new Date(updateData.measurementDate);
    }
    if (updateData.packedDate) {
      updateData.packedDate = new Date(updateData.packedDate);
    }
    if (updateData.qcDate) {
      updateData.qcDate = new Date(updateData.qcDate);
    }
    if (updateData.thickness !== undefined) {
      updateData.thickness = updateData.thickness ? parseFloat(updateData.thickness) : null;
    }
    if (updateData.weight !== undefined) {
      updateData.weight = updateData.weight ? parseFloat(updateData.weight) : null;
    }
    if (updateData.areaDm2 !== undefined) {
      updateData.areaDm2 = updateData.areaDm2 ? parseFloat(updateData.areaDm2) : null;
      // Auto-convert to m² if dm² is updated
      if (updateData.areaDm2 && !updateData.areaM2) {
        updateData.areaM2 = parseFloat(updateData.areaDm2) / 100;
      }
    }
    if (updateData.areaM2 !== undefined) {
      updateData.areaM2 = updateData.areaM2 ? parseFloat(updateData.areaM2) : null;
    }
    if (updateData.pieces !== undefined) {
      updateData.pieces = updateData.pieces ? parseInt(updateData.pieces) : null;
    }

    const record = await prisma.measurementPacking.update({
      where: { id },
      data: updateData,
      include: {
        finishedBatch: {
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
        }
      }
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Error updating measurement/packing record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

