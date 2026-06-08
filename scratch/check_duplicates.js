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

    // Find duplicates by email within the same exam
    const res = await client.query(`
      SELECT email, exam_id, COUNT(*) as count, array_agg(id ORDER BY id) as ids, array_agg(created_at ORDER BY id) as dates
      FROM public.registrations
      GROUP BY email, exam_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `);

    if (res.rows.length === 0) {
      console.log("No duplicate emails found.\n");
    } else {
      console.log(`Found ${res.rows.length} duplicate email group(s):`);
      res.rows.forEach(row => {
        console.log(`  Email: ${row.email} | Exam ID: ${row.exam_id} | Count: ${row.count} | IDs: ${row.ids}`);
      });
    }

    // Also check duplicates by phone
    const res2 = await client.query(`
      SELECT phone, exam_id, COUNT(*) as count, array_agg(id ORDER BY id) as ids
      FROM public.registrations
      WHERE phone IS NOT NULL AND phone != ''
      GROUP BY phone, exam_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `);

    if (res2.rows.length === 0) {
      console.log("\nNo duplicate phone numbers found.");
    } else {
      console.log(`\nFound ${res2.rows.length} duplicate phone group(s):`);
      res2.rows.forEach(row => {
        console.log(`  Phone: ${row.phone} | Exam ID: ${row.exam_id} | Count: ${row.count} | IDs: ${row.ids}`);
      });
    }

    // Total registrations
    const total = await client.query(`SELECT COUNT(*) as total FROM public.registrations;`);
    console.log(`\nTotal registrations in DB: ${total.rows[0].total}`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
