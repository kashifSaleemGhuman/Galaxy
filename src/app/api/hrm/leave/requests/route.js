import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'
import { validateLeaveRequest, calculateLeaveDays, hasOverlappingLeave } from '@/lib/leave-validator'

/**
 * GET /api/hrm/leave/requests
 * List leave requests (filtered by role)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const leaveTypeId = searchParams.get('leaveTypeId')

    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    const isEmployee = session.user.role === ROLES.USER

    // Build where clause
    const where = {}

    // Employees can only see their own requests
    if (isEmployee) {
      // Get employee ID from user
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee record not found' },
          { status: 404 }
        )
      }

      where.employeeId = employee.id
    } else if (employeeId && isHR) {
      // HR can filter by employee
      where.employeeId = employeeId
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (leaveTypeId) {
      where.leaveTypeId = leaveTypeId
    }

    const requests = await prisma.leaveRequest.findMany({
      where,
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
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hrm/leave/requests
 * Create a new leave request (Employee)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leaveTypeId, startDate, endDate, reason } = body

    // Validate required fields
    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get employee record
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee record not found' },
        { status: 404 }
      )
    }

    // Validate leave request
    const validation = await validateLeaveRequest({
      employeeId: employee.id,
      leaveTypeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check for overlapping leave
    const hasOverlap = await hasOverlappingLeave(
      employee.id,
      new Date(startDate),
      new Date(endDate)
    )

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Overlapping leave request exists' },
        { status: 400 }
      )
    }

    // Calculate leave days
    const days = calculateLeaveDays(new Date(startDate), new Date(endDate))

    if (days <= 0) {
      return NextResponse.json(
        { error: 'Invalid date range or all days are weekends' },
        { status: 400 }
      )
    }

    // Check if request is backdated
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isBackdated = new Date(startDate) < today

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: 'PENDING',
        requestedBy: session.user.id,
        isBackdated
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
        }
      }
    })

    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    )
  }
}

