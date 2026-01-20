/**
 * Payroll Helper Functions
 * 
 * Utility functions for payroll operations
 */

import { prisma } from '@/lib/db'

/**
 * Get active salary structure for employee at a given date
 */
export async function getActiveSalaryStructure(employeeId, date) {
  const targetDate = new Date(date)
  
  const structure = await prisma.salaryStructure.findFirst({
    where: {
      employeeId,
      isActive: true,
      effectiveFrom: { lte: targetDate },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: targetDate } }
      ]
    },
    include: {
      components: {
        where: { isActive: true },
        orderBy: { priority: 'asc' }
      }
    },
    orderBy: { effectiveFrom: 'desc' }
  })

  return structure
}

/**
 * Check if attendance is locked for a period
 */
export async function isAttendanceLocked(periodStart, periodEnd) {
  const lock = await prisma.attendanceLock.findFirst({
    where: {
      periodStart: { lte: periodEnd },
      periodEnd: { gte: periodStart },
      isActive: true
    }
  })

  return !!lock
}

/**
 * Lock attendance for payroll period
 */
export async function lockAttendanceForPeriod(periodStart, periodEnd, lockedBy) {
  // Check if already locked
  const existingLock = await isAttendanceLocked(periodStart, periodEnd)
  if (existingLock) {
    throw new Error('Attendance already locked for this period')
  }

  // Create lock
  const lock = await prisma.attendanceLock.create({
    data: {
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      lockedBy,
      lockedAt: new Date(),
      isActive: true
    }
  })

  // Lock all daily attendance records in the period
  await prisma.dailyAttendance.updateMany({
    where: {
      date: {
        gte: new Date(periodStart),
        lte: new Date(periodEnd)
      },
      isLocked: false
    },
    data: {
      isLocked: true,
      lockedAt: new Date(),
      lockedBy
    }
  })

  return lock
}

/**
 * Validate payroll period dates
 */
export function validatePayrollPeriod(periodStart, periodEnd) {
  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  if (start >= end) {
    return { valid: false, error: 'Period start date must be before end date' }
  }

  // Check if period is too long (more than 3 months)
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth())
  if (monthsDiff > 3) {
    return { valid: false, error: 'Payroll period cannot exceed 3 months' }
  }

  return { valid: true }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Get payroll summary for a period
 */
export async function getPayrollSummary(payrollPeriodId) {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: payrollPeriodId },
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
      }
    }
  })

  if (!period) {
    return null
  }

  const summary = {
    periodId: period.id,
    periodName: period.periodName,
    status: period.status,
    totalEmployees: period.payrollRecords.length,
    totalGrossSalary: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    totalNetSalary: 0
  }

  for (const record of period.payrollRecords) {
    summary.totalGrossSalary += Number(record.grossSalary)
    summary.totalAllowances += Number(record.totalAllowances)
    summary.totalDeductions += Number(record.totalDeductions)
    summary.totalNetSalary += Number(record.netSalary)
  }

  return summary
}

/**
 * Check if payroll can be regenerated
 */
export async function canRegeneratePayroll(payrollPeriodId) {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: payrollPeriodId }
  })

  if (!period) {
    return { canRegenerate: false, reason: 'Period not found' }
  }

  if (period.status !== 'DRAFT') {
    return { canRegenerate: false, reason: 'Can only regenerate DRAFT periods' }
  }

  return { canRegenerate: true }
}

