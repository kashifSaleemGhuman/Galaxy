import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { generateDocumentContent, getEmployeeFields, htmlToPdf } from '@/lib/document-generator'
import { getTemplateByCategory } from '@/lib/document-templates'
import { uploadFile } from '@/lib/supabase'

// POST /api/hrm/documents/generate - Generate a document from template
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
      return new NextResponse('Forbidden: Only HR can generate documents', { status: 403 })
    }

    const body = await req.json()
    const { templateId, employeeId, fieldValues, title, description, tags = [] } = body

    if (!templateId || !employeeId) {
      return new NextResponse('Missing required fields: templateId, employeeId', { status: 400 })
    }

    // Get template from database or use predefined template
    let template = await prisma.documentTemplate.findUnique({
      where: { id: templateId }
    })
    
    let isPredefinedTemplate = false

    // If template not found in DB, try to use predefined template by category
    if (!template || !template.isActive) {
      // Try to get predefined template
      const predefinedTemplate = getTemplateByCategory(templateId) // templateId might be category
      if (predefinedTemplate) {
        // Create a virtual template object
        isPredefinedTemplate = true
        template = {
          id: templateId,
          name: templateId.replace(/_/g, ' '),
          category: templateId,
          content: predefinedTemplate,
          isActive: true,
          fields: []
        }
      } else {
        return new NextResponse('Template not found or inactive', { status: 404 })
      }
    }

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    // Get employee fields for template
    const employeeFields = getEmployeeFields(employee)

    // Generate document content
    const generatedContent = generateDocumentContent(
      template.content,
      { ...employeeFields, ...fieldValues },
      employee
    )

    // Convert HTML to PDF
    const pdfBuffer = await htmlToPdf(generatedContent)

    // Generate file name and path
    const timestamp = Date.now()
    const fileName = `${template.category}_${employee.employeeId}_${timestamp}.pdf`
    const filePath = `employees/${employeeId}/${template.category}/${fileName}`

    // Upload PDF to Supabase (pdfBuffer is already a Buffer)
    const { url, path } = await uploadFile(pdfBuffer, filePath)

    // Save document record
    // Only set templateId if it's a database template (not predefined)
    const document = await prisma.employeeDocument.create({
      data: {
        employeeId,
        templateId: isPredefinedTemplate ? null : templateId, // Don't set templateId for predefined templates
        documentType: 'GENERATED',
        category: template.category,
        title: title || template.name,
        fileName,
        filePath: path,
        fileUrl: url,
        fileSize: pdfBuffer.length,
        mimeType: 'application/pdf',
        fieldValues: { ...employeeFields, ...fieldValues },
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
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('[DOCUMENT_GENERATE]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

