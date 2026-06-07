const { Client } = require('pg');

const databaseUrl = "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'security_logs';
    `);
    console.log("Columns of security_logs:");
    console.log(res.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
