import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { getSignedUrl } from '@/lib/supabase'

// GET /api/hrm/documents/[id]/download - Get download URL for a document
export async function GET(req, { params }) {
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

    // Get document
    const document = await prisma.employeeDocument.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true
          }
        }
      }
    })

    if (!document || !document.isActive) {
      return new NextResponse('Document not found', { status: 404 })
    }

    // Check permissions: Employee can only access their own documents
    if (currentUser.role === ROLES.USER && currentUser.employee) {
      if (document.employeeId !== currentUser.employee.id) {
        return new NextResponse('Forbidden: You can only access your own documents', { status: 403 })
      }
    }

    // If document has a public URL, return it
    if (document.fileUrl) {
      return NextResponse.json({ 
        url: document.fileUrl,
        fileName: document.fileName,
        mimeType: document.mimeType
      })
    }

    // Otherwise, generate a signed URL
    const signedUrl = await getSignedUrl(document.filePath)

    return NextResponse.json({ 
      url: signedUrl,
      fileName: document.fileName,
      mimeType: document.mimeType
    })
  } catch (error) {
    console.error('[DOCUMENT_DOWNLOAD]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

