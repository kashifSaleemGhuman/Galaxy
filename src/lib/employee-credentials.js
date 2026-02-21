import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const rawSecret = process.env.EMPLOYEE_CREDENTIALS_SECRET || process.env.NEXTAUTH_SECRET;
  if (!rawSecret) {
    throw new Error('Missing EMPLOYEE_CREDENTIALS_SECRET or NEXTAUTH_SECRET');
  }

  // Derive a fixed 32-byte key from secret text.
  return crypto.createHash('sha256').update(rawSecret).digest();
}

export function encryptEmployeePassword(password) {
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

export function decryptEmployeePassword(record) {
  if (!record?.encryptedPassword || !record?.iv || !record?.authTag) {
    return null;
  }

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    record.algorithm || ALGORITHM,
    key,
    Buffer.from(record.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(record.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(record.encryptedPassword, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}


