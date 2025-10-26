import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const r = await prisma.rFQ.findUnique({ where: { id }, include: { items: { include: { product: true } }, vendor: true, createdBy: true, approvedBy: true } })
    if (!r) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: {
      rfq_id: r.id,
      rfq_number: r.rfqNumber,
      vendor_id: r.vendorId,
      vendor_name: r.vendor?.name,
      created_by: r.createdBy?.name,
      order_deadline: r.orderDeadline.toISOString().split('T')[0],
      sent_date: r.sentDate?.toISOString().split('T')[0],
      status: r.status,
      vendor_price: r.vendorPrice,
      expected_delivery: r.expectedDelivery?.toISOString().split('T')[0],
      items: r.items?.map(item => ({
        id: item.id,
        product_id: item.productId,
        product_name: item.product?.name,
        quantity: item.quantity,
        unit: item.unit
      }))
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

    const updated = await prisma.rFQ.update({
      where: { id },
      data: {
        vendorId: supplier_id ?? undefined,
        status: status ?? undefined,
      },
    })
    return NextResponse.json({ success: true, data: { rfq_id: updated.id, vendor_id: updated.vendorId, order_deadline: updated.orderDeadline.toISOString().split('T')[0], status: updated.status } })
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
    await prisma.rFQ.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'RFQ deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
