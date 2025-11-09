// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data });
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

    // Check if user is purchase_manager or above
    const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only purchase managers can add products' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, unit } = body;

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
        description: description || null,
        category: category || null,
        unit,
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

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
