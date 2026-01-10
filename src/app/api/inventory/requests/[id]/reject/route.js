import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/requests/[id]/reject - Reject a stock movement request
export async function POST(request, { params }) {
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

    // Only Super Admin and Admin can reject requests
    const canReject = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN
    ].includes(currentUser.role);

    if (!canReject) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: requestId } = params;
    const body = await request.json();
    const { rejectionReason, notes } = body;

    if (!rejectionReason) {
      return NextResponse.json({ 
        error: 'Rejection reason is required' 
      }, { status: 400 });
    }

    // Get the request
    const stockRequest = await prisma.stockMovementRequest.findUnique({
      where: { id: requestId }
    });

    if (!stockRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (stockRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: `Request is already ${stockRequest.status}` 
      }, { status: 400 });
    }

    // Update request status
    await prisma.stockMovementRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        rejectedBy: currentUser.id,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason,
        notes: notes || stockRequest.notes
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Request rejected successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json({ 
      error: 'Failed to reject request',
      details: error.message 
    }, { status: 500 });
  }
}


