import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  try {
    // In production with Prisma Accelerate, use PRISMA_DATABASE_URL if available
    // Otherwise, Prisma will use DATABASE_URL from the schema
    const config = {
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    };

    // If PRISMA_DATABASE_URL is set, override the datasource URL
    // This allows using Prisma Accelerate in production
    if (process.env.PRISMA_DATABASE_URL) {
      config.datasources = {
        db: {
          url: process.env.PRISMA_DATABASE_URL,
        },
      };
    }

    const client = new PrismaClient(config);
    
    // Test connection on initialization in production
    if (process.env.NODE_ENV === 'production') {
      client.$connect().catch(err => {
        console.error('Prisma connection error on init:', err.message);
      });
    }
    
    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
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