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

    // Check if the supabase_realtime publication exists, and if so add the sessions table to it
    console.log("Adding sessions table to supabase_realtime publication...");
    try {
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;`);
      console.log("Successfully added 'sessions' table to supabase_realtime publication.");
    } catch (pubErr) {
      if (pubErr.message.includes("already exists") || pubErr.message.includes("duplicate")) {
        console.log("Table 'sessions' is already in the publication.");
      } else {
        console.warn("Could not add to publication directly, trying to create or modify publication...", pubErr.message);
        try {
          await client.query(`CREATE PUBLICATION supabase_realtime FOR TABLE public.sessions;`);
          console.log("Created supabase_realtime publication for 'sessions'.");
        } catch (createErr) {
          console.error("Failed to setup realtime publication:", createErr.message);
        }
      }
    }

  } catch (err) {
    console.error("Error setting up realtime:", err);
  } finally {
    await client.end();
  }
}

run();
