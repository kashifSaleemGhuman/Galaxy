const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read migration SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250120000001_add_document_content_tracking/migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');

    // Split SQL into statements, handling DO blocks separately
    const results = [];
    
    // Extract DO blocks first
    const doBlockRegex = /DO \$\$[\s\S]*?\$\$;/g;
    const doBlocks = migrationSQL.match(doBlockRegex) || [];
    const sqlWithoutDoBlocks = migrationSQL.replace(doBlockRegex, '');
    
    // Execute DO blocks
    for (const doBlock of doBlocks) {
      try {
        await prisma.$executeRawUnsafe(doBlock);
        results.push({ type: 'DO block', status: 'success' });
        console.log('✅ Executed DO block');
      } catch (error) {
        if (error.message && (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('IF NOT EXISTS')
        )) {
          results.push({ type: 'DO block', status: 'skipped' });
          console.log('⚠️  DO block skipped (already exists)');
        } else {
          console.error('❌ Error executing DO block:', error.message);
          results.push({ type: 'DO block', status: 'error', error: error.message });
        }
      }
    }
    
    // Execute regular statements
    const statements = sqlWithoutDoBlocks
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          results.push({ 
            statement: statement.substring(0, 60).replace(/\n/g, ' '), 
            status: 'success' 
          });
          console.log('✅ Executed:', statement.substring(0, 60).replace(/\n/g, ' '));
        } catch (error) {
          // Ignore errors for IF NOT EXISTS
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.message.includes('IF NOT EXISTS') ||
            (error.message.includes('relation') && error.message.includes('already exists'))
          )) {
            results.push({ 
              statement: statement.substring(0, 60).replace(/\n/g, ' '), 
              status: 'skipped' 
            });
            console.log('⚠️  Skipped (already exists):', statement.substring(0, 60).replace(/\n/g, ' '));
          } else {
            console.error('❌ Error:', error.message);
            results.push({ 
              statement: statement.substring(0, 60).replace(/\n/g, ' '), 
              status: 'error', 
              error: error.message.substring(0, 100) 
            });
          }
        }
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying migration...');
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('DocumentContent', 'DocumentRevision')
      `;
      
      if (tableCheck.length === 2) {
        console.log('✅ Migration successful! Both tables exist.');
      } else {
        console.log('⚠️  Warning: Some tables may be missing:', tableCheck);
      }
    } catch (error) {
      console.error('❌ Error verifying migration:', error.message);
    }

    console.log('\n📊 Migration Summary:');
    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Success: ${successCount}`);
    console.log(`⚠️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please review above.');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

