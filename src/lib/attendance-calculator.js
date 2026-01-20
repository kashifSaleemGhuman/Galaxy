/**
 * Attendance Calculator
 * 
 * Calculates daily attendance from raw attendance events
 * This is a pure function that produces idempotent results
 */

/**
 * Calculate daily attendance from events
 * @param {Object} params - Calculation parameters
 * @param {Object} params.shift - Shift object with timing
 * @param {Object} params.checkInEvent - Check-in event (or null)
 * @param {Object} params.checkOutEvent - Check-out event (or null)
 * @param {Date} params.date - Attendance date
 * @param {boolean} params.hasApprovedLeave - Whether employee has approved leave
 * @returns {Object} Calculated daily attendance
 */
export function calculateDailyAttendance({
  shift,
  checkInEvent,
  checkOutEvent,
  date,
  hasApprovedLeave = false
}) {
  // Initialize result
  const result = {
    checkInTime: null,
    checkOutTime: null,
    workedMinutes: 0,
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    overtimeMinutes: 0,
    breakMinutes: shift?.breakDurationMinutes || 0,
    status: 'ABSENT'
  }

  // If no check-in and no leave, mark as absent
  if (!checkInEvent && !hasApprovedLeave) {
    return {
      ...result,
      status: 'ABSENT'
    }
  }

  // If has approved leave but no check-in, mark as leave
  if (!checkInEvent && hasApprovedLeave) {
    return {
      ...result,
      status: 'LEAVE'
    }
  }

  // Extract times
  const checkInTime = checkInEvent ? new Date(checkInEvent.timestamp) : null
  const checkOutTime = checkOutEvent ? new Date(checkOutEvent.timestamp) : null

  result.checkInTime = checkInTime
  result.checkOutTime = checkOutTime

  // If no shift assigned, can't calculate times
  if (!shift) {
    return {
      ...result,
      status: checkInTime ? 'PRESENT' : 'ABSENT'
    }
  }

  // Parse shift times
  const [startHour, startMinute] = shift.startTime.split(':').map(Number)
  const [endHour, endMinute] = shift.endTime.split(':').map(Number)

  // Create shift start/end times for the date
  const shiftStart = new Date(date)
  shiftStart.setHours(startHour, startMinute, 0, 0)

  const shiftEnd = new Date(date)
  shiftEnd.setHours(endHour, endMinute, 0, 0)

  // Handle late-night shifts (end time next day)
  if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
    shiftEnd.setDate(shiftEnd.getDate() + 1)
  }

  // Calculate grace period end
  const gracePeriodEnd = new Date(shiftStart)
  gracePeriodEnd.setMinutes(gracePeriodEnd.getMinutes() + (shift.gracePeriodMinutes || 15))

  // Calculate late minutes
  if (checkInTime && checkInTime > gracePeriodEnd) {
    result.lateMinutes = Math.floor((checkInTime - gracePeriodEnd) / (1000 * 60))
  }

  // Calculate worked minutes
  if (checkInTime && checkOutTime) {
    const totalMinutes = Math.floor((checkOutTime - checkInTime) / (1000 * 60))
    result.workedMinutes = Math.max(0, totalMinutes - result.breakMinutes)
  } else if (checkInTime && !checkOutTime) {
    // Missing check-out - use shift end as default
    const defaultCheckOut = new Date(shiftEnd)
    const totalMinutes = Math.floor((defaultCheckOut - checkInTime) / (1000 * 60))
    result.workedMinutes = Math.max(0, totalMinutes - result.breakMinutes)
    result.checkOutTime = defaultCheckOut // Use default for calculation
  }

  // Calculate early departure
  const expectedEnd = new Date(shiftEnd)
  expectedEnd.setMinutes(expectedEnd.getMinutes() - result.breakMinutes)

  if (checkOutTime && checkOutTime < expectedEnd) {
    result.earlyDepartureMinutes = Math.floor((expectedEnd - checkOutTime) / (1000 * 60))
  }

  // Calculate overtime
  const shiftDurationMinutes = Math.floor((shiftEnd - shiftStart) / (1000 * 60)) - result.breakMinutes
  if (result.workedMinutes > shiftDurationMinutes) {
    result.overtimeMinutes = result.workedMinutes - shiftDurationMinutes
  }

  // Determine status
  const workedHours = result.workedMinutes / 60
  const halfDayThreshold = shift.halfDayThresholdHours || 4.0

  if (result.lateMinutes > 0 && workedHours >= halfDayThreshold) {
    result.status = 'LATE'
  } else if (workedHours >= halfDayThreshold) {
    result.status = 'PRESENT'
  } else if (workedHours > 0 && workedHours < halfDayThreshold) {
    result.status = 'HALF_DAY'
  } else if (checkInTime) {
    result.status = 'PRESENT' // At least checked in
  } else {
    result.status = 'ABSENT'
  }

  return result
}

/**
 * Get employee's shift for a specific date
 * @param {Object} employeeShifts - Array of employee shift assignments
 * @param {Date} date - Date to check
 * @returns {Object|null} Shift assignment or null
 */
export function getShiftForDate(employeeShifts, date) {
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  // Find active shift assignment for the date
  const activeShift = employeeShifts.find(es => {
    const from = new Date(es.effectiveFrom)
    from.setHours(0, 0, 0, 0)
    
    const to = es.effectiveTo ? new Date(es.effectiveTo) : null
    if (to) {
      to.setHours(0, 0, 0, 0)
    }

    return es.isActive && 
           dateOnly >= from && 
           (!to || dateOnly <= to)
  })

  return activeShift || null
}

/**
 * Validate check-in/out event
 * @param {Object} params - Validation parameters
 * @param {string} params.eventType - CHECK_IN or CHECK_OUT
 * @param {Date} params.timestamp - Event timestamp
 * @param {Array} params.existingEvents - Existing events for the day
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateAttendanceEvent({ eventType, timestamp, existingEvents }) {
  const now = new Date()
  const eventDate = new Date(timestamp)
  eventDate.setHours(0, 0, 0, 0)

  // Cannot be in the future
  if (timestamp > now) {
    return { valid: false, error: 'Cannot record attendance in the future' }
  }

  // Cannot be too far in the past (more than 24 hours)
  const hoursAgo = (now - timestamp) / (1000 * 60 * 60)
  if (hoursAgo > 24) {
    return { valid: false, error: 'Cannot record attendance more than 24 hours in the past' }
  }

  // Check for duplicate event type today
  const todayEvents = existingEvents.filter(e => {
    const eDate = new Date(e.timestamp)
    eDate.setHours(0, 0, 0, 0)
    return eDate.getTime() === eventDate.getTime() && e.eventType === eventType
  })

  if (todayEvents.length > 0) {
    return { valid: false, error: `Already have a ${eventType} for this date` }
  }

  // Check-in must be before check-out
  if (eventType === 'CHECK_OUT') {
    const checkIn = existingEvents.find(e => {
      const eDate = new Date(e.timestamp)
      eDate.setHours(0, 0, 0, 0)
      return eDate.getTime() === eventDate.getTime() && e.eventType === 'CHECK_IN'
    })

    if (!checkIn) {
      return { valid: false, error: 'Cannot check out without checking in first' }
    }

    if (timestamp < new Date(checkIn.timestamp)) {
      return { valid: false, error: 'Check-out time must be after check-in time' }
    }
  }

  return { valid: true }
}

