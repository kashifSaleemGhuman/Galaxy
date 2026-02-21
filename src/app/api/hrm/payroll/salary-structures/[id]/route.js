import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/salary-structures/:id - Get salary structure
export async function GET(req, { params }) {
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

    const salaryStructure = await prisma.salaryStructure.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        salaryComponents: {
          orderBy: { priority: 'asc' }
        }
      }
    })

    if (!salaryStructure) {
      return new NextResponse('Salary structure not found', { status: 404 })
    }

    return NextResponse.json(salaryStructure)
  } catch (error) {
    console.error('[SALARY_STRUCTURE_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// PUT /api/hrm/payroll/salary-structures/:id - Update salary structure
export async function PUT(req, { params }) {
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
    const { effectiveFrom, effectiveTo, components } = body

    // Check if structure exists
    const existingStructure = await prisma.salaryStructure.findUnique({
      where: { id: params.id },
      include: {
        payrollRecords: {
          where: {
            status: { in: ['FINALIZED', 'PAID'] }
          }
        }
      }
    })

    if (!existingStructure) {
      return new NextResponse('Salary structure not found', { status: 404 })
    }

    // Cannot modify if used in finalized payroll
    if (existingStructure.payrollRecords.length > 0) {
      return new NextResponse('Cannot modify salary structure used in finalized payroll', { status: 400 })
    }

    // Update structure
    const salaryStructure = await prisma.salaryStructure.update({
      where: { id: params.id },
      data: {
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined,
        effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
        ...(components && {
          salaryComponents: {
            deleteMany: {},
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
        })
      },
      include: {
        salaryComponents: true
      }
    })

    return NextResponse.json(salaryStructure)
  } catch (error) {
    console.error('[SALARY_STRUCTURE_PUT]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// DELETE /api/hrm/payroll/salary-structures/:id - Delete salary structure
export async function DELETE(req, { params }) {
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

    // Check if structure is used in payroll
    const salaryStructure = await prisma.salaryStructure.findUnique({
      where: { id: params.id },
      include: {
        payrollRecords: true
      }
    })

    if (!salaryStructure) {
      return new NextResponse('Salary structure not found', { status: 404 })
    }

    if (salaryStructure.payrollRecords.length > 0) {
      return new NextResponse('Cannot delete salary structure used in payroll records', { status: 400 })
    }

    await prisma.salaryStructure.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Salary structure deleted successfully' })
  } catch (error) {
    console.error('[SALARY_STRUCTURE_DELETE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

