import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

// DELETE /api/hrm/payroll/manual-deductions/:id
export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 })

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })
    if (!currentUser) return new NextResponse('User not found', { status: 404 })
    if (!hasHrAccess(currentUser.role)) return new NextResponse('Forbidden', { status: 403 })

    const existing = await prisma.payrollAuditLog.findUnique({
      where: { id: params.id }
    })

    if (!existing || !['MANUAL_DEDUCTION', 'MANUAL_ADDITION', 'MANUAL_ADJUSTMENT'].includes(existing.action)) {
      return new NextResponse('Manual adjustment not found', { status: 404 })
    }

    await prisma.payrollAuditLog.update({
      where: { id: params.id },
      data: {
        details: {
          ...(existing.details || {}),
          isActive: false,
          removedBy: currentUser.id,
          removedAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[MANUAL_DEDUCTION_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

