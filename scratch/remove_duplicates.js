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

    // 1. Remove duplicates from public.registrations
    console.log("Removing duplicates from public.registrations table (matching email + exam_id)...");
    const resReg = await client.query(`
      DELETE FROM public.registrations a
      WHERE ctid < (
        SELECT max(b.ctid)
        FROM public.registrations b
        WHERE a.exam_id = b.exam_id
          AND LOWER(TRIM(a.email)) = LOWER(TRIM(b.email))
      );
    `);
    console.log(`Deleted ${resReg.rowCount} duplicate row(s) from public.registrations.`);

    // 2. Remove duplicates from public.student_registrations
    console.log("Removing duplicates from public.student_registrations table (matching email)...");
    const resStudent = await client.query(`
      DELETE FROM public.student_registrations a
      WHERE ctid < (
        SELECT max(b.ctid)
        FROM public.student_registrations b
        WHERE LOWER(TRIM(a.email)) = LOWER(TRIM(b.email))
      );
    `);
    console.log(`Deleted ${resStudent.rowCount} duplicate row(s) from public.student_registrations.`);

    console.log("Cleanup script completed successfully.");
  } catch (err) {
    console.error("Error executing cleanup script:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
