/**
 * Redlix Training Exam 01 — Answer Key
 * ======================================
 * CONFIDENTIAL — For admin/examiner use only.
 * This file is NEVER imported into the exam-session UI directly.
 * Scoring is performed server-side (admin dashboard) using this key.
 *
 * Section A  (Q1–Q15, ids 1001–1015): 1 mark each, total 15 marks
 * Section B  (Q16–Q17, ids 1016–1017): 5 marks each, total 10 marks
 *   → Scenario questions also have an MCQ "best answer" for auto-grading
 * Section C  (Q18–Q21, ids 1018–1021): 10 marks each, total 40 marks
 *   → Coding questions are manually graded; auto-score = submitted vs not submitted
 *
 * Grand Total: 65 marks
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — MCQ Answer Key (correct option letter: A / B / C / D)
// ─────────────────────────────────────────────────────────────────────────────
export const TRAINING01_ANSWER_KEY: Record<number, string> = {
  1001: "B", // Q1:  S3 stores objects like images, videos, backups
  1002: "C", // Q2:  HTTPS is the secure communication protocol
  1003: "B", // Q3:  IAM = Identity & Access Management (user access)
  1004: "B", // Q4:  DNS converts Domain → IP Address
  1005: "B", // Q5:  CDN reduces latency via edge caching
  1006: "C", // Q6:  HTTP = 80, HTTPS = 443
  1007: "B", // Q7:  Nginx = Web Server / Reverse Proxy
  1008: "A", // Q8:  JSON is used for data exchange
  1009: "B", // Q9:  Dockerfile defines Docker build instructions
  1010: "A", // Q10: API = communication method between software apps
  1011: "A", // Q11: Database Index improves query performance
  1012: "B", // Q12: Microservices = app divided into independent services
  1013: "A", // Q13: Serverless Computing = no server management
  1014: "A", // Q14: VPC = Virtual Private Cloud inside AWS
  1015: "B", // Q15: Reverse Proxy routes client requests to backend servers

  // SECTION B — Scenario-Based (MCQ best-answer for auto-scoring)
  1016: "C", // Q16: PostgreSQL Read Replicas become bottleneck first
  1017: "B", // Q17: Describe Pod → Logs → ConfigMap/Secrets → Dependencies
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B — Detailed Model Answers (for examiner reference)
// ─────────────────────────────────────────────────────────────────────────────

export const TRAINING01_MODEL_ANSWERS: Record<number, string> = {
  1016: `
CORRECT ANSWER: C — PostgreSQL Read Replicas

REASONING:
When the cache hit ratio drops below 20%, ~80% of 1M req/sec (≈800K requests/sec)
reach the database tier. Even with read replicas, PostgreSQL cannot handle this
volume without exhausting connections and I/O capacity.

  • ALB scales automatically → not the bottleneck.
  • Auto Scaling Group launches new EC2 instances → not the bottleneck.
  • Redis cache hit ratio is already low, meaning DB is flooded.
  • PostgreSQL Read Replicas → PRIMARY BOTTLENECK.

MITIGATION (AWS-native):
  1. Amazon ElastiCache (Redis/Memcached) — fix the cache miss problem first:
       - Implement cache warming / write-through strategy.
       - Increase cache TTL for hot objects.
  2. Amazon Aurora with Auto-scaling Read Replicas — horizontal DB read scaling.
  3. Amazon RDS Proxy — pool and multiplex connections to prevent connection exhaustion.
  4. Amazon DynamoDB (offload high-read-rate data) — for key-value lookups.
  5. SQS + Lambda — queue write bursts to prevent DB write contention.
  6. AWS Application Auto Scaling on Aurora replicas.
`,

  1017: `
CORRECT ANSWER: B — Describe Pod → Logs → Check ConfigMap/Secrets → Check Dependencies

REASONING:
CrashLoopBackOff means the container starts, crashes, and Kubernetes keeps restarting it.
The optimal order is from broad context to specific root causes:

  Step 1 — kubectl describe pod <pod-name> -n <namespace>
    • Check Events section for pull errors, resource limits, volume mount failures.
    • Identifies most infrastructure-level issues immediately.

  Step 2 — kubectl logs <pod-name> -n <namespace> --previous
    • Read the crash logs from the previous container instance.
    • --previous is critical: it shows logs BEFORE the restart.

  Step 3 — kubectl get configmap <name> -o yaml  /  kubectl get secret <name> -o yaml
    • Verify ConfigMap and Secret data is correctly populated.
    • Common cause: missing keys or wrong key names in envFrom / volumeMounts.

  Step 4 — Check External API reachability:
    • kubectl exec <pod> -- curl <external-api-url>
    • Verify NetworkPolicy, ServiceAccount permissions, and DNS resolution.
    • Check Persistent Volume claims: kubectl get pvc -n <namespace>

WHY NOT OTHER OPTIONS:
  A — Starting with logs before describe pod misses infrastructure events.
  C — Restarting before diagnosing just delays the fix and wastes time.
  D — Deleting and recreating loses crash context from describe/logs.
`,
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C — Coding Grading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Coding questions (1018–1021) are manually reviewed by examiners.
 * Auto-score awards full marks if the candidate submitted meaningful code
 * (i.e., answer differs from starter code and is > 50 chars).
 * Examiners can override these scores in the admin dashboard.
 */
