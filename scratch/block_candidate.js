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

    const res = await client.query(`UPDATE public.registrations SET blocked = true WHERE hall_ticket_number = '26AI995593' RETURNING *;`);
    console.log("Updated registrations:");
    console.log(JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
