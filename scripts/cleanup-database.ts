#!/usr/bin/env tsx
import postgres from 'postgres';
import 'dotenv/config';

const DEFINED_TABLES = [
  'resumes',
  'work_history',
  'projects',
  'achievements',
  '__drizzle_migrations',
];

// System tables to never drop
const SYSTEM_TABLES = [
  '__drizzle_migrations',
];

async function main() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔍 Checking database tables...\n');

    // Get all tables in the public schema
    const tables = await sql<{ tablename: string }[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('📋 All tables in database:');
    tables.forEach((t) => {
      const status = DEFINED_TABLES.includes(t.tablename)
        ? '✅ (defined in schema)'
        : SYSTEM_TABLES.includes(t.tablename)
        ? '🔧 (system table)'
        : '⚠️  (NOT in schema)';
      console.log(`  - ${t.tablename} ${status}`);
    });

    // Find tables to remove
    const tablesToRemove = tables
      .map((t) => t.tablename)
      .filter((name) => !DEFINED_TABLES.includes(name) && !SYSTEM_TABLES.includes(name));

    if (tablesToRemove.length === 0) {
      console.log('\n✨ No extra tables found. Database is clean!');
      await sql.end();
      return;
    }

    console.log(`\n⚠️  Found ${tablesToRemove.length} table(s) not in schema:`);
    tablesToRemove.forEach((name) => console.log(`  - ${name}`));

    // Check if we should drop tables
    const shouldDrop = process.argv.includes('--drop');

    if (!shouldDrop) {
      console.log('\n💡 To remove these tables, run:');
      console.log('   pnpm tsx scripts/cleanup-database.ts --drop');
      await sql.end();
      return;
    }

    console.log('\n🗑️  Dropping tables...');
    for (const tableName of tablesToRemove) {
      try {
        await sql.unsafe(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        console.log(`  ✓ Dropped: ${tableName}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to drop ${tableName}:`, error.message);
      }
    }

    console.log('\n✅ Database cleanup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
