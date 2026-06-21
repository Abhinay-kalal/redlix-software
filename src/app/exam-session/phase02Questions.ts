import { Question } from "./questions";

export const PHASE02_QUESTIONS: Question[] = [
  // ─────────────────────────────────────────────────────────────
  // SECTION A — Multiple Choice Questions (4 marks each)
  // ─────────────────────────────────────────────────────────────
  {
    id: 2001,
    type: "mcq",
    section: "A",
    number: 1,
    questionText: "Scenario: Your e-commerce platform runs on AWS. During a flash sale, Auto Scaling adds 200 EC2 instances within 5 minutes. Your RDS MySQL instance becomes the bottleneck — CPU hits 100% and connections are maxed out at 500. Sales are dropping.\n\nWhat is the MOST effective immediate mitigation without changing your application code?",
    options: [
      "A) Increase RDS instance size to db.r6g.16xlarge immediately",
      "B) Enable RDS Proxy to pool and multiplex database connections",
      "C) Add a read replica and redirect all traffic",
      "D) Switch to Aurora Serverless v2 on the fly"
    ],
    marks: 4
  },
  {
    id: 2002,
    type: "mcq",
    section: "A",
    number: 2,
    questionText: "Scenario: Your company runs a hybrid cloud setup: critical workloads on AWS us-east-1, with on-prem data centers connected via AWS Direct Connect. Your Direct Connect link goes down unexpectedly. Traffic fails over to a Site-to-Site VPN, but latency spikes from 2ms to 180ms, causing SLA violations.\n\nWhat architectural change prevents this latency spike while maintaining resilience?",
    options: [
      "A) Add a second Direct Connect in active-passive mode",
      "B) Deploy a Transit Gateway with ECMP across dual Direct Connect + VPN in active-active",
      "C) Move all workloads to on-prem during Direct Connect outages",
      "D) Use CloudFront to cache all API responses"
    ],
    marks: 4
  },
  {
    id: 2003,
    type: "mcq",
    section: "A",
    number: 3,
    questionText: "Scenario: A high-throughput Kafka broker on Linux is dropping messages under load. iostat shows disk utilization at 100% but CPU is at 20%. The broker uses ext4 on a RAID-10 array of HDDs.\n\nWhich change provides the greatest performance uplift for this specific bottleneck?",
    options: [
      "A) Increase Kafka's num.io.threads from 8 to 32",
      "B) Switch filesystem to XFS and enable noatime mount option",
      "C) Add more CPU cores to the broker",
      "D) Increase the JVM heap to 32GB"
    ],
    marks: 4
  },
  {
    id: 2004,
    type: "mcq",
    section: "A",
    number: 4,
    questionText: "Scenario: An EKS cluster's pods are intermittently failing with 'context deadline exceeded' when calling an external API. The issue occurs only between 14:00-15:00 UTC. VPC flow logs show all packets leaving. Node-level curl to the same endpoint works fine.\n\nWhat is the MOST likely root cause?",
    options: [
      "A) Security group blocking pod-level egress",
      "B) CoreDNS is throttled causing DNS resolution timeouts for pods",
      "C) The external API has a rate limit",
      "D) NAT Gateway bandwidth limit is exceeded"
    ],
    marks: 4
  },
  {
    id: 2005,
    type: "mcq",
    section: "A",
    number: 5,
    questionText: "Scenario: You run a latency-sensitive trading application on bare-metal Linux. The p99.9 latency suddenly increased by 300 microseconds. Nothing changed in application code. The kernel was recently patched.\n\nWhat kernel feature is the MOST likely culprit for introducing this microsecond-level jitter?",
    options: [
      "A) A new iptables rule was auto-added",
      "B) Transparent Huge Pages (THP) defragmentation causing stalls",
      "C) The TCP buffer size was reduced",
      "D) Cgroup memory limits were applied"
    ],
    marks: 4
  },
  {
    id: 2006,
    type: "mcq",
    section: "A",
    number: 6,
    questionText: "Scenario: Your Lambda function processes SQS messages and writes to DynamoDB. Under high load, you see ProvisionedThroughputExceededException errors increasing. DynamoDB is in on-demand mode.\n\nWhat is happening and what is the correct fix?",
    options: [
      "A) On-demand mode has a hard cap; switch to provisioned with auto-scaling",
      "B) A hot partition key is concentrating writes; redesign the partition key with write sharding",
      "C) Lambda concurrency is too high; add a reserved concurrency limit",
      "D) SQS batch size is too large; reduce to 1"
    ],
    marks: 4
  },
  {
    id: 2007,
    type: "mcq",
    section: "A",
    number: 7,
    questionText: "Scenario: You run Kubernetes workloads across AWS EKS and Azure AKS using a service mesh (Istio). After enabling mTLS between services, inter-cluster API calls start failing with TLS handshake errors only when crossing clouds.\n\nWhat is the MOST precise root cause?",
    options: [
      "A) Different Istio versions generating incompatible cipher suites",
      "B) Each cluster's Istio CA issued certificates that the other cluster's trust bundle does not recognize",
      "C) mTLS is not supported in cross-cloud topologies",
      "D) Azure's load balancer is terminating TLS before Istio"
    ],
    marks: 4
  },
  {
    id: 2008,
    type: "mcq",
    section: "A",
    number: 8,
    questionText: "Scenario: Your team uses Terraform to manage infrastructure across AWS and GCP. After a botched terraform apply, 3 production EC2 instances and 2 GCP VMs were terminated. The state file shows them as destroyed. Backups exist but are 6 hours old.\n\nWhat is your recovery sequence and how do you prevent Terraform from orphaning newly restored instances?",
    options: [
      "A) Restore from backup, run terraform import, update state to match reality",
      "B) Run terraform destroy and rebuild from scratch to match state",
      "C) Manually recreate instances, then terraform refresh to sync state",
      "D) Delete the state file and run terraform apply fresh"
    ],
    marks: 4
  },
  {
    id: 2009,
    type: "mcq",
    section: "A",
    number: 9,
    questionText: "Scenario: A containerized microservice running in Docker on Linux has a security incident. An attacker gained shell access inside the container. The container runs as root.\n\nWhich Linux kernel feature, if properly configured, would have most limited the blast radius of this compromise?",
    options: [
      "A) AppArmor/SELinux profiles restricting syscalls available to the container",
      "B) Setting the container's memory limit to 512MB",
      "C) Using an overlay network instead of host networking",
      "D) Running Docker daemon with --userns-remap"
    ],
    marks: 4
  },
  {
    id: 2010,
    type: "mcq",
    section: "A",
    number: 10,
    questionText: "Scenario: You have a distributed system with 15 microservices on ECS Fargate. A new deployment of service-C causes a cascading failure: service-C's response times increase, service-B times out waiting for service-C, and service-A (customer-facing) returns 503s. All services have health checks passing.\n\nWhat pattern was MISSING from this architecture that would have isolated the failure to service-C only?",
    options: [
      "A) Blue-green deployment strategy",
      "B) Circuit breaker pattern between service-B and service-C",
      "C) Health check endpoint on service-C",
      "D) Auto Scaling on all services"
    ],
    marks: 4
  },
  {
    id: 2011,
    type: "mcq",
    section: "A",
    number: 11,
    questionText: "Scenario: You're running a PostgreSQL 15 database on Linux with 256GB RAM. The database performs well during the day but experiences severe slowdowns at 2 AM daily. iostat shows massive write I/O at that time. No scheduled jobs exist in cron.\n\nWhat is the MOST likely cause of this nightly I/O storm?",
    options: [
      "A) PostgreSQL autovacuum running on bloated tables",
      "B) The Linux OOM Killer reclaiming memory",
      "C) PostgreSQL WAL archiving catching up",
      "D) Linux dirty page writeback flushing accumulated buffer cache"
    ],
    marks: 4
  },
  {
    id: 2012,
    type: "mcq",
    section: "A",
    number: 12,
    questionText: "Scenario: You're running a Kubernetes cluster. A developer accidentally ran kubectl delete namespace production. The namespace had no Velero backups. The cluster uses etcd for state storage and etcd snapshots are taken every hour.\n\nWhat is your recovery procedure and what data is definitively unrecoverable?",
    options: [
      "A) Run kubectl apply -f of all manifests; PersistentVolume data is unrecoverable",
      "B) Restore etcd from snapshot, restart API server; data written since last snapshot is unrecoverable",
      "C) Use kubectl rollout undo to reverse the deletion",
      "D) Restore from etcd snapshot; all data is fully recoverable with no gaps"
    ],
    marks: 4
  },
  {
    id: 2013,
    type: "mcq",
    section: "A",
    number: 13,
    questionText: "Your company hosts an e-commerce website on a single VM. During a festival sale, traffic increases 20x and the website crashes. What is the best solution?",
    options: [
      "A) Increase the font size of the website",
      "B) Add Load Balancer with Auto Scaling",
      "C) Move the database to the frontend server",
      "D) Restart the VM manually whenever traffic increases"
    ],
    marks: 4
  },
  {
    id: 2014,
    type: "mcq",
    section: "A",
    number: 14,
    questionText: "Your application needs to store millions of user-uploaded images. Which storage is suitable?",
    options: [
      "A) RAM storage",
      "B) Object storage",
      "C) CPU cache",
      "D) Local temporary storage"
    ],
    marks: 4
  },
  {
    id: 2015,
    type: "mcq",
    section: "A",
    number: 15,
    questionText: "Your application needs to process payments, emails, and notifications independently. Which architecture is better?",
    options: [
      "A) Microservices architecture",
      "B) Single HTML page",
      "C) One database table",
      "D) Static website"
    ],
    marks: 4
  },
  {
    id: 2016,
    type: "mcq",
    section: "A",
    number: 16,
    questionText: "Your company wants developers to deploy code automatically after every Git push. What is required?",
    options: [
      "A) CI/CD Pipeline",
      "B) Jenkins/GitHub Actions",
      "C) Automated Testing",
      "D) All of the above"
    ],
    marks: 4
  },
  {
    id: 2017,
    type: "mcq",
    section: "A",
    number: 17,
    questionText: "Which application is used for WhatsApp chats?",
    options: [
      "A) WebSockets",
      "B) FTP",
      "C) HTML only",
      "D) None of these"
    ],
    marks: 4
  },
  {
    id: 2018,
    type: "mcq",
    section: "A",
    number: 18,
    questionText: "Which architecture is suitable for Uber-like applications?",
    options: [
      "A) Mobile App → API → Services → Database → Cloud",
      "B) Mobile App → Database directly",
      "C) HTML file only",
      "D) None of these"
    ],
    marks: 4
  },
  {
    id: 2019,
    type: "mcq",
    section: "A",
    number: 19,
    questionText: "If your company wants users to authenticate using Google/Facebook accounts, which technology?",
    options: [
      "A) OAuth",
      "B) FTP",
      "C) SSH",
      "D) DNS"
    ],
    marks: 4
  },

  // ─────────────────────────────────────────────────────────────
  // SECTION B — Scenario-Based Open-Ended Questions (10 marks each)
  // ─────────────────────────────────────────────────────────────
  {
    id: 2101,
    type: "open",
    section: "B",
    number: 1,
    questionText: "Scenario: A production Linux server (RHEL 8) shows gradual memory increase over 72 hours until OOM Killer fires, taking down your Java microservice. The heap dump shows normal object sizes.\n\nWalk through your systematic diagnostic approach to identify whether this is a JVM heap leak, native memory leak, or OS-level memory pressure issue. What commands and tools would you use at each layer?",
    marks: 10
  },
  {
    id: 2102,
    type: "open",
    section: "B",
    number: 2,
    questionText: "Scenario: You architect a multi-tenant SaaS on AWS. Each tenant must have complete data isolation. You have 10,000 tenants. Cost, operational overhead, and security isolation are all constraints.\n\nCompare and justify your choice between: (a) one AWS account per tenant, (b) one VPC per tenant in a shared account, (c) namespace-level isolation using IAM + S3 bucket prefixes. Under what tenant profile does each model break down?",
    marks: 10
  },
  {
    id: 2103,
    type: "open",
    section: "B",
    number: 3,
    questionText: "Scenario: Your CTO wants a disaster recovery strategy across AWS and GCP for a stateful PostgreSQL database with an RPO of 30 seconds and RTO of 5 minutes. The primary runs on AWS RDS Aurora.\n\nDesign a cross-cloud DR architecture. Address replication mechanism, failover automation, network path, and what would fail to meet RPO/RTO — and why.",
    marks: 10
  },
  {
    id: 2104,
    type: "open",
    section: "B",
    number: 4,
    questionText: "Scenario: A Linux NFS server is serving 500 clients. Read throughput is good but write performance is terrible. Clients report write latency of 2-5 seconds. The server has SSD storage, 10Gbps NIC, and plenty of RAM.\n\nDiagnose this systematically. Explain the role of NFS sync vs async, how client-side caching interacts with write-back, and what server-side tuning parameters you would change. What are the data integrity trade-offs of each fix?",
    marks: 10
  },
  {
    id: 2105,
    type: "open",
    section: "B",
    number: 5,
    questionText: "Scenario: Your AWS bill increased by $80,000 last month. The spike correlates with S3 GET requests increasing 1000x. You suspect a misconfigured public bucket, but CloudTrail shows requests from hundreds of different IPs.\n\nWalk through your forensic investigation process, how you'd stop the bleeding immediately, and what architectural controls would prevent this in future. Consider both reactive and preventive measures.",
    marks: 10
  },
  {
    id: 2106,
    type: "open",
    section: "B",
    number: 6,
    questionText: "Scenario: Your organization needs to comply with GDPR. Customer PII is stored across AWS RDS (EU-West-1), an on-prem Oracle DB in Germany, and occasionally lands in S3 logs in US-East-1 due to a logging misconfiguration.\n\nDesign a data residency enforcement architecture. Address data classification, movement controls, the S3 log issue specifically, and how you'd prove compliance to an auditor.",
    marks: 10
  },
  {
    id: 2107,
    type: "open",
    section: "B",
    number: 7,
    questionText: "Scenario: Your team is building a real-time fraud detection system on AWS that must analyze 500,000 transactions per second with sub-100ms end-to-end latency. The ML model runs inference in 20ms. The system must be fault-tolerant across 2 AZs.\n\nDesign the complete data pipeline from ingestion to result delivery. Justify every service choice against the latency and throughput constraints. Identify the single most likely bottleneck.",
    marks: 10
  },
  {
    id: 2108,
    type: "open",
    section: "B",
    number: 8,
    questionText: "Scenario: A senior engineer claims: 'We should move from bare-metal servers to VMs on-prem, then containerize everything on those VMs, then put that entire stack into a public cloud.' Your CTO asks you to technically evaluate this 3-tier virtualization nesting strategy.\n\nAnalyze the performance overhead at each virtualization layer, the security attack surface changes at each boundary, and make a technically grounded recommendation with specific metrics a scientist would cite.",
    marks: 10
  }
];
