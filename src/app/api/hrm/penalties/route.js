import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

// GET /api/hrm/penalties - List penalties
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const isHr = hasHrAccess(currentUser.role)

    // Build where clause
    const where = {}
    
    // If not HR, only show own penalties
    if (!isHr && currentUser.employee) {
      where.employeeId = currentUser.employee.id
    } else if (employeeId) {
      where.employeeId = employeeId
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    const penalties = await prisma.penalty.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, penalties })
  } catch (error) {
    console.error('[PENALTIES_LIST]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// POST /api/hrm/penalties - Create penalty (HR only)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

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
    const { employeeId, amount, reason, description, date } = body

    if (!employeeId || !reason || !date) {
      return new NextResponse('Missing required fields: employeeId, reason, date', { status: 400 })
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    const penalty = await prisma.penalty.create({
      data: {
        employeeId,
        amount: amount ? parseFloat(amount) : null,
        reason,
        description: description || null,
        date: new Date(date),
        createdBy: currentUser.id
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
      penalty,
      message: 'Penalty created successfully'
    })
  } catch (error) {
    console.error('[PENALTY_CREATE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

