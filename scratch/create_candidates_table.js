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

    console.log("Creating public.candidates table if it doesn't exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.candidates (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        college VARCHAR(200),
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Table 'public.candidates' created/verified successfully.");

  } catch (err) {
    console.error("Error creating candidates table:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
