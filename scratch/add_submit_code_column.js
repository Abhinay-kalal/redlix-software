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

    await client.query(`
      ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS submit_code VARCHAR(6) DEFAULT NULL;
    `);
    console.log("submit_code column added/verified.");

    const verifyRes = await client.query(`SELECT id, name, submit_code FROM public.exams;`);
    console.log("Current exams:");
    console.log(verifyRes.rows);

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
