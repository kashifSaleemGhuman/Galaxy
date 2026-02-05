import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/bonuses - List bonuses
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

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const payrollPeriodId = searchParams.get('payrollPeriodId')
    const status = searchParams.get('status')

    const where = {}
    if (employeeId) where.employeeId = employeeId
    if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId
    if (status) where.status = status

    const bonuses = await prisma.bonus.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        payrollPeriod: {
          select: {
            id: true,
            periodName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bonuses)
  } catch (error) {
    console.error('[BONUSES_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// POST /api/hrm/payroll/bonuses - Create bonus
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
    const { employeeId, payrollPeriodId, name, amount, type, notes } = body

    if (!employeeId || !name || !amount) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    const bonus = await prisma.bonus.create({
      data: {
        employeeId,
        payrollPeriodId: payrollPeriodId || null,
        name,
        amount,
        type: type || 'ONE_TIME',
        status: 'PENDING',
        notes,
        createdBy: currentUser.id
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(bonus, { status: 201 })
  } catch (error) {
    console.error('[BONUSES_POST]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

