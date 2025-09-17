import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.vendorBill.findMany()
    const shaped = data.map(b => ({ bill_id: b.billId, po_id: b.poId, date_billed: b.dateBilled.toISOString().split('T')[0], amount: Number(b.amount), status: b.status }))
    return NextResponse.json({ success: true, data: shaped })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { bill_id, po_id, amount, status = 'Draft', date_billed } = body

    if (!po_id || amount == null) {
      return NextResponse.json({ success: false, error: 'po_id and amount are required' }, { status: 400 })
    }

    const created = await prisma.vendorBill.create({
      data: {
        billId: bill_id ?? undefined,
        poId: po_id,
        amount,
        status,
        dateBilled: date_billed ? new Date(date_billed) : new Date(),
      },
    })

    return NextResponse.json({ success: true, data: { bill_id: created.billId, po_id: created.poId, date_billed: created.dateBilled.toISOString().split('T')[0], amount: Number(created.amount), status: created.status } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
