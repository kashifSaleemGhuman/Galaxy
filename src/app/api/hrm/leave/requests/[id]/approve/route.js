import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'
import { recalculateLeaveBalance } from '@/lib/leave-balance-calculator'

/**
 * POST /api/hrm/leave/requests/[id]/approve
 * Approve a leave request (HR only)
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
    const { remarks, level = 1 } = body

    // Get leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        leaveType: true,
        employee: true
      }
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      )
    }

    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending requests can be approved' },
        { status: 400 }
      )
    }

    // Create approval record
    await prisma.leaveApproval.create({
      data: {
        leaveRequestId: id,
        approverId: session.user.id,
        level,
        status: 'APPROVED',
        remarks: remarks || null,
        approvedAt: new Date()
      }
    })

    // Update leave request status
    const approved = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: session.user.id,
        approvedAt: new Date()
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
            code: true,
            isPaid: true
          }
        },
        approvals: {
          orderBy: { level: 'asc' }
        }
      }
    })

    // Update daily attendance records for the leave period
    const startDate = new Date(leaveRequest.startDate)
    const endDate = new Date(leaveRequest.endDate)
    const current = new Date(startDate)

    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      // Only update weekdays (exclude weekends)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        await prisma.dailyAttendance.upsert({
          where: {
            employeeId_date: {
              employeeId: leaveRequest.employeeId,
              date: new Date(current)
            }
          },
          create: {
            employeeId: leaveRequest.employeeId,
            date: new Date(current),
            status: 'LEAVE',
            leaveRequestId: id,
            workedMinutes: 0,
            lastCalculatedAt: new Date()
          },
          update: {
            status: 'LEAVE',
            leaveRequestId: id
          }
        })
      }
      current.setDate(current.getDate() + 1)
    }

    // Recalculate leave balance
    try {
      const today = new Date()
      const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      await recalculateLeaveBalance(
        leaveRequest.employeeId,
        leaveRequest.leaveTypeId,
        periodStart,
        periodEnd
      )
    } catch (error) {
      console.error('Error recalculating leave balance:', error)
      // Don't fail the approval if balance recalculation fails
    }

    return NextResponse.json(approved)
  } catch (error) {
    console.error('Error approving leave request:', error)
    return NextResponse.json(
      { error: 'Failed to approve leave request' },
      { status: 500 }
    )
  }
}

