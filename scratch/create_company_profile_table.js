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

    // 1. Create table
    console.log("Creating public.piscidrop_company_profile table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.piscidrop_company_profile (
        id INTEGER PRIMARY KEY DEFAULT 1,
        name VARCHAR(255) NOT NULL DEFAULT 'Pisci Drop Pvt Ltd',
        description TEXT DEFAULT 'A state-of-the-art secure workspace and automated file logistics node, powering secure assessments globally.',
        founder VARCHAR(255) DEFAULT 'Marcus Aurelius',
        date_started VARCHAR(255) DEFAULT 'January 15, 2024',
        website VARCHAR(255) DEFAULT 'piscidrop.com',
        phone VARCHAR(255) DEFAULT '+91 98765 43210',
        email VARCHAR(255) DEFAULT 'support@piscidrop.com',
        address TEXT DEFAULT '108 Silicon Hills, Block A, ORR, Bangalore, KA, India, 560103',
        logo_url TEXT DEFAULT 'https://ik.imagekit.io/dypkhqxip/picsihoriz?updatedAt=1778919009480',
        CONSTRAINT check_singleton CHECK (id = 1)
      );
    `);
    console.log("Table public.piscidrop_company_profile verified/created.");

    // 2. Insert initial row if not exists
    console.log("Checking for existing company profile data...");
    const res = await client.query(`SELECT COUNT(*) FROM public.piscidrop_company_profile WHERE id = 1;`);
    const count = parseInt(res.rows[0].count, 10);

    if (count === 0) {
      console.log("Seeding default company profile row...");
      await client.query(`
        INSERT INTO public.piscidrop_company_profile (id, name, description, founder, date_started, website, phone, email, address, logo_url)
        VALUES (
          1,
          'Pisci Drop Pvt Ltd',
          'A state-of-the-art secure workspace and automated file logistics node, powering secure assessments globally.',
          'Marcus Aurelius',
          'January 15, 2024',
          'piscidrop.com',
          '+91 98765 43210',
          'support@piscidrop.com',
          '108 Silicon Hills, Block A, ORR, Bangalore, KA, India, 560103',
          'https://ik.imagekit.io/dypkhqxip/picsihoriz?updatedAt=1778919009480'
        );
      `);
      console.log("Seeding completed successfully.");
    } else {
      console.log("Company profile row already exists. Skipping seed.");
    }

    // 3. Enable RLS
    console.log("Enabling Row Level Security on public.piscidrop_company_profile...");
    await client.query(`ALTER TABLE public.piscidrop_company_profile ENABLE ROW LEVEL SECURITY;`);

    // 4. Create RLS Policies
    console.log("Recreating RLS policies for public.piscidrop_company_profile...");
    await client.query(`DROP POLICY IF EXISTS "company_profile_select_policy" ON public.piscidrop_company_profile;`);
    await client.query(`DROP POLICY IF EXISTS "company_profile_admin_policy" ON public.piscidrop_company_profile;`);

    // Public select policy
    await client.query(`
      CREATE POLICY "company_profile_select_policy" ON public.piscidrop_company_profile
      FOR SELECT USING (true);
    `);
    console.log("Select policy (allow all) created.");

    // Admin write policy (insert, update, delete)
    await client.query(`
      CREATE POLICY "company_profile_admin_policy" ON public.piscidrop_company_profile
      FOR ALL USING (
        (((current_setting('request.headers'::text, true))::json ->> 'x-admin-token'::text) = 'redlix-secure-admin-token-2026'::text)
      );
    `);
    console.log("Admin write policy created.");

    console.log("Database script execution completed successfully.");
  } catch (err) {
    console.error("Failed to setup company profile database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
