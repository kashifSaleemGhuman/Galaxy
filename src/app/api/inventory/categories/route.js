import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/inventory/categories - Get all product categories
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Our schema stores category as a scalar on Product; derive distinct values
    const products = await prisma.product.findMany({
      select: { category: true }
    })
    const names = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()
    const categories = names.map((name) => ({ id: name, name, description: null }))

    return NextResponse.json(categories)
    
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
