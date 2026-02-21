import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

// GET /api/hrm/requests - List requests
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const isHr = hasHrAccess(currentUser.role)

    // Build where clause
    const where = {}
    
    // If not HR, only show own requests
    if (!isHr && currentUser.employee) {
      where.employeeId = currentUser.employee.id
    } else if (employeeId) {
      where.employeeId = employeeId
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const requests = await prisma.employeeRequest.findMany({
      where,
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
          orderBy: { createdAt: 'asc' },
          include: {
            request: false
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, requests })
  } catch (error) {
    console.error('[REQUESTS_LIST]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// POST /api/hrm/requests - Create request
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })

    if (!currentUser || !currentUser.employee) {
      return new NextResponse('Employee record not found', { status: 404 })
    }

    const body = await req.json()
    const { subject, message, priority } = body

    if (!subject || !message) {
      return new NextResponse('Missing required fields: subject, message', { status: 400 })
    }

    const request = await prisma.employeeRequest.create({
      data: {
        employeeId: currentUser.employee.id,
        subject,
        message,
        priority: priority || 'NORMAL'
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true
          }
        },
        replies: true
      }
    })

    return NextResponse.json({
      success: true,
      request,
      message: 'Request created successfully'
    })
  } catch (error) {
    console.error('[REQUEST_CREATE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

