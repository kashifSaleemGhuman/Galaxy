import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/traceability/grade-assortments
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
      const gradeAssortment = await prisma.gradeAssortment.findUnique({
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
          }
        }
      });

      if (!gradeAssortment) {
        return NextResponse.json({ error: 'Grade assortment not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: gradeAssortment });
    }

    const where = wbBatchId ? { wbBatchId } : {};
    const gradeAssortments = await prisma.gradeAssortment.findMany({
      where,
      include: {
        wbBatch: {
          select: {
            id: true,
            wbCode: true,
            rawBatchCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: gradeAssortments });
  } catch (error) {
    console.error('Error fetching grade assortments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/organization/traceability/grade-assortments
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      wbBatchId,
      grade,
      gradeCategory,
      quantity,
      unit,
      notes
    } = body;

    if (!wbBatchId || !grade) {
      return NextResponse.json(
        { error: 'W/B Batch ID and Grade are required' },
        { status: 400 }
      );
    }

    // Determine grade category if not provided
    let finalGradeCategory = gradeCategory;
    if (!finalGradeCategory) {
      const gradeNum = parseInt(grade);
      if (gradeNum >= 1 && gradeNum <= 5) {
        finalGradeCategory = 'A';
      } else if (gradeNum >= 6 && gradeNum <= 7) {
        finalGradeCategory = 'B';
      } else if (gradeNum >= 8 && gradeNum <= 9) {
        finalGradeCategory = 'C';
      }
    }

    // Verify wet blue batch exists
    const wbBatch = await prisma.wetBlueBatch.findUnique({
      where: { id: wbBatchId }
    });

    if (!wbBatch) {
      return NextResponse.json({ error: 'Wet Blue batch not found' }, { status: 404 });
    }

    const gradeAssortment = await prisma.gradeAssortment.create({
      data: {
        wbBatchId,
        wbCode: wbBatch.wbCode,
        grade,
        gradeCategory: finalGradeCategory,
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        notes
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

    return NextResponse.json({ success: true, data: gradeAssortment }, { status: 201 });
  } catch (error) {
    console.error('Error creating grade assortment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization/traceability/grade-assortments
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

    // Convert quantity to Decimal if provided
    if (updateData.quantity !== undefined) {
      updateData.quantity = updateData.quantity ? parseFloat(updateData.quantity) : null;
    }

    const gradeAssortment = await prisma.gradeAssortment.update({
      where: { id },
      data: updateData,
      include: {
        wbBatch: true
      }
    });

    return NextResponse.json({ success: true, data: gradeAssortment });
  } catch (error) {
    console.error('Error updating grade assortment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

