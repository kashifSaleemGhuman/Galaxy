import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { hash, compare } from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Start a transaction to update password and create history
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Save old password to history
      await tx.passwordHistory.create({
        data: {
          userId: user.id,
          password: user.password
        }
      });

      // Update user password
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          isFirstLogin: false,
          updatedAt: new Date()
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGE',
          details: 'Password changed by user',
          ipAddress: req.headers.get('x-forwarded-for') || req.ip,
          userAgent: req.headers.get('user-agent')
        }
      });

      return updated;
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Log the successful password change
    console.log('Password changed successfully for user:', session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      email: session.user.email // Return email for re-authentication
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
