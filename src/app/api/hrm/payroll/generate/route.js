import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { calculatePayroll } from '@/lib/payroll-calculator'

// POST /api/hrm/payroll/generate - Generate payroll for period
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
    const { payrollPeriodId, employeeIds } = body

    if (!payrollPeriodId) {
      return new NextResponse('Missing payrollPeriodId', { status: 400 })
    }

    // Check if period exists and is in DRAFT status
    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: payrollPeriodId }
    })

    if (!payrollPeriod) {
      return new NextResponse('Payroll period not found', { status: 404 })
    }

    if (payrollPeriod.status !== 'DRAFT') {
      return new NextResponse('Can only generate payroll for DRAFT periods', { status: 400 })
    }

    // Check if attendance is locked for the period
    const attendanceLock = await prisma.attendanceLock.findFirst({
      where: {
        periodStart: { lte: payrollPeriod.periodEnd },
        periodEnd: { gte: payrollPeriod.periodStart },
        isActive: true
      }
    })

    if (!attendanceLock) {
      return new NextResponse('Attendance must be locked before generating payroll', { status: 400 })
    }

    // Get employees to process
    let employees
    if (employeeIds && employeeIds.length > 0) {
      employees = await prisma.employee.findMany({
        where: {
          id: { in: employeeIds },
          dateOfLeaving: null // Only active employees
        }
      })
    } else {
      employees = await prisma.employee.findMany({
        where: {
          dateOfLeaving: null // Only active employees
        }
      })
    }

    const results = []
    const errors = []

    // Delete existing GENERATED records for this period
    await prisma.payrollRecord.deleteMany({
      where: {
        payrollPeriodId,
        status: 'GENERATED'
      }
    })

    // Generate payroll for each employee
    for (const employee of employees) {
      try {
        const calculation = await calculatePayroll({
          employeeId: employee.id,
          payrollPeriodId,
          calculatedBy: currentUser.id
        })

        // Ensure JSON fields are properly serialized
        // Convert Date objects to ISO strings for JSON serialization
        const serializeForJson = (obj) => {
          if (obj === null || obj === undefined) {
            return null
          }
          // If it's already a string, it might be an error message - return empty object
          if (typeof obj === 'string') {
            console.warn('Expected JSON object but got string:', obj.substring(0, 50))
            return {}
          }
          // Recursively serialize Date objects
          try {
            return JSON.parse(JSON.stringify(obj, (key, value) => {
              if (value instanceof Date) {
                return value.toISOString()
              }
              return value
            }))
          } catch (error) {
            console.error('Error serializing JSON:', error, 'Object:', obj)
            return {}
          }
        }

        // Create payroll record
        const payrollRecord = await prisma.payrollRecord.create({
          data: {
            employeeId: employee.id,
            payrollPeriodId,
            salaryStructureId: calculation.salaryStructureId,
            status: 'GENERATED',
            calculatedBy: currentUser.id,
            grossSalary: calculation.grossSalary,
            totalAllowances: calculation.totalAllowances,
            totalDeductions: calculation.totalDeductions,
            netSalary: calculation.netSalary,
            calculationBreakdown: serializeForJson(calculation.calculationBreakdown),
            attendanceSummary: serializeForJson(calculation.attendanceSummary),
            leaveSummary: serializeForJson(calculation.leaveSummary)
          }
        })

        // Create payroll components
        await prisma.payrollComponent.createMany({
          data: calculation.components.map(comp => ({
            payrollRecordId: payrollRecord.id,
            componentName: comp.componentName,
            componentType: comp.componentType,
            calculationType: comp.calculationType,
            baseAmount: comp.baseAmount,
            amount: comp.amount,
            isTaxable: comp.isTaxable,
            priority: comp.priority
          }))
        })

        // Update loan installments
        const loanDeductions = await getLoanDeductions(employee.id, payrollPeriodId)
        for (const installment of loanDeductions.installments) {
          await prisma.loanInstallment.update({
            where: { id: installment.installmentId },
            data: {
              payrollRecordId: payrollRecord.id,
              status: 'DEDUCTED',
              deductedAt: new Date()
            }
          })
        }

        // Create audit log
        await prisma.payrollAuditLog.create({
          data: {
            action: 'CALCULATED',
            payrollRecordId: payrollRecord.id,
            payrollPeriodId,
            employeeId: employee.id,
            userId: currentUser.id,
            details: {
              grossSalary: Number(calculation.grossSalary),
              netSalary: Number(calculation.netSalary)
            }
          }
        })

        results.push({
          employeeId: employee.id,
          employeeName: employee.name,
          success: true,
          payrollRecordId: payrollRecord.id
        })
      } catch (error) {
        console.error(`[PAYROLL_GENERATE] Error for employee ${employee.id}:`, error)
        errors.push({
          employeeId: employee.id,
          employeeName: employee.name,
          success: false,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length
    })
  } catch (error) {
    console.error('[PAYROLL_GENERATE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// Helper function to get loan deductions (duplicated from calculator for API use)
async function getLoanDeductions(employeeId, payrollPeriodId) {
  const loans = await prisma.loan.findMany({
    where: {
      employeeId,
      status: 'ACTIVE'
    },
    include: {
      installments: {
        where: {
          status: 'PENDING',
          payrollRecordId: null
        },
        orderBy: { installmentNumber: 'asc' },
        take: 1
      }
    }
  })

  let totalAmount = 0
  const installments = []

  for (const loan of loans) {
    if (loan.installments.length > 0) {
      const installment = loan.installments[0]
      totalAmount += Number(installment.amount)
      installments.push({
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        installmentId: installment.id,
        amount: Number(installment.amount)
      })
    }
  }

  return {
    totalAmount,
    installments
  }
}

