import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/customer-delivery
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const dispatchId = searchParams.get('dispatchId');
    const finishedBatchId = searchParams.get('finishedBatchId');

    if (id) {
      const delivery = await prisma.customerDelivery.findUnique({
        where: { id },
        include: {
          dispatch: {
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
          },
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

      if (!delivery) {
        return NextResponse.json({ error: 'Customer delivery record not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: delivery });
    }

    const where = {};
    if (dispatchId) where.dispatchId = dispatchId;
    if (finishedBatchId) where.finishedBatchId = finishedBatchId;

    const deliveries = await prisma.customerDelivery.findMany({
      where,
      include: {
        dispatch: {
          select: {
            id: true,
            dispatchNumber: true,
            dispatchDate: true,
            customerName: true
          }
        },
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
      orderBy: { deliveryDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: deliveries });
  } catch (error) {
    console.error('Error fetching customer delivery records:', error);
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

// POST /api/organization/traceability/customer-delivery
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      deliveryNumber,
      dispatchId,
      customerName,
      customerId,
      customerOrderNumber,
      deliveryDate,
      deliveryStatus,
      receivedBy,
      receivedByPhone,
      deliveryNotes,
      qualityStatus,
      qualityNotes
    } = body;

    if (!deliveryNumber || !dispatchId || !customerName || !deliveryDate) {
      return NextResponse.json(
        { error: 'Delivery Number, Dispatch ID, Customer Name, and Delivery Date are required' },
        { status: 400 }
      );
    }

    // Check if delivery number already exists
    const existingDelivery = await prisma.customerDelivery.findUnique({
      where: { deliveryNumber }
    });

    if (existingDelivery) {
      return NextResponse.json(
        { error: 'Delivery Number already exists' },
        { status: 400 }
      );
    }

    // Verify dispatch exists and get related info
    const dispatch = await prisma.dispatch.findUnique({
      where: { id: dispatchId },
      include: {
        finishedBatch: true
      }
    });

    if (!dispatch) {
      return NextResponse.json({ error: 'Dispatch record not found' }, { status: 404 });
    }

    const delivery = await prisma.customerDelivery.create({
      data: {
        deliveryNumber,
        dispatchId,
        dispatchNumber: dispatch.dispatchNumber,
        finishedBatchId: dispatch.finishedBatchId,
        batchNumber: dispatch.batchNumber,
        customerId: customerId || null,
        customerName,
        customerOrderNumber: customerOrderNumber || dispatch.customerOrderNumber,
        deliveryDate: new Date(deliveryDate),
        deliveryStatus: deliveryStatus || 'pending',
        receivedBy,
        receivedByPhone,
        deliveryNotes,
        qualityStatus,
        qualityNotes
      },
      include: {
        dispatch: {
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
        },
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

    return NextResponse.json({ success: true, data: delivery }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer delivery record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/customer-delivery
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

    // Convert dates
    if (updateData.deliveryDate) {
      updateData.deliveryDate = new Date(updateData.deliveryDate);
    }

    const delivery = await prisma.customerDelivery.update({
      where: { id },
      data: updateData,
      include: {
        dispatch: {
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
        },
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

    return NextResponse.json({ success: true, data: delivery });
  } catch (error) {
    console.error('Error updating customer delivery record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

