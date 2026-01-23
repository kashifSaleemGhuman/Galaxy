import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DOCUMENT_NAME = 'RSL PROCEDURE'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find the document
    const document = await prisma.document.findUnique({
      where: { name: DOCUMENT_NAME },
      include: { content: true }
    })

    if (!document) {
      return NextResponse.json({ content: null })
    }

    // Return the content if it exists
    if (document.content) {
      return NextResponse.json({
        id: document.id,
        name: document.name,
        docNo: document.docNo,
        revDate: document.revDate,
        description: document.description,
        content: document.content.content
      })
    }

    return NextResponse.json({
      id: document.id,
      name: document.name,
      docNo: document.docNo,
      revDate: document.revDate,
      description: document.description,
      content: null
    })
  } catch (error) {
    console.error('[RSL_PROCEDURE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check permission (admin only)
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const { content } = body

    // Find or create the document
    let document = await prisma.document.findUnique({
      where: { name: DOCUMENT_NAME }
    })

    if (!document) {
      document = await prisma.document.create({
        data: { name: DOCUMENT_NAME }
      })
    }

    // Update or create document content
    const existingContent = await prisma.documentContent.findUnique({
      where: { documentId: document.id }
    })

    if (existingContent) {
      // Update existing content
      await prisma.documentContent.update({
        where: { documentId: document.id },
        data: {
          content: content,
          revisionNo: existingContent.revisionNo + 1,
          revisionDate: new Date(),
          lastEditedBy: session.user.email,
          lastEditedAt: new Date()
        }
      })

      // Create revision history entry
      await prisma.documentRevision.create({
        data: {
          documentId: document.id,
          documentName: DOCUMENT_NAME,
          revisionNo: existingContent.revisionNo,
          revisionDate: existingContent.revisionDate,
          content: existingContent.content,
          editedBy: existingContent.lastEditedBy,
          changeDescription: 'Previous revision'
        }
      })
    } else {
      // Create new content
      await prisma.documentContent.create({
        data: {
          documentId: document.id,
          documentName: DOCUMENT_NAME,
          content: content,
          revisionNo: 1,
          revisionDate: new Date(),
          lastEditedBy: session.user.email,
          lastEditedAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RSL_PROCEDURE_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}


