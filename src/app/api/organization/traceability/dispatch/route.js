import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/dispatch
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const finishedBatchId = searchParams.get('finishedBatchId');
    const customerOrderNumber = searchParams.get('customerOrderNumber');

    if (id) {
      const dispatch = await prisma.dispatch.findUnique({
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
          measurementPacking: true,
          deliveries: true
        }
      });

      if (!dispatch) {
        return NextResponse.json({ error: 'Dispatch record not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: dispatch });
    }

    const where = {};
    if (finishedBatchId) where.finishedBatchId = finishedBatchId;
    if (customerOrderNumber) where.customerOrderNumber = customerOrderNumber;

    const dispatches = await prisma.dispatch.findMany({
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
        },
        measurementPacking: {
          select: {
            id: true,
            recordNumber: true,
            status: true
          }
        }
      },
      orderBy: { dispatchDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: dispatches });
  } catch (error) {
    console.error('Error fetching dispatch records:', error);
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

// POST /api/organization/traceability/dispatch
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      dispatchNumber,
      measurementPackingId,
      finishedBatchId,
      customerName,
      customerId,
      customerOrderNumber,
      vendorCode,
      dispatchDate,
      dispatchType,
      vehicleNumber,
      driverName,
      driverPhone,
      destination,
      deliveryAddress,
      quantity,
      unit,
      pieces,
      areaM2,
      status
    } = body;

    if (!dispatchNumber || !finishedBatchId || !customerName || !dispatchDate) {
      return NextResponse.json(
        { error: 'Dispatch Number, Finished Batch ID, Customer Name, and Dispatch Date are required' },
        { status: 400 }
      );
    }

    // Check if dispatch number already exists
    const existingDispatch = await prisma.dispatch.findUnique({
      where: { dispatchNumber }
    });

    if (existingDispatch) {
      return NextResponse.json(
        { error: 'Dispatch Number already exists' },
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

    // Verify measurement/packing record if provided
    if (measurementPackingId) {
      const measurementPacking = await prisma.measurementPacking.findUnique({
        where: { id: measurementPackingId }
      });

      if (!measurementPacking) {
        return NextResponse.json({ error: 'Measurement/Packing record not found' }, { status: 404 });
      }
    }

    const dispatch = await prisma.dispatch.create({
      data: {
        dispatchNumber,
        measurementPackingId: measurementPackingId || null,
        finishedBatchId,
        batchNumber: finishedBatch.batchNumber,
        rtCode: finishedBatch.rtCode,
        wbCode: finishedBatch.wbCode,
        rawBatchCode: finishedBatch.rawBatchCode,
        customerId: customerId || null,
        customerName,
        customerOrderNumber,
        vendorCode,
        dispatchDate: new Date(dispatchDate),
        dispatchType,
        vehicleNumber,
        driverName,
        driverPhone,
        destination,
        deliveryAddress,
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        pieces: pieces ? parseInt(pieces) : null,
        areaM2: areaM2 ? parseFloat(areaM2) : null,
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
        },
        measurementPacking: true
      }
    });

    return NextResponse.json({ success: true, data: dispatch }, { status: 201 });
  } catch (error) {
    console.error('Error creating dispatch record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/dispatch
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
    if (updateData.dispatchDate) {
      updateData.dispatchDate = new Date(updateData.dispatchDate);
    }
    if (updateData.quantity !== undefined) {
      updateData.quantity = updateData.quantity ? parseFloat(updateData.quantity) : null;
    }
    if (updateData.areaM2 !== undefined) {
      updateData.areaM2 = updateData.areaM2 ? parseFloat(updateData.areaM2) : null;
    }
    if (updateData.pieces !== undefined) {
      updateData.pieces = updateData.pieces ? parseInt(updateData.pieces) : null;
    }

    const dispatch = await prisma.dispatch.update({
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
        },
        measurementPacking: true,
        deliveries: true
      }
    });

    return NextResponse.json({ success: true, data: dispatch });
  } catch (error) {
    console.error('Error updating dispatch record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

