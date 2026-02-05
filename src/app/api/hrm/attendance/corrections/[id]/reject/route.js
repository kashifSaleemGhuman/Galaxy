import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// PUT /api/hrm/attendance/corrections/[id]/reject - Reject correction request
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user has HR permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const hasAccess = currentUser.role === ROLES.SUPER_ADMIN || 
                     currentUser.role === ROLES.ADMIN || 
                     currentUser.role === ROLES.HR_MANAGER

    if (!hasAccess) {
      return new NextResponse('Forbidden: Only HR can reject corrections', { status: 403 })
    }

    const body = await req.json()
    const { reviewNotes } = body

    // Get correction request
    const correction = await prisma.attendanceCorrection.findUnique({
      where: { id: params.id }
    })

    if (!correction) {
      return new NextResponse('Correction request not found', { status: 404 })
    }

    if (correction.status !== 'PENDING') {
      return new NextResponse('Correction request is not pending', { status: 400 })
    }

    // Update correction status
    const updatedCorrection = await prisma.attendanceCorrection.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        reviewNotes
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

    return NextResponse.json({
      correction: updatedCorrection,
      message: 'Correction request rejected'
    })
  } catch (error) {
    console.error('[ATTENDANCE_CORRECTION_REJECT]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

