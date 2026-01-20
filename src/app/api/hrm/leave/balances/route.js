import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'
import { getLeaveBalanceSummary, getCurrentLeaveBalance } from '@/lib/leave-balance-calculator'

/**
 * GET /api/hrm/leave/balances
 * Get leave balances (filtered by role)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const leaveTypeId = searchParams.get('leaveTypeId')

    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    const isEmployee = session.user.role === ROLES.USER

    // Employees can only see their own balances
    if (isEmployee) {
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

      // Get balance summary
      const summary = await getLeaveBalanceSummary(employee.id)

      // If specific leave type requested, return detailed balance
      if (leaveTypeId) {
        const balance = await getCurrentLeaveBalance(employee.id, leaveTypeId)
        return NextResponse.json({
          leaveTypeId,
          currentBalance: balance,
          summary: summary.find(s => s.leaveTypeId === leaveTypeId)
        })
      }

      return NextResponse.json(summary)
    }

    // HR can see any employee's balances
    if (isHR && employeeId) {
      if (leaveTypeId) {
        const balance = await getCurrentLeaveBalance(employeeId, leaveTypeId)
        return NextResponse.json({
          employeeId,
          leaveTypeId,
          currentBalance: balance
        })
      }

      const summary = await getLeaveBalanceSummary(employeeId)
      return NextResponse.json(summary)
    }

    // If no employeeId specified for HR, return error
    if (isHR && !employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Error fetching leave balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave balances' },
      { status: 500 }
    )
  }
}

