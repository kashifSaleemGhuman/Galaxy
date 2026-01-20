import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

/**
 * GET /api/hrm/leave/requests/[id]
 * Get a single leave request
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
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
            code: true,
            isPaid: true
          }
        },
        approvals: {
          orderBy: { level: 'asc' }
        }
      }
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    const isEmployee = session.user.role === ROLES.USER

    if (isEmployee) {
      // Employees can only see their own requests
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (employee?.id !== leaveRequest.employeeId) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Error fetching leave request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave request' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hrm/leave/requests/[id]/cancel
 * Cancel a leave request
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { cancellationReason } = body

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

    // Check permissions
    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    const isEmployee = session.user.role === ROLES.USER

    if (isEmployee) {
      // Employees can only cancel their own pending requests
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (employee?.id !== leaveRequest.employeeId) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      if (leaveRequest.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Only pending requests can be cancelled' },
          { status: 400 }
        )
      }
    }

    // HR can cancel any request
    if (!isHR && !isEmployee) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Cancel the request
    const cancelled = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: session.user.id,
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || null
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
        }
      }
    })

    return NextResponse.json(cancelled)
  } catch (error) {
    console.error('Error cancelling leave request:', error)
    return NextResponse.json(
      { error: 'Failed to cancel leave request' },
      { status: 500 }
    )
  }
}

