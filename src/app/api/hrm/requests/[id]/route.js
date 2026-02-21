import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

// GET /api/hrm/requests/[id] - Get request details
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const requestId = resolvedParams.id

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const request = await prisma.employeeRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!request) {
      return new NextResponse('Request not found', { status: 404 })
    }

    // Check access: HR can see all, employees can only see their own
    const isHr = hasHrAccess(currentUser.role)
    if (!isHr && currentUser.employee && request.employeeId !== currentUser.employee.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    return NextResponse.json({ success: true, request })
  } catch (error) {
    console.error('[REQUEST_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// PUT /api/hrm/requests/[id]/status - Update request status (HR only)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const requestId = resolvedParams.id

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (!hasHrAccess(currentUser.role)) {
      return new NextResponse('Forbidden: HR access required', { status: 403 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    const request = await prisma.employeeRequest.findUnique({
      where: { id: requestId }
    })

    if (!request) {
      return new NextResponse('Request not found', { status: 404 })
    }

    const updateData = { status }
    
    if (status === 'RESOLVED' && !request.resolvedAt) {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = currentUser.id
    } else if (status === 'CLOSED' && !request.closedAt) {
      updateData.closedAt = new Date()
      updateData.closedBy = currentUser.id
    }

    const updatedRequest = await prisma.employeeRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true
          }
        },
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: 'Request status updated successfully'
    })
  } catch (error) {
    console.error('[REQUEST_UPDATE_STATUS]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

