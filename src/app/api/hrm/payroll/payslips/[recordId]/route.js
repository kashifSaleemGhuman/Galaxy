import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'
import { generatePayslipData, formatPayslipAsText } from '@/lib/payslip-generator'

// GET /api/hrm/payroll/payslips/:recordId - Get payslip data
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, tenantId: true, employee: { select: { id: true } } }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const payrollRecord = await prisma.payrollRecord.findUnique({
      where: { id: params.recordId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true,
            designation: true
          }
        },
        payrollPeriod: true,
        components: {
          orderBy: { priority: 'asc' }
        }
      }
    })

    if (!payrollRecord) {
      return new NextResponse('Payroll record not found', { status: 404 })
    }

    // Check if user has access
    const isHR = currentUser.role === ROLES.SUPER_ADMIN || 
                 currentUser.role === ROLES.ADMIN || 
                 currentUser.role === ROLES.HR_MANAGER

    if (!isHR && currentUser.employee?.id !== payrollRecord.employeeId) {
      return new NextResponse('Forbidden: Cannot access other employees\' payslips', { status: 403 })
    }

    // Get company information
    const organization = await prisma.organization.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    let tenantId = currentUser.tenantId
    if (!tenantId) {
      const defaultTenant = await prisma.tenant.findFirst({ where: { domain: 'default' } })
      tenantId = defaultTenant?.id
    }
    const tenant = tenantId
      ? await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } })
      : null
    const payslipSettings = tenant?.settings?.payslip || {}

    const companyInfo = organization ? {
      companyName: payslipSettings.companyNameOverride || organization.companyName,
      address: organization.address || organization.fullAddress || '',
      logo: payslipSettings.logoUrl || organization.companyLogo || null,
      themeColor: payslipSettings.themeColor || '#1d4ed8',
      accentColor: payslipSettings.accentColor || '#0f172a',
      footerNote: payslipSettings.footerNote || 'This is a system-generated payslip.'
    } : {}

    // Generate payslip data
    const payslipData = generatePayslipData(payrollRecord, companyInfo)

    // Check if text format is requested
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'

    if (format === 'text') {
      const textPayslip = formatPayslipAsText(payslipData)
      return new NextResponse(textPayslip, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="payslip-${payrollRecord.employee.employeeId}-${payrollRecord.payrollPeriod.periodName.replace(/\s+/g, '-')}.txt"`
        }
      })
    }

    return NextResponse.json(payslipData)
  } catch (error) {
    console.error('[PAYSLIP_GET]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}

