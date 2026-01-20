import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

/**
 * GET /api/hrm/leave/policies/[id]
 * Get a single leave policy
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const policy = await prisma.leavePolicy.findUnique({
      where: { id },
      include: {
        leaveType: true,
        assignments: {
          where: { isActive: true },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                employeeId: true
              }
            }
          }
        }
      }
    })

    if (!policy) {
      return NextResponse.json(
        { error: 'Leave policy not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error fetching leave policy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave policy' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hrm/leave/policies/[id]
 * Update a leave policy (HR only)
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    if (!isHR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()

    // Check if policy exists
    const existing = await prisma.leavePolicy.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Leave policy not found' },
        { status: 404 }
      )
    }

    // Update policy
    const updateData = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.accrualType !== undefined) updateData.accrualType = body.accrualType.toUpperCase()
    if (body.accrualAmount !== undefined) updateData.accrualAmount = parseFloat(body.accrualAmount)
    if (body.accrualFrequency !== undefined) updateData.accrualFrequency = body.accrualFrequency ? parseInt(body.accrualFrequency) : null
    if (body.maxBalance !== undefined) updateData.maxBalance = body.maxBalance ? parseFloat(body.maxBalance) : null
    if (body.allowNegativeBalance !== undefined) updateData.allowNegativeBalance = body.allowNegativeBalance
    if (body.carryForwardEnabled !== undefined) updateData.carryForwardEnabled = body.carryForwardEnabled
    if (body.carryForwardLimit !== undefined) updateData.carryForwardLimit = body.carryForwardLimit ? parseFloat(body.carryForwardLimit) : null
    if (body.carryForwardExpiryMonths !== undefined) updateData.carryForwardExpiryMonths = body.carryForwardExpiryMonths ? parseInt(body.carryForwardExpiryMonths) : null
    if (body.encashmentEnabled !== undefined) updateData.encashmentEnabled = body.encashmentEnabled
    if (body.encashmentLimit !== undefined) updateData.encashmentLimit = body.encashmentLimit ? parseFloat(body.encashmentLimit) : null
    if (body.effectiveFrom !== undefined) updateData.effectiveFrom = new Date(body.effectiveFrom)
    if (body.effectiveTo !== undefined) updateData.effectiveTo = body.effectiveTo ? new Date(body.effectiveTo) : null
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const policy = await prisma.leavePolicy.update({
      where: { id },
      data: updateData,
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error updating leave policy:', error)
    return NextResponse.json(
      { error: 'Failed to update leave policy' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hrm/leave/policies/[id]
 * Deactivate a leave policy (HR only)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    if (!isHR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params

    // Deactivate policy
    const policy = await prisma.leavePolicy.update({
      where: { id },
      data: {
        isActive: false,
        effectiveTo: new Date()
      }
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error deleting leave policy:', error)
    return NextResponse.json(
      { error: 'Failed to delete leave policy' },
      { status: 500 }
    )
  }
}