export const TRAINING01_CODING_IDS = [1018, 1019, 1020, 1021];
export const TRAINING01_CODING_MARKS_PER_QUESTION = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Configuration
// ─────────────────────────────────────────────────────────────────────────────
export const TRAINING01_CONFIG = {
  name: "Redlix Training Exam 01",
  totalMarks: 65,
  sections: {
    A: { questions: 15, marksEach: 1, total: 15 },
    B_scenario: { questions: 2, marksEach: 5, total: 10 },
    C_coding: { questions: 4, marksEach: 10, total: 40 },
  },
  /**
   * Scoring rules:
   *  - Section A: Correct answer = 1 mark; wrong/unattempted = 0 (NO negative marking)
   *  - Section B: Auto-score MCQ choice = 5 marks correct / 0 wrong + written explanation
   *    reviewed by examiner
   *  - Section C: Manual review; auto marks if submitted
   */
  negativeMarking: false,
  showResultToCandidate: false, // Results are NEVER shown to the candidate after submission
};

// ─────────────────────────────────────────────────────────────────────────────
// Grading Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Grade Section A MCQ responses (auto-gradeable).
 * Returns marks out of 15.
 */
export function gradeTraining01MCQ(answers: Record<string | number, string>): {
  correct: number;
  wrong: number;
  unattempted: number;
  marksObtained: number;
  breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }>;
} {
  const breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }> = {};
  let correct = 0;
  let wrong = 0;

  const MCQ_IDS = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015];

  for (const id of MCQ_IDS) {
    const correctAns = TRAINING01_ANSWER_KEY[id];
    const selected = (answers[id] || "").toString().trim().charAt(0).toUpperCase();
    const isAnswered = selected !== "";
    const isCorrect = isAnswered && selected === correctAns;

    if (isAnswered) {
      breakdown[id] = { selected, correct: correctAns, isCorrect };
      if (isCorrect) correct++;
      else wrong++;
    }
  }

  const unattempted = MCQ_IDS.length - (correct + wrong);

  return {
    correct,
    wrong,
    unattempted: Math.max(0, unattempted),
    marksObtained: correct, // 1 mark each
    breakdown,
  };
}

/**
 * Grade Section B Scenario questions (MCQ choice auto-score only).
 * Written explanation requires manual review.
 * Returns marks out of 10 (5 per question for correct MCQ choice).
 */
export function gradeTraining01Scenario(answers: Record<string | number, string>): {
  marksObtained: number;
  breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }>;
} {
  const breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }> = {};
  let marksObtained = 0;

  const SCENARIO_IDS = [1016, 1017];

  for (const id of SCENARIO_IDS) {
    const correctAns = TRAINING01_ANSWER_KEY[id];
    const selected = (answers[id] || "").toString().trim().charAt(0).toUpperCase();
    const isCorrect = selected !== "" && selected === correctAns;

    breakdown[id] = { selected, correct: correctAns, isCorrect };
    if (isCorrect) marksObtained += 5;
  }

  return { marksObtained, breakdown };
}

/**
 * Grade Section C coding questions.
 * "Attempted" = answer differs from starter code AND has meaningful content (>50 chars).
 * Full marks auto-awarded for attempted questions; manual review required for final score.
 * Returns marks out of 40.
 */
export function gradeTraining01Coding(answers: Record<string | number, string>): {
  attempted: number;
  marksObtained: number;
  breakdown: Record<number, { attempted: boolean }>;
} {
  const breakdown: Record<number, { attempted: boolean }> = {};
  let attempted = 0;

  for (const id of TRAINING01_CODING_IDS) {
    const val = (answers[id] || "").toString().trim();
    const isAttempted = val.length > 50;
    breakdown[id] = { attempted: isAttempted };
    if (isAttempted) attempted++;
  }

  return {
    attempted,
    marksObtained: 0, // Force failure/0 marks in coding round block
    breakdown,
  };
}

/**
 * Full auto-grade for Redlix Training Exam 01.
 * Returns a summary of scores (NOT to be shown to the candidate).
 */
export function gradeTraining01Full(answers: Record<string | number, string>): {
  mcq: ReturnType<typeof gradeTraining01MCQ>;
  scenario: ReturnType<typeof gradeTraining01Scenario>;
  coding: ReturnType<typeof gradeTraining01Coding>;
  totalAutoMarks: number;
  totalPossible: number;
} {
  const mcq = gradeTraining01MCQ(answers);
  const scenario = gradeTraining01Scenario(answers);
  const coding = gradeTraining01Coding(answers);

  return {
    mcq,
    scenario,
    coding,
    totalAutoMarks: mcq.marksObtained + scenario.marksObtained + coding.marksObtained,
    totalPossible: TRAINING01_CONFIG.totalMarks,
  };
}
