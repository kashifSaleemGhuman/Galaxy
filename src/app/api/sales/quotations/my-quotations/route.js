import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Build where clause - only quotations created by current user
    const where = {
      createdById: currentUser.id
    };

    // Filter by status if provided (supports comma-separated values like "approved,rejected")
    if (status) {
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }

    const quotations = await prisma.salesQuotation.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        items: true,
        approvals: {
          include: {
            approver: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Get counts by status for user's quotations
    const counts = await prisma.salesQuotation.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        createdById: currentUser.id
      }
    });

    const statusCounts = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      sent: 0,
      total: 0
    };

    counts.forEach(count => {
      if (statusCounts.hasOwnProperty(count.status)) {
        statusCounts[count.status] = count._count.status;
      }
      statusCounts.total += count._count.status;
    });

    return NextResponse.json({
      quotations,
      counts: statusCounts
    });

  } catch (error) {
    console.error('Error fetching my quotations:', error);
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

