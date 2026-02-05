import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { getPayrollSummary } from '@/lib/payroll-helpers'

// GET /api/hrm/payroll/periods/:id/summary - Get payroll period summary
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

    const summary = await getPayrollSummary(params.id)

    if (!summary) {
      return new NextResponse('Payroll period not found', { status: 404 })
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[PAYROLL_SUMMARY]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

