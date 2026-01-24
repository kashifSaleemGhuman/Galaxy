import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

/**
 * GET /api/hrm/leave/types
 * List all leave types (filtered by tenant)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where = {}
    
    // Get tenantId from session, or use default tenant
    let tenantId = session.user.tenantId
    if (!tenantId) {
      // Find default tenant if user doesn't have one
      const defaultTenant = await prisma.tenant.findFirst({
        where: { domain: 'default' }
      })
      if (defaultTenant) {
        tenantId = defaultTenant.id
      }
    }
    
    // Only filter by tenantId if we have one
    if (tenantId) {
      where.tenantId = tenantId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const leaveTypes = await prisma.leaveType.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    })

    // Always return array, even if empty
    return NextResponse.json(leaveTypes || [])
  } catch (error) {
    console.error('Error fetching leave types:', error)
    // Return empty array on error to prevent UI issues
    return NextResponse.json([])
  }
}

/**
 * POST /api/hrm/leave/types
 * Create a new leave type (HR only)
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
      name,
      code,
      description,
      isPaid = true,
      requiresApproval = true,
      maxConsecutiveDays,
      requiresMedicalCertificate = false
    } = body

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Check if code already exists for this tenant
    const existing = await prisma.leaveType.findUnique({
      where: {
        tenantId_code: {
          tenantId: session.user.tenantId || '',
          code
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Leave type code already exists' },
        { status: 400 }
      )
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        tenantId: session.user.tenantId || '',
        name,
        code: code.toUpperCase(),
        description,
        isPaid,
        isActive: true,
        requiresApproval,
        maxConsecutiveDays,
        requiresMedicalCertificate
      }
    })

    return NextResponse.json(leaveType, { status: 201 })
  } catch (error) {
    console.error('Error creating leave type:', error)
    return NextResponse.json(
      { error: 'Failed to create leave type' },
      { status: 500 }
    )
  }
}

