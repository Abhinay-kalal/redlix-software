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

    console.log("Adding answers JSONB column to public.registrations...");
    await client.query(`
      ALTER TABLE public.registrations 
      ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;
    `);
    console.log("Answers column successfully verified/added.");

    // Let's verify by retrieving the columns
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'registrations';
    `);
    console.log("Updated columns of registrations:");
    console.log(res.rows);

  } catch (err) {
    console.error("Error running script:", err);
  } finally {
    await client.end();
  }
}

run();
