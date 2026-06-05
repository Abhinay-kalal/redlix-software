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

    // 1. Add visitor_id to public.sessions
    console.log("Altering sessions table to add visitor_id...");
    try {
      await client.query(`ALTER TABLE public.sessions ADD COLUMN visitor_id VARCHAR(100);`);
      console.log("visitor_id column added successfully.");
    } catch (err) {
      console.log("visitor_id column might already exist:", err.message);
    }

    // 2. Create security_logs table
    console.log("Creating public.security_logs table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.security_logs (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        visitor_id VARCHAR(100) NOT NULL,
        event VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Table public.security_logs created successfully.");

    // 3. Enable RLS
    console.log("Enabling RLS on public.security_logs...");
    await client.query(`ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;`);

    // 4. Create Policies
    console.log("Recreating RLS policies for public.security_logs...");
    await client.query(`DROP POLICY IF EXISTS "security_logs_insert_policy" ON public.security_logs;`);
    await client.query(`DROP POLICY IF EXISTS "security_logs_select_policy" ON public.security_logs;`);

    await client.query(`
      CREATE POLICY "security_logs_insert_policy" ON public.security_logs
      FOR INSERT WITH CHECK (
        (((current_setting('request.headers'::text, true))::json ->> 'x-admin-token'::text) = 'redlix-secure-admin-token-2026'::text)
        OR
        (((current_setting('request.headers'::text, true))::json ->> 'x-candidate-hall-ticket'::text) = (student_id)::text)
      );
    `);
    console.log("Insert policy created.");

    await client.query(`
      CREATE POLICY "security_logs_select_policy" ON public.security_logs
      FOR SELECT USING (
        (((current_setting('request.headers'::text, true))::json ->> 'x-admin-token'::text) = 'redlix-secure-admin-token-2026'::text)
      );
    `);
    console.log("Select policy created.");

    console.log("All DB changes applied successfully.");
  } catch (err) {
    console.error("Failed to run DB migrations:", err);
  } finally {
    await client.end();
  }
}

run();
