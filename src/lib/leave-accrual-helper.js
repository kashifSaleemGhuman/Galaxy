/**
 * Leave Accrual Helper
 * 
 * Helper functions for automatic accrual calculations and creation
 */

import { prisma } from '@/lib/db'

/**
 * Calculate pro-rata accrual for mid-period assignment
 * @param {Date} assignmentDate - Date when policy is assigned
 * @param {string} accrualType - MONTHLY, YEARLY, etc.
 * @param {number} accrualAmount - Full accrual amount
 * @returns {number} Pro-rata accrual amount
 */
function calculateProRataAccrual(assignmentDate, accrualType, accrualAmount) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const assignDate = new Date(assignmentDate)
  assignDate.setHours(0, 0, 0, 0)

  if (accrualType === 'MONTHLY') {
    // Calculate days remaining in current month
    const lastDayOfMonth = new Date(assignDate.getFullYear(), assignDate.getMonth() + 1, 0)
    const totalDaysInMonth = lastDayOfMonth.getDate()
    const daysRemaining = lastDayOfMonth.getDate() - assignDate.getDate() + 1
    
    // Pro-rata: (accrualAmount / totalDaysInMonth) * daysRemaining
    return (Number(accrualAmount) / totalDaysInMonth) * daysRemaining
  } else if (accrualType === 'YEARLY') {
    // Calculate days remaining in current year
    const yearStart = new Date(assignDate.getFullYear(), 0, 1)
    const yearEnd = new Date(assignDate.getFullYear(), 11, 31)
    const totalDaysInYear = Math.ceil((yearEnd - yearStart) / (1000 * 60 * 60 * 24)) + 1
    const daysRemaining = Math.ceil((yearEnd - assignDate) / (1000 * 60 * 60 * 24)) + 1
    
    // Pro-rata: (accrualAmount / totalDaysInYear) * daysRemaining
    return (Number(accrualAmount) / totalDaysInYear) * daysRemaining
  } else if (accrualType === 'NONE') {
    return 0
  }
  
  // For CUSTOM or other types, return full amount (can be adjusted later)
  return Number(accrualAmount)
}

/**
 * Get or create initial balance record for employee
 * @param {string} employeeId - Employee ID
 * @param {string} leaveTypeId - Leave type ID
 * @param {string} policyId - Policy ID
 * @param {Date} effectiveFrom - Effective from date
 * @returns {Promise<Object>} Balance record
 */
async function getOrCreateInitialBalance(employeeId, leaveTypeId, policyId, effectiveFrom) {
  // Check if balance already exists for current period
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Define period (current month for monthly, current year for yearly)
  const periodStart = new Date(effectiveFrom)
  periodStart.setDate(1) // First day of month
  periodStart.setHours(0, 0, 0, 0)
  
  const periodEnd = new Date(periodStart)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  periodEnd.setDate(0) // Last day of month
  periodEnd.setHours(23, 59, 59, 999)

  // Check for existing balance
  const existingBalance = await prisma.leaveBalance.findFirst({
    where: {
      employeeId,
      leaveTypeId,
      periodStart: {
        lte: periodEnd
      },
      periodEnd: {
        gte: periodStart
      }
    }
  })

  if (existingBalance) {
    return existingBalance
  }

  // Create initial balance record
  const balance = await prisma.leaveBalance.create({
    data: {
      employeeId,
      leaveTypeId,
      policyId,
      periodStart,
      periodEnd,
      openingBalance: 0,
      accrued: 0,
      used: 0,
      encashed: 0,
      carriedForward: 0,
      closingBalance: 0
    }
  })

  return balance
}

/**
 * Create initial accrual when policy is assigned to employee
 * @param {string} employeeId - Employee ID
 * @param {string} leaveTypeId - Leave type ID
 * @param {Object} policy - Policy object
 * @param {Date} effectiveFrom - Effective from date (assignment date)
 * @param {string} createdBy - User ID who assigned the policy
 * @returns {Promise<Object>} Created accrual record
 */
export async function createInitialAccrual(employeeId, leaveTypeId, policy, effectiveFrom, createdBy) {
  try {
    // Skip if accrual type is NONE
    if (policy.accrualType === 'NONE') {
      return null
    }

    const effectiveDate = new Date(effectiveFrom)
    effectiveDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // For initial assignment, give FULL accrual amount (not pro-rata)
    // This is common HR practice - new employees get full month/year entitlement
    // Pro-rata will apply in subsequent accrual runs
    let accrualAmount = Number(policy.accrualAmount)

    // For MONTHLY: Give full month's accrual
    // For YEARLY: Give full year's accrual
    // For CUSTOM: Give full accrual amount
    
    // Round to 2 decimal places
    const roundedAmount = Math.round(accrualAmount * 100) / 100

    // Ensure minimum of 1 day for initial assignment (if accrual amount > 0)
    // This prevents issues where employees can't take even 1 day of leave
    const finalAmount = roundedAmount > 0 && roundedAmount < 1 ? 1 : roundedAmount

    // Skip if accrual amount is 0 or negative
    if (finalAmount <= 0) {
      return null
    }

    // Get or create initial balance
    const balance = await getOrCreateInitialBalance(
      employeeId,
      leaveTypeId,
      policy.id,
      effectiveDate
    )

    // Calculate period dates
    const periodStart = new Date(balance.periodStart)
    const periodEnd = new Date(balance.periodEnd)

    // Get current balance before accrual
    const balanceBefore = Number(balance.closingBalance)

    // Calculate balance after accrual (respecting max balance)
    let balanceAfter = balanceBefore + finalAmount
    if (policy.maxBalance) {
      balanceAfter = Math.min(balanceAfter, Number(policy.maxBalance))
    }
    const actualAccrual = balanceAfter - balanceBefore

    // Skip if actual accrual is 0 (already at max)
    if (actualAccrual <= 0) {
      return null
    }

    // Create accrual record
    const accrual = await prisma.leaveAccrual.create({
      data: {
        employeeId,
        leaveTypeId,
        policyId: policy.id,
        accrualDate: effectiveDate,
        accrualAmount: actualAccrual,
        periodStart,
        periodEnd,
        balanceBefore,
        balanceAfter,
        notes: `Initial accrual on policy assignment (full entitlement: ${finalAmount.toFixed(2)} days)`,
        createdBy
      }
    })

    // Update balance record
    await prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        accrued: Number(balance.accrued) + actualAccrual,
        closingBalance: balanceAfter,
        lastCalculatedAt: new Date()
      }
    })

    return accrual
  } catch (error) {
    console.error('Error creating initial accrual:', error)
    // Don't throw - allow assignment to proceed even if accrual fails
    return null
  }
}

/**
 * Calculate working days between two dates (excluding weekends)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of working days
 */
function calculateWorkingDays(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

