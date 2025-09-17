import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const po_id = searchParams.get('po_id')
    const where = po_id ? { poId: po_id } : {}
    const lines = await prisma.pO_Line.findMany({ where })
    return NextResponse.json({ success: true, data: lines })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { po_line_id, po_id, product_id, quantity_ordered, quantity_received = 0, price } = body

    if (!po_id || !product_id || quantity_ordered == null || price == null) {
      return NextResponse.json({ success: false, error: 'po_id, product_id, quantity_ordered, price required' }, { status: 400 })
    }

    const created = await prisma.pO_Line.create({
      data: {
        poLineId: po_line_id ?? undefined,
        poId: po_id,
        productId: product_id,
        quantityOrdered: Number(quantity_ordered),
        quantityReceived: Number(quantity_received ?? 0),
        price: Number(price),
      },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
