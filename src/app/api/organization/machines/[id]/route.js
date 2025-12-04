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

    // Ensure prisma is available before using it
    if (!prisma) {
        console.error('[MACHINE_GET] Prisma client is undefined');
        return new NextResponse('Database connection error', { status: 500 });
    }

    const { id } = params

    const machine = await prisma.machine.findUnique({
      where: { id }
    })

    if (!machine) {
      return new NextResponse('Machine not found', { status: 404 })
    }

    return NextResponse.json(machine)
  } catch (error) {
    console.error('[MACHINE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Ensure prisma is available before using it
    if (!prisma) {
        console.error('[MACHINE_UPDATE] Prisma client is undefined');
        return new NextResponse('Database connection error', { status: 500 });
    }

    const { id } = params
    const body = await req.json()
    const {
      serialNumber,
      machineId,
      name,
      quantity,
      motorDetails,
      powerRating,
      airPressure,
      modelNumber,
      manufacturingYear,
      length,
      width,
      height,
      steamTemp,
      steamConsumption,
      electricityRating,
      operationType,
      department,
      status,
      remarks
    } = body

    // Basic validation
    if (!machineId || !name) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        serialNumber,
        machineId,
        name,
        quantity: quantity ? parseInt(quantity) : 1,
        motorDetails,
        powerRating,
        airPressure,
        modelNumber,
        manufacturingYear,
        length,
        width,
        height,
        steamTemp,
        steamConsumption,
        electricityRating,
        operationType,
        department,
        status,
        remarks
      }
    })

    return NextResponse.json(machine)
  } catch (error) {
    console.error('[MACHINE_UPDATE]', error)
    if (error.code === 'P2002') {
      return new NextResponse('Machine ID already exists', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Ensure prisma is available before using it
    if (!prisma) {
        console.error('[MACHINE_DELETE] Prisma client is undefined');
        return new NextResponse('Database connection error', { status: 500 });
    }

    const { id } = params

    await prisma.machine.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[MACHINE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

