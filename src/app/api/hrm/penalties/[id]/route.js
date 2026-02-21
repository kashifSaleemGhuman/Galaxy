import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

// GET /api/hrm/penalties/[id] - Get penalty details
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const penaltyId = resolvedParams.id

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const penalty = await prisma.penalty.findUnique({
      where: { id: penaltyId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true
          }
        }
      }
    })

    if (!penalty) {
      return new NextResponse('Penalty not found', { status: 404 })
    }

    // Check access: HR can see all, employees can only see their own
    const isHr = hasHrAccess(currentUser.role)
    if (!isHr && currentUser.employee && penalty.employeeId !== currentUser.employee.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    return NextResponse.json({ success: true, penalty })
  } catch (error) {
    console.error('[PENALTY_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// PUT /api/hrm/penalties/[id] - Cancel penalty (HR only)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const penaltyId = resolvedParams.id

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (!hasHrAccess(currentUser.role)) {
      return new NextResponse('Forbidden: HR access required', { status: 403 })
    }

    const penalty = await prisma.penalty.findUnique({
      where: { id: penaltyId }
    })

    if (!penalty) {
      return new NextResponse('Penalty not found', { status: 404 })
    }

    if (penalty.status === 'CANCELLED') {
      return new NextResponse('Penalty already cancelled', { status: 400 })
    }

    const updatedPenalty = await prisma.penalty.update({
      where: { id: penaltyId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: currentUser.id
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      penalty: updatedPenalty,
      message: 'Penalty cancelled successfully'
    })
  } catch (error) {
    console.error('[PENALTY_CANCEL]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

