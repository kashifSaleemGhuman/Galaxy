import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/records/employee/:employeeId - Get employee payroll history
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, employee: { select: { id: true } } }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const isHR = currentUser.role === ROLES.SUPER_ADMIN || 
                 currentUser.role === ROLES.ADMIN || 
                 currentUser.role === ROLES.HR_MANAGER

    // Employees can only see their own records
    if (!isHR && currentUser.employee?.id !== params.employeeId) {
      return new NextResponse('Forbidden: Cannot access other employees\' payroll', { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const payrollRecords = await prisma.payrollRecord.findMany({
      where: {
        employeeId: params.employeeId
      },
      include: {
        payrollPeriod: {
          select: {
            id: true,
            periodName: true,
            periodStart: true,
            periodEnd: true,
            status: true
          }
        },
        components: {
          orderBy: { priority: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.payrollRecord.count({
      where: {
        employeeId: params.employeeId
      }
    })

    return NextResponse.json({
      records: payrollRecords,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('[EMPLOYEE_PAYROLL_HISTORY]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

