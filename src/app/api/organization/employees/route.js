import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { ROLES } from '@/lib/constants/roles'
import { encryptEmployeePassword } from '@/lib/employee-credentials'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Always return 200 with array, even if empty
    return NextResponse.json(employees || [])
  } catch (error) {
    console.error('[EMPLOYEES_GET]', error)
    // Only return 500 for actual errors, not for empty results
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const {
      employeeId,
      idCardNumber,
      name,
      photo,
      parentName,
      dob,
      address,
      gender,
      contactNumber,
      emergencyContact,
      dateOfJoining,
      department,
      lastEmployment,
      process,
      designation,
      salary,
      dateOfLeaving,
      shift,
      secondaryJob,
      isFirstAider,
      isEmergencyResponder,
      isFirefighter
    } = body

    // Basic validation
    if (!employeeId || !name) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if current user is super admin (to return credentials)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    const isSuperAdmin = String(currentUser?.role || '').toUpperCase() === ROLES.SUPER_ADMIN

    // Sanitize employeeId for email (remove special characters, convert to lowercase)
    const sanitizedEmployeeId = employeeId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const email = `${sanitizedEmployeeId}@employee.local`

    // Generate a random 8-character password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hash(tempPassword, 12)

    // Create employee with user account in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account first
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: ROLES.USER,
          isActive: true,
          isFirstLogin: true
        }
      })

      // Store encrypted password so super admin can retrieve employee credentials later.
      const encryptedCredential = encryptEmployeePassword(tempPassword)
      await tx.employeeCredential.upsert({
        where: { userId: user.id },
        update: encryptedCredential,
        create: {
          userId: user.id,
          ...encryptedCredential
        }
      })

      // Create employee linked to user account
      const employee = await tx.employee.create({
        data: {
          employeeId,
          idCardNumber,
          name,
          photo,
          parentName,
          dob: dob ? new Date(dob) : null,
          address,
          gender,
          contactNumber,
          emergencyContact,
          dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
          department,
          lastEmployment,
          process,
          designation,
          salary: salary ? parseFloat(salary) : null,
          dateOfLeaving: dateOfLeaving ? new Date(dateOfLeaving) : null,
          shift,
          secondaryJob,
          isFirstAider: isFirstAider || false,
          isEmergencyResponder: isEmergencyResponder || false,
          isFirefighter: isFirefighter || false,
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

      return { employee, user, tempPassword }
    })

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
  } catch (error) {
    console.error('[EMPLOYEES_POST]', error)
    if (error.code === 'P2002') {
      return new NextResponse('Employee ID already exists', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

