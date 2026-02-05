import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

/**
 * GET /api/hrm/leave/policies
 * List all leave policies (filtered by tenant)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leaveTypeId = searchParams.get('leaveTypeId')
    const isActive = searchParams.get('isActive')

    const where = {
      tenantId: session.user.tenantId || undefined
    }

    if (leaveTypeId) {
      where.leaveTypeId = leaveTypeId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const policies = await prisma.leavePolicy.findMany({
      where,
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { leaveType: { name: 'asc' } },
        { effectiveFrom: 'desc' }
      ]
    })

    // Always return array, even if empty
    return NextResponse.json(policies || [])
  } catch (error) {
    console.error('Error fetching leave policies:', error)
    // Return empty array on error to prevent UI issues
    return NextResponse.json([])
  }
}

/**
 * POST /api/hrm/leave/policies
 * Create a new leave policy (HR only)
 */
export async function POST(request) {
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

    const body = await request.json()
    const {
      leaveTypeId,
      name,
      accrualType,
      accrualAmount,
      accrualFrequency,
      maxBalance,
      allowNegativeBalance = false,
      carryForwardEnabled = false,
      carryForwardLimit,
      carryForwardExpiryMonths,
      encashmentEnabled = false,
      encashmentLimit,
      effectiveFrom
    } = body

    // Validate required fields
    if (!leaveTypeId || !name || !accrualType || accrualAmount === undefined || !effectiveFrom) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate leave type exists
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId }
    })

    if (!leaveType) {
      return NextResponse.json(
        { error: 'Leave type not found' },
        { status: 404 }
      )
    }

    // Get tenantId from leaveType or user session, or use default tenant
    let tenantId = session.user.tenantId || leaveType.tenantId
    if (!tenantId) {
      // Find default tenant if user doesn't have one
      const defaultTenant = await prisma.tenant.findFirst({
        where: { domain: 'default' }
      })
      if (defaultTenant) {
        tenantId = defaultTenant.id
      } else {
        return NextResponse.json(
          { error: 'No tenant found. Please contact administrator.' },
          { status: 400 }
        )
      }
    }

    // Deactivate previous active policy for this leave type
    await prisma.leavePolicy.updateMany({
      where: {
        leaveTypeId,
        tenantId: tenantId,
        isActive: true
      },
      data: {
        isActive: false,
        effectiveTo: new Date(effectiveFrom)
      }
    })

    // Create new policy
    const policy = await prisma.leavePolicy.create({
      data: {
        tenantId: tenantId,
        leaveTypeId,
        name,
        accrualType: accrualType.toUpperCase(),
        accrualAmount: parseFloat(accrualAmount),
        accrualFrequency: accrualFrequency ? parseInt(accrualFrequency) : null,
        maxBalance: maxBalance ? parseFloat(maxBalance) : null,
        allowNegativeBalance,
        carryForwardEnabled,
        carryForwardLimit: carryForwardLimit ? parseFloat(carryForwardLimit) : null,
        carryForwardExpiryMonths: carryForwardExpiryMonths ? parseInt(carryForwardExpiryMonths) : null,
        encashmentEnabled,
        encashmentLimit: encashmentLimit ? parseFloat(encashmentLimit) : null,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: null,
        isActive: true,
        createdBy: session.user.id
      },
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

    return NextResponse.json(policy, { status: 201 })
  } catch (error) {
    console.error('Error creating leave policy:', error)
    return NextResponse.json(
      { error: 'Failed to create leave policy' },
      { status: 500 }
    )
  }
}

