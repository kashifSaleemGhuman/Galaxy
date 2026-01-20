import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/periods/:id - Get payroll period
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
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
      where: { id: params.id },
      include: {
        payrollRecords: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            payrollRecords: true
          }
        }
      }
    })

    if (!payrollPeriod) {
      return new NextResponse('Payroll period not found', { status: 404 })
    }

    return NextResponse.json(payrollPeriod)
  } catch (error) {
    console.error('[PAYROLL_PERIOD_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// PUT /api/hrm/payroll/periods/:id - Update payroll period
export async function PUT(req, { params }) {
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

    const body = await req.json()
    const { periodName, periodStart, periodEnd, notes } = body

    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: params.id }
    })

    if (!payrollPeriod) {
      return new NextResponse('Payroll period not found', { status: 404 })
    }

    if (payrollPeriod.status !== 'DRAFT') {
      return new NextResponse('Cannot modify finalized or paid period', { status: 400 })
    }

    const updatedPeriod = await prisma.payrollPeriod.update({
      where: { id: params.id },
      data: {
        ...(periodName && { periodName }),
        ...(periodStart && { periodStart: new Date(periodStart) }),
        ...(periodEnd && { periodEnd: new Date(periodEnd) }),
        ...(notes !== undefined && { notes })
      }
    })

    return NextResponse.json(updatedPeriod)
  } catch (error) {
    console.error('[PAYROLL_PERIOD_PUT]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

