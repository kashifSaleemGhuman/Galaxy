import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

// GET /api/hrm/payroll/manual-deductions?payrollPeriodId=...&employeeId=...&type=ADDITION|DEDUCTION
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 })

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, employee: { select: { id: true } } }
    })
    if (!currentUser) return new NextResponse('User not found', { status: 404 })

    const { searchParams } = new URL(req.url)
    const payrollPeriodId = searchParams.get('payrollPeriodId')
    const employeeId = searchParams.get('employeeId')
    const type = (searchParams.get('type') || '').toUpperCase()

    if (!payrollPeriodId) return new NextResponse('Missing payrollPeriodId', { status: 400 })

    const isHR = hasHrAccess(currentUser.role)
    if (!isHR) return new NextResponse('Forbidden', { status: 403 })

    const where = {
      action: { in: ['MANUAL_DEDUCTION', 'MANUAL_ADDITION', 'MANUAL_ADJUSTMENT'] },
      payrollPeriodId,
      ...(employeeId ? { employeeId } : {})
    }

    const logs = await prisma.payrollAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    const result = logs
      .map((log) => ({
      id: log.id,
      payrollPeriodId: log.payrollPeriodId,
      employeeId: log.employeeId,
      amount: Number(log.details?.amount || 0),
      reason: String(log.details?.reason || ''),
      type: String(log.details?.type || (log.action === 'MANUAL_ADDITION' ? 'ADDITION' : 'DEDUCTION')).toUpperCase(),
      isActive: log.details?.isActive !== false,
      createdAt: log.createdAt
      }))
      .filter((item) => (type ? item.type === type : true))

    return NextResponse.json(result)
  } catch (error) {
    console.error('[MANUAL_DEDUCTIONS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/hrm/payroll/manual-deductions
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 })

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })
    if (!currentUser) return new NextResponse('User not found', { status: 404 })
    if (!hasHrAccess(currentUser.role)) return new NextResponse('Forbidden', { status: 403 })

    const body = await req.json()
    const { payrollPeriodId, employeeId, amount, reason, type } = body
    const numericAmount = Number(amount)
    const cleanReason = String(reason || '').trim()
    const normalizedType = String(type || 'DEDUCTION').toUpperCase()

    if (!payrollPeriodId || !employeeId || !(numericAmount > 0) || !cleanReason || !['DEDUCTION', 'ADDITION'].includes(normalizedType)) {
      return NextResponse.json(
        { error: 'payrollPeriodId, employeeId, amount (> 0), reason, and valid type are required' },
        { status: 400 }
      )
    }

    const [period, employee] = await Promise.all([
      prisma.payrollPeriod.findUnique({ where: { id: payrollPeriodId }, select: { id: true, status: true } }),
      prisma.employee.findUnique({ where: { id: employeeId }, select: { id: true } })
    ])
    if (!period) return new NextResponse('Payroll period not found', { status: 404 })
    if (!employee) return new NextResponse('Employee not found', { status: 404 })
    if (period.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Manual adjustments can only be added to DRAFT periods' }, { status: 400 })
    }

    const log = await prisma.payrollAuditLog.create({
      data: {
        action: normalizedType === 'ADDITION' ? 'MANUAL_ADDITION' : 'MANUAL_DEDUCTION',
        payrollPeriodId,
        employeeId,
        userId: currentUser.id,
        details: {
          amount: numericAmount,
          reason: cleanReason,
          type: normalizedType,
          isActive: true
        }
      }
    })

    return NextResponse.json({
      id: log.id,
      payrollPeriodId,
      employeeId,
      amount: numericAmount,
      reason: cleanReason,
      type: normalizedType,
      isActive: true,
      createdAt: log.createdAt
    }, { status: 201 })
  } catch (error) {
    console.error('[MANUAL_DEDUCTIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

