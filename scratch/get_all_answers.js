const { Client } = require('pg');

const databaseUrl = "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const MCQ_IDS    = Array.from({ length: 100 }, (_, i) => i + 1);
const CODING_IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

function pad(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
}

async function run() {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT r.candidate_name, r.hall_ticket_number, r.email, r.exam_id,
           e.name AS exam_name, r.answers
    FROM   public.registrations r
    LEFT JOIN public.exams e ON e.id = r.exam_id
    WHERE  r.exam_id = 4
      AND  r.answers IS NOT NULL
      AND  r.answers::text != '{}'
      AND  r.answers::text != 'null'
    ORDER  BY r.candidate_name;
  `);

  const candidates = res.rows.filter(r => {
    const ans = r.answers || {};
    return Object.values(ans).some(v => v && v.toString().trim() !== '');
  });

  console.log(`\nTotal candidates with answers: ${candidates.length}\n`);

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const answers = c.answers || {};

    console.log('');
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log(`║  [${i+1}/${candidates.length}]  ${c.candidate_name.padEnd(50)} ${c.hall_ticket_number.padEnd(14)}║`);
    console.log(`║  Email: ${c.email.padEnd(69)}║`);
    console.log('╚' + '═'.repeat(78) + '╝');

    // MCQ
    const mcqEntries = Object.entries(answers)
      .filter(([k]) => MCQ_IDS.includes(+k) && answers[k]?.toString().trim())
      .sort((a, b) => +a[0] - +b[0]);

    console.log(`\n  MCQ (${mcqEntries.length} answered):`);
    if (mcqEntries.length === 0) {
      console.log('    No MCQ answers.');
    } else {
      // Print in rows of 5
      for (let j = 0; j < mcqEntries.length; j += 5) {
        const chunk = mcqEntries.slice(j, j + 5);
        const line = chunk.map(([id, val]) => `Q${String(id).padEnd(4)}: ${val.toString().trim().charAt(0)}`).join('   ');
        console.log('    ' + line);
      }
    }

    // Coding
    const codingEntries = Object.entries(answers)
      .filter(([k]) => CODING_IDS.includes(+k) && answers[k]?.toString().trim())
      .sort((a, b) => +a[0] - +b[0]);

    console.log(`\n  Coding (${codingEntries.length} answered):`);
    if (codingEntries.length === 0) {
      console.log('    No coding answers.');
    } else {
      codingEntries.forEach(([id, val]) => {
        const lines = val.toString().split('\n');
        console.log(`\n    ── Q${id} (${lines.length} lines) ${'─'.repeat(40)}`);
        lines.forEach(line => console.log('      ' + line));
      });
    }

    console.log('\n' + '─'.repeat(80));
  }

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
