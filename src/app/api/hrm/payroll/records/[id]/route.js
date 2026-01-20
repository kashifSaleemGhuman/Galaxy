import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/records/:id - Get payroll record
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

    const payrollRecord = await prisma.payrollRecord.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        payrollPeriod: true,
        salaryStructure: {
          include: {
            components: {
              orderBy: { priority: 'asc' }
            }
          }
        },
        components: {
          orderBy: { priority: 'asc' }
        }
      }
    })

    if (!payrollRecord) {
      return new NextResponse('Payroll record not found', { status: 404 })
    }

    // Check if user has access
    const isHR = currentUser.role === ROLES.SUPER_ADMIN || 
                 currentUser.role === ROLES.ADMIN || 
                 currentUser.role === ROLES.HR_MANAGER

    if (!isHR) {
      // Try to find employee by userId if employee relation doesn't exist
      let employeeId = currentUser.employee?.id
      if (!employeeId) {
        const employee = await prisma.employee.findFirst({
          where: { userId: currentUser.id },
          select: { id: true }
        })
        employeeId = employee?.id
      }
      
      if (!employeeId || employeeId !== payrollRecord.employeeId) {
        return new NextResponse('Forbidden: Cannot access other employees\' payroll', { status: 403 })
      }
    }

    return NextResponse.json(payrollRecord)
  } catch (error) {
    console.error('[PAYROLL_RECORD_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

