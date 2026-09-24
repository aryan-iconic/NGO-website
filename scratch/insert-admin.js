const { Client } = require('pg');
const client = new Client('postgresql://postgres.pdqrzwnxzhblksbshtor:6tPpv_H.8%21rWti%2A@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres');

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase!");
    
    // Insert admin
    await client.query(`
      INSERT INTO admins (id, name, email, password_hash, role, two_factor_enabled, must_change_password, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        'Super Admin',
        'admin@nityanikunj.org',
        '$2b$10$F2GaiEHwYGVKCgiB9Pj4me4E8srn9TAGQnP/DSkLSf6KJ6OZJGF.m',
        'SUPER_ADMIN',
        false,
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log("Admin user created successfully!");
  } catch (e) {
    console.error("Error executing:", e);
  } finally {
    client.end();
  }
}

run();
