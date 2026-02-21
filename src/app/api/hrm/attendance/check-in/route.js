import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { validateAttendanceEvent } from '@/lib/attendance-calculator'
import { recalculateDailyAttendance } from '@/lib/attendance-recalculator'
import { checkAndSendLateCheckInAlert } from '@/lib/attendance-alerts'

// POST /api/hrm/attendance/check-in - Employee check-in
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get current user and their employee record
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        employee: {
          include: {
            shifts: {
              where: { isActive: true },
              include: { shift: true },
              orderBy: { effectiveFrom: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!currentUser || !currentUser.employee) {
      return new NextResponse('Employee record not found', { status: 404 })
    }

    const employee = currentUser.employee
    const body = await req.json()
    const { timestamp, location, deviceId, notes } = body

    // Use provided timestamp or current time
    const eventTimestamp = timestamp ? new Date(timestamp) : new Date()

    const activeShiftAssignment = employee.shifts?.find((assignment) => {
      const effectiveFrom = assignment.effectiveFrom ? new Date(assignment.effectiveFrom) : null
      const effectiveTo = assignment.effectiveTo ? new Date(assignment.effectiveTo) : null
      const startsBefore = !effectiveFrom || effectiveFrom <= eventTimestamp
      const endsAfter = !effectiveTo || effectiveTo >= eventTimestamp
      return startsBefore && endsAfter
    })

    if (!activeShiftAssignment) {
      return NextResponse.json(
        { message: 'Shift is not assigned. Please contact HR before clock-in.' },
        { status: 400 }
      )
    }

    // Get existing events for today
    const todayStart = new Date(eventTimestamp)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(eventTimestamp)
    todayEnd.setHours(23, 59, 59, 999)

    const existingEvents = await prisma.attendanceEvent.findMany({
      where: {
        employeeId: employee.id,
        timestamp: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    })

    // Validate event
    const validation = validateAttendanceEvent({
      eventType: 'CHECK_IN',
      timestamp: eventTimestamp,
      existingEvents
    })

    if (!validation.valid) {
      return new NextResponse(validation.error, { status: 400 })
    }

    // Get client IP
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    // Create attendance event
    const event = await prisma.attendanceEvent.create({
      data: {
        employeeId: employee.id,
        eventType: 'CHECK_IN',
        timestamp: eventTimestamp,
        source: 'AUTOMATIC',
        location,
        deviceId,
        ipAddress,
        notes,
        createdBy: currentUser.id
      }
    })

    // Recalculate daily attendance
    await recalculateDailyAttendance(employee.id, eventTimestamp)

    // Check for late check-in and send alerts (non-blocking)
    checkAndSendLateCheckInAlert(employee.id, eventTimestamp).catch(err => {
      console.error('Error sending late check-in alert:', err)
    })

    return NextResponse.json({
      success: true,
      event,
      message: 'Check-in recorded successfully'
    })
  } catch (error) {
    console.error('[ATTENDANCE_CHECK_IN]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

