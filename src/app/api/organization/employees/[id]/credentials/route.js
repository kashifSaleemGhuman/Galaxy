import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { decryptEmployeePassword } from '@/lib/employee-credentials'

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

    const currentUserRole = String(currentUser?.role || '').toUpperCase()
    if (!currentUser || (currentUserRole !== ROLES.SUPER_ADMIN && currentUserRole !== ROLES.HR_MANAGER)) {
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
            role: true,
            employeeCredential: {
              select: {
                encryptedPassword: true,
                iv: true,
                authTag: true,
                algorithm: true
              }
            }
          }
        },
      }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    if (!employee.user) {
      return new NextResponse('Employee does not have a user account', { status: 404 })
    }

    const response = {
      employeeId: employee.employeeId,
      employeeName: employee.name,
      email: employee.user.email,
      role: employee.user.role,
      isActive: employee.user.isActive
    }

    // Only super admin can view decrypted password.
    if (currentUserRole === ROLES.SUPER_ADMIN) {
      let password = null
      try {
        password = decryptEmployeePassword(employee.user.employeeCredential)
      } catch (decryptError) {
        console.error('[EMPLOYEE_CREDENTIALS_DECRYPT]', decryptError)
      }

      return NextResponse.json({
        ...response,
        password,
        message: password
          ? 'Password retrieved from secure credential vault.'
          : 'No stored password found. Reset password to generate a new visible credential.'
      })
    }

    return NextResponse.json({
      ...response,
      message: 'Only super admin can view password. HR manager can view account metadata only.'
    })
  } catch (error) {
    console.error('[EMPLOYEE_CREDENTIALS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

