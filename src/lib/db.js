import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  try {
    // In production with Prisma Accelerate, use PRISMA_DATABASE_URL if available
    // Otherwise, Prisma will use DATABASE_URL from the schema
    const config = {
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    };

    // Priority: Use DATABASE_URL if it points to production, otherwise use PRISMA_DATABASE_URL
    // This allows connecting to production DB locally for development
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('db.prisma.io')) {
      // If DATABASE_URL points to production (Prisma hosted), use it directly
      config.datasources = {
        db: {
          url: process.env.DATABASE_URL,
        },
      };
      console.log('Using production DATABASE_URL for database connection');
    } else if (process.env.PRISMA_DATABASE_URL && process.env.PRISMA_DATABASE_URL.startsWith('postgres://')) {
      // Use PRISMA_DATABASE_URL if it's a direct postgres connection (not Accelerate)
      config.datasources = {
        db: {
          url: process.env.PRISMA_DATABASE_URL,
        },
      };
      console.log('Using PRISMA_DATABASE_URL (direct postgres) for database connection');
    } else if (process.env.PRISMA_DATABASE_URL && process.env.PRISMA_DATABASE_URL.startsWith('prisma+postgres://')) {
      // Use Prisma Accelerate URL for queries (read-only for schema operations)
      config.datasources = {
        db: {
          url: process.env.PRISMA_DATABASE_URL,
        },
      };
      console.log('Using PRISMA_DATABASE_URL (Accelerate) for database connection');
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
if (!globalForPrisma.prismaNew) {
  globalForPrisma.prismaNew = prismaClientSingleton();
}

const prisma = globalForPrisma.prismaNew;

export { prisma };
export default prisma;