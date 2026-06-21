/**
 * Redlix Phase - 02 ( Final Phase ) — Answer Key
 * ===============================================
 * Section A (MCQs, ids 2001-2019): 4 marks each, total 76 marks
 * Section B (Open-Ended, ids 2101-2108): 10 marks each, total 80 marks
 * 
 * Grand Total: 156 marks
 */

export const PHASE02_ANSWER_KEY: Record<number, string> = {
  2001: "B", // Q01 AWS Cloud MCQ - RDS Proxy
  2002: "B", // Q03 Multi-Cloud & Hybrid MCQ - Transit Gateway + ECMP
  2003: "B", // Q04 Linux & Server MCQ - XFS + noatime
  2004: "B", // Q06 AWS Cloud MCQ - CoreDNS throttling
  2005: "B", // Q08 Linux & Server MCQ - THP defrag
  2006: "B", // Q09 AWS Cloud MCQ - Write sharding
  2007: "B", // Q10 Multi-Cloud & Hybrid MCQ - Istio trust bundle
  2008: "A", // Q13 Multi-Cloud & Hybrid MCQ - terraform import
  2009: "A", // Q14 Linux & Server MCQ - AppArmor/SELinux
  2010: "B", // Q15 AWS Cloud MCQ - Circuit breaker
  2011: "D", // Q17 Linux & Server MCQ - Dirty page writeback
  2012: "B", // Q19 Multi-Cloud & Hybrid MCQ - etcd restore
  2013: "B", // Danush Csm Q1 - Load Balancer with Auto Scaling
  2014: "B", // Danush Csm Q2 - Object storage
  2015: "A", // Danush Csm Q3 - Microservices
  2016: "D", // Danush Csm Q4 - All of the above (CI/CD, GitHub Actions, testing)
  2017: "A", // Danush Csm Q5 - WebSockets
  2018: "A", // Danush Csm Q6 - Mobile App → API → Services → Database → Cloud
  2019: "A", // Danush Csm Q7 - OAuth
};

export const PHASE02_MODEL_ANSWERS: Record<number, string> = {
  2101: `Check /proc/PID/smaps & pmap for native memory; use jcmd VM.native_memory for JVM native tracking; compare RES vs heap with jstat; check slab usage via /proc/slabinfo; use perf or valgrind for C extensions. Distinguish RSS growth without heap growth = native/JNI leak.`,
  2102: `Per-account: strongest isolation, AWS Organizations + Control Tower needed, billing separation, but 10k accounts is near limit. Per-VPC: VPC limits (5/region default), good for mid-tier. IAM/prefix: lowest cost, highest dev complexity, breaks for compliance tenants needing physical isolation. Choose based on compliance tier.`,
  2103: `Use Debezium CDC on Aurora -> Kafka -> GCP Cloud SQL/AlloyDB. 30s RPO requires near-sync replication; Kafka lag must stay <30s. Failover: Route53 health checks + Lambda trigger DNS cut to GCP. RTO 5min needs pre-warmed GCP instance. What breaks: schema migrations mid-flight, large transactions >30s, GCP provisioning delay if not pre-warmed.`,
  2104: `NFS sync (default) flushes every write to stable storage before ACK — SSD still has fsync latency per op. Fix: async export in /etc/exports. Tune: increase nfsd threads, wsize/rsize to 1MB, enable nconnect on clients. Check nfsstat -s for RPC queue depth. Trade-off: async = performance at cost of crash consistency; sync = safe but slow.`,
  2105: `Immediate: enable S3 Block Public Access at org level, check bucket ACLs/policies. Forensics: S3 server access logs + CloudTrail data events for IPs, user-agents, referrer headers. Cost stop: Bucket Policy to deny unauthenticated reads, or add CloudFront with signed URLs. Prevention: AWS Budgets alerts, S3 Storage Lens for anomaly detection, SCPs preventing public bucket creation, require CloudFront in front of public content with WAF rate limiting.`,
  2106: `Classification: tag all data stores with data_classification=PII. Controls: AWS Organizations SCP denying S3 puts in non-EU regions for tagged buckets; Macie scans S3 for PII patterns. Log fix: update logging config to write to EU bucket; enable S3 Replication with EU-only destination; delete existing US logs. Audit evidence: CloudTrail + Config rules, Macie findings dashboard, automated compliance report via Security Hub.`,
  2107: `Ingestion: API Gateway -> Kinesis Data Streams (~125 shards for 500k TPS at avg 1KB). Processing: Lambda with enhanced fan-out or Kinesis Consumer on ECS Fargate for lower cold start jitter. ML: SageMaker real-time endpoint in Multi-AZ. Result: DynamoDB + SNS. Bottleneck: Kinesis shard limit and Lambda cold starts — use provisioned concurrency. Budget: 5ms API GW + 5ms Kinesis + 20ms ML + 5ms DynamoDB = ~35ms with headroom.`,
  2108: `Bare-metal to VM: hypervisor adds 1-8% CPU overhead; SR-IOV reduces NIC overhead to <1%. VM to Container: minimal overhead (<0.5% CPU), but adds container escape vectors. On-prem to Cloud: network RTT adds 2-15ms vs LAN 0.1ms. Nested VM (type-2 in type-1) loses HW virtualization -> 15-40% overhead. Recommendation: skip on-prem VM layer, containerize directly on bare metal, then lift to cloud EKS/GKE. Google Borg paper: <3% overhead for direct bare-metal containers; nested VM studies`
};

export const PHASE02_CONFIG = {
  name: "Redlix Phase - 02 ( Final Phase )",
  totalMarks: 156,
  sections: {
    A: { questions: 19, marksEach: 4, total: 76 },
    B: { questions: 8, marksEach: 10, total: 80 }
  },
  negativeMarking: false,
  showResultToCandidate: false,
};

export function gradePhase02MCQ(answers: Record<string | number, string>): {
  correct: number;
  wrong: number;
  unattempted: number;
  marksObtained: number;
  breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }>;
} {
  const breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }> = {};
  let correct = 0;
  let wrong = 0;

  const MCQ_IDS = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];

  for (const id of MCQ_IDS) {
    const correctAns = PHASE02_ANSWER_KEY[id];
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
    marksObtained: correct * PHASE02_CONFIG.sections.A.marksEach,
    breakdown,
  };
}

export function gradePhase02Open(answers: Record<string | number, string>): {
  attempted: number;
  marksObtained: number;
  breakdown: Record<number, { attempted: boolean }>;
} {
  const breakdown: Record<number, { attempted: boolean }> = {};
  let attempted = 0;

  const OPEN_IDS = [2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108];

  for (const id of OPEN_IDS) {
    const val = (answers[id] || "").toString().trim();
    const isAttempted = val.length > 20; // At least 20 chars for a meaningful text response
    breakdown[id] = { attempted: isAttempted };
    if (isAttempted) attempted++;
  }

  // Open-ended scenario questions require manual grading; auto-graded marks default to 0 for unreviewed
  return {
    attempted,
    marksObtained: 0,
    breakdown,
  };
}

export function gradePhase02Full(answers: Record<string | number, string>): {
  mcq: ReturnType<typeof gradePhase02MCQ>;
  open: ReturnType<typeof gradePhase02Open>;
  totalAutoMarks: number;
  totalPossible: number;
} {
  const mcq = gradePhase02MCQ(answers);
  const open = gradePhase02Open(answers);

  return {
    mcq,
    open,
    totalAutoMarks: mcq.marksObtained + open.marksObtained,
    totalPossible: PHASE02_CONFIG.totalMarks,
  };
}
