import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

const ALLOWED_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Helper function to check if user has permission to manage users
async function checkPermission() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { allowed: false, error: 'Unauthorized' };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
    return { allowed: false, error: 'Insufficient permissions' };
  }

  // Super admin can manage all users
  // Admin can't manage super admin users
  return {
    allowed: true,
    isSuperAdmin: currentUser.role === ROLES.SUPER_ADMIN,
    currentUser
  };
}

export async function GET() {
  try {
    const permission = await checkPermission();
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.error }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true
      },
      where: permission.isSuperAdmin ? {} : {
        role: { not: ROLES.SUPER_ADMIN }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const permission = await checkPermission();
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.error }, { status: 403 });
    }

    const { name, email, role, isActive } = await req.json();

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Non-super admin users can't create super admin accounts
    if (!permission.isSuperAdmin && role === ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions to create super admin' }, { status: 403 });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword, 12);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
          isActive: isActive ?? true,
          isFirstLogin: true
        }
      });

      await tx.auditLog.create({
        data: {
          userId: permission.currentUser.id,
          action: 'CREATE_USER',
          details: `Created user: ${email} with role: ${role}`,
        }
      });

      return user;
    });

    // TODO: Send email to user with temporary password

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isActive: newUser.isActive,
        tempPassword // Only for development, remove in production
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const permission = await checkPermission();
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.error }, { status: 403 });
    }

    const { id, name, role, isActive } = await req.json();

    // Validate required fields
    if (!id || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Non-super admin users can't modify super admin accounts
    if (!permission.isSuperAdmin && targetUser.role === ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions to modify super admin' }, { status: 403 });
    }

    // Non-super admin users can't grant super admin role
    if (!permission.isSuperAdmin && role === ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions to grant super admin role' }, { status: 403 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { name, role, isActive }
      });

      await tx.auditLog.create({
        data: {
          userId: permission.currentUser.id,
          action: 'UPDATE_USER',
          details: `Updated user: ${user.email}, Role: ${role}, Active: ${isActive}`,
        }
      });

      return user;
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}