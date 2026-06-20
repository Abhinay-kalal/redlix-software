/**
 * Redlix Training Exam 01 — Question Bank
 * =========================================
 * Section A  : Q1–Q15  MCQ (1 mark each) — ids 1001–1015
 * Section B  : Q16–Q17 Scenario-Based (5 marks each) — ids 1016–1017
 * Section C  : Q18–Q21 Full-Stack Coding (10 marks each) — ids 1018–1021
 *
 * Answers are stored in training01AnswerKey.ts (separate file).
 */

import { Question } from "./questions";

export const TRAINING01_QUESTIONS: Question[] = [
  // ─────────────────────────────────────────────────────────────
  // SECTION A — Multiple Choice Questions (1 mark each)
  // ─────────────────────────────────────────────────────────────
  {
    id: 1001,
    type: "mcq",
    section: "A",
    number: 1,
    questionText:
      "Q1. Which AWS service is used to store objects like images, videos, and backups?",
    options: [
      "A) EC2",
      "B) S3",
      "C) Lambda",
      "D) RDS",
    ],
    marks: 1,
  },
  {
    id: 1002,
    type: "mcq",
    section: "A",
    number: 2,
    questionText:
      "Q2. Which protocol is used for secure communication between browser and server?",
    options: [
      "A) FTP",
      "B) HTTP",
      "C) HTTPS",
      "D) SMTP",
    ],
    marks: 1,
  },
  {
    id: 1003,
    type: "mcq",
    section: "A",
    number: 3,
    questionText: "Q3. IAM is mainly used for:",
    options: [
      "A) Database storage",
      "B) User access management",
      "C) File compression",
      "D) Code compilation",
    ],
    marks: 1,
  },
  {
    id: 1004,
    type: "mcq",
    section: "A",
    number: 4,
    questionText: "Q4. DNS is used to convert:",
    options: [
      "A) IP → Code",
      "B) Domain → IP Address",
      "C) Database → Server",
      "D) HTML → CSS",
    ],
    marks: 1,
  },
  {
    id: 1005,
    type: "mcq",
    section: "A",
    number: 5,
    questionText: "Q5. CDN is mainly used to:",
    options: [
      "A) Store passwords",
      "B) Reduce latency",
      "C) Write code",
      "D) Create databases",
    ],
    marks: 1,
  },
  {
    id: 1006,
    type: "mcq",
    section: "A",
    number: 6,
    questionText:
      "Q6. Which ports are commonly used for HTTP and HTTPS respectively?",
    options: [
      "A) 126, 22",
      "B) 22, 126",
      "C) 80, 443",
      "D) 443, 80",
    ],
    marks: 1,
  },
  {
    id: 1007,
    type: "mcq",
    section: "A",
    number: 7,
    questionText: "Q7. Nginx is mainly used as:",
    options: [
      "A) Database",
      "B) Web Server / Reverse Proxy",
      "C) Programming Language",
      "D) Operating System",
    ],
    marks: 1,
  },
  {
    id: 1008,
    type: "mcq",
    section: "A",
    number: 8,
    questionText: "Q8. JSON is mainly used for:",
    options: [
      "A) Data exchange",
      "B) Image editing",
      "C) Video streaming",
      "D) Server hardware",
    ],
    marks: 1,
  },
  {
    id: 1009,
    type: "mcq",
    section: "A",
    number: 9,
    questionText: "Q9. Which file defines Docker build instructions?",
    options: [
      "A) docker.txt",
      "B) Dockerfile",
      "C) container.yml",
      "D) image.json",
    ],
    marks: 1,
  },
  {
    id: 1010,
    type: "mcq",
    section: "A",
    number: 10,
    questionText: "Q10. What is an API?",
    options: [
      "A) A method for communication between software applications",
      "B) A cloud storage service",
      "C) A server hardware component",
      "D) A security tool",
    ],
    marks: 1,
  },
  {
    id: 1011,
    type: "mcq",
    section: "A",
    number: 11,
    questionText: "Q11. What is a Database Index?",
    options: [
      "A) A technique to improve query performance",
      "B) A backup file",
      "C) A programming variable",
      "D) A server",
    ],
    marks: 1,
  },
  {
    id: 1012,
    type: "mcq",
    section: "A",
    number: 12,
    questionText: "Q12. What is Microservices Architecture?",
    options: [
      "A) One large application",
      "B) Application divided into independent smaller services",
      "C) A database model",
      "D) A networking protocol",
    ],
    marks: 1,
  },
  {
    id: 1013,
    type: "mcq",
    section: "A",
    number: 13,
    questionText:
      "Q13. If you want to run applications without managing servers, which option applies?",
    options: [
      "A) Serverless Computing",
      "B) Physical Server",
      "C) Manual Deployment",
      "D) Local Storage",
    ],
    marks: 1,
  },
  {
    id: 1014,
    type: "mcq",
    section: "A",
    number: 14,
    questionText:
      "Q14. If you want a private network inside AWS, which service do you use?",
    options: [
      "A) VPC",
      "B) S3",
      "C) Lambda",
      "D) CloudFront",
    ],
    marks: 1,
  },
  {
    id: 1015,
    type: "mcq",
    section: "A",
    number: 15,
    questionText: "Q15. A reverse proxy is mainly used for:",
    options: [
      "A) User authentication only",
      "B) Routing client requests to backend servers",
      "C) Creating databases",
      "D) Writing frontend code",
    ],
    marks: 1,
  },

  // ─────────────────────────────────────────────────────────────
  // SECTION B — Scenario-Based Questions (5 marks each)
  // ─────────────────────────────────────────────────────────────
  {
    id: 1016,
    type: "mcq",
    section: "B",
    number: 1,
    questionText:
      "Q16. High-Traffic AWS Architecture Bottleneck Analysis\n\n" +
      "A high-traffic application is deployed on Amazon Web Services using the following stack:\n\n" +
      "  • Load Balancer: Application Load Balancer (ALB)\n" +
      "  • Scaling: Auto Scaling Group\n" +
      "  • Cache: Redis Cache\n" +
      "  • Database: PostgreSQL with Read Replicas\n\n" +
      "Suddenly, traffic spikes from 10K req/sec to 1M req/sec. The cache hit ratio drops below 20%.\n\n" +
      "Which layer will most likely become the FIRST bottleneck?\n\n" +
      "Explain your reasoning and describe how you would mitigate this bottleneck using AWS-native solutions.",
    options: [
      "A) Load Balancer",
      "B) Auto Scaling Group",
      "C) PostgreSQL Read Replicas",
      "D) Redis Cluster",
    ],
    marks: 5,
  },
  {
    id: 1017,
    type: "mcq",
    section: "B",
    number: 2,
    questionText:
      "Q17. Kubernetes Pod Debugging — CrashLoopBackOff\n\n" +
      "In a Kubernetes cluster, a pod is stuck in CrashLoopBackOff. The application depends on: " +
      "ConfigMap, Secret, Persistent Volume, and an External API.\n\n" +
      "Which debugging order is most optimal?\n\n" +
      "Justify the optimal debugging sequence and state the kubectl commands you would use at each step.",
    options: [
      "A) Logs → Events → Describe Pod → Check Volume",
      "B) Describe Pod → Logs → Check ConfigMap/Secrets → Check Dependencies",
      "C) Restart Deployment → Check Logs → Scale Pods",
      "D) Delete Pod → Recreate Deployment",
    ],
    marks: 5,
  },

  // ─────────────────────────────────────────────────────────────
  // SECTION C — Full Stack Coding Problems (10 marks each)
  // ─────────────────────────────────────────────────────────────
  {
    id: 1018,
    type: "coding",
    section: "B",
    number: 3,
    questionText:
      "Q18. Distributed Token Bucket Rate Limiter (Node.js / Python)\n\n" +
      "Design and implement a distributed token bucket rate limiter:\n\n" +
      "  • Limit: 100 requests per minute per user\n" +
      "  • State Sharing: Multiple servers must share state\n" +
      "  • Storage: Use Redis for synchronization\n" +
      "  • Correctness: Must handle race conditions atomically\n" +
      "  • Performance: O(1) time complexity required\n\n" +
      "Sample Input/Output:\n" +
      "  Input:  user1 at t=10, user1 at t=11, ...\n" +
      "  Output: ALLOW / ALLOW / BLOCK\n\n" +
      "Write code for:\n" +
      "  (a) Token refill logic\n" +
      "  (b) Atomic consume logic using Redis Lua script\n" +
      "  (c) TTL cleanup mechanism",
    sampleInput: "checkRateLimit('user1') // called multiple times rapidly",
    sampleOutput: "ALLOW\nALLOW\nALLOW\n... (up to 100 times)\nBLOCK",
    starterCode:
      `// Distributed Token Bucket Rate Limiter
// Use Redis Lua scripts for atomic operations

const redis = require('redis'); // assume connected Redis client

const LIMIT = 100;       // max tokens per window
const WINDOW = 60;       // window in seconds

// Lua script for atomic token consumption
const luaScript = \`
  -- KEYS[1] = rate limit key  ARGV[1] = limit  ARGV[2] = window_seconds
  local key    = KEYS[1]
  local limit  = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local current = redis.call("GET", key)
  if current and tonumber(current) >= limit then
    return 0  -- BLOCK
  end
  -- TODO: implement atomic increment + TTL logic
  return 1  -- ALLOW
\`;

async function checkRateLimit(userId) {
  const key = \`rate:\${userId}\`;
  // TODO: execute lua script and return 'ALLOW' or 'BLOCK'
}

// (a) Token refill logic
function refillTokens(userId) {
  // TODO: implement refill
}

// (c) TTL cleanup mechanism
function setupCleanup(client) {
  // TODO: implement cleanup using Redis TTL
}

module.exports = { checkRateLimit, refillTokens, setupCleanup };
`,
    marks: 10,
  },
  {
    id: 1019,
    type: "coding",
    section: "B",
    number: 4,
    questionText:
      "Q19a. Distributed File Upload System (Backend)\n\n" +
      "Build backend code for a resumable chunked file upload system:\n\n" +
      "  • Upload file chunks to server with resume capability if interrupted\n" +
      "  • Merge all chunks after completion with hash integrity validation\n" +
      "  • Store file metadata in MongoDB and final files in Amazon S3\n\n" +
      "Sample: file_id=abc123, chunk=4/20 → Chunk uploaded successfully\n\n" +
      "Write: API endpoints | Merge logic | Retry logic",
    sampleInput:
      "POST /upload/chunk  { fileId: 'abc123', chunkIndex: 4, totalChunks: 20, data: <binary> }",
    sampleOutput: '{ success: true, message: "Chunk 4/20 uploaded successfully" }',
    starterCode:
      `// Resumable Chunked File Upload System
const express = require('express');
const crypto  = require('crypto');
const app     = express();
app.use(express.json({ limit: '50mb' }));

// POST /upload/chunk — Upload a single chunk
app.post('/upload/chunk', async (req, res) => {
  const { fileId, chunkIndex, totalChunks, data } = req.body;
  // TODO: validate inputs, save chunk to temp storage
  // TODO: track uploaded chunks in MongoDB
  res.json({ success: true, message: \`Chunk \${chunkIndex}/\${totalChunks} uploaded successfully\` });
});

// POST /upload/merge — Merge chunks and upload to S3
app.post('/upload/merge', async (req, res) => {
  const { fileId, fileName, expectedHash } = req.body;
  // TODO: retrieve all chunks, merge them in order
  // TODO: compute SHA-256 hash and compare with expectedHash
  // TODO: upload merged file to S3
  // TODO: update metadata in MongoDB
  res.json({ success: true, url: 's3://bucket/path/to/file' });
});

// GET /upload/status/:fileId — Resume support: return uploaded chunk indices
app.get('/upload/status/:fileId', async (req, res) => {
  const { fileId } = req.params;
  // TODO: fetch uploaded chunk list from MongoDB
  res.json({ uploadedChunks: [] });
});

app.listen(3000, () => console.log('Upload server running'));
`,
    marks: 10,
  },
  {
    id: 1020,
    type: "coding",
    section: "B",
    number: 5,
    questionText:
      "Q19b. Load Balancer Simulator\n\n" +
      "Implement a mini load balancer supporting four algorithms:\n\n" +
      "  1. Round Robin           — Distribute requests sequentially across servers\n" +
      "  2. Least Connections     — Route to server with fewest active connections\n" +
      "  3. Weighted Round Robin  — Distribute proportionally based on server weight\n" +
      "  4. Health Check Failover — Skip failed servers; auto-recover on health check\n\n" +
      "Constraints:\n" +
      "  • 10 servers | Random request duration | Servers can fail anytime | Auto-recovery required\n\n" +
      "Expected Output: S1 handled 312 / S2 handled 340 / S3 handled 348\n\n" +
      "Write: Scheduler | Failure Detector | Recovery Logic | Metrics Collector",
    sampleInput: "simulate(1000) // simulate 1000 requests",
    sampleOutput:
      "S1 handled 312\nS2 handled 340\nS3 handled 348\n...\nTotal: 1000 requests distributed",
    starterCode:
      `// Mini Load Balancer Simulator

const servers = Array.from({ length: 10 }, (_, i) => ({
  id: \`S\${i + 1}\`,
  weight: Math.floor(Math.random() * 5) + 1,
  connections: 0,
  healthy: true,
  handled: 0,
}));

let rrIndex = 0; // Round Robin index

// Algorithm 1: Round Robin
function roundRobin() {
  // TODO: skip unhealthy servers, cycle through all healthy servers
  const healthy = servers.filter(s => s.healthy);
  if (!healthy.length) throw new Error('No healthy servers');
  const server = healthy[rrIndex % healthy.length];
  rrIndex++;
  return server;
}

// Algorithm 2: Least Connections
function leastConnections() {
  // TODO: return healthy server with minimum active connections
}

// Algorithm 3: Weighted Round Robin
function weightedRoundRobin() {
  // TODO: distribute requests proportionally based on server weight
}

// Health Check — run every 5 seconds (simulated)
function healthCheck() {
  servers.forEach(server => {
    // TODO: simulate health check, auto-recover if previously failed
    server.healthy = Math.random() > 0.1; // 90% uptime
  });
}

// Simulate request handling
function handleRequest(algorithm = 'roundRobin') {
  let server;
  if (algorithm === 'roundRobin')         server = roundRobin();
  else if (algorithm === 'leastConn')     server = leastConnections();
  else if (algorithm === 'weighted')      server = weightedRoundRobin();
  else                                    server = roundRobin();

  server.connections++;
  server.handled++;
  const duration = Math.random() * 100; // random ms
  setTimeout(() => { server.connections = Math.max(0, server.connections - 1); }, duration);
}

// Simulate N requests
function simulate(n = 1000, algorithm = 'roundRobin') {
  for (let i = 0; i < n; i++) {
    if (i % 50 === 0) healthCheck(); // health check every 50 requests
    handleRequest(algorithm);
  }
  servers.forEach(s => console.log(\`\${s.id} handled \${s.handled}\`));
}

module.exports = { simulate, roundRobin, leastConnections, weightedRoundRobin };
`,
    marks: 10,
  },
  {
    id: 1021,
    type: "coding",
    section: "B",
    number: 6,
    questionText:
      "Q20 & Q21. Full Stack System — Login API + To-Do Application\n\n" +
      "Part A — Full Stack Login API (Frontend + Backend + Database)\n" +
      "  • Build a login form accepting email and password (HTML/CSS/JS)\n" +
      "  • Store user data securely in MongoDB (bcrypt for password hashing)\n" +
      "  • Validate credentials via POST /login\n" +
      "  • Return: { status: 200, message: 'Login Successful' } or error\n" +
      "  • Use JWT or session for auth\n\n" +
      "Part B — Full Stack To-Do Application (React + Node.js + MongoDB)\n" +
      "  • POST /tasks   — Add task\n" +
      "  • GET  /tasks   — View all tasks\n" +
      "  • DELETE /tasks/:id — Delete task\n" +
      "  • PATCH  /tasks/:id — Mark complete\n" +
      "  • Input: Task: 'Complete assignment' → Output: 'Task Added Successfully'\n\n" +
      "Write:\n" +
      "  1. Express API routes for both login (/login) and tasks (/tasks)\n" +
      "  2. MongoDB schemas (User + Task) using Mongoose\n" +
      "  3. Frontend form & React component logic (include in comments/pseudocode if needed)",
    sampleInput:
      "POST /login  { email: 'user@gmail.com', password: '123456' }\nPOST /tasks  { title: 'Complete assignment' }",
    sampleOutput:
      '{ status: 200, message: "Login Successful", token: "<jwt>" }\n{ status: 201, message: "Task Added Successfully", task: { id: "...", title: "Complete assignment" } }',
    starterCode:
      `// ── Part A: Login API ──────────────────────────────────────────
const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// MongoDB — User Schema
const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },           // hashed
});
const User = mongoose.model('User', userSchema);

// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // TODO: find user by email
  // TODO: compare bcrypt hash
  // TODO: sign JWT and return
  res.json({ status: 200, message: 'Login Successful', token: '<jwt>' });
});

// ── Part B: To-Do API ──────────────────────────────────────────
const taskSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date,   default: Date.now },
});
const Task = mongoose.model('Task', taskSchema);

// POST /tasks — Add task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  // TODO: validate and create task
  res.status(201).json({ status: 201, message: 'Task Added Successfully' });
});

// GET /tasks — View all tasks
app.get('/tasks', async (req, res) => {
  // TODO: fetch all tasks from MongoDB
  res.json({ tasks: [] });
});

// DELETE /tasks/:id — Delete task
app.delete('/tasks/:id', async (req, res) => {
  // TODO: remove task by id
  res.json({ message: 'Task deleted successfully' });
});

// PATCH /tasks/:id — Mark task complete
app.patch('/tasks/:id', async (req, res) => {
  // TODO: update completed = true
  res.json({ message: 'Task marked as complete' });
});

// ── Frontend Pseudocode (React Component) ──────────────────────
/*
function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput]  = useState('');

  const addTask = async () => {
    const res = await fetch('/tasks', { method: 'POST', body: JSON.stringify({ title: input }) });
    // refresh task list
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTask}>Add Task</button>
      {tasks.map(t => <div key={t._id}>{t.title}</div>)}
    </div>
  );
}
*/

mongoose.connect('mongodb://localhost:27017/redlix').then(() =>
  app.listen(3001, () => console.log('Server running on port 3001'))
);
`,
    marks: 10,
  },
];
