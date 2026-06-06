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

    // Create the bucket in the storage.buckets table
    console.log("Registering 'live-feeds' bucket in Supabase storage...");
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('live-feeds', 'live-feeds', true, 5242880, '{"image/jpeg", "image/png"}')
      ON CONFLICT (id) DO UPDATE 
      SET public = true, file_size_limit = 5242880, allowed_mime_types = '{"image/jpeg", "image/png"}';
    `);
    console.log("Successfully registered 'live-feeds' bucket.");

    // Make sure storage policies allow anonymous insert/upsert to the live-feeds bucket
    // Note: in Supabase, policies for storage are on storage.objects
    console.log("Checking / Creating storage policies for 'live-feeds' bucket...");
    
    // 1. Enable RLS on storage.objects if not already enabled
    await client.query(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
    
    // 2. Allow public inserts to the bucket
    await client.query(`
      DROP POLICY IF EXISTS "Allow public uploads to live-feeds" ON storage.objects;
      CREATE POLICY "Allow public uploads to live-feeds" ON storage.objects
        FOR INSERT 
        WITH CHECK (bucket_id = 'live-feeds');
    `);
    
    // 3. Allow public updates (upserts) to the bucket
    await client.query(`
      DROP POLICY IF EXISTS "Allow public updates to live-feeds" ON storage.objects;
      CREATE POLICY "Allow public updates to live-feeds" ON storage.objects
        FOR UPDATE
        USING (bucket_id = 'live-feeds');
    `);

    // 4. Allow public select (read) to the bucket
    await client.query(`
      DROP POLICY IF EXISTS "Allow public read of live-feeds" ON storage.objects;
      CREATE POLICY "Allow public read of live-feeds" ON storage.objects
        FOR SELECT
        USING (bucket_id = 'live-feeds');
    `);

    console.log("Storage policies for 'live-feeds' bucket configured successfully.");

  } catch (err) {
    console.error("Error setting up storage bucket:", err);
  } finally {
    await client.end();
  }
}

run();
