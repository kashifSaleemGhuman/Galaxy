import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/records - List payroll records
export async function GET(req) {
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

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const payrollPeriodId = searchParams.get('payrollPeriodId')

    const isHR = currentUser.role === ROLES.SUPER_ADMIN || 
                 currentUser.role === ROLES.ADMIN || 
                 currentUser.role === ROLES.HR_MANAGER

    const where = {}
    
    // Employees can only see their own records
    if (!isHR) {
      // Try to find employee by userId if employee relation doesn't exist
      if (currentUser.employee?.id) {
        where.employeeId = currentUser.employee.id
      } else {
        // Find employee by userId
        const employee = await prisma.employee.findFirst({
          where: { userId: currentUser.id },
          select: { id: true }
        })
        if (employee) {
          where.employeeId = employee.id
        } else {
          // No employee record found - return empty array
          return NextResponse.json([])
        }
      }
    } else if (employeeId) {
      where.employeeId = employeeId
    }

    if (payrollPeriodId) {
      where.payrollPeriodId = payrollPeriodId
    }

    const payrollRecords = await prisma.payrollRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        payrollPeriod: {
          select: {
            id: true,
            periodName: true,
            periodStart: true,
            periodEnd: true
          }
        },
        components: {
          orderBy: { priority: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payrollRecords)
  } catch (error) {
    console.error('[PAYROLL_RECORDS_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

