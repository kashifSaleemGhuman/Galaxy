import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Returns best unit price for a supplier/product/qty, considering min_qty and date validity
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const supplier_id = searchParams.get('supplier_id')
    const product_id = searchParams.get('product_id')
    const qty = Number(searchParams.get('qty') || 1)

    if (!supplier_id || !product_id) {
      return NextResponse.json({ success: false, error: 'supplier_id and product_id are required' }, { status: 400 })
    }

    const today = new Date()
    const lists = await prisma.supplierPriceList.findMany({
      where: {
        supplierId: supplier_id,
        productId: product_id,
        minQty: { lte: qty },
        OR: [
          { validFrom: null },
          { validFrom: { lte: today } },
        ],
        OR: [
          { validTo: null },
          { validTo: { gte: today } },
        ],
      },
      orderBy: [
        { price: 'asc' },
        { minQty: 'desc' },
      ],
      take: 1,
    })

    const best = lists[0] || null
    return NextResponse.json({ success: true, data: best })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


