// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prismaImported from '@/lib/db';
import { PrismaClient } from '@prisma/client';
import { ROLES } from '@/lib/constants/roles';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = prismaImported ?? new PrismaClient();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where = {};
    
    // Filter by search query
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    // Filter by active status if requested (for RFQ creation)
    if (activeOnly) {
      where.isActive = true;
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
    });

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is purchase_manager or above
    const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only purchase managers can add vendors' }, { status: 403 });
    }

    const prisma = prismaImported ?? new PrismaClient();
    const body = await req.json();
    const { name, email, phone, address } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if vendor with this email already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email }
    });

    if (existingVendor) {
      return NextResponse.json({ error: 'Vendor with this email already exists' }, { status: 400 });
    }

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        isActive: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VENDOR_CREATED',
        details: `Vendor "${name}" created by ${session.user.email}`,
      }
    });

    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor: ' + error.message }, { status: 500 });
  }
}
