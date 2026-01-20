import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/documents - List documents (filtered by employee if employee role)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, employee: { select: { id: true } } }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const category = searchParams.get('category')
    const documentType = searchParams.get('documentType')

    // Build where clause
    const where = {
      isActive: true
    }

    // If user is an employee (not HR), only show their own documents
    if (currentUser.role === ROLES.USER && currentUser.employee) {
      where.employeeId = currentUser.employee.id
    } else if (employeeId) {
      // HR can filter by employee
      where.employeeId = employeeId
    }

    if (category) {
      where.category = category
    }

    if (documentType) {
      where.documentType = documentType
    }

    const documents = await prisma.employeeDocument.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('[DOCUMENTS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

