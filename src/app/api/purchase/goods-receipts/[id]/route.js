import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const r = await prisma.goodsReceipt.findUnique({ where: { receiptId: id } })
    if (!r) {
      return NextResponse.json({ success: false, error: 'Goods Receipt not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { receipt_id: r.receiptId, po_id: r.poId, date_received: r.dateReceived?.toISOString().split('T')[0] ?? null, status: r.status } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { po_id, status, date_received } = body

    const updated = await prisma.goodsReceipt.update({
      where: { receiptId: id },
      data: {
        poId: po_id ?? undefined,
        status: status ?? undefined,
        dateReceived: date_received ? new Date(date_received) : undefined,
      },
    })
    return NextResponse.json({ success: true, data: { receipt_id: updated.receiptId, po_id: updated.poId, date_received: updated.dateReceived?.toISOString().split('T')[0] ?? null, status: updated.status } })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Goods Receipt not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.goodsReceipt.delete({ where: { receiptId: id } })
    return NextResponse.json({ success: true, message: 'Goods Receipt deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Goods Receipt not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
