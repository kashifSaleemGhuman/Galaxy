import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const rfq_id = searchParams.get('rfq_id')
    const where = rfq_id ? { rfqId: rfq_id } : {}
    const lines = await prisma.rFQItem.findMany({ where })
    return NextResponse.json({ success: true, data: lines })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { rfq_line_id, rfq_id, product_id, quantity, price } = body

    if (!rfq_id || !product_id || quantity == null || price == null) {
      return NextResponse.json({ success: false, error: 'rfq_id, product_id, quantity, price required' }, { status: 400 })
    }

    const created = await prisma.rFQItem.create({
      data: {
        rfqLineId: rfq_line_id ?? undefined,
        rfqId: rfq_id,
        productId: product_id,
        quantity: Number(quantity),
        price: Number(price),
      },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
