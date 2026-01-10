import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/batch-tracking
// Get full traceability chain for a batch (can search by any batch code)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchCode = searchParams.get('batchCode'); // Can be raw batch, W/B code, RT code, or finished batch number

    if (!batchCode) {
      return NextResponse.json(
        { error: 'Batch code is required' },
        { status: 400 }
      );
    }

    // Try to find the batch in any of the batch types
    let traceabilityData = null;

    // Check Raw Batch
    const rawBatch = await prisma.rawBatch.findUnique({
      where: { batchCode },
      include: {
        igp: true,
        wetBlueBatches: {
          include: {
            reTanningBatches: {
              include: {
                finishedBatches: true
              },
              gradeAssortments: true
            }
          }
        },
        jobCards: true,
        batchCards: true
      }
    });

    if (rawBatch) {
      traceabilityData = {
        type: 'raw',
        batch: rawBatch,
        upstream: {
          igp: rawBatch.igp
        },
        downstream: {
          wetBlueBatches: rawBatch.wetBlueBatches
        }
      };
    } else {
      // Check Wet Blue Batch
      const wbBatch = await prisma.wetBlueBatch.findUnique({
        where: { wbCode: batchCode },
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

      if (wbBatch) {
        traceabilityData = {
          type: 'wet_blue',
          batch: wbBatch,
          upstream: {
            rawBatch: wbBatch.rawBatch,
            igp: wbBatch.rawBatch?.igp
          },
          downstream: {
            reTanningBatches: wbBatch.reTanningBatches
          }
        };
      } else {
        // Check Re-tanning Batch
        const rtBatch = await prisma.reTanningBatch.findUnique({
          where: { rtCode: batchCode },
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

        if (rtBatch) {
          traceabilityData = {
            type: 're_tanning',
            batch: rtBatch,
            upstream: {
              wbBatch: rtBatch.wbBatch,
              rawBatch: rtBatch.wbBatch?.rawBatch,
              igp: rtBatch.wbBatch?.rawBatch?.igp
            },
            downstream: {
              finishedBatches: rtBatch.finishedBatches
            }
          };
        } else {
          // Check Finished Leather Batch
          const finishedBatch = await prisma.finishedLeatherBatch.findUnique({
            where: { batchNumber: batchCode },
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

          if (finishedBatch) {
            traceabilityData = {
              type: 'finished',
              batch: finishedBatch,
              upstream: {
                rtBatch: finishedBatch.rtBatch,
                wbBatch: finishedBatch.rtBatch?.wbBatch,
                rawBatch: finishedBatch.rtBatch?.wbBatch?.rawBatch,
                igp: finishedBatch.rtBatch?.wbBatch?.rawBatch?.igp
              },
              downstream: null
            };
          }
        }
      }
    }

    if (!traceabilityData) {
      return NextResponse.json(
        { error: 'Batch not found with the provided code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: traceabilityData });
  } catch (error) {
    console.error('Error fetching batch tracking:', error);
    // If model doesn't exist yet (migration not run), return not found
    if (error.message?.includes('Unknown model') || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Batch not found with the provided code' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

