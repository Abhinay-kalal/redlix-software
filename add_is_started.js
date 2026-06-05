const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected.");

    await client.query(`
      ALTER TABLE public.exams
      ADD COLUMN IF NOT EXISTS is_started BOOLEAN DEFAULT FALSE;
    `);
    console.log("✓ Added 'is_started' column to exams table.");

    const res = await client.query(`SELECT id, name, is_started FROM public.exams ORDER BY id;`);
    console.log("Current exams:", res.rows);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

run();
