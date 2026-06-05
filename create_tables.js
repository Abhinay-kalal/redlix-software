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

    // Create public.sessions table
    console.log("Dropping existing tables if any...");
    await client.query(`DROP TABLE IF EXISTS public.sessions;`);

    console.log("Creating sessions table...");
    await client.query(`
      CREATE TABLE public.sessions (
        id VARCHAR(50) PRIMARY KEY,
        student VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        exam VARCHAR(200) NOT NULL,
        flags_count INTEGER DEFAULT 0,
        integrity_score INTEGER DEFAULT 100,
        last_flag_type VARCHAR(100) DEFAULT 'None',
        severity VARCHAR(50) DEFAULT 'Normal',
        timestamp VARCHAR(50) NOT NULL,
        avatar VARCHAR(10) NOT NULL
      );
    `);
    console.log("Table 'sessions' created successfully.");

    // Insert original proctoring sessions data
    const sessions = [
      ["S-1092", "Marcus Aurelius", "marcus.a@academy.edu", "PHL-301: Advanced Epistemology", 4, 68, "Multiple Faces Detected", "Critical", "2 mins ago", "MA"],
      ["S-2051", "Ada Lovelace", "ada.l@polytechnic.edu", "CS-402: Compiler Architecture", 2, 84, "Tab Switch Detected", "Warning", "5 mins ago", "AL"],
      ["S-1940", "Alan Turing", "alan.t@cambridge.edu", "CS-501: Computability Theory", 0, 99, "None", "Normal", "12 mins ago", "AT"],
      ["S-3022", "Grace Hopper", "grace.h@naval.edu", "CS-204: Cobol Systems", 3, 72, "Unusual Audio Frequency", "Warning", "15 mins ago", "GH"],
      ["S-4011", "Nikola Tesla", "nikola.t@wardenclyffe.org", "EE-302: Alternating Current Systems", 5, 45, "Absent from Camera Feed", "Critical", "18 mins ago", "NT"],
      ["S-5044", "Marie Curie", "marie.c@sorbonne.fr", "PHY-401: Radiochemistry Lab", 1, 92, "Off-screen Eye Gaze", "Normal", "24 mins ago", "MC"]
    ];

    console.log("Inserting sessions records...");
    for (let row of sessions) {
      await client.query(
        `INSERT INTO public.sessions (id, student, email, exam, flags_count, integrity_score, last_flag_type, severity, timestamp, avatar)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        row
      );
    }
    console.log("Insert completed successfully.");

    // Verify row count
    const resCount = await client.query(`SELECT count(*) FROM public.sessions`);
    console.log(`Verified row count in database: ${resCount.rows[0].count}`);

  } catch (err) {
    console.error("Error creating database table:", err);
  } finally {
    await client.end();
  }
}

run();
