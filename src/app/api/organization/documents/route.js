import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DEFAULT_DOCUMENTS = [
  "OPERATING PERMITS → OPERATING PERMIT REGISTER",
  "PRODUCTION DATA → RAW & WETBLUE & PRODUCTION ISSUE",
  "TRACEABILITY INCOMING → RAW LEATHER TRACKING COUNTRY WISE",
  "KPI → PRODUCTION CONSUMPTION RECORD",
  "OBJECTIVES & TARGETS → ENVIRONMENTAL IMPROVEMENT",
  "ENVIRONMENTAL ORGANISATION CHART → PERSONNEL COMPETENCY",
  "EMS → TRANNING CALENDAR",
  "EMS → TRANNING RECORD",
  "EMS → DOCUMENT CONTROL REGISTER",
  "EMS → OBSERVATION SHEET INTERNAL AUDIT",
  "EMS → INTERNAL AUDIT & MRM",
  "EMS → MANAGEMENT REVIEW MEETING",
  "EMS → ASPECT & IMPACT REGISTER",
  "CLIENT → RSL REGISTER",
  "INCOMING PART PROCESSED → RSL REGISTER",
  "ENERGY CONSUMPTION → ENERGY CONSUMPTION TO CETP",
  "WATER CONSUMPTION RECORD",
  "STACK EMISSION INVENTORY",
  "PREVENTIVE MAINTENANCE CHECK LIST",
  "WASTE GENERATION",
  "SCRAP AGENT REGISTER",
  "HEALTH & SAFETY PROCEDURE",
  "EMERGENCY PREPARENESS PLAN",
  "CHEMICAL MANAGEMENT PROCEDURE",
  "TRAFFIC MANAGEMENT",
  "TRAFFIC BANNER",
  "TRAFFIC MANAGEMENT & INDUCTION GUIDELINES",
  "HOUSEKEEPING PROCEDURE",
  "COMPLAINTS AND PUBLIC",
  "PRODUCTION ISSUE REGISTER",
  "Wet Blue/Raw/Crust Arrival Record",
  "Wet Blue/Raw/Crust Issue Record",
  "Wet Blue/Raw/Crust Stock Record",
  "Legals & Other Requirements Register",
  "Key Performance Indicator Records",
  "Internal Audit Schedule",
  "Management Review Meeting Schedule",
  "Standard Operating Procedure (SOP)",
  "Operational Control Procedure (OCP)",
  "Client RSL Evaluation",
  "Client RSL & MRSL Review Register",
  "RSL Full Test Register",
  "CrVI Test Register",
  "Incoming Part-Processed Register",
  "Diesel Consumption Record",
  "CETP Outgoing Water Record",
  "Wood Consumption Record",
  "Incoming Water Consumption Record",
  "CETP Outgoing Water Consumption Record",
  "3R PROCEDURE",
  "CETP Effluent Treated Water Register",
  "PPE details according to Operations",
  "Induction Assessment Form",
  "Induction Assessment Program",
  "H&S Induction for visitors",
  "Chemcial Emergency Manual Issue Regsiter",
  "Client MRSL Assessment",
  "MRSL Compliance Register",
  "Incoming Part-Processed MRSL Compliance Register",
  "House Keeping Checklist",
  "Traffic Management Plan",
  "Traffic Management and Induction Procedure",
  "Equipment Calibration Register",
  "CHEMICAL RISK ASSESSMENT",
  "EACH ROLE RISK ASSESSMENT",
  "PPE DETAILS ACCORDING TO GHS HAZARD",
  "PPE REGISTER",
  "MRSL COMPLAINCE REGISTER - CLIENT COMMUNCATION",
  "CHEMICAL VERIFICATION",
  "WETBLUE CHROME COMPLIANCE DECLERATION",
  "CHEMICAL INVENTORY MASTER",
  "HOUSEKEEPING OBSVERATION",
  "OUTGOING TRACEABILITY",
  "INCOMING TRACEABILITY",
  "EMS POLICY",
  "EMS PROCEDURE",
  "RSL POLICY",
  "ASPECT & IMPACT",
  "RSL PROCEDURE",
  "Chemical Recipe",
  "Cr IV Prevention",
  "WASTE MANAGEMENT",
  "HEALTH & SAFETY"
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if documents exist
    const count = await prisma.document.count()

    if (count === 0) {
      // Seed documents
      await prisma.document.createMany({
        data: DEFAULT_DOCUMENTS.map(name => ({ name }))
      })
    } else {
      // Optional: Check for missing default documents and add them
      // This is useful if we add new defaults later
      const existing = await prisma.document.findMany({
        select: { name: true }
      })
      const existingNames = new Set(existing.map(d => d.name))
      const missing = DEFAULT_DOCUMENTS.filter(name => !existingNames.has(name))
      
      if (missing.length > 0) {
        await prisma.document.createMany({
          data: missing.map(name => ({ name }))
        })
      }
    }

    const documents = await prisma.document.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('[DOCUMENTS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check permission (assuming admin or similar)
    // const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
    // if (!isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const body = await req.json()
    const { id, docNo, revDate, description } = body

    if (!id) {
      return new NextResponse('Missing ID', { status: 400 })
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        docNo,
        revDate,
        description
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('[DOCUMENTS_UPDATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

