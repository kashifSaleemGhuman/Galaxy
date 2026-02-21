import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/lib/constants/roles'

const DEFAULT_SETTINGS = {
  themeColor: '#1d4ed8',
  accentColor: '#0f172a',
  footerNote: 'This is a system-generated payslip.',
  logoUrl: '',
  companyNameOverride: ''
}

async function resolveTenantId(sessionUser) {
  if (sessionUser?.tenantId) return sessionUser.tenantId
  const defaultTenant = await prisma.tenant.findFirst({ where: { domain: 'default' } })
  return defaultTenant?.id || null
}

function hasHrAccess(role) {
  const normalized = String(role || '').toUpperCase()
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN || normalized === ROLES.HR_MANAGER
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, tenantId: true }
    })
    if (!user) return new NextResponse('User not found', { status: 404 })

    const tenantId = await resolveTenantId(user)
    if (!tenantId) return NextResponse.json(DEFAULT_SETTINGS)

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    })

    const stored = tenant?.settings?.payslip || {}
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...stored })
  } catch (error) {
    console.error('[PAYSLIP_SETTINGS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, tenantId: true }
    })
    if (!user) return new NextResponse('User not found', { status: 404 })
    if (!hasHrAccess(user.role)) return new NextResponse('Forbidden', { status: 403 })

    const tenantId = await resolveTenantId(user)
    if (!tenantId) return new NextResponse('Tenant not found', { status: 404 })

    const body = await req.json()
    const nextSettings = {
      ...DEFAULT_SETTINGS,
      themeColor: String(body.themeColor || DEFAULT_SETTINGS.themeColor),
      accentColor: String(body.accentColor || DEFAULT_SETTINGS.accentColor),
      footerNote: String(body.footerNote || DEFAULT_SETTINGS.footerNote),
      logoUrl: String(body.logoUrl || ''),
      companyNameOverride: String(body.companyNameOverride || '')
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    })

    const mergedSettings = {
      ...(tenant?.settings || {}),
      payslip: nextSettings
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: mergedSettings }
    })

    return NextResponse.json(nextSettings)
  } catch (error) {
    console.error('[PAYSLIP_SETTINGS_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}


