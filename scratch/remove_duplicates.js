const { Client } = require('pg');

const databaseUrl = "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database.\n");

    // Delete older duplicates (by email + exam_id), keeping only the latest (max id)
    const res = await client.query(`
      DELETE FROM public.registrations
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM public.registrations
        GROUP BY email, exam_id
      )
      RETURNING id, email, exam_id, candidate_name;
    `);

    if (res.rows.length === 0) {
      console.log("No duplicates found to delete.");
    } else {
      console.log(`Deleted ${res.rows.length} duplicate registration(s):`);
      res.rows.forEach(row => {
        console.log(`  ID: ${row.id} | ${row.candidate_name} | ${row.email} | Exam ID: ${row.exam_id}`);
      });
    }

    // Verify final count
    const total = await client.query(`SELECT COUNT(*) as total FROM public.registrations;`);
    console.log(`\nTotal registrations remaining: ${total.rows[0].total}`);

    // Verify no more duplicates
    const check = await client.query(`
      SELECT email, exam_id, COUNT(*) as count
      FROM public.registrations
      GROUP BY email, exam_id
      HAVING COUNT(*) > 1;
    `);
    if (check.rows.length === 0) {
      console.log("✓ No more duplicate registrations.");
    } else {
      console.log("Still found duplicates:", check.rows);
    }

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
