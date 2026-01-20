/**
 * Leave Balance Calculator
 * 
 * Calculates and manages leave balances based on policies
 */

import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Get current leave balance for an employee and leave type
 * @param {string} employeeId - Employee ID
 * @param {string} leaveTypeId - Leave type ID
 * @returns {Promise<number>} Current balance in days
 */
export async function getCurrentLeaveBalance(employeeId, leaveTypeId) {
  try {
    // Get the most recent balance record
    const latestBalance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        leaveTypeId
      },
      orderBy: {
        periodEnd: 'desc'
      },
      include: {
        policy: true
      }
    })

    if (!latestBalance) {
      // If no balance record exists, check for any accruals
      // This handles cases where accrual was created but balance wasn't initialized
      const anyAccrual = await prisma.leaveAccrual.findFirst({
        where: {
          employeeId,
          leaveTypeId
        },
        orderBy: {
          accrualDate: 'desc'
        }
      })

      if (anyAccrual) {
        // Calculate balance from accruals
        const allAccruals = await prisma.leaveAccrual.findMany({
          where: {
            employeeId,
            leaveTypeId
          }
        })

        const allUsed = await prisma.leaveRequest.findMany({
          where: {
            employeeId,
            leaveTypeId,
            status: 'APPROVED'
          }
        })

        const totalAccrued = allAccruals.reduce((sum, acc) => sum + Number(acc.accrualAmount), 0)
        const totalUsed = allUsed.reduce((sum, req) => sum + Number(req.days), 0)

        return Math.max(0, totalAccrued - totalUsed)
      }

      return 0
    }

    // Get accruals since period end
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const accrualsSincePeriodEnd = await prisma.leaveAccrual.findMany({
      where: {
        employeeId,
        leaveTypeId,
        accrualDate: {
          gt: latestBalance.periodEnd
        }
      }
    })

    // Get used leave since period end
    const usedSincePeriodEnd = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        leaveTypeId,
        status: 'APPROVED',
        startDate: {
          gt: latestBalance.periodEnd
        }
      }
    })

    const totalUsed = usedSincePeriodEnd.reduce((sum, req) => {
      return sum + Number(req.days)
    }, 0)

    // Get encashments since period end
    const encashmentsSincePeriodEnd = await prisma.leaveEncashment.findMany({
      where: {
        employeeId,
        leaveTypeId,
        status: 'PROCESSED',
        encashmentDate: {
          gt: latestBalance.periodEnd
        }
      }
    })

    const totalEncashed = encashmentsSincePeriodEnd.reduce((sum, enc) => {
      return sum + Number(enc.daysEncashed)
    }, 0)

    // Calculate current balance
    const totalAccrued = accrualsSincePeriodEnd.reduce((sum, acc) => {
      return sum + Number(acc.accrualAmount)
    }, 0)

    const currentBalance = 
      Number(latestBalance.closingBalance) + 
      totalAccrued - 
      totalUsed - 
      totalEncashed

    return Math.max(0, currentBalance) // Don't return negative unless policy allows
  } catch (error) {
    console.error('Error calculating leave balance:', error)
    return 0
  }
}

/**
 * Recalculate leave balance for a period
 * @param {string} employeeId - Employee ID
 * @param {string} leaveTypeId - Leave type ID
 * @param {Date} periodStart - Period start date
 * @param {Date} periodEnd - Period end date
 * @returns {Promise<Object>} Updated balance record
 */
