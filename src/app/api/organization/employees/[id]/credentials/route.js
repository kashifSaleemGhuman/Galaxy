import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/organization/employees/[id]/credentials
// Only super admin can access employee credentials
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is super admin or HR manager
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.HR_MANAGER)) {
      return new NextResponse('Forbidden: Only super admin and HR manager can view credentials', { status: 403 })
    }

    // Get employee with user account
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            role: true
          }
        }
      }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    if (!employee.user) {
      return new NextResponse('Employee does not have a user account', { status: 404 })
    }

    // Return credentials (email is available, password cannot be retrieved)
    return NextResponse.json({
      employeeId: employee.employeeId,
      employeeName: employee.name,
      email: employee.user.email,
      role: employee.user.role,
      isActive: employee.user.isActive,
      message: 'Password cannot be retrieved. Use reset password feature to set a new password.'
    })
  } catch (error) {
    console.error('[EMPLOYEE_CREDENTIALS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

