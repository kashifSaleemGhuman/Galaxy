import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// POST /api/hrm/payroll/bonuses/:id/approve - Approve bonus
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const hasAccess = currentUser.role === ROLES.SUPER_ADMIN || 
                     currentUser.role === ROLES.ADMIN || 
                     currentUser.role === ROLES.HR_MANAGER

    if (!hasAccess) {
      return new NextResponse('Forbidden: Insufficient permissions', { status: 403 })
    }

    const bonus = await prisma.bonus.findUnique({
      where: { id: params.id }
    })

    if (!bonus) {
      return new NextResponse('Bonus not found', { status: 404 })
    }

    if (bonus.status !== 'PENDING') {
      return new NextResponse('Bonus is not pending approval', { status: 400 })
    }

    const updatedBonus = await prisma.bonus.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedBy: currentUser.id,
        approvedAt: new Date()
      }
    })

    return NextResponse.json(updatedBonus)
  } catch (error) {
    console.error('[BONUS_APPROVE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