export async function recalculateLeaveBalance(employeeId, leaveTypeId, periodStart, periodEnd) {
  try {
    // Get active policy for the period
    const policyAssignment = await prisma.leavePolicyAssignment.findFirst({
      where: {
        employeeId,
        isActive: true,
        effectiveFrom: { lte: periodStart },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: periodStart } }
        ]
      },
      include: {
        policy: {
          include: {
            leaveType: true
          }
        }
      }
    })

    if (!policyAssignment || policyAssignment.policy.leaveTypeId !== leaveTypeId) {
      throw new Error('No active policy found for this period')
    }

    const policy = policyAssignment.policy

    // Get previous period balance
    const previousBalance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        leaveTypeId,
        periodEnd: { lt: periodStart }
      },
      orderBy: {
        periodEnd: 'desc'
      }
    })

    // Calculate opening balance (with carry forward)
    let openingBalance = 0
    let carriedForward = 0

    if (previousBalance) {
      if (policy.carryForwardEnabled && policy.carryForwardLimit) {
        carriedForward = Math.min(
          Number(previousBalance.closingBalance),
          Number(policy.carryForwardLimit)
        )
      }
      openingBalance = carriedForward
    }

    // Get accruals for the period
    const accruals = await prisma.leaveAccrual.findMany({
      where: {
        employeeId,
        leaveTypeId,
        policyId: policy.id,
        accrualDate: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    })

    const totalAccrued = accruals.reduce((sum, acc) => {
      return sum + Number(acc.accrualAmount)
    }, 0)

    // Get used leave for the period
    const usedLeave = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        leaveTypeId,
        status: 'APPROVED',
        OR: [
          {
            AND: [
              { startDate: { gte: periodStart } },
              { startDate: { lte: periodEnd } }
            ]
          },
          {
            AND: [
              { endDate: { gte: periodStart } },
              { endDate: { lte: periodEnd } }
            ]
          }
        ]
      }
    })

    const totalUsed = usedLeave.reduce((sum, req) => {
      // Calculate days within the period
      const reqStart = new Date(req.startDate)
      const reqEnd = new Date(req.endDate)
      const periodStartDate = new Date(periodStart)
      const periodEndDate = new Date(periodEnd)

      const actualStart = reqStart > periodStartDate ? reqStart : periodStartDate
      const actualEnd = reqEnd < periodEndDate ? reqEnd : periodEndDate

      if (actualStart <= actualEnd) {
        const days = calculateDaysInRange(actualStart, actualEnd)
        return sum + days
      }
      return sum
    }, 0)

    // Get encashments for the period
    const encashments = await prisma.leaveEncashment.findMany({
      where: {
        employeeId,
        leaveTypeId,
        policyId: policy.id,
        status: 'PROCESSED',
        encashmentDate: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    })

    const totalEncashed = encashments.reduce((sum, enc) => {
      return sum + Number(enc.daysEncashed)
    }, 0)

    // Calculate closing balance
    const closingBalance = openingBalance + totalAccrued - totalUsed - totalEncashed

    // Apply max balance limit if set
    const finalClosingBalance = policy.maxBalance 
      ? Math.min(closingBalance, Number(policy.maxBalance))
      : closingBalance

    // Upsert balance record
    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_periodStart: {
          employeeId,
          leaveTypeId,
          periodStart
        }
      },
      create: {
        employeeId,
        leaveTypeId,
        policyId: policy.id,
        periodStart,
        periodEnd,
        openingBalance,
        accrued: totalAccrued,
        used: totalUsed,
        encashed: totalEncashed,
        carriedForward,
        closingBalance: finalClosingBalance,
        lastCalculatedAt: new Date()
      },
      update: {
        openingBalance,
        accrued: totalAccrued,
        used: totalUsed,
        encashed: totalEncashed,
        carriedForward,
        closingBalance: finalClosingBalance,
        lastCalculatedAt: new Date()
      }
    })

    return balance
  } catch (error) {
    console.error('Error recalculating leave balance:', error)
    throw error
  }
}

/**
 * Calculate days in a date range (excluding weekends)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
function calculateDaysInRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let days = 0
  const current = new Date(start)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++
    }
    current.setDate(current.getDate() + 1)
  }

  return days
}

/**
 * Get leave balance summary for an employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Array>} Array of balance summaries by leave type
 */
export async function getLeaveBalanceSummary(employeeId) {
  try {
    // Get all leave types with active policies for this employee
    const policyAssignments = await prisma.leavePolicyAssignment.findMany({
      where: {
        employeeId,
        isActive: true,
        effectiveTo: null // Current assignments only
      },
      include: {
        policy: {
          include: {
            leaveType: true
          }
        }
      }
    })

    const balances = await Promise.all(
      policyAssignments.map(async (assignment) => {
        const balance = await getCurrentLeaveBalance(
          employeeId,
          assignment.policy.leaveTypeId
        )

        return {
          leaveTypeId: assignment.policy.leaveTypeId,
          leaveTypeName: assignment.policy.leaveType.name,
          leaveTypeCode: assignment.policy.leaveType.code,
          isPaid: assignment.policy.leaveType.isPaid,
          currentBalance: balance,
          policyName: assignment.policy.name
        }
      })
    )

    return balances
  } catch (error) {
    console.error('Error getting leave balance summary:', error)
    return []
  }
}

