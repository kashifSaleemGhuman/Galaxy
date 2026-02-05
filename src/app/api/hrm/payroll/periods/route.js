import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/periods - List payroll periods
export async function GET(req) {
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

    const payrollPeriods = await prisma.payrollPeriod.findMany({
      include: {
        _count: {
          select: {
            payrollRecords: true
          }
        }
      },
      orderBy: { periodStart: 'desc' }
    })

    return NextResponse.json(payrollPeriods)
  } catch (error) {
    console.error('[PAYROLL_PERIODS_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// POST /api/hrm/payroll/periods - Create payroll period
export async function POST(req) {
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

    if (!periodName || !periodStart || !periodEnd) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const startDate = new Date(periodStart)
    const endDate = new Date(periodEnd)

    if (startDate >= endDate) {
      return new NextResponse('Period start date must be before end date', { status: 400 })
    }

    // Check for overlapping periods
    const overlapping = await prisma.payrollPeriod.findFirst({
      where: {
        OR: [
          {
            AND: [
              { periodStart: { lte: endDate } },
              { periodEnd: { gte: startDate } }
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return new NextResponse('Period overlaps with existing period', { status: 400 })
    }

    const payrollPeriod = await prisma.payrollPeriod.create({
      data: {
        periodName,
        periodStart: startDate,
        periodEnd: endDate,
        status: 'DRAFT',
        notes,
        createdBy: currentUser.id
      }
    })

    return NextResponse.json(payrollPeriod, { status: 201 })
  } catch (error) {
    console.error('[PAYROLL_PERIODS_POST]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

