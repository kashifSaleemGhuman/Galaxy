import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// POST /api/hrm/payroll/periods/:id/finalize - Finalize payroll period
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
      where: { id: params.id },
      include: {
        payrollRecords: true
      }
    })

    if (!payrollPeriod) {
      return new NextResponse('Payroll period not found', { status: 404 })
    }

    if (payrollPeriod.status !== 'DRAFT') {
      return new NextResponse('Period is already finalized or paid', { status: 400 })
    }

    if (payrollPeriod.payrollRecords.length === 0) {
      return new NextResponse('Cannot finalize period without payroll records', { status: 400 })
    }

    // Finalize period and all records
    await prisma.$transaction([
      prisma.payrollPeriod.update({
        where: { id: params.id },
        data: {
          status: 'FINALIZED',
          finalizedAt: new Date(),
          finalizedBy: currentUser.id
        }
      }),
      prisma.payrollRecord.updateMany({
        where: {
          payrollPeriodId: params.id,
          status: 'GENERATED'
        },
        data: {
          status: 'FINALIZED',
          finalizedAt: new Date(),
          finalizedBy: currentUser.id
        }
      }),
      // Create audit logs
      ...payrollPeriod.payrollRecords.map(record =>
        prisma.payrollAuditLog.create({
          data: {
            action: 'FINALIZED',
            payrollRecordId: record.id,
            payrollPeriodId: params.id,
            employeeId: record.employeeId,
            userId: currentUser.id,
            details: {
              periodName: payrollPeriod.periodName,
              finalizedAt: new Date().toISOString()
            }
          }
        })
      )
    ])

    const updatedPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: params.id }
    })

    return NextResponse.json(updatedPeriod)
  } catch (error) {
    console.error('[PAYROLL_PERIOD_FINALIZE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

