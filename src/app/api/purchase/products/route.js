// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where = {};
    
    // Filter by active status if requested (for RFQ creation)
    if (activeOnly) {
      where.isActive = true;
    }

    const data = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    // Shape to ERD-like keys for backward compatibility
    const shaped = data.map(p => ({
      product_id: p.id,
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      unit: p.unit,
      isActive: p.isActive,
    }));

    return NextResponse.json({ success: true, data: shaped });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions using unified permission system
    if (!hasPermission(session.user.role, PERMISSIONS.PURCHASE.MANAGE_PRODUCTS)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to manage products' }, { status: 403 });
    }

    const body = await request.json();
    const { product_id, name, description, category, unit } = body;

    // Validation
    if (!name || !unit) {
      return NextResponse.json({ success: false, error: 'Name and unit are required' }, { status: 400 });
    }

    // Check if product with this name already exists
    const existingProduct = await prisma.product.findFirst({
      where: { name }
    });

    if (existingProduct) {
      return NextResponse.json({ success: false, error: 'Product with this name already exists' }, { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        name,
        description: description ?? null,
        category: category ?? null,
        unit: unit ?? 'pcs',
        isActive: true
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PRODUCT_CREATED',
        details: `Product "${name}" created by ${session.user.email}`,
      }
    });

    // Return in both formats for backward compatibility
    return NextResponse.json({ 
      success: true, 
      product: created,
      data: { 
        product_id: created.id, 
        id: created.id,
        name: created.name, 
        description: created.description, 
        category: created.category, 
        unit: created.unit,
        isActive: created.isActive
      } 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
