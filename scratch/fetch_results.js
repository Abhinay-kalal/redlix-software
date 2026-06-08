const { Client } = require('pg');

const databaseUrl = "postgresql://postgres.vcbxrdwomptrsxghtkpw:proctorsystemsredlix@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

// ── Question metadata pulled from questions.ts ──────────────────────────────
// Each entry: [id, type, section, marks]
// MCQ ids 1-100 (section A, 3 marks each)
// Coding ids 101-110 (section B, 10 marks each)
const MCQ_IDS   = Array.from({ length: 100 }, (_, i) => i + 1);
const CODING_IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
const MCQ_MARKS   = 3;
const CODING_MARKS = 10;

// Total possible marks
const TOTAL_MCQ_MARKS    = MCQ_IDS.length * MCQ_MARKS;    // 100 × 3 = 300
const TOTAL_CODING_MARKS = CODING_IDS.length * CODING_MARKS; // 10 × 10 = 100
const TOTAL_MARKS        = TOTAL_MCQ_MARKS + TOTAL_CODING_MARKS; // 400

function scoreAnswers(answers) {
  if (!answers || typeof answers !== 'object') {
    return { mcqAttempted: 0, codingAttempted: 0, totalAttempted: 0 };
  }

  let mcqAttempted   = 0;
  let codingAttempted = 0;

  for (const [key, val] of Object.entries(answers)) {
    const id  = parseInt(key, 10);
    const ans = (val || '').toString().trim();
    if (!ans) continue;

    if (MCQ_IDS.includes(id)) {
      mcqAttempted++;
    } else if (CODING_IDS.includes(id)) {
      codingAttempted++;
    }
  }

  return {
    mcqAttempted,
    codingAttempted,
    totalAttempted: mcqAttempted + codingAttempted,
    mcqMaxMarks:    MCQ_IDS.length,
    codingMaxQns:   CODING_IDS.length,
    totalMaxQns:    MCQ_IDS.length + CODING_IDS.length,
  };
}

function pad(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
}

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected.\n");

    const res = await client.query(`
      SELECT 
        r.id,
        r.candidate_name,
        r.hall_ticket_number,
        r.email,
        r.exam_id,
        e.name AS exam_name,
        r.answers
      FROM public.registrations r
      LEFT JOIN public.exams e ON e.id = r.exam_id
      WHERE r.answers IS NOT NULL
      ORDER BY r.exam_id, r.candidate_name;
    `);

    if (res.rows.length === 0) {
      console.log("No candidates with saved answers found.");
      return;
    }

    // Group by exam
    const byExam = {};
    for (const row of res.rows) {
      const key = `${row.exam_id}||${row.exam_name}`;
      if (!byExam[key]) byExam[key] = [];
      byExam[key].push(row);
    }

    for (const [examKey, candidates] of Object.entries(byExam)) {
      const [, examName] = examKey.split('||');
      console.log('═'.repeat(110));
      console.log(`  EXAM: ${examName}`);
      console.log('═'.repeat(110));
      console.log(
        pad('Hall Ticket', 15) + ' | ' +
        pad('Name', 30) + ' | ' +
        pad('MCQ Attempted', 14) + ' | ' +
        pad('Coding Attempted', 17) + ' | ' +
        pad('Total Attempted', 16) + ' | ' +
        'Completion'
      );
      console.log('-'.repeat(110));

      let submitted = 0;
      let notSubmitted = 0;

      for (const c of candidates) {
        const score = scoreAnswers(c.answers);
        const hasAnswers = score.totalAttempted > 0;

        if (hasAnswers) submitted++;
        else notSubmitted++;

        const completion = ((score.totalAttempted / (MCQ_IDS.length + CODING_IDS.length)) * 100).toFixed(1);

        console.log(
          pad(c.hall_ticket_number || '-', 15) + ' | ' +
          pad(c.candidate_name, 30) + ' | ' +
          pad(`${score.mcqAttempted} / ${MCQ_IDS.length}`, 14) + ' | ' +
          pad(`${score.codingAttempted} / ${CODING_IDS.length}`, 17) + ' | ' +
          pad(`${score.totalAttempted} / ${MCQ_IDS.length + CODING_IDS.length}`, 16) + ' | ' +
          `${completion}%`
        );
      }

      console.log('-'.repeat(110));
      console.log(`  Candidates with answers: ${submitted}   |   No answers yet: ${notSubmitted}   |   Total: ${candidates.length}`);
      console.log();
    }

    // Also show candidates who haven't submitted any answers
    const noAnswers = await client.query(`
      SELECT r.candidate_name, r.hall_ticket_number, r.exam_id, e.name AS exam_name
      FROM public.registrations r
      LEFT JOIN public.exams e ON e.id = r.exam_id
      WHERE r.answers IS NULL OR r.answers::text = '{}' OR r.answers::text = 'null'
      ORDER BY r.exam_id, r.candidate_name;
    `);

    if (noAnswers.rows.length > 0) {
      console.log('═'.repeat(80));
      console.log('  CANDIDATES WITH NO ANSWERS SUBMITTED');
      console.log('═'.repeat(80));
      for (const c of noAnswers.rows) {
        console.log(`  [Exam ${c.exam_id}] ${pad(c.hall_ticket_number || '-', 15)} | ${c.candidate_name}`);
      }
      console.log();
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
