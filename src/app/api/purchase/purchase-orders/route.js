import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.purchaseOrder.findMany({ include: { supplier: true } })
    const shaped = data.map(p => ({
      po_id: p.poId,
      rfq_id: p.rfqId,
      supplier_id: p.supplierId,
      date_created: p.dateCreated.toISOString().split('T')[0],
      status: p.status,
      supplier_name: p.supplier?.name,
    }))
    return NextResponse.json({ success: true, data: shaped })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { po_id, rfq_id, supplier_id, status = 'Draft' } = body

    if (!supplier_id) {
      return NextResponse.json({ success: false, error: 'supplier_id is required' }, { status: 400 })
    }

    const created = await prisma.purchaseOrder.create({
      data: {
        poId: po_id ?? undefined,
        rfqId: rfq_id ?? null,
        supplierId: supplier_id,
        status,
      },
    })

    return NextResponse.json({ success: true, data: { po_id: created.poId, rfq_id: created.rfqId, supplier_id: created.supplierId, date_created: created.dateCreated.toISOString().split('T')[0], status: created.status } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
