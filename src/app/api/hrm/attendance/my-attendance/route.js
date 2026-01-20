import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/attendance/my-attendance - Get employee's own attendance
export async function GET(req) {
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

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '30')

    // Build date range
    const today = new Date()
    const defaultEnd = new Date(today)
    const defaultStart = new Date(today)
    defaultStart.setDate(defaultStart.getDate() - limit)

    const queryStart = startDate ? new Date(startDate) : defaultStart
    const queryEnd = endDate ? new Date(endDate) : defaultEnd

    // Get daily attendance records
    const attendance = await prisma.dailyAttendance.findMany({
      where: {
        employeeId: currentUser.employee.id,
        date: {
          gte: queryStart,
          lte: queryEnd
        }
      },
      include: {
        shift: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Get today's events for real-time status
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayEvents = await prisma.attendanceEvent.findMany({
      where: {
        employeeId: currentUser.employee.id,
        timestamp: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    return NextResponse.json({
      attendance,
      todayEvents,
      summary: {
        totalDays: attendance.length,
        present: attendance.filter(a => a.status === 'PRESENT').length,
        late: attendance.filter(a => a.status === 'LATE').length,
        absent: attendance.filter(a => a.status === 'ABSENT').length,
        halfDay: attendance.filter(a => a.status === 'HALF_DAY').length
      }
    })
  } catch (error) {
    console.error('[MY_ATTENDANCE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

