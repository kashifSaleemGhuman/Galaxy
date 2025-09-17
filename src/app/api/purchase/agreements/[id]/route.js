import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const agr = await prisma.purchaseAgreement.findUnique({ where: { id: params.id }, include: { lines: true, supplier: true } })
    if (!agr) return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: agr })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { agreement_no, supplier_id, start_date, end_date, status } = body
    const updated = await prisma.purchaseAgreement.update({
      where: { id: params.id },
      data: {
        agreementNo: agreement_no ?? undefined,
        supplierId: supplier_id ?? undefined,
        startDate: start_date ? new Date(start_date) : undefined,
        endDate: end_date ? new Date(end_date) : undefined,
        status: status ?? undefined,
      },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.purchaseAgreement.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Agreement deleted' })
  } catch (error) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


