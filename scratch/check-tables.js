const { Client } = require('pg');
const client = new Client('postgresql://postgres.pdqrzwnxzhblksbshtor:6tPpv_H.8%21rWti%2A@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true');

client.connect()
  .then(() => client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
  .then(res => {
    console.log("Tables in database:", res.rows.map(r => r.table_name));
    client.end();
  })
  .catch(e => {
    console.error('Error:', e.message);
    client.end();
  });
