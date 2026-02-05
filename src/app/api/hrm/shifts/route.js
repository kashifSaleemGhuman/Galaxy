import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/shifts - List all shifts
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user has HR permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const hasAccess = currentUser.role === ROLES.SUPER_ADMIN || 
                     currentUser.role === ROLES.ADMIN || 
                     currentUser.role === ROLES.HR_MANAGER

    if (!hasAccess) {
      return new NextResponse('Forbidden: Only HR can view shifts', { status: 403 })
    }

    const shifts = await prisma.shift.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('[SHIFTS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/hrm/shifts - Create a new shift
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user has HR permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const hasAccess = currentUser.role === ROLES.SUPER_ADMIN || 
                     currentUser.role === ROLES.ADMIN || 
                     currentUser.role === ROLES.HR_MANAGER

    if (!hasAccess) {
      return new NextResponse('Forbidden: Only HR can create shifts', { status: 403 })
    }

    const body = await req.json()
    const { name, startTime, endTime, gracePeriodMinutes, breakDurationMinutes, halfDayThresholdHours } = body

    if (!name || !startTime || !endTime) {
      return new NextResponse('Missing required fields: name, startTime, endTime', { status: 400 })
    }

    const shift = await prisma.shift.create({
      data: {
        name,
        startTime,
        endTime,
        gracePeriodMinutes: gracePeriodMinutes || 15,
        breakDurationMinutes: breakDurationMinutes || 60,
        halfDayThresholdHours: halfDayThresholdHours || 4.0
      }
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('[SHIFTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

