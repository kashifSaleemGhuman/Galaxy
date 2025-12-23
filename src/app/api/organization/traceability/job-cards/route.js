import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/job-cards
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const rawBatchId = searchParams.get('rawBatchId');
    const wbBatchId = searchParams.get('wbBatchId');
    const rtBatchId = searchParams.get('rtBatchId');
    const finishedBatchId = searchParams.get('finishedBatchId');

    if (id) {
      const jobCard = await prisma.jobCard.findUnique({
        where: { id },
        include: {
          rawBatch: {
            include: {
              igp: true
            }
          },
          wbBatch: {
            include: {
              rawBatch: {
                include: {
                  igp: true
                }
              }
            }
          },
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

      if (!jobCard) {
        return NextResponse.json({ error: 'Job card not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: jobCard });
    }

    // Build where clause
    const where = {};
    if (rawBatchId) where.rawBatchId = rawBatchId;
    if (wbBatchId) where.wbBatchId = wbBatchId;
    if (rtBatchId) where.rtBatchId = rtBatchId;
    if (finishedBatchId) where.finishedBatchId = finishedBatchId;

    const jobCards = await prisma.jobCard.findMany({
      where,
      include: {
        rawBatch: {
          select: {
            id: true,
            batchCode: true
          }
        },
        wbBatch: {
          select: {
            id: true,
            wbCode: true
          }
        },
        rtBatch: {
          select: {
            id: true,
            rtCode: true
          }
        },
        finishedBatch: {
          select: {
            id: true,
            batchNumber: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ success: true, data: jobCards });
  } catch (error) {
    console.error('Error fetching job cards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/organization/traceability/job-cards
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      jobCardNumber,
      rawBatchId,
      wbBatchId,
      rtBatchId,
      finishedBatchId,
      recipe,
      technicianId,
      technicianName,
      date,
      month,
      year,
      notes
    } = body;

    if (!jobCardNumber || !date) {
      return NextResponse.json(
        { error: 'Job Card Number and Date are required' },
        { status: 400 }
      );
    }

    // At least one batch reference is required
    if (!rawBatchId && !wbBatchId && !rtBatchId && !finishedBatchId) {
      return NextResponse.json(
        { error: 'At least one batch reference (Raw, W/B, RT, or Finished) is required' },
        { status: 400 }
      );
    }

    // Check if job card number already exists
    const existingJobCard = await prisma.jobCard.findUnique({
      where: { jobCardNumber }
    });

    if (existingJobCard) {
      return NextResponse.json(
        { error: 'Job Card Number already exists' },
        { status: 400 }
      );
    }

    // Extract month and year from date if not provided
    const dateObj = new Date(date);
    const finalMonth = month || dateObj.getMonth() + 1;
    const finalYear = year || dateObj.getFullYear();

    const jobCard = await prisma.jobCard.create({
      data: {
        jobCardNumber,
        rawBatchId: rawBatchId || null,
        wbBatchId: wbBatchId || null,
        rtBatchId: rtBatchId || null,
        finishedBatchId: finishedBatchId || null,
        recipe,
        technicianId,
        technicianName,
        date: dateObj,
        month: finalMonth,
        year: finalYear,
        notes
      },
      include: {
        rawBatch: true,
        wbBatch: true,
        rtBatch: true,
        finishedBatch: true
      }
    });

    return NextResponse.json({ success: true, data: jobCard }, { status: 201 });
  } catch (error) {
    console.error('Error creating job card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/job-cards
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

    // Convert date
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
      // Update month and year if date changed
      if (!updateData.month) {
        updateData.month = updateData.date.getMonth() + 1;
      }
      if (!updateData.year) {
        updateData.year = updateData.date.getFullYear();
      }
    }

    const jobCard = await prisma.jobCard.update({
      where: { id },
      data: updateData,
      include: {
        rawBatch: true,
        wbBatch: true,
        rtBatch: true,
        finishedBatch: true
      }
    });

    return NextResponse.json({ success: true, data: jobCard });
  } catch (error) {
    console.error('Error updating job card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

