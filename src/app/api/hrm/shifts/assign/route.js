import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// POST /api/hrm/shifts/assign - Assign shift to employee
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
      return new NextResponse('Forbidden: Only HR can assign shifts', { status: 403 })
    }

    const body = await req.json()
    const { employeeId, shiftId, effectiveFrom, effectiveTo } = body

    if (!employeeId || !shiftId) {
      return new NextResponse('Missing required fields: employeeId, shiftId', { status: 400 })
    }

    // Deactivate previous active shift assignments
    await prisma.employeeShift.updateMany({
      where: {
        employeeId,
        isActive: true
      },
      data: {
        isActive: false,
        effectiveTo: effectiveFrom ? new Date(effectiveFrom) : new Date()
      }
    })

    // Create new shift assignment
    const assignment = await prisma.employeeShift.create({
      data: {
        employeeId,
        shiftId,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive: true
      },
      include: {
        shift: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('[SHIFT_ASSIGN]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

