import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { uploadFile } from '@/lib/supabase'

// POST /api/hrm/documents/upload - Upload a document
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
      return new NextResponse('Forbidden: Only HR can upload documents', { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const employeeId = formData.get('employeeId')
    const category = formData.get('category')
    const title = formData.get('title')
    const description = formData.get('description')
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags')) : []

    if (!file || !employeeId || !category || !title) {
      return new NextResponse('Missing required fields: file, employeeId, category, title', { status: 400 })
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    // Generate file path
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `employees/${employeeId}/${category}/${timestamp}_${sanitizedFileName}`

    // Upload to Supabase
    const { url, path } = await uploadFile(file, filePath)

    // Save document record
    const document = await prisma.employeeDocument.create({
      data: {
        employeeId,
        documentType: 'UPLOADED',
        category,
        title,
        fileName: file.name,
        filePath: path,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.type,
        description,
        tags,
        uploadedBy: currentUser.id
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('[DOCUMENT_UPLOAD]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

