import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/loans - List loans
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

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    const where = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const loans = await prisma.loan.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        installments: {
          orderBy: { installmentNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error('[LOANS_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

// POST /api/hrm/payroll/loans - Create loan
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
    const { employeeId, loanNumber, principalAmount, interestRate, installmentAmount, totalInstallments, startDate, notes } = body

    if (!employeeId || !loanNumber || !principalAmount || !installmentAmount || !totalInstallments || !startDate) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    // Check if loan number is unique
    const existingLoan = await prisma.loan.findUnique({
      where: { loanNumber }
    })

    if (existingLoan) {
      return new NextResponse('Loan number already exists', { status: 400 })
    }

    // Calculate total amount
    let totalAmount = Number(principalAmount)
    if (interestRate) {
      const interest = (Number(principalAmount) * Number(interestRate)) / 100
      totalAmount += interest
    }

    // Calculate end date (approximate)
    const start = new Date(startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + totalInstallments)

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        employeeId,
        loanNumber,
        principalAmount,
        interestRate: interestRate || null,
        totalAmount,
        installmentAmount,
        totalInstallments,
        remainingInstallments: totalInstallments,
        status: 'ACTIVE',
        startDate: new Date(startDate),
        endDate,
        notes,
        createdBy: currentUser.id
      }
    })

    // Create installments
    const installments = []
    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)
      
      installments.push({
        loanId: loan.id,
        installmentNumber: i,
        amount: installmentAmount,
        status: 'PENDING',
        dueDate
      })
    }

    await prisma.loanInstallment.createMany({
      data: installments
    })

    const loanWithInstallments = await prisma.loan.findUnique({
      where: { id: loan.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        installments: {
          orderBy: { installmentNumber: 'asc' }
        }
      }
    })

    return NextResponse.json(loanWithInstallments, { status: 201 })
  } catch (error) {
    console.error('[LOANS_POST]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

