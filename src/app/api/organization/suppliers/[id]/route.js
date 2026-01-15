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

    const supplier = await prisma.organizationSupplier.findUnique({
      where: { id }
    })

    if (!supplier) {
      return new NextResponse('Supplier not found', { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('[SUPPLIER_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
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

    const supplier = await prisma.organizationSupplier.update({
      where: { id },
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
    console.error('[SUPPLIER_UPDATE]', error)
    if (error.code === 'P2025') {
      return new NextResponse('Supplier not found', { status: 404 })
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

    const { id } = params

    await prisma.organizationSupplier.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[SUPPLIER_DELETE]', error)
    if (error.code === 'P2025') {
      return new NextResponse('Supplier not found', { status: 404 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

