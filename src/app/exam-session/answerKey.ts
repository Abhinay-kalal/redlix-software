// Answer key for all 100 MCQ questions (Section A)
// Key: question id → correct option letter (A/B/C/D)
// MCQ marks: 3 per question
// Coding marks: 10 per question (manually graded — shown as submitted/not submitted)

export const ANSWER_KEY: Record<number, string> = {
  1:  "B", // Event loop: Start→End→Promise1→Microtask1→Promise2→Timeout
  2:  "B", // setImmediate before setTimeout inside fs.readFile callback
  3:  "B", // React 18 auto-batching in all async contexts
  4:  "A", // Fiber: render phase interruptible, commit phase synchronous
  5:  "B", // Prototype pollution: recursive copy without __proto__ checks
  6:  "B", // ESR rule: {status:1, name:1, age:1}
  7:  "A", // next(err) skips to error-handling middleware (4-param)
  8:  "A", // alg:none allows signature bypass
  9:  "B", // no-cache = revalidate; no-store = never cache
  10: "B", // TransientTransactionError = retry on network/write conflicts
  11: "B", // git reflog to recover lost commits
  12: "B", // WeakMap holds weak refs — eligible for GC when no other refs
  13: "B", // Stale closure: useEffect captures initial count=0
  14: "A", // Backpressure: write() returns false when buffer full
  15: "B", // receiver = proxy/inheriting obj for correct 'this' in Reflect.get
  16: "B", // PUT idempotent+full replace; PATCH not guaranteed idempotent
  17: "B", // credentials:include needs exact origin (not *) + Allow-Credentials:true
  18: "B", // MongoDB agg >100MB fails; fix: allowDiskUse:true
  19: "B", // worker_threads share memory via SharedArrayBuffer; child_process isolated
  20: "B", // cherry-pick = 3-way merge (parent, picked commit, HEAD)
  21: "C", // var hoisting — console.log(x) → undefined
  22: "B", // Split context into multiple providers or memoize slice selectors
  23: "B", // HTTP/2 binary frames interleaved over single TCP connection
  24: "B", // Write Skew under Repeatable Read/Snapshot; prevented by Serializable
  25: "B", // Partial index: filter expressions; Sparse: only field presence
  26: "A", // freeze=read-only+non-configurable; seal=no add/remove but editable
  27: "B", // JWT revocation: short TTL + backend refresh token blacklist
  28: "B", // ReDoS — catastrophic backtracking on route regex
  29: "B", // useLayoutEffect: sync DOM measurement before paint
  30: "B", // Primitives have no unique identity → weak refs inapplicable
  31: "C", // Generator returns object implementing Iterable+Iterator protocols
  32: "B", // Hydration = React attaching event listeners to SSR HTML
  33: "C", // Hydration mismatch: DOM differs from server HTML → layout bugs
  34: "B", // useSyncExternalStore: subscribe to external mutable stores safely
  35: "B", // Concurrent Mode: lane-based priority (user input vs transitions)
  36: "B", // Mutating state directly: ref changes but no re-render triggered
  37: "B", // Buffer.allocUnsafe: uninitialized memory — may contain old data
  38: "B", // exports field: subpaths, restricted internals, conditional ESM/CJS
  39: "B", // cluster: master creates socket, distributes to workers via IPC/round-robin
  40: "C", // Node.js 'vm' module for isolated V8 contexts
  41: "B", // Atomics: thread-safe ops on SharedArrayBuffer, prevents data races
  42: "A", // No next() or response: request hangs until timeout
  43: "B", // helmet: sets secure HTTP headers (CSP, HSTS, XSS-Protection, etc.)
  44: "A", // frame-ancestors in CSP prevents clickjacking
  45: "A", // sparse: field must exist; partial: filter expression
  46: "B", // $graphLookup: recursive graph/tree traversal
  47: "A", // majority write concern: ack after majority of replica nodes
  48: "C", // snapshot read concern for snapshot isolation in transactions
  49: "B", // MVCC: readers don't block writers, writers don't block readers
  50: "B", // Repeatable Read prevents non-repeatable reads (and phantoms in PG)
  51: "B", // GIN: indexing multi-valued types (arrays, JSONB, full-text)
  52: "B", // git cherry-pick
  53: "B", // git commit object: tree hash + parent hash(es) + author + message
  54: "C", // PKCE: prevents auth code interception via code_verifier/challenge
  55: "C", // SameSite restricts cross-site cookie sending
  56: "B", // Object.keys returns ['a']; b is non-enumerable; obj.b = 2
  57: "C", // Both A and B are leaks; B specifically keeps bigData in closure
  58: "B", // preventExtensions: only blocks adding; seal: blocks add/remove + configurable:false
  59: "B", // 0.1 + 0.2 !== 0.3 due to binary float rounding
  60: "B", // ESM: top-level await + static treeshaking; CJS: synchronous require
  61: "A", // useDeferredValue defers updating part of UI
  62: "A", // RSC: reduce client bundle by keeping server-side components on server
  63: "B", // Index as key: bugs when list items added/removed/reordered
  64: "B", // useLayoutEffect: sync after DOM mutations, before paint; useEffect: async after paint
  65: "B", // Promise callbacks → Microtask Queue
  66: "B", // pipe() redirects readable to writable
  67: "C", // Error handler signature: (err, req, res, next)
  68: "B", // If-Match used with PUT/PATCH for conditional updates
  69: "B", // ETag: unique version identifier/hash for a resource
  70: "B", // B-Tree: range queries + sorting; Hash: equality only
  71: "B", // LEFT OUTER JOIN: matching rows + NULLs for unmatched right rows
  72: "A", // git tree object: directory structure mapping files/subdirs to hashes
  73: "B", // CORS: server controls which origins can read responses
  74: "B", // Symbol: unique primitive identifiers, usable as object keys
  75: "C", // typeof null === 'object' (historical bug)
  76: "B", // ref.current: mutable container, changes don't trigger re-renders
  77: "B", // useMemo: memoizes computed values across re-renders
  78: "C", // 'drain' event: writable buffer flushed, ready for more data
  79: "B", // spawn: stream output; exec: buffer entire output in memory
  80: "A", // * is the wildcard matching zero or more characters in Express
  81: "B", // $unwind: deconstructs array field into per-element documents
  82: "A", // Primary node: receives all writes, replicates to secondaries
  83: "B", // GIN index: optimized for full-text search
  84: "B", // CROSS JOIN: Cartesian product of two tables
  85: "A", // git blob object: file data content
  86: "B", // Content-Security-Policy header restricts resource sources
  87: "B", // Deep clone: JSON.parse(JSON.stringify()) or structuredClone()
  88: "B", // forEach: no return; map: returns new array with mapped values
  89: "B", // Default: all children re-render unless memoized
  90: "B", // 'use strict': stricter parsing, silent bugs become errors
  91: "B", // Streams: process chunks without loading full file into RAM
  92: "B", // 409 Conflict: resource state conflict (e.g. concurrent edits)
  93: "C", // Dirty Read: reading uncommitted data from concurrent transaction
  94: "B", // git tag object: commit hash + signature + message + creator + timestamp
  95: "B", // SOP: prevents cross-origin scripts from reading/modifying data
  96: "C", // CORS: both Allow-Origin and Allow-Methods needed
  97: "A", // Object.create(null): no prototype chain at all
  98: "B", // useContext: consume context in functional component without Consumer tag
  99: "A", // Buffer.from('A').toJSON() → { type: 'Buffer', data: [65] }
  100: "A", // HTTP/3 QUIC connection migration: change IP without dropping connection
};

