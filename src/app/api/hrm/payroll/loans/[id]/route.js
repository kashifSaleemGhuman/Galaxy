import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/payroll/loans/[id] - Get single loan by ID
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

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
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

    if (!loan) {
      return new NextResponse('Loan not found', { status: 404 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error('[LOAN_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

