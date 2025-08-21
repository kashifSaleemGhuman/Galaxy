-- Initialize Galaxy ERP Database
-- This script only creates the database and extensions
-- The actual schema will be created by Prisma

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- The database 'galaxy_erp' is already created by the POSTGRES_DB environment variable
-- Tables will be created by Prisma when we run the migration 