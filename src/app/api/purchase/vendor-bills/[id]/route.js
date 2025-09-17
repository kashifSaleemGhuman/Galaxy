import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const b = await prisma.vendorBill.findUnique({ where: { billId: id } })
    if (!b) {
      return NextResponse.json({ success: false, error: 'Vendor Bill not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { bill_id: b.billId, po_id: b.poId, date_billed: b.dateBilled.toISOString().split('T')[0], amount: Number(b.amount), status: b.status } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { po_id, amount, status, date_billed } = body

    const updated = await prisma.vendorBill.update({
      where: { billId: id },
      data: {
        poId: po_id ?? undefined,
        amount: amount != null ? Number(amount) : undefined,
        status: status ?? undefined,
        dateBilled: date_billed ? new Date(date_billed) : undefined,
      },
    })
    return NextResponse.json({ success: true, data: { bill_id: updated.billId, po_id: updated.poId, date_billed: updated.dateBilled.toISOString().split('T')[0], amount: Number(updated.amount), status: updated.status } })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Vendor Bill not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.vendorBill.delete({ where: { billId: id } })
    return NextResponse.json({ success: true, message: 'Vendor Bill deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Vendor Bill not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
