import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/inventory/warehouses/[id]/create-manager - Create a warehouse manager/operator
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only SUPER_ADMIN can create warehouse managers
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Only Super Admin can create warehouse managers' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        manager: true
      }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Check if warehouse already has a manager
    if (warehouse.managerId) {
      return NextResponse.json({ 
        error: 'Warehouse already has a manager. Please remove the existing manager first.' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 });
    }

    // Generate a secure random password
    const generatedPassword = crypto.randomBytes(12).toString('base64').slice(0, 12);
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    // Create the warehouse manager user
    const manager = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: ROLES.WAREHOUSE_OPERATOR,
        isFirstLogin: true,
        isActive: true
      }
    });

    // Assign manager to warehouse
    await prisma.warehouse.update({
      where: { id },
      data: {
        managerId: manager.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Warehouse manager created successfully',
      data: {
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          role: manager.role
        },
        credentials: {
          email: email,
          password: generatedPassword // Return plain password only once
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating warehouse manager:', error);
    return NextResponse.json({ 
      error: 'Failed to create warehouse manager',
      details: error.message 
    }, { status: 500 });
  }
}

// GET /api/inventory/warehouses/[id]/manager-credentials - Get manager credentials (only for viewing)
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only SUPER_ADMIN can view credentials
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Only Super Admin can view credentials' }, { status: 403 });
    }

    const { id } = params;

    // Get warehouse with manager
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        manager: true
      }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    if (!warehouse.manager) {
      return NextResponse.json({ 
        error: 'No manager assigned to this warehouse' 
      }, { status: 404 });
    }

    // Note: We cannot retrieve the original password as it's hashed
    // This endpoint just confirms the manager exists
    return NextResponse.json({
      success: true,
      data: {
        manager: {
          id: warehouse.manager.id,
          name: warehouse.manager.name,
          email: warehouse.manager.email,
          role: warehouse.manager.role
        },
        note: 'Password cannot be retrieved as it is securely hashed. Please reset password if needed.'
      }
    });

  } catch (error) {
    console.error('Error fetching manager credentials:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch manager credentials',
      details: error.message 
    }, { status: 500 });
  }
}


