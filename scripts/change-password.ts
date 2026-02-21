import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const rawSecret = process.env.EMPLOYEE_CREDENTIALS_SECRET || process.env.NEXTAUTH_SECRET;
  if (!rawSecret) {
    throw new Error('Missing EMPLOYEE_CREDENTIALS_SECRET or NEXTAUTH_SECRET');
  }
  return crypto.createHash('sha256').update(rawSecret).digest();
}

function encryptEmployeePassword(password: string) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedPassword: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: ALGORITHM
  };
}

async function changeUserPassword(email: string, newPassword: string) {
  try {
    console.log(`🔐 Changing password for user: ${email}\n`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: {
          select: { id: true }
        }
      }
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

      if (user.employee) {
        const encryptedCredential = encryptEmployeePassword(newPassword);
        await tx.employeeCredential.upsert({
          where: { userId: user.id },
          update: encryptedCredential,
          create: {
            userId: user.id,
            ...encryptedCredential
          }
        });
      }

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

  } catch (error: any) {
    console.error('❌ Error changing password:', error.message);
    throw error;
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npm run change-password <email> <new-password>');
  console.log('\nExample:');
  console.log('  npm run change-password admin@galaxy.com newpassword123');
  console.log('\nOr using ts-node directly:');
  console.log('  ts-node --compiler-options \'{"module":"CommonJS"}\' scripts/change-password.ts admin@galaxy.com newpassword123');
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

