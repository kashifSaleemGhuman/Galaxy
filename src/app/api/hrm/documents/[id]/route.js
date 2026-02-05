import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { deleteFile } from '@/lib/supabase'

// DELETE /api/hrm/documents/[id] - Delete a document (soft delete)
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
      return new NextResponse('Forbidden: Only HR can delete documents', { status: 403 })
    }

    // Get document
    const document = await prisma.employeeDocument.findUnique({
      where: { id: params.id }
    })

    if (!document) {
      return new NextResponse('Document not found', { status: 404 })
    }

    // Soft delete
    await prisma.employeeDocument.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    // Optionally delete from Supabase (uncomment if you want to delete files)
    // await deleteFile(document.filePath)

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('[DOCUMENT_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

