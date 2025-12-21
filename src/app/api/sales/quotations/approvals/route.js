import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

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

    // Check if user has permission to view approvals
    const canViewApprovals = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER].includes(currentUser.role);
    if (!canViewApprovals) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit')) || 50;

    let whereClause = {};
    
    if (status === 'pending') {
      whereClause = {
        status: 'submitted'
      };
    } else if (status === 'approved') {
      whereClause = {
        status: 'approved'
      };
    } else if (status === 'rejected') {
      whereClause = {
        status: 'rejected'
      };
    }

    const quotations = await prisma.salesQuotation.findMany({
      where: whereClause,
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

    // Get counts for different statuses
    const counts = await prisma.salesQuotation.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        status: { in: ['submitted', 'approved', 'rejected'] }
      }
    });

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    counts.forEach(count => {
      if (count.status === 'submitted') {
        statusCounts.pending += count._count.status;
      } else if (count.status === 'approved') {
        statusCounts.approved += count._count.status;
      } else if (count.status === 'rejected') {
        statusCounts.rejected += count._count.status;
      }
      statusCounts.total += count._count.status;
    });

    return NextResponse.json({
      quotations,
      counts: statusCounts
    });

  } catch (error) {
    console.error('Error fetching sales quotation approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

