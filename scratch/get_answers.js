const { Client } = require('pg');

const databaseUrl = "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

// Question metadata
const MCQ_IDS    = Array.from({ length: 100 }, (_, i) => i + 1);
const CODING_IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

function pad(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
}

async function run() {
  const hallTicket = process.argv[2];
  if (!hallTicket) {
    console.log('\nUsage: node scratch/get_answers.js <HALL_TICKET_NUMBER>');
    console.log('Example: node scratch/get_answers.js 26AI300388\n');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT r.candidate_name, r.hall_ticket_number, r.email, r.exam_id,
           e.name AS exam_name, r.answers
    FROM   public.registrations r
    LEFT JOIN public.exams e ON e.id = r.exam_id
    WHERE  UPPER(r.hall_ticket_number) = UPPER($1)
    LIMIT 1;
  `, [hallTicket]);

  if (res.rows.length === 0) {
    console.log(`\nNo candidate found with hall ticket: ${hallTicket}\n`);
    await client.end();
    return;
  }

  const c = res.rows[0];
  const answers = c.answers || {};

  console.log('');
  console.log('═'.repeat(80));
  console.log(`  Candidate : ${c.candidate_name}`);
  console.log(`  Hall Ticket: ${c.hall_ticket_number}  |  Email: ${c.email}`);
  console.log(`  Exam      : ${c.exam_name}`);
  console.log('═'.repeat(80));

  // MCQ answers
  const mcqAnswered = Object.entries(answers).filter(([k]) => MCQ_IDS.includes(+k));
  console.log(`\n── MCQ Answers (${mcqAnswered.length} answered) ${'─'.repeat(50)}`);
  if (mcqAnswered.length === 0) {
    console.log('  No MCQ answers found.');
  } else {
    console.log(pad('Q.ID', 8) + pad('Selected Answer', 72));
    console.log('-'.repeat(80));
    mcqAnswered
      .sort((a, b) => +a[0] - +b[0])
      .forEach(([id, val]) => {
        const trimmed = val.toString().trim();
        // Print the full answer (MCQ options are usually long)
        console.log(`  Q${pad(id, 5)} ${trimmed}`);
      });
  }

  // Coding answers
  const codingAnswered = Object.entries(answers).filter(([k]) => CODING_IDS.includes(+k));
  console.log(`\n── Coding Answers (${codingAnswered.length} answered) ${'─'.repeat(48)}`);
  if (codingAnswered.length === 0) {
    console.log('  No coding answers found.');
  } else {
    codingAnswered
      .sort((a, b) => +a[0] - +b[0])
      .forEach(([id, val]) => {
        const lines = val.toString().split('\n');
        console.log(`\n  ── Question ID: ${id} (${lines.length} lines of code) ${'─'.repeat(30)}`);
        lines.forEach(line => console.log('  ' + line));
      });
  }

  console.log('\n' + '═'.repeat(80) + '\n');
  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