export const MCQ_MARKS_PER_QUESTION = 3;
export const CODING_MARKS_PER_QUESTION = 10;
export const TOTAL_MCQ_IN_EXAM = 30;
export const TOTAL_CODING_IN_EXAM = 10;
export const MAX_MCQ_MARKS = TOTAL_MCQ_IN_EXAM * MCQ_MARKS_PER_QUESTION;   // 90
export const MAX_CODING_MARKS = TOTAL_CODING_IN_EXAM * CODING_MARKS_PER_QUESTION; // 100
export const MAX_TOTAL_MARKS = MAX_MCQ_MARKS + MAX_CODING_MARKS;             // 190

export function gradeMCQ(answers: Record<string | number, string>): {
  correct: number;
  wrong: number;
  unattempted: number;
  marksObtained: number;
  breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }>;
} {
  const breakdown: Record<number, { selected: string; correct: string; isCorrect: boolean }> = {};
  let correct = 0;
  let wrong = 0;

  for (const [qId, correctAns] of Object.entries(ANSWER_KEY)) {
    const id = Number(qId);
    const selected = (answers[id] || "").toString().trim().charAt(0).toUpperCase();
    const isAnswered = selected !== "";
    const isCorrect = isAnswered && selected === correctAns;

    if (isAnswered) {
      breakdown[id] = { selected, correct: correctAns, isCorrect };
      if (isCorrect) correct++;
      else wrong++;
    }
  }

  const unattempted = TOTAL_MCQ_IN_EXAM - (correct + wrong);

  return {
    correct,
    wrong,
    unattempted: Math.max(0, unattempted),
    marksObtained: correct * MCQ_MARKS_PER_QUESTION,
    breakdown,
  };
}

export function gradeCoding(answers: Record<string | number, string>): {
  attempted: number;
  marksObtained: number; // awarded for attempted (manual review assumed full marks)
} {
  const CODING_IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
  const attempted = CODING_IDS.filter((id) => {
    const val = (answers[id] || "").toString().trim();
    // Must have actual code beyond just starter boilerplate
    return val.length > 10;
  }).length;

  return {
    attempted,
    marksObtained: attempted * CODING_MARKS_PER_QUESTION,
  };
}
