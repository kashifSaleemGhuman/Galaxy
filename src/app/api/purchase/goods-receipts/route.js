import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.goodsReceipt.findMany()
    const shaped = data.map(r => ({
      receipt_id: r.receiptId,
      po_id: r.poId,
      date_received: r.dateReceived?.toISOString().split('T')[0] ?? null,
      status: r.status,
    }))
    return NextResponse.json({ success: true, data: shaped })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { receipt_id, po_id, status = 'Draft', date_received } = body

    if (!po_id) {
      return NextResponse.json({ success: false, error: 'po_id is required' }, { status: 400 })
    }

    const created = await prisma.goodsReceipt.create({
      data: {
        receiptId: receipt_id ?? undefined,
        poId: po_id,
        status,
        dateReceived: date_received ? new Date(date_received) : new Date(),
      },
    })

    return NextResponse.json({ success: true, data: { receipt_id: created.receiptId, po_id: created.poId, date_received: created.dateReceived?.toISOString().split('T')[0] ?? null, status: created.status } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
