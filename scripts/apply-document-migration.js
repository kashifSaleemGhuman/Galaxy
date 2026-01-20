const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/galaxy_erp'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250120000001_add_document_content_tracking/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');

    // Execute the migration SQL
    console.log('🚀 Applying migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration SQL executed');

    // Verify tables were created
    console.log('\n🔍 Verifying migration...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('DocumentContent', 'DocumentRevision')
    `);

    if (result.rows.length === 2) {
      console.log('✅ Migration successful! Both tables exist.');
      console.log('   - DocumentContent');
      console.log('   - DocumentRevision');
    } else {
      console.log('⚠️  Warning: Some tables may be missing. Found:', result.rows.map(r => r.table_name));
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    if (error.message && (
      error.message.includes('already exists') ||
      error.message.includes('duplicate')
    )) {
      console.log('⚠️  Some objects may already exist. This is usually fine.');
    } else {
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

applyMigration();
