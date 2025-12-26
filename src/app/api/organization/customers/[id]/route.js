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

    const customer = await prisma.organizationCustomer.findUnique({
      where: { id }
    })

    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('[CUSTOMER_GET]', error)
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

    const customer = await prisma.organizationCustomer.update({
      where: { id },
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
    console.error('[CUSTOMER_UPDATE]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
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

    await prisma.organizationCustomer.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CUSTOMER_DELETE]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

