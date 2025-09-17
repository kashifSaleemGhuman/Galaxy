import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const p = await prisma.product.findUnique({ where: { id } })
    if (!p) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { product_id: p.id, name: p.name, sku: p.sku, unit_of_measure: p.unitOfMeasure, default_price: p.defaultPrice ?? Number(p.price) } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, sku, unit_of_measure, default_price } = body

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? undefined,
        sku: sku ?? undefined,
        unitOfMeasure: unit_of_measure ?? undefined,
        defaultPrice: default_price ?? undefined,
        price: default_price ?? undefined,
      },
    })
    return NextResponse.json({ success: true, data: { product_id: updated.id, name: updated.name, sku: updated.sku, unit_of_measure: updated.unitOfMeasure, default_price: updated.defaultPrice ?? Number(updated.price) } })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
