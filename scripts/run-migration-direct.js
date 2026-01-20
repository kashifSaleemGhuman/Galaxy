// Direct migration runner - uses pg library to execute SQL
const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  // Use PRISMA_DATABASE_URL if available, otherwise DATABASE_URL
  let dbUrl = process.env.PRISMA_DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgres://')) {
    // Use PRISMA_DATABASE_URL
  } else {
    dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      dbUrl = dbUrl.replace(/^#\s*/, '').replace(/^"|"$/g, '');
    }
  }

  if (!dbUrl) {
    console.error('❌ No DATABASE_URL found in environment variables');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl && dbUrl.includes('db.prisma.io') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration SQL
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250120000001_add_document_content_tracking/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Reading migration file...');
    
    // Split SQL into statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} statements to execute\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✅ [${i + 1}/${statements.length}] Executed: ${statement.substring(0, 50).replace(/\n/g, ' ')}...`);
          successCount++;
        } catch (error) {
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.message.includes('IF NOT EXISTS')
          )) {
            console.log(`⚠️  [${i + 1}/${statements.length}] Skipped (already exists): ${statement.substring(0, 50).replace(/\n/g, ' ')}...`);
            skippedCount++;
          } else {
            console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
            errorCount++;
          }
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('💡 Please restart your Next.js server for changes to take effect.');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the output above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

