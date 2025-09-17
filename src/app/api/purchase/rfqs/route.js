import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.requestForQtn.findMany({ include: { supplier: true } })
    const shaped = data.map(r => ({
      rfq_id: r.rfqId,
      supplier_id: r.supplierId,
      date_created: r.dateCreated.toISOString().split('T')[0],
      status: r.status,
      supplier_name: r.supplier?.name,
    }))
    return NextResponse.json({ success: true, data: shaped })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { rfq_id, supplier_id, status = 'Draft' } = body

    if (!supplier_id) {
      return NextResponse.json({ success: false, error: 'supplier_id is required' }, { status: 400 })
    }

    const created = await prisma.requestForQtn.create({
      data: {
        rfqId: rfq_id ?? undefined,
        supplierId: supplier_id,
        status,
      },
    })

    return NextResponse.json({ success: true, data: { rfq_id: created.rfqId, supplier_id: created.supplierId, date_created: created.dateCreated.toISOString().split('T')[0], status: created.status } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
