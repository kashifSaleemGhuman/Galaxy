import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { ROLES } from '@/lib/constants/roles'
import { encryptEmployeePassword } from '@/lib/employee-credentials'

// POST /api/organization/employees/[id]/create-account
// Create a user account for an existing employee
export async function POST(request, { params }) {
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
      return new NextResponse('Forbidden: Only super admin and HR manager can create employee accounts', { status: 403 })
    }

    const { id } = params

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    // Check if employee already has a user account
    if (employee.userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: employee.userId }
      })
      if (existingUser) {
        return new NextResponse('Employee already has a user account', { status: 400 })
      }
    }

    // Sanitize employeeId for email (remove special characters, convert to lowercase)
    const sanitizedEmployeeId = employee.employeeId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const email = `${sanitizedEmployeeId}@employee.local`

    // Check if email already exists
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserWithEmail) {
      return new NextResponse('User account with this email already exists', { status: 400 })
    }

    // Generate a random 8-character password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hash(tempPassword, 12)

    // Create user account and link to employee
    // Use sequential operations instead of transaction to avoid Prisma Accelerate issues
    try {
      // Create user account first
      const user = await prisma.user.create({
        data: {
          email,
          name: employee.name,
          password: hashedPassword,
          role: ROLES.USER,
          isActive: true,
          isFirstLogin: true
        }
      })

      // Store encrypted password so super admin can view credentials later.
      const encryptedCredential = encryptEmployeePassword(tempPassword)
      await prisma.employeeCredential.upsert({
        where: { userId: user.id },
        update: encryptedCredential,
        create: {
          userId: user.id,
          ...encryptedCredential
        }
      })

      // Update employee to link user account
      const updatedEmployee = await prisma.employee.update({
        where: { id: employee.id },
        data: {
          userId: user.id
        },
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

      const result = { employee: updatedEmployee, user, tempPassword }

      const isSuperAdmin = currentUserRole === ROLES.SUPER_ADMIN

      // Return employee with credentials if super admin
      if (isSuperAdmin) {
        return NextResponse.json({
          ...result.employee,
          credentials: {
            employeeId: result.employee.employeeId,
            employeeName: result.employee.name,
            email: result.user.email,
            password: result.tempPassword,
            role: result.user.role,
            isActive: result.user.isActive,
            message: 'Credential is stored securely and can be viewed again by super admin.'
          }
        })
      }

      return NextResponse.json(result.employee)
    } catch (createError) {
      // If user creation succeeded but employee update failed, try to clean up
      if (createError.code !== 'P2002') {
        // Try to delete the user if employee update failed
        try {
          const createdUser = await prisma.user.findUnique({ where: { email } })
          if (createdUser && !employee.userId) {
            await prisma.user.delete({ where: { id: createdUser.id } })
          }
        } catch (cleanupError) {
          console.error('[CREATE_EMPLOYEE_ACCOUNT_CLEANUP]', cleanupError)
        }
      }
      throw createError
    }
  } catch (error) {
    console.error('[CREATE_EMPLOYEE_ACCOUNT]', error)
    if (error.code === 'P2002') {
      return new NextResponse('User account with this email already exists', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

