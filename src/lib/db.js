import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // In production with Prisma Accelerate, use PRISMA_DATABASE_URL if available
  // Otherwise, Prisma will use DATABASE_URL from the schema
  const config = {
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  };

  // If PRISMA_DATABASE_URL is set, override the datasource URL
  if (process.env.PRISMA_DATABASE_URL) {
    config.datasources = {
      db: {
        url: process.env.PRISMA_DATABASE_URL,
      },
    };
  }

  return new PrismaClient(config);
};

// Ensure we only have one instance of Prisma Client
// In serverless environments (like Vercel), we need to cache it globally
const globalForPrisma = globalThis;

// Always cache in serverless environments to prevent connection pool exhaustion
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prismaClientSingleton();
}

const prisma = globalForPrisma.prisma;

export { prisma };
export default prisma;