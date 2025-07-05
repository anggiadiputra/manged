const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    // Read SQL files
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../database/schema.sql'),
      'utf8'
    );
    const sampleDataSQL = fs.readFileSync(
      path.join(__dirname, '../database/insert_sample_data.sql'),
      'utf8'
    );
    const testUsersSQL = fs.readFileSync(
      path.join(__dirname, '../database/insert_test_users_with_auth.sql'),
      'utf8'
    );

    // Execute schema reset
    console.log('Resetting schema...');
    const { error: schemaError } = await supabase.rpc('run_sql', {
      sql: schemaSQL
    });
    if (schemaError) throw schemaError;

    // Insert sample data
    console.log('Inserting sample data...');
    const { error: sampleDataError } = await supabase.rpc('run_sql', {
      sql: sampleDataSQL
    });
    if (sampleDataError) throw sampleDataError;

    // Insert test users
    console.log('Creating test users...');
    const { error: usersError } = await supabase.rpc('run_sql', {
      sql: testUsersSQL
    });
    if (usersError) throw usersError;

    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase();
} 