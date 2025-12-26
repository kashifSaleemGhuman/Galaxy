import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params

    const material = await prisma.organizationMaterial.findUnique({
      where: { id }
    })

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error('[MATERIAL_GET]', error)
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params
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

    const material = await prisma.organizationMaterial.update({
      where: { id },
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
    console.error('[MATERIAL_UPDATE]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params

    await prisma.organizationMaterial.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[MATERIAL_DELETE]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

