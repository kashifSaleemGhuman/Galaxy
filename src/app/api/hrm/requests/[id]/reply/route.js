import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { emailService } from '@/lib/email'

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

// POST /api/hrm/requests/[id]/reply - Reply to request
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const requestId = resolvedParams.id

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const body = await req.json()
    const { message } = body

    if (!message) {
      return new NextResponse('Message is required', { status: 400 })
    }

    const request = await prisma.employeeRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    })

    if (!request) {
      return new NextResponse('Request not found', { status: 404 })
    }

    const isHr = hasHrAccess(currentUser.role)
    
    // Check access: HR can reply to any request, employees can only reply to their own
    if (!isHr && currentUser.employee && request.employeeId !== currentUser.employee.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Create reply
    const reply = await prisma.employeeRequestReply.create({
      data: {
        requestId,
        message,
        repliedBy: currentUser.id,
        isFromHr: isHr
      }
    })

    // Update request status if HR is replying
    if (isHr && request.status === 'PENDING') {
      await prisma.employeeRequest.update({
        where: { id: requestId },
        data: { status: 'IN_PROGRESS' }
      })
    }

    // Send email notification
    try {
      if (isHr) {
        // HR replied - notify employee
        if (request.employee.user?.email) {
          const subject = `Reply to your request: ${request.subject}`
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">HR Reply</h2>
              <p>Dear ${request.employee.name},</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Request:</strong> ${request.subject}</p>
                <p><strong>Reply:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p>You can view the full conversation in your dashboard.</p>
            </div>
          `
          await emailService.sendEmail({ 
            to: request.employee.user.email, 
            subject, 
            html 
          }).catch(console.error)
        }
      } else {
        // Employee replied - notify all HR users
        const hrUsers = await prisma.user.findMany({
          where: {
            role: { in: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER] },
            isActive: true
          }
        })

        const subject = `New reply on request: ${request.subject}`
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Reply</h2>
            <p>A new reply has been added to a request.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Request:</strong> ${request.subject}</p>
              <p><strong>From:</strong> ${request.employee.name} (${request.employee.employeeId})</p>
              <p><strong>Reply:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p>You can view the full conversation in your dashboard.</p>
          </div>
        `

        for (const hrUser of hrUsers) {
          if (hrUser.email) {
            await emailService.sendEmail({ 
              to: hrUser.email, 
              subject, 
              html 
            }).catch(console.error)
          }
        }
      }
    } catch (emailError) {
      console.error('Error sending reply notification email:', emailError)
      // Don't fail the request if email fails
    }

    // Fetch updated request with replies
    const updatedRequest = await prisma.employeeRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true
          }
        },
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      reply,
      request: updatedRequest,
      message: 'Reply added successfully'
    })
  } catch (error) {
    console.error('[REQUEST_REPLY]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

