import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

/**
 * POST /api/hrm/leave/requests/[id]/reject
 * Reject a leave request (HR only)
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    if (!isHR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { rejectionReason, level = 1 } = body

    if (!rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Get leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      )
    }

    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending requests can be rejected' },
        { status: 400 }
      )
    }

    // Create approval record with rejected status
    await prisma.leaveApproval.create({
      data: {
        leaveRequestId: id,
        approverId: session.user.id,
        level,
        status: 'REJECTED',
        remarks: rejectionReason,
        approvedAt: new Date()
      }
    })

    // Update leave request status
    const rejected = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
        rejectionReason
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true
          }
        },
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        approvals: {
          orderBy: { level: 'asc' }
        }
      }
    })

    return NextResponse.json(rejected)
  } catch (error) {
    console.error('Error rejecting leave request:', error)
    return NextResponse.json(
      { error: 'Failed to reject leave request' },
      { status: 500 }
    )
  }
}

