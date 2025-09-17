import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.supplier.findMany()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { supplier_id, name, contact_info, email, phone } = body

    if (!supplier_id || !name || !email) {
      return NextResponse.json({ success: false, error: 'supplier_id, name and email are required' }, { status: 400 })
    }

    const created = await prisma.supplier.create({
      data: {
        supplierId: supplier_id,
        name,
        contactInfo: contact_info ?? null,
        email,
        phone: phone ?? null,
      },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
