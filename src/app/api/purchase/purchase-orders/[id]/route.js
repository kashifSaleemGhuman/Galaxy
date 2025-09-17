import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const po = await prisma.purchaseOrder.findUnique({ where: { poId: id }, include: { lines: true, supplier: true } })
    if (!po) {
      return NextResponse.json({ success: false, error: 'Purchase Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {
      po_id: po.poId,
      rfq_id: po.rfqId,
      supplier_id: po.supplierId,
      date_created: po.dateCreated.toISOString().split('T')[0],
      status: po.status,
      lines: po.lines,
      supplier_name: po.supplier?.name,
    } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { rfq_id, supplier_id, status } = body

    const updated = await prisma.purchaseOrder.update({
      where: { poId: id },
      data: {
        rfqId: rfq_id ?? undefined,
        supplierId: supplier_id ?? undefined,
        status: status ?? undefined,
      },
    })
    return NextResponse.json({ success: true, data: { po_id: updated.poId, rfq_id: updated.rfqId, supplier_id: updated.supplierId, date_created: updated.dateCreated.toISOString().split('T')[0], status: updated.status } })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Purchase Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.purchaseOrder.delete({ where: { poId: id } })
    return NextResponse.json({ success: true, message: 'Purchase Order deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Purchase Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
