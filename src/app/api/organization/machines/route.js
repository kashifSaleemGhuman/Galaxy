import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let session
    try {
      session = await getServerSession(authOptions)
    } catch (authErr) {
      console.error('[Machines GET] getServerSession error:', authErr)
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
    }
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      console.error('[MACHINES_GET] Prisma client is undefined')
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
    }

    const machines = await prisma.machine.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(machines)
  } catch (error) {
    console.error('[MACHINES_GET]', error)
    return NextResponse.json({ error: error?.message || 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      console.error('[MACHINES_POST] Prisma client is undefined')
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      return NextResponse.json({ error: 'Machine ID already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: error?.message || 'Internal Error' }, { status: 500 })
  }
}

