const { Client } = require('pg');

const databaseUrl = "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

// Question IDs actually shown in exam (30 MCQ + 10 Coding)
const MCQ_IDS    = Array.from({ length: 100 }, (_, i) => i + 1);
const CODING_IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

function hasAttempted(answers) {
  if (!answers || typeof answers !== 'object') return false;
  return Object.entries(answers).some(([, v]) => v && v.toString().trim() !== '');
}

function pad(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
}

async function run() {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // ── Who actually took the exam (has at least 1 answered question)
  const res = await client.query(`
    SELECT r.candidate_name, r.hall_ticket_number, r.email, r.exam_id,
           e.name AS exam_name, r.answers
    FROM   public.registrations r
    LEFT JOIN public.exams e ON e.id = r.exam_id
    WHERE  r.exam_id = 4
    ORDER  BY r.candidate_name;
  `);

  const took   = res.rows.filter(r => hasAttempted(r.answers));
  const didnt  = res.rows.filter(r => !hasAttempted(r.answers));

  console.log('');
  console.log('═'.repeat(70));
  console.log('  STUDENT FORGE TECHNICAL ASSESSMENT 2026 — EXAM SUMMARY');
  console.log('═'.repeat(70));
  console.log(`  Total Registered : ${res.rows.length}`);
  console.log(`  Took the exam    : ${took.length}`);
  console.log(`  Did NOT attempt  : ${didnt.length}`);
  console.log('');

  console.log('── Candidates who TOOK the exam (' + took.length + ') ─────────────────────────');
  console.log(pad('#', 4) + pad('Hall Ticket', 16) + pad('Name', 34) + pad('MCQ', 8) + pad('Code', 8));
  console.log('-'.repeat(70));
  took.forEach((r, i) => {
    const ans = r.answers || {};
    const mcq  = Object.keys(ans).filter(k => MCQ_IDS.includes(+k)    && ans[k]?.toString().trim()).length;
    const code = Object.keys(ans).filter(k => CODING_IDS.includes(+k) && ans[k]?.toString().trim()).length;
    console.log(pad(i+1, 4) + pad(r.hall_ticket_number, 16) + pad(r.candidate_name, 34) + pad(mcq+'/30', 8) + pad(code+'/10', 8));
  });
  console.log('');

  console.log('── Candidates who DID NOT attempt (' + didnt.length + ') ──────────────────────');
  didnt.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.candidate_name.padEnd(35)} ${r.hall_ticket_number}`);
  });

  console.log('');
  console.log('═'.repeat(70));
  console.log('  To retrieve a specific candidate\'s answers, run:');
  console.log('  node scratch/get_answers.js <HALL_TICKET_NUMBER>');
  console.log('  Example: node scratch/get_answers.js 26AI300388');
  console.log('═'.repeat(70));
  console.log('');

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
