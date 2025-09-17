import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supplier = await prisma.supplier.findUnique({ where: { supplierId: id } })
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: supplier })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, contact_info, email, phone } = body

    const updated = await prisma.supplier.update({
      where: { supplierId: id },
      data: {
        name: name ?? undefined,
        contactInfo: contact_info ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
      },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.supplier.delete({ where: { supplierId: id } })
    return NextResponse.json({ success: true, message: 'Supplier deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
