import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { lockAttendanceForPeriod } from '@/lib/payroll-helpers'

// POST /api/hrm/payroll/periods/:id/lock-attendance - Lock attendance for payroll period
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const hasAccess = currentUser.role === ROLES.SUPER_ADMIN || 
                     currentUser.role === ROLES.ADMIN || 
                     currentUser.role === ROLES.HR_MANAGER

    if (!hasAccess) {
      return new NextResponse('Forbidden: Insufficient permissions', { status: 403 })
    }

    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: params.id }
    })

    if (!payrollPeriod) {
      return new NextResponse('Payroll period not found', { status: 404 })
    }

    if (payrollPeriod.status !== 'DRAFT') {
      return new NextResponse('Can only lock attendance for DRAFT periods', { status: 400 })
    }

    // Lock attendance for the period
    const lock = await lockAttendanceForPeriod(
      payrollPeriod.periodStart,
      payrollPeriod.periodEnd,
      currentUser.id
    )

    return NextResponse.json({
      success: true,
      lock,
      message: 'Attendance locked successfully for payroll period'
    })
  } catch (error) {
    console.error('[LOCK_ATTENDANCE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

