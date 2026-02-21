/**
 * Leave Validator
 * 
 * Validates leave requests before submission
 */

import { prisma } from '@/lib/db'
import { getLeaveTypeQuotaStats } from '@/lib/leave-balance-calculator'

/**
 * Validate leave request
 * @param {Object} params - Validation parameters
 * @param {string} params.employeeId - Employee ID
 * @param {string} params.leaveTypeId - Leave type ID
 * @param {Date} params.startDate - Start date
 * @param {Date} params.endDate - End date
 * @returns {Object} { valid: boolean, error?: string }
 */
export async function validateLeaveRequest({ employeeId, leaveTypeId, startDate, endDate }) {
  try {
    // 1. Check leave type exists and is active
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId }
    })

    if (!leaveType || !leaveType.isActive) {
      return { valid: false, error: 'Leave type not found or inactive' }
    }

    // 2. Check employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return { valid: false, error: 'Employee not found' }
    }

    // 3. Check dates are valid
    if (startDate > endDate) {
      return { valid: false, error: 'Start date must be before or equal to end date' }
    }

    // 4. Check for overlapping approved leave
    const overlappingLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: 'APPROVED',
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } }
            ]
          }
        ]
      }
    })

    if (overlappingLeave) {
      return { 
        valid: false, 
        error: `Overlapping with approved leave from ${new Date(overlappingLeave.startDate).toLocaleDateString()} to ${new Date(overlappingLeave.endDate).toLocaleDateString()}` 
      }
    }

    // 5. Check employee has active policy assignment
    const policyAssignment = await prisma.leavePolicyAssignment.findFirst({
      where: {
        employeeId,
        isActive: true,
        effectiveFrom: { lte: startDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: startDate } }
        ],
        policy: {
          isActive: true,
          leaveTypeId: leaveTypeId,
          effectiveFrom: { lte: startDate },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: startDate } }
          ]
        }
      },
      include: {
        policy: {
          include: {
            leaveType: true
          }
        }
      }
    })

    // Check if policy exists but not assigned
    if (!policyAssignment) {
      // Check if a policy exists for this leave type
      const policyExists = await prisma.leavePolicy.findFirst({
        where: {
          leaveTypeId,
          isActive: true,
          effectiveFrom: { lte: startDate },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: startDate } }
          ]
        }
      })

      if (policyExists) {
        return { 
          valid: false, 
          error: 'No active policy assignment found. Please contact HR to assign a leave policy to your account.' 
        }
      } else {
        return { 
          valid: false, 
          error: 'No active leave policy found for this leave type. Please contact HR.' 
        }
      }
    }

    if (!policyAssignment.policy || policyAssignment.policy.leaveTypeId !== leaveTypeId) {
      return { 
        valid: false, 
        error: 'No active policy assignment found for this leave type. Please contact HR to assign a leave policy.' 
      }
    }

    // 6. Check balance availability (if paid leave)
    if (leaveType.isPaid) {
      const requestedDays = calculateLeaveDays(startDate, endDate)
      const quotaStats = await getLeaveTypeQuotaStats(employeeId, leaveTypeId, startDate)

      const policy = policyAssignment.policy

      if (!policy.allowNegativeBalance && quotaStats.remainingAfterPendingDays < requestedDays) {
        return { 
          valid: false, 
          error: `Insufficient leave balance. Allocated: ${quotaStats.allocatedDays.toFixed(1)}, Used: ${quotaStats.usedDays.toFixed(1)}, Pending: ${quotaStats.pendingDays.toFixed(1)}, Remaining: ${quotaStats.remainingAfterPendingDays.toFixed(1)}, Requested: ${requestedDays}` 
        }
      }
    }

    // 7. Check consecutive days limit
    if (leaveType.maxConsecutiveDays) {
      const requestedDays = calculateLeaveDays(startDate, endDate)
      if (requestedDays > leaveType.maxConsecutiveDays) {
        return { 
          valid: false, 
          error: `Maximum consecutive days allowed: ${leaveType.maxConsecutiveDays}` 
        }
      }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error validating leave request:', error)
    return { valid: false, error: 'Validation error occurred' }
  }
}

/**
 * Calculate leave days (excluding weekends)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
export function calculateLeaveDays(startDate, endDate) {
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
 * Check for overlapping leave requests
 * @param {string} employeeId - Employee ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} excludeRequestId - Request ID to exclude from check
 * @returns {Promise<boolean>} True if overlap exists
 */
export async function hasOverlappingLeave(employeeId, startDate, endDate, excludeRequestId = null) {
  try {
    const where = {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } }
          ]
        }
      ]
    }

    if (excludeRequestId) {
      where.id = { not: excludeRequestId }
    }

    const overlap = await prisma.leaveRequest.findFirst({
      where
    })

    return !!overlap
  } catch (error) {
    console.error('Error checking overlap:', error)
    return false
  }
}

