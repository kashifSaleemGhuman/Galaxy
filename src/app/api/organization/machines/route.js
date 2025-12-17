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

    // Ensure prisma is available before using it
    if (!prisma) {
      console.error('[MACHINES_GET] Prisma client is undefined');
      return new NextResponse('Database connection error', { status: 500 });
    }

    const machines = await prisma.machine.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(machines)
  } catch (error) {
    console.error('[MACHINES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Ensure prisma is available before using it
    if (!prisma) {
        console.error('[MACHINES_POST] Prisma client is undefined');
        return new NextResponse('Database connection error', { status: 500 });
    }

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

    const machine = await prisma.machine.create({
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
    console.error('[MACHINES_POST]', error)
    if (error.code === 'P2002') {
      return new NextResponse('Machine ID already exists', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

