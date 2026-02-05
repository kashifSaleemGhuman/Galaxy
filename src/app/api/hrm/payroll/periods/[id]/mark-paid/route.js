import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// POST /api/hrm/payroll/periods/:id/mark-paid - Mark payroll period as paid
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

    if (payrollPeriod.status !== 'FINALIZED') {
      return new NextResponse('Period must be finalized before marking as paid', { status: 400 })
    }

    // Mark period and all records as paid
    await prisma.$transaction([
      prisma.payrollPeriod.update({
        where: { id: params.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paidBy: currentUser.id
        }
      }),
      prisma.payrollRecord.updateMany({
        where: {
          payrollPeriodId: params.id,
          status: 'FINALIZED'
        },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paidBy: currentUser.id
        }
      }),
      // Create audit logs
      ...payrollPeriod.payrollRecords.map(record =>
        prisma.payrollAuditLog.create({
          data: {
            action: 'PAID',
            payrollRecordId: record.id,
            payrollPeriodId: params.id,
            employeeId: record.employeeId,
            userId: currentUser.id,
            details: {
              periodName: payrollPeriod.periodName,
              paidAt: new Date().toISOString()
            }
          }
        })
      )
    ])

    const updatedPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            payrollRecords: true
          }
        }
      }
    })

    return NextResponse.json(updatedPeriod)
  } catch (error) {
    console.error('[PAYROLL_PERIOD_MARK_PAID]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

