import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DEFAULT_PERMITS = [
  "Factory License",
  "Water Abstraction Consent",
  "Water Discharge Consent",
  "Air and Noise Consent",
  "Hazardous Waste Management Consent",
  "Boiler Consent",
  "Chemical Storage Permission",
  "Building Stability",
  "Fire License",
  "Diesel Generator Stability",
  "Weighing Scale Calibration",
  "Pressure Vessel stability certificate",
  "Hooking Conveyor Stability",
  "Chain Pulley Block",
  "Lift Stability Certificate",
  "Battery Stacker",
  "Buffing Machine",
  "Chain Pully",
  "Roller Coating",
  "Hand Pallet Truck",
  "Manual Stacker",
  "Splitting Machine",
  "Vaccum Dryer",
  "Shaving Machine",
  "Roller Plating",
  "Hydraulic Press"
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Ensure prisma is available
    if (!prisma) {
      console.error('[PERMITS_GET] Prisma client is undefined')
      return new NextResponse('Database connection error', { status: 500 })
    }

    // Check if Permit model is available in Prisma client
    if (!prisma.permit) {
      console.error('[PERMITS_GET] Permit model is undefined in Prisma client')
      // Attempt to force re-connect or throw specific error
      return new NextResponse('Database model error - Restart server', { status: 500 })
    }

    // Seed default permits if none exist
    const count = await prisma.permit.count()
    if (count === 0) {
      await prisma.permit.createMany({
        data: DEFAULT_PERMITS.map(title => ({ title }))
      })
    } else {
      // Add any missing defaults
      const existing = await prisma.permit.findMany({
        select: { title: true }
      })
      const existingTitles = new Set(existing.map(p => p.title))
      const missing = DEFAULT_PERMITS.filter(title => !existingTitles.has(title))
      
      if (missing.length > 0) {
        await prisma.permit.createMany({
          data: missing.map(title => ({ title }))
        })
      }
    }

    const permits = await prisma.permit.findMany({
      orderBy: { title: 'asc' }
    })

    return NextResponse.json(permits)
  } catch (error) {
    console.error('[PERMITS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!prisma) {
      return new NextResponse('Database connection error', { status: 500 })
    }

    const body = await req.json()
    const { 
      id,
      authorizedNumber,
      issuingAuthority,
      dateOfIssue,
      dateOfExpiry,
      renewalSubmissionDate,
      reportingFrequency,
      lastReportDate,
      responsiblePerson
    } = body

    if (!id) {
      return new NextResponse('Missing ID', { status: 400 })
    }

    const permit = await prisma.permit.update({
      where: { id },
      data: {
        authorizedNumber,
        issuingAuthority,
        dateOfIssue: dateOfIssue ? new Date(dateOfIssue) : null,
        dateOfExpiry: dateOfExpiry ? new Date(dateOfExpiry) : null,
        renewalSubmissionDate: renewalSubmissionDate ? new Date(renewalSubmissionDate) : null,
        reportingFrequency,
        lastReportDate: lastReportDate ? new Date(lastReportDate) : null,
        responsiblePerson
      }
    })

    return NextResponse.json(permit)
  } catch (error) {
    console.error('[PERMITS_UPDATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

