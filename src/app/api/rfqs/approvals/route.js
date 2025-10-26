import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';

export async function GET(req) {
  try {
    const session = await getServerSession();
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
    const canViewApprovals = ['super_admin', 'admin', 'purchase_manager'].includes(currentUser.role);
    if (!canViewApprovals) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit')) || 50;

    let whereClause = {};
    
    if (status === 'pending') {
      whereClause = {
        status: 'received'
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

    const rfqs = await prisma.rFQ.findMany({
      where: whereClause,
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Get counts for different statuses
    const counts = await prisma.rFQ.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        status: { in: ['sent', 'received', 'approved', 'rejected'] }
      }
    });

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    counts.forEach(count => {
      if (['sent', 'received'].includes(count.status)) {
        statusCounts.pending += count._count.status;
      } else if (count.status === 'approved') {
        statusCounts.approved += count._count.status;
      } else if (count.status === 'rejected') {
        statusCounts.rejected += count._count.status;
      }
      statusCounts.total += count._count.status;
    });

    return NextResponse.json({
      rfqs,
      counts: statusCounts
    });

  } catch (error) {
    console.error('Error fetching RFQ approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}