/**
 * Attendance Alerts Service
 * 
 * Detects late/missed check-ins and sends notifications to employees and HR
 */

import { prisma } from '@/lib/db'
import { emailService } from '@/lib/email'
import { getShiftForDate } from './attendance-calculator'

/**
 * Check for late check-ins and send alerts
 * This should be called after a check-in event is recorded
 */
export async function checkAndSendLateCheckInAlert(employeeId, checkInTime) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
        shifts: {
          where: { isActive: true },
          include: { shift: true },
          orderBy: { effectiveFrom: 'desc' }
        }
      }
    })

    if (!employee || !employee.user) {
      return { success: false, error: 'Employee or user not found' }
    }

    // Get shift for the check-in date
    const shiftAssignment = getShiftForDate(employee.shifts, checkInTime)
    if (!shiftAssignment || !shiftAssignment.shift) {
      return { success: false, error: 'No active shift found' }
    }

    const shift = shiftAssignment.shift
    const checkInDate = new Date(checkInTime)
    checkInDate.setHours(0, 0, 0, 0)

    // Parse shift start time
    const [startHour, startMinute] = shift.startTime.split(':').map(Number)
    const shiftStart = new Date(checkInDate)
    shiftStart.setHours(startHour, startMinute, 0, 0)

    // Calculate grace period end
    const gracePeriodEnd = new Date(shiftStart)
    gracePeriodEnd.setMinutes(gracePeriodEnd.getMinutes() + (shift.gracePeriodMinutes || 15))

    // Check if check-in is late
    if (checkInTime > gracePeriodEnd) {
      const lateMinutes = Math.floor((checkInTime - gracePeriodEnd) / (1000 * 60))
      
      // Send notification to employee
      await sendLateCheckInNotificationToEmployee(employee, shift, lateMinutes, checkInTime)
      
      // Send notification to HR
      await sendLateCheckInNotificationToHR(employee, shift, lateMinutes, checkInTime)
      
      return { success: true, isLate: true, lateMinutes }
    }

    return { success: true, isLate: false }
  } catch (error) {
    console.error('Error checking late check-in:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check for missed check-ins at end of day
 * This should be called via a scheduled job (e.g., cron) at end of business day
 */
export async function checkAndSendMissedCheckInAlerts(date) {
  try {
    const checkDate = date ? new Date(date) : new Date()
    checkDate.setHours(0, 0, 0, 0)

    const endOfDay = new Date(checkDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all employees with active shifts
    const employees = await prisma.employee.findMany({
      where: {
        shifts: {
          some: {
            isActive: true,
            effectiveFrom: { lte: endOfDay },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: checkDate } }
            ]
          }
        }
      },
      include: {
        user: true,
        shifts: {
          where: { isActive: true },
          include: { shift: true },
          orderBy: { effectiveFrom: 'desc' }
        },
        dailyAttendance: {
          where: {
            date: {
              gte: checkDate,
              lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    const alerts = []

    for (const employee of employees) {
      if (!employee.user) continue

      // Get shift for the date
      const shiftAssignment = getShiftForDate(employee.shifts, checkDate)
      if (!shiftAssignment || !shiftAssignment.shift) continue

      // Check if employee has check-in for this date
      const hasCheckIn = employee.dailyAttendance.length > 0 && 
                         employee.dailyAttendance[0].checkInTime !== null

      // Check if employee has approved leave
      const hasLeave = await prisma.leaveRequest.findFirst({
        where: {
          employeeId: employee.id,
          startDate: { lte: checkDate },
          endDate: { gte: checkDate },
          status: 'APPROVED'
        }
      })

      // If no check-in and no leave, send missed check-in alert
      if (!hasCheckIn && !hasLeave) {
        const shift = shiftAssignment.shift
        
        // Send notification to employee
        await sendMissedCheckInNotificationToEmployee(employee, shift, checkDate)
        
        // Send notification to HR
        await sendMissedCheckInNotificationToHR(employee, shift, checkDate)
        
        alerts.push({
          employeeId: employee.id,
          employeeName: employee.name,
          date: checkDate
        })
      }
    }

    return { success: true, alertsCount: alerts.length, alerts }
  } catch (error) {
    console.error('Error checking missed check-ins:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send late check-in notification to employee
 */
async function sendLateCheckInNotificationToEmployee(employee, shift, lateMinutes, checkInTime) {
  if (!employee.user?.email) return

  const checkInDate = new Date(checkInTime)
  const subject = `Late Check-In Alert - ${checkInDate.toLocaleDateString()}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Late Check-In Alert</h2>
      <p>Dear ${employee.name},</p>
      <p>You checked in <strong>${lateMinutes} minutes late</strong> on ${checkInDate.toLocaleDateString()}.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Details:</strong></p>
        <ul>
          <li>Expected Check-In: ${shift.startTime}</li>
          <li>Actual Check-In: ${checkInTime.toLocaleTimeString()}</li>
          <li>Late by: ${lateMinutes} minutes</li>
        </ul>
      </div>
      <p>Please ensure you arrive on time for your scheduled shift.</p>
      <p>If you have any questions or concerns, please contact HR.</p>
    </div>
  `

  try {
    await emailService.sendEmail({
      to: employee.user.email,
      subject,
      html
    })
  } catch (error) {
    console.error('Error sending late check-in email to employee:', error)
  }
}

/**
 * Send late check-in notification to HR
 */
async function sendLateCheckInNotificationToHR(employee, shift, lateMinutes, checkInTime) {
  // Get all HR users
  const hrUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER']
      },
      isActive: true
    }
  })

  if (hrUsers.length === 0) return

  const checkInDate = new Date(checkInTime)
  const subject = `Late Check-In Alert - ${employee.name} - ${checkInDate.toLocaleDateString()}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Late Check-In Alert</h2>
      <p>Employee <strong>${employee.name}</strong> (${employee.employeeId}) checked in late.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Details:</strong></p>
        <ul>
          <li>Employee: ${employee.name} (${employee.employeeId})</li>
          <li>Department: ${employee.department || 'N/A'}</li>
          <li>Shift: ${shift.name} (${shift.startTime} - ${shift.endTime})</li>
          <li>Expected Check-In: ${shift.startTime}</li>
          <li>Actual Check-In: ${checkInTime.toLocaleTimeString()}</li>
          <li>Late by: ${lateMinutes} minutes</li>
          <li>Date: ${checkInDate.toLocaleDateString()}</li>
        </ul>
      </div>
    </div>
  `

  // Send to all HR users
  for (const hrUser of hrUsers) {
    if (!hrUser.email) continue
    
    try {
      await emailService.sendEmail({
        to: hrUser.email,
        subject,
        html
      })
    } catch (error) {
      console.error(`Error sending late check-in email to HR user ${hrUser.email}:`, error)
    }
  }
}

/**
 * Send missed check-in notification to employee
 */
async function sendMissedCheckInNotificationToEmployee(employee, shift, date) {
  if (!employee.user?.email) return

  const subject = `Missed Check-In Alert - ${date.toLocaleDateString()}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Missed Check-In Alert</h2>
      <p>Dear ${employee.name},</p>
      <p>You did not check in on <strong>${date.toLocaleDateString()}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Details:</strong></p>
        <ul>
          <li>Date: ${date.toLocaleDateString()}</li>
          <li>Expected Shift: ${shift.name} (${shift.startTime} - ${shift.endTime})</li>
        </ul>
      </div>
      <p>If you were absent or on leave, please ensure your leave request is properly submitted and approved.</p>
      <p>If you have any questions or concerns, please contact HR immediately.</p>
    </div>
  `

  try {
    await emailService.sendEmail({
      to: employee.user.email,
      subject,
      html
    })
  } catch (error) {
    console.error('Error sending missed check-in email to employee:', error)
  }
}

/**
 * Send missed check-in notification to HR
 */
async function sendMissedCheckInNotificationToHR(employee, shift, date) {
  // Get all HR users
  const hrUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER']
      },
      isActive: true
    }
  })

  if (hrUsers.length === 0) return

  const subject = `Missed Check-In Alert - ${employee.name} - ${date.toLocaleDateString()}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Missed Check-In Alert</h2>
      <p>Employee <strong>${employee.name}</strong> (${employee.employeeId}) did not check in.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Details:</strong></p>
        <ul>
          <li>Employee: ${employee.name} (${employee.employeeId})</li>
          <li>Department: ${employee.department || 'N/A'}</li>
          <li>Shift: ${shift.name} (${shift.startTime} - ${shift.endTime})</li>
          <li>Date: ${date.toLocaleDateString()}</li>
        </ul>
      </div>
      <p>Please verify if the employee was on approved leave or if this is an unexcused absence.</p>
    </div>
  `

  // Send to all HR users
  for (const hrUser of hrUsers) {
    if (!hrUser.email) continue
    
    try {
      await emailService.sendEmail({
        to: hrUser.email,
        subject,
        html
      })
    } catch (error) {
      console.error(`Error sending missed check-in email to HR user ${hrUser.email}:`, error)
    }
  }
}

