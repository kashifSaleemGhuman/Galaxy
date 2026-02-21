import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/salary-structures - List salary structures
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const hasAccess = currentUser.role === ROLES.SUPER_ADMIN || 
                     currentUser.role === ROLES.ADMIN || 
                     currentUser.role === ROLES.HR_MANAGER

    if (!hasAccess) {
      return new NextResponse('Forbidden: Insufficient permissions', { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')

    const where = {}
    if (employeeId) {
      where.employeeId = employeeId
    }

    const salaryStructures = await prisma.salaryStructure.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        salaryComponents: {
          where: { isActive: true },
          orderBy: { priority: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(salaryStructures)
  } catch (error) {
    console.error('[SALARY_STRUCTURES_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// POST /api/hrm/payroll/salary-structures - Create salary structure
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const hasAccess = currentUser.role === ROLES.SUPER_ADMIN || 
                     currentUser.role === ROLES.ADMIN || 
                     currentUser.role === ROLES.HR_MANAGER

    if (!hasAccess) {
      return new NextResponse('Forbidden: Insufficient permissions', { status: 403 })
    }

    const body = await req.json()
    const { employeeId, effectiveFrom, effectiveTo, components } = body

    if (!employeeId || !effectiveFrom || !components || components.length === 0) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    // Deactivate existing active structures
    await prisma.salaryStructure.updateMany({
      where: {
        employeeId,
        isActive: true
      },
      data: {
        isActive: false,
        effectiveTo: new Date(effectiveFrom)
      }
    })

    // Create new salary structure
    const salaryStructure = await prisma.salaryStructure.create({
      data: {
        employeeId,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive: true,
        createdBy: currentUser.id,
        salaryComponents: {
          create: components.map(comp => ({
            name: comp.name,
            type: comp.type,
            calculationType: comp.calculationType,
            amount: comp.amount,
            baseComponentId: comp.baseComponentId || null,
            isTaxable: comp.isTaxable || false,
            priority: comp.priority || 0,
            isActive: true
          }))
        }
      },
      include: {
        salaryComponents: true
      }
    })

    return NextResponse.json(salaryStructure, { status: 201 })
  } catch (error) {
    console.error('[SALARY_STRUCTURES_POST]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

