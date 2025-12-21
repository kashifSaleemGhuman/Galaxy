import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    // Read mock inventory data
    const filePath = join(process.cwd(), 'public', 'data', 'mock-inventory.json');
    const fileContents = await readFile(filePath, 'utf8');
    let products = JSON.parse(fileContents);

    // Filter by active status
    products = products.filter(p => p.isActive !== false);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Get total count before pagination
    const total = products.length;

    // Apply pagination
    const paginatedProducts = products.slice(skip, skip + limit);

    // Get unique categories for filter options
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      },
      categories,
      filters: {
        search,
        category
      }
    });
  } catch (error) {
    console.error('Error reading inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory products' },
      { status: 500 }
    );
  }
}

