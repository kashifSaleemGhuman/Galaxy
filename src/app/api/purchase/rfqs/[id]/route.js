import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const r = await prisma.requestForQtn.findUnique({ where: { rfqId: id }, include: { lines: true, supplier: true } })
    if (!r) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {
      rfq_id: r.rfqId,
      supplier_id: r.supplierId,
      date_created: r.dateCreated.toISOString().split('T')[0],
      status: r.status,
      lines: r.lines,
      supplier_name: r.supplier?.name,
    } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { supplier_id, status } = body

    const updated = await prisma.requestForQtn.update({
      where: { rfqId: id },
      data: {
        supplierId: supplier_id ?? undefined,
        status: status ?? undefined,
      },
    })
    return NextResponse.json({ success: true, data: { rfq_id: updated.rfqId, supplier_id: updated.supplierId, date_created: updated.dateCreated.toISOString().split('T')[0], status: updated.status } })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.requestForQtn.delete({ where: { rfqId: id } })
    return NextResponse.json({ success: true, message: 'RFQ deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
