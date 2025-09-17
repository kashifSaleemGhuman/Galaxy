import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.product.findMany()
    // Shape to ERD-like keys
    const shaped = data.map(p => ({
      product_id: p.id,
      name: p.name,
      sku: p.sku,
      unit_of_measure: p.unitOfMeasure,
      default_price: p.defaultPrice ?? Number(p.price),
    }))
    return NextResponse.json({ success: true, data: shaped })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { product_id, name, sku, unit_of_measure, default_price } = body

    if (!name || !sku) {
      return NextResponse.json({ success: false, error: 'name and sku are required' }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        id: product_id ?? undefined,
        name,
        sku,
        unitOfMeasure: unit_of_measure ?? null,
        defaultPrice: default_price != null ? default_price : null,
        price: default_price != null ? default_price : 0,
        tenantId: 'default-tenant',
      },
    })

    return NextResponse.json({ success: true, data: { product_id: created.id, name: created.name, sku: created.sku, unit_of_measure: created.unitOfMeasure, default_price: created.defaultPrice ?? Number(created.price) } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
