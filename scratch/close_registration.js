const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    // 1. Add registration_closed column to public.exams if not exists
    console.log("Altering public.exams table to add registration_closed column...");
    try {
      await client.query(`ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS registration_closed BOOLEAN DEFAULT false;`);
      console.log("registration_closed column successfully verified/added.");
    } catch (err) {
      console.log("Note on altering column:", err.message);
    }

    // 2. Set registration_closed = true for Exam ID 4
    console.log("Closing registrations for Student Forge Technical Assessment 2026 (ID = 4)...");
    const res = await client.query(`
      UPDATE public.exams 
      SET registration_closed = true 
      WHERE id = 4;
    `);
    console.log(`Successfully updated ${res.rowCount} exam(s).`);

    // Verify status
    const verifyRes = await client.query(`SELECT id, name, registration_closed FROM public.exams;`);
    console.log("Current exams status in database:");
    console.log(verifyRes.rows);

  } catch (err) {
    console.error("Error running script:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
