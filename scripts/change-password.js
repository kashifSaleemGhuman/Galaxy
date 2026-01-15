const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function changeUserPassword(email, newPassword) {
  try {
    console.log(`🔐 Changing password for user: ${email}\n`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name || email} (${user.role})`);

    // Hash the new password
    console.log('🔒 Hashing new password...');
    const hashedPassword = await hash(newPassword, 12);

    // Update password in a transaction
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
          details: 'Password changed via script',
          ipAddress: '127.0.0.1',
          userAgent: 'change-password-script'
        }
      });

      return updated;
    });

    console.log('\n✅ Password changed successfully!');
    console.log(`📧 User: ${updatedUser.email}`);
    console.log(`👤 Name: ${updatedUser.name || 'N/A'}`);
    console.log(`🔑 New password has been set`);
    console.log('\n💡 The user can now login with the new password.');

  } catch (error) {
    console.error('❌ Error changing password:', error.message);
    throw error;
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/change-password.js <email> <new-password>');
  console.log('\nExample:');
  console.log('  node scripts/change-password.js admin@galaxy.com newpassword123');
  process.exit(1);
}

const [email, newPassword] = args;

if (!email || !newPassword) {
  console.error('❌ Both email and password are required');
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error('❌ Password must be at least 8 characters long');
  process.exit(1);
}

changeUserPassword(email, newPassword)
  .catch((e) => {
    console.error('❌ Failed to change password:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

