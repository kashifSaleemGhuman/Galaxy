import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/document-templates - List all templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user has HR permissions
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

    const templates = await prisma.documentTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('[DOCUMENT_TEMPLATES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/hrm/document-templates - Create a new template
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user has HR permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
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
    const { name, category, description, content, fields, isActive = true } = body

    if (!name || !category || !content) {
      return new NextResponse('Missing required fields: name, category, content', { status: 400 })
    }

    const template = await prisma.documentTemplate.create({
      data: {
        name,
        category,
        description,
        content,
        fields: fields || [],
        isActive,
        createdBy: currentUser.id
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('[DOCUMENT_TEMPLATES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

