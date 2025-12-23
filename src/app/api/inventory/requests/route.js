import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/inventory/requests - Get all stock movement requests
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only Super Admin and Admin can view all requests
    const canViewRequests = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN
    ].includes(currentUser.role);

    if (!canViewRequests) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const requestType = searchParams.get('requestType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(status && status !== 'all' && { status }),
      ...(requestType && requestType !== 'all' && { requestType })
    };

    // Get requests with relations
    const [requests, total] = await Promise.all([
      prisma.stockMovementRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          rejecter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              unit: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          fromWarehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          toWarehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          location: {
            select: {
              id: true,
              code: true,
              name: true
            }
          },
          movements: {
            select: {
              id: true,
              type: true,
              quantity: true,
              createdAt: true
            }
          }
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.stockMovementRequest.count({ where })
    ]);

    // Format response
    const formattedRequests = requests.map(req => {
      const baseRequest = {
        id: req.id,
        requestType: req.requestType,
        status: req.status,
        requestedBy: {
          id: req.requester.id,
          name: req.requester.name,
          email: req.requester.email,
          role: req.requester.role
        },
        requestedAt: req.requestedAt,
        approvedBy: req.approver ? {
          id: req.approver.id,
          name: req.approver.name,
          email: req.approver.email
        } : null,
        approvedAt: req.approvedAt,
        rejectedBy: req.rejecter ? {
          id: req.rejecter.id,
          name: req.rejecter.name,
          email: req.rejecter.email
        } : null,
        rejectedAt: req.rejectedAt,
        rejectionReason: req.rejectionReason,
        notes: req.notes,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        movements: req.movements
      };

      // Add type-specific data
      if (req.requestType === 'movement') {
        return {
          ...baseRequest,
          product: req.product ? {
            id: req.product.id,
            name: req.product.name,
            category: req.product.category,
            unit: req.product.unit
          } : null,
          warehouse: req.warehouse ? {
            id: req.warehouse.id,
            name: req.warehouse.name,
            code: req.warehouse.code
          } : null,
          location: req.location ? {
            id: req.location.id,
            code: req.location.code,
            name: req.location.name
          } : null,
          type: req.type,
          quantity: req.quantity,
          reason: req.reason,
          reference: req.reference
        };
      } else if (req.requestType === 'transfer') {
        // Parse transferLines if it's a string
        let transferLines = req.transferLines;
        if (typeof transferLines === 'string') {
          try {
            transferLines = JSON.parse(transferLines);
          } catch (e) {
            transferLines = [];
          }
        }
        
        return {
          ...baseRequest,
          fromWarehouse: req.fromWarehouse ? {
            id: req.fromWarehouse.id,
            name: req.fromWarehouse.name,
            code: req.fromWarehouse.code
          } : null,
          toWarehouse: req.toWarehouse ? {
            id: req.toWarehouse.id,
            name: req.toWarehouse.name,
            code: req.toWarehouse.code
          } : null,
          transferLines: Array.isArray(transferLines) ? transferLines : [],
          reference: req.reference
        };
      } else if (req.requestType === 'adjustment') {
        // Parse adjustmentLines if it's a string
        let adjustmentLines = req.adjustmentLines;
        if (typeof adjustmentLines === 'string') {
          try {
            adjustmentLines = JSON.parse(adjustmentLines);
          } catch (e) {
            adjustmentLines = [];
          }
        }
        
        return {
          ...baseRequest,
          warehouse: req.warehouse ? {
            id: req.warehouse.id,
            name: req.warehouse.name,
            code: req.warehouse.code
          } : null,
          adjustmentLines: Array.isArray(adjustmentLines) ? adjustmentLines : [],
          reason: req.reason,
          reference: req.reference
        };
      }

      return baseRequest;
    });

    // Calculate stats
    const stats = {
      total: total,
      pending: await prisma.stockMovementRequest.count({ where: { ...where, status: 'pending' } }),
      approved: await prisma.stockMovementRequest.count({ where: { ...where, status: 'approved' } }),
      rejected: await prisma.stockMovementRequest.count({ where: { ...where, status: 'rejected' } })
    };

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching stock movement requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}


