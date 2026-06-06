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

    // 1. Enable RLS on registrations
    console.log("Enabling Row Level Security on registrations...");
    await client.query(`ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;`);

    // 2. Recreate policies for public.registrations
    console.log("Recreating RLS policies for public.registrations...");
    await client.query(`DROP POLICY IF EXISTS "registrations_insert_policy" ON public.registrations;`);
    await client.query(`DROP POLICY IF EXISTS "registrations_admin_policy" ON public.registrations;`);

    // Policy allowing anyone to insert (register)
    await client.query(`
      CREATE POLICY "registrations_insert_policy" ON public.registrations
      FOR INSERT WITH CHECK (true);
    `);
    console.log("Insert policy created (Allows public INSERT).");

    // Policy allowing SELECT, UPDATE, DELETE only for admin with x-admin-token
    await client.query(`
      CREATE POLICY "registrations_admin_policy" ON public.registrations
      FOR ALL USING (
        (((current_setting('request.headers'::text, true))::json ->> 'x-admin-token'::text) = 'redlix-secure-admin-token-2026'::text)
      );
    `);
    console.log("Admin policy created (Allows SELECT/UPDATE/DELETE only with x-admin-token).");

    console.log("All RLS policies applied successfully to registrations table.");
  } catch (err) {
    console.error("Failed to apply DB migrations:", err);
  } finally {
    await client.end();
  }
}

run();
