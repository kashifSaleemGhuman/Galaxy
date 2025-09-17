import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const supplier_id = searchParams.get('supplier_id')
    const product_id = searchParams.get('product_id')
    const where = {
      ...(supplier_id ? { supplierId: supplier_id } : {}),
      ...(product_id ? { productId: product_id } : {}),
    }
    const data = await prisma.supplierPriceList.findMany({ where })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { supplier_id, product_id, min_qty = 1, price, currency = 'USD', valid_from, valid_to, discount_pct } = body
    if (!supplier_id || !product_id || price == null) {
      return NextResponse.json({ success: false, error: 'supplier_id, product_id, price required' }, { status: 400 })
    }
    const created = await prisma.supplierPriceList.create({
      data: {
        supplierId: supplier_id,
        productId: product_id,
        minQty: Number(min_qty),
        price: Number(price),
        currency,
        validFrom: valid_from ? new Date(valid_from) : null,
        validTo: valid_to ? new Date(valid_to) : null,
        discountPct: discount_pct != null ? Number(discount_pct) : null,
      },
    })
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


