import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// GET /api/rfqs/approvals - Get RFQs pending approval
export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    // Only managers and admins can view approvals
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // pending, approved, rejected, all
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (status && status !== 'all') {
      if (status === 'pending') {
        where.status = { in: ['sent', 'received'] };
      } else {
        where.status = status;
      }
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          vendor: true,
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          approvedBy: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          },
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true, email: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.rFQ.count({ where })
    ]);

    // Get counts for different statuses
    const counts = await Promise.all([
      prisma.rFQ.count({ where: { status: { in: ['sent', 'received'] } } }), // pending
      prisma.rFQ.count({ where: { status: 'approved' } }),
      prisma.rFQ.count({ where: { status: 'rejected' } }),
      prisma.rFQ.count() // total
    ]);

    const [pendingCount, approvedCount, rejectedCount, totalCount] = counts;

    return NextResponse.json({
      rfqs,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching RFQ approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch RFQ approvals' }, { status: 500 });
  }
}
