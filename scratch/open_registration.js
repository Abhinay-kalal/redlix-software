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
      UPDATE public.exams 
      SET registration_closed = false 
      WHERE id = 4;
    `);
    console.log(`Successfully updated ${res.rowCount} exam(s).`);

    const verifyRes = await client.query(`SELECT id, name, registration_closed FROM public.exams WHERE id = 4;`);
    console.log("Current status:");
    console.log(verifyRes.rows);

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
