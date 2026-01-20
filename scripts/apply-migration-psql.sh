#!/bin/bash

# Script to apply database migration using psql
# This script reads the DATABASE_URL from .env or environment and applies the migration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$PROJECT_DIR/prisma/migrations/20250120000001_add_document_content_tracking/migration.sql"

echo "🚀 Starting database migration..."

# Load .env file if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source <(grep -v '^#' "$PROJECT_DIR/.env" | grep -v '^$' | sed 's/^/export /')
    set +a
fi

# Extract database connection details from DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment"
    exit 1
fi

# Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
# For Prisma hosted: postgres://user:pass@db.prisma.io:5432/db?sslmode=require
DB_URL="$DATABASE_URL"

# Remove postgresql:// or postgres:// prefix
DB_URL="${DB_URL#postgresql://}"
DB_URL="${DB_URL#postgres://}"

# Extract parts
if [[ "$DB_URL" == *"@"* ]]; then
    # Has authentication
    AUTH_PART="${DB_URL%%@*}"
    REST="${DB_URL#*@}"
    
    if [[ "$AUTH_PART" == *":"* ]]; then
        DB_USER="${AUTH_PART%%:*}"
        DB_PASS="${AUTH_PART#*:}"
    else
        DB_USER="$AUTH_PART"
        DB_PASS=""
    fi
else
    DB_USER="postgres"
    DB_PASS=""
    REST="$DB_URL"
fi

# Extract host, port, and database
if [[ "$REST" == *"/"* ]]; then
    HOST_PORT="${REST%%/*}"
    DB_NAME="${REST#*/}"
    # Remove query parameters
    DB_NAME="${DB_NAME%%\?*}"
else
    HOST_PORT="$REST"
    DB_NAME="postgres"
fi

if [[ "$HOST_PORT" == *":"* ]]; then
    DB_HOST="${HOST_PORT%%:*}"
    DB_PORT="${HOST_PORT#*:}"
    # Remove query parameters from port
    DB_PORT="${DB_PORT%%\?*}"
else
    DB_HOST="$HOST_PORT"
    DB_PORT="5432"
fi

# Check for SSL requirement
SSL_MODE=""
if [[ "$DATABASE_URL" == *"sslmode=require"* ]] || [[ "$DATABASE_URL" == *"db.prisma.io"* ]]; then
    SSL_MODE="sslmode=require"
fi

echo "📋 Connection details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Applying migration from: $MIGRATION_FILE"
echo ""

# Set PGPASSWORD if password is provided
if [ -n "$DB_PASS" ]; then
    export PGPASSWORD="$DB_PASS"
fi

# Apply migration using psql with SSL if needed
PSQL_CMD="psql"
if [ -n "$SSL_MODE" ] || [[ "$DATABASE_URL" == *"db.prisma.io"* ]]; then
    export PGSSLMODE=require
    export PGSSLROOTCERT=""
fi

# Use connection string directly if it's complex
if [[ "$DATABASE_URL" == *"db.prisma.io"* ]] || [[ "$DATABASE_URL" == *"sslmode"* ]]; then
    echo "🔐 Using SSL connection..."
    $PSQL_CMD "$DATABASE_URL" -f "$MIGRATION_FILE" 2>&1 | grep -v "already exists" | grep -v "duplicate" | grep -v "NOTICE" || true
else
    $PSQL_CMD -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE" 2>&1 | grep -v "already exists" | grep -v "duplicate" | grep -v "NOTICE" || true
fi

# Verify tables were created
echo ""
echo "🔍 Verifying migration..."
if [[ "$DATABASE_URL" == *"db.prisma.io"* ]] || [[ "$DATABASE_URL" == *"sslmode"* ]]; then
    $PSQL_CMD "$DATABASE_URL" -c "\dt DocumentContent DocumentRevision" 2>&1 | grep -v "NOTICE" || true
else
    $PSQL_CMD -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt DocumentContent DocumentRevision" 2>&1 | grep -v "NOTICE" || true
fi

echo ""
echo "✅ Migration completed!"
echo "💡 Please restart your Next.js server for changes to take effect."

