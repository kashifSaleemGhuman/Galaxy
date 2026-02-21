import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

/**
 * GET /api/hrm/leave/types/[id]
 * Get a single leave type
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const leaveType = await prisma.leaveType.findUnique({
      where: { id },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1
        }
      }
    })

    if (!leaveType) {
      return NextResponse.json(
        { error: 'Leave type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(leaveType)
  } catch (error) {
    console.error('Error fetching leave type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave type' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hrm/leave/types/[id]
 * Update a leave type (HR only)
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
    const {
      name,
      code,
      description,
      isPaid,
      isActive,
      requiresApproval,
      maxConsecutiveDays,
      requiresMedicalCertificate
    } = body

    // Check if leave type exists
    const existing = await prisma.leaveType.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Leave type not found' },
        { status: 404 }
      )
    }

    // Resolve tenantId from session or default tenant (needed for @@unique([tenantId, code]))
    let tenantId = session.user.tenantId
    if (!tenantId) {
      let defaultTenant = await prisma.tenant.findFirst({
        where: { domain: 'default' }
      })
      if (!defaultTenant) {
        // Create a default tenant if none exists (safe fallback for single-tenant setups)
        defaultTenant = await prisma.tenant.create({
          data: {
            name: 'Default Tenant',
            domain: 'default',
            settings: {}
          }
        })
      }
      tenantId = defaultTenant.id
    }

    // If code is being changed, check for duplicates
    if (code && code !== existing.code) {
      const duplicate = await prisma.leaveType.findUnique({
        where: {
          tenantId_code: {
            tenantId,
            code: code.toUpperCase()
          }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Leave type code already exists' },
          { status: 400 }
        )
      }
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (code !== undefined) updateData.code = code.toUpperCase()
    if (description !== undefined) updateData.description = description
    if (isPaid !== undefined) updateData.isPaid = isPaid
    if (isActive !== undefined) updateData.isActive = isActive
    if (requiresApproval !== undefined) updateData.requiresApproval = requiresApproval
    if (maxConsecutiveDays !== undefined) updateData.maxConsecutiveDays = maxConsecutiveDays
    if (requiresMedicalCertificate !== undefined) updateData.requiresMedicalCertificate = requiresMedicalCertificate

    const leaveType = await prisma.leaveType.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(leaveType)
  } catch (error) {
    console.error('Error updating leave type:', error)
    return NextResponse.json(
      { error: 'Failed to update leave type' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hrm/leave/types/[id]
 * Deactivate a leave type (HR only)
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

    // Check if leave type has active requests
    const activeRequests = await prisma.leaveRequest.count({
      where: {
        leaveTypeId: id,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    })

    if (activeRequests > 0) {
      return NextResponse.json(
        { error: 'Cannot delete leave type with active requests' },
        { status: 400 }
      )
    }

    // Deactivate instead of deleting
    const leaveType = await prisma.leaveType.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json(leaveType)
  } catch (error) {
    console.error('Error deleting leave type:', error)
    return NextResponse.json(
      { error: 'Failed to delete leave type' },
      { status: 500 }
    )
  }
}

