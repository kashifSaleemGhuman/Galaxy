import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const materials = await prisma.organizationMaterial.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error('[MATERIALS_GET]', error)
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const {
      description,
      size,
      unitOfMeasurement,
      thickness,
      weight,
      customField,
      packaging,
      ghsSymbolImage,
      hsCode,
      hazardClassification,
      materialOrigin,
      oem,
      usage,
      process,
      department,
      materialType
    } = body

    const material = await prisma.organizationMaterial.create({
      data: {
        description,
        size,
        unitOfMeasurement,
        thickness,
        weight,
        customField,
        packaging,
        ghsSymbolImage,
        hsCode,
        hazardClassification,
        materialOrigin,
        oem,
        usage,
        process,
        department,
        materialType
      }
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error('[MATERIALS_POST]', error)
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

