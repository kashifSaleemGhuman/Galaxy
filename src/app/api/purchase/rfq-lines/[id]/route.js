import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const line = await prisma.rFQ_Line.findUnique({ where: { rfqLineId: id } })
    if (!line) {
      return NextResponse.json({ success: false, error: 'RFQ Line not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: line })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { rfq_id, product_id, quantity, price } = body

    const updated = await prisma.rFQ_Line.update({
      where: { rfqLineId: id },
      data: {
        rfqId: rfq_id ?? undefined,
        productId: product_id ?? undefined,
        quantity: quantity != null ? Number(quantity) : undefined,
        price: price != null ? Number(price) : undefined,
      },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'RFQ Line not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.rFQ_Line.delete({ where: { rfqLineId: id } })
    return NextResponse.json({ success: true, message: 'RFQ Line deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'RFQ Line not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
