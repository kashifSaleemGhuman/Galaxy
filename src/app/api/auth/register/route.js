import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, companyName, companyDomain } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          domain: companyDomain || null,
          settings: {
            theme: 'light',
            timezone: 'UTC'
          }
        }
      })

      // Create default admin role
      const adminRole = await tx.role.create({
        data: {
          name: 'Administrator',
          description: 'Full system access',
          permissions: ['*:*:*'] // All permissions
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          tenantId: tenant.id,
          roleId: adminRole.id,
          isActive: true
        }
      })

      // Create employee record
      await tx.employee.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          employeeId: `EMP${Date.now()}`,
          position: 'System Administrator',
          hireDate: new Date(),
          isActive: true
        }
      })

      return { tenant, user }
    })

    return NextResponse.json({
      message: 'Registration successful',
      tenantId: result.tenant.id,
      userId: result.user.id
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 