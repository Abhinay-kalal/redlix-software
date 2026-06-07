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
      SET total_qns = 110,
          types_of_qns = 'Multiple Choice Questions - 100, Coding Questions - 10'
      WHERE id = 4;
    `);
    console.log(`Successfully updated ${res.rowCount} exam(s).`);

    const verifyRes = await client.query(`SELECT id, name, total_qns, types_of_qns FROM public.exams WHERE id = 4;`);
    console.log("Verified Exam status in DB:", verifyRes.rows[0]);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
