import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

// GET /api/hrm/document-templates/[id] - Get a single template
export async function GET(req, { params }) {
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

    const template = await prisma.documentTemplate.findUnique({
      where: { id: params.id }
    })

    if (!template) {
      return new NextResponse('Template not found', { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('[DOCUMENT_TEMPLATE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// PUT /api/hrm/document-templates/[id] - Update a template
export async function PUT(req, { params }) {
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

    const body = await req.json()
    const { name, category, description, content, fields, isActive } = body

    const template = await prisma.documentTemplate.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(content && { content }),
        ...(fields && { fields }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('[DOCUMENT_TEMPLATE_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE /api/hrm/document-templates/[id] - Delete a template (soft delete)
export async function DELETE(req, { params }) {
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

    // Soft delete by setting isActive to false
    const template = await prisma.documentTemplate.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Template deleted successfully', template })
  } catch (error) {
    console.error('[DOCUMENT_TEMPLATE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

