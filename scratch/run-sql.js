const { Client } = require('pg');
const client = new Client('postgresql://postgres.pdqrzwnxzhblksbshtor:6tPpv_H.8%21rWti%2A@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres');

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase!");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    console.log("Recreated public schema.");
  } catch (e) {
    console.error("Error executing schema:", e);
  } finally {
    client.end();
  }
}

run();
