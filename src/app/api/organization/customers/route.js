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

    const customers = await prisma.organizationCustomer.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('[CUSTOMERS_GET]', error)
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
      name,
      address,
      phone,
      email,
      registrationNo,
      taxId
    } = body

    // Basic validation
    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const customer = await prisma.organizationCustomer.create({
      data: {
        name,
        address,
        phone,
        email,
        registrationNo,
        taxId
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('[CUSTOMERS_POST]', error)
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

