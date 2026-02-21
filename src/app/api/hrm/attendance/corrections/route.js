import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { recalculateDailyAttendance } from '@/lib/attendance-recalculator'

// GET /api/hrm/attendance/corrections - Get correction requests
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        role: true, 
        employee: { 
          select: { id: true } 
        } 
      }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where = {}

    // If employee, only show their own corrections
    if (currentUser.role === ROLES.USER && currentUser.employee) {
      where.employeeId = currentUser.employee.id
    }

    if (status) {
      where.status = status
    }

    const corrections = await prisma.attendanceCorrection.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return NextResponse.json(corrections)
  } catch (error) {
    console.error('[ATTENDANCE_CORRECTIONS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/hrm/attendance/corrections - Request attendance correction
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
        employee: true
      }
    })

    if (!currentUser || !currentUser.employee) {
      return new NextResponse('Employee record not found', { status: 404 })
    }

    const body = await req.json()
    const { date, requestedCheckInTime, requestedCheckOutTime, reason } = body

    if (!date || !reason) {
      return new NextResponse('Missing required fields: date, reason', { status: 400 })
    }

    const correctionDate = new Date(date)
    correctionDate.setHours(0, 0, 0, 0)

    // Check if date is locked
    const lockedAttendance = await prisma.dailyAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: currentUser.employee.id,
          date: correctionDate
        }
      }
    })

    if (lockedAttendance?.isLocked) {
      return new NextResponse('Cannot request correction for locked attendance', { status: 400 })
    }

    // Check if correction already exists for this date
    const existing = await prisma.attendanceCorrection.findFirst({
      where: {
        employeeId: currentUser.employee.id,
        date: correctionDate,
        status: 'PENDING'
      }
    })

    if (existing) {
      return new NextResponse('Correction request already pending for this date', { status: 400 })
    }

    // Create correction request
    const correction = await prisma.attendanceCorrection.create({
      data: {
        employeeId: currentUser.employee.id,
        date: correctionDate,
        requestedCheckInTime: requestedCheckInTime ? new Date(requestedCheckInTime) : null,
        requestedCheckOutTime: requestedCheckOutTime ? new Date(requestedCheckOutTime) : null,
        reason,
        requestedBy: currentUser.id,
        status: 'PENDING'
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(correction)
  } catch (error) {
    console.error('[ATTENDANCE_CORRECTIONS_POST]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

