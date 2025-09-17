import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.purchaseAgreement.findMany({ include: { lines: true, supplier: true } })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { agreement_no, supplier_id, start_date, end_date, status = 'active', lines = [] } = body

    if (!supplier_id || !start_date || !end_date) {
      return NextResponse.json({ success: false, error: 'supplier_id, start_date, end_date are required' }, { status: 400 })
    }

    const created = await prisma.purchaseAgreement.create({
      data: {
        agreementNo: agreement_no ?? `AGR-${Date.now()}`,
        supplierId: supplier_id,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        status,
        lines: lines.length ? {
          create: lines.map((l) => ({ productId: l.product_id, price: l.price, minQty: l.min_qty ?? 1, maxQty: l.max_qty ?? null }))
        } : undefined,
      },
      include: { lines: true },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


