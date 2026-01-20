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

    const suppliers = await prisma.organizationSupplier.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('[SUPPLIERS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
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
      taxId,
      taxNo,
      bankDetails,
      bankName,
      bankAddress,
      ibanNo,
      swiftCode,
      accountTitle
    } = body

    // Basic validation
    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const supplier = await prisma.organizationSupplier.create({
      data: {
        name,
        address,
        phone,
        email,
        registrationNo,
        taxId,
        taxNo,
        bankDetails,
        bankName,
        bankAddress,
        ibanNo,
        swiftCode,
        accountTitle
      }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('[SUPPLIERS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

