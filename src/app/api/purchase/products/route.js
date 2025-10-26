import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.product.findMany()
    // Shape to ERD-like keys
    const shaped = data.map(p => ({
      product_id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      unit: p.unit,
      isActive: p.isActive,
    }))
    return NextResponse.json({ success: true, data: shaped })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { product_id, name, description, category, unit } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        id: product_id ?? undefined,
        name,
        description: description ?? null,
        category: category ?? null,
        unit: unit ?? 'pcs',
      },
    })

    return NextResponse.json({ success: true, data: { product_id: created.id, name: created.name, description: created.description, category: created.category, unit: created.unit } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
