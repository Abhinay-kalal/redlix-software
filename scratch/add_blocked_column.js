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

    // Add blocked column to public.registrations
    console.log("Altering registrations table to add blocked...");
    try {
      await client.query(`ALTER TABLE public.registrations ADD COLUMN blocked BOOLEAN DEFAULT FALSE;`);
      console.log("blocked column added successfully.");
    } catch (err) {
      console.log("blocked column might already exist:", err.message);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
