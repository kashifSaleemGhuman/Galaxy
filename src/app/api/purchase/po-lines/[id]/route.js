import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const line = await prisma.pO_Line.findUnique({ where: { poLineId: id } })
    if (!line) {
      return NextResponse.json({ success: false, error: 'PO Line not found' }, { status: 404 })
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
    const { po_id, product_id, quantity_ordered, quantity_received, price } = body

    const updated = await prisma.pO_Line.update({
      where: { poLineId: id },
      data: {
        poId: po_id ?? undefined,
        productId: product_id ?? undefined,
        quantityOrdered: quantity_ordered != null ? Number(quantity_ordered) : undefined,
        quantityReceived: quantity_received != null ? Number(quantity_received) : undefined,
        price: price != null ? Number(price) : undefined,
      },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'PO Line not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.pO_Line.delete({ where: { poLineId: id } })
    return NextResponse.json({ success: true, message: 'PO Line deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'PO Line not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


