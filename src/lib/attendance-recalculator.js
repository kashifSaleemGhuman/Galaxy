/**
 * Attendance Recalculator
 * 
 * Recalculates daily attendance from raw events
 * This ensures data consistency and idempotency
 */

const { prisma } = require('@/lib/db')
const { calculateDailyAttendance, getShiftForDate } = require('@/lib/attendance-calculator')

/**
 * Recalculate daily attendance for an employee on a specific date
 * @param {string} employeeId - Employee ID
 * @param {Date} date - Date to recalculate
 */
export async function recalculateDailyAttendance(employeeId, date) {
  try {
    // Normalize date to start of day
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    // Get employee with shift assignments
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        shifts: {
          include: { shift: true },
          orderBy: { effectiveFrom: 'desc' }
        }
      }
    })

    if (!employee) {
      throw new Error('Employee not found')
    }

    // Get shift for the date
    const shiftAssignment = getShiftForDate(employee.shifts, dateOnly)
    const shift = shiftAssignment?.shift || null

    // Get attendance events for the date
    const startOfDay = new Date(dateOnly)
    const endOfDay = new Date(dateOnly)
    endOfDay.setHours(23, 59, 59, 999)

    const events = await prisma.attendanceEvent.findMany({
      where: {
        employeeId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    const checkInEvent = events.find(e => e.eventType === 'CHECK_IN')
    const checkOutEvent = events.find(e => e.eventType === 'CHECK_OUT')

    // Check for approved leave (you'll need to implement leave system separately)
    // For now, assume no leave
    const hasApprovedLeave = false // TODO: Integrate with leave management

    // Calculate daily attendance
    const calculated = calculateDailyAttendance({
      shift,
      checkInEvent,
      checkOutEvent,
      date: dateOnly,
      hasApprovedLeave
    })

    // Check if daily attendance already exists
    const existing = await prisma.dailyAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: dateOnly
        }
      }
    })

    // Don't update if locked
    if (existing?.isLocked) {
      console.log(`Daily attendance for ${employeeId} on ${dateOnly.toISOString()} is locked, skipping recalculation`)
      return existing
    }

    // Upsert daily attendance
    const dailyAttendance = await prisma.dailyAttendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: dateOnly
        }
      },
      create: {
        employeeId,
        date: dateOnly,
        shiftId: shift?.id || null,
        checkInTime: calculated.checkInTime,
        checkOutTime: calculated.checkOutTime,
        workedMinutes: calculated.workedMinutes,
        lateMinutes: calculated.lateMinutes,
        earlyDepartureMinutes: calculated.earlyDepartureMinutes,
        overtimeMinutes: calculated.overtimeMinutes,
        breakMinutes: calculated.breakMinutes,
        status: calculated.status,
        lastCalculatedAt: new Date()
      },
      update: {
        shiftId: shift?.id || null,
        checkInTime: calculated.checkInTime,
        checkOutTime: calculated.checkOutTime,
        workedMinutes: calculated.workedMinutes,
        lateMinutes: calculated.lateMinutes,
        earlyDepartureMinutes: calculated.earlyDepartureMinutes,
        overtimeMinutes: calculated.overtimeMinutes,
        breakMinutes: calculated.breakMinutes,
        status: calculated.status,
        lastCalculatedAt: new Date()
      }
    })

    return dailyAttendance
  } catch (error) {
    console.error('Error recalculating daily attendance:', error)
    throw error
  }
}

/**
 * Recalculate daily attendance for a date range
 * @param {string} employeeId - Employee ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export async function recalculateDateRange(employeeId, startDate, endDate) {
  const results = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    try {
      const result = await recalculateDailyAttendance(employeeId, current)
      results.push(result)
    } catch (error) {
      console.error(`Error recalculating for ${current.toISOString()}:`, error)
    }
    current.setDate(current.getDate() + 1)
  }
  
  return results
}

