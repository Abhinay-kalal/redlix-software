export interface Question {
  id: number;
  type: "mcq" | "coding" | "open";
  section: "A" | "B" | "C";
  number: number;
  questionText: string;
  options?: string[];
  sampleInput?: string;
  sampleOutput?: string;
  starterCode?: string;
  marks: number;
}

export const QUESTIONS: Question[] = [
  // SECTION A: MCQS (1-100)
  {
    id: 1,
    type: "mcq",
    section: "A",
    number: 1,
    questionText: "What is the output of the following JavaScript code execution?\n\nconsole.log('Start');\nsetTimeout(() => console.log('Timeout'), 0);\nPromise.resolve().then(() => {\n  console.log('Promise 1');\n  queueMicrotask(() => console.log('Microtask 1'));\n}).then(() => console.log('Promise 2'));\nconsole.log('End');",
    options: [
      "A) Start, End, Promise 1, Promise 2, Microtask 1, Timeout",
      "B) Start, End, Promise 1, Microtask 1, Promise 2, Timeout",
      "C) Start, End, Promise 1, Promise 2, Timeout, Microtask 1",
      "D) Start, Promise 1, End, Promise 2, Microtask 1, Timeout"
    ],
    marks: 3
  },
  {
    id: 2,
    type: "mcq",
    section: "A",
    number: 2,
    questionText: "In Node.js, when fs.readFile() callback completes and schedules setImmediate() and setTimeout(..., 0), which statement is true about their execution order?",
    options: [
      "A) setTimeout always runs before setImmediate because timers are checked first in the event loop.",
      "B) setImmediate always runs before setTimeout because the poll phase transitions directly to the check phase where setImmediate is queued.",
      "C) The order is non-deterministic and entirely dependent on CPU cycle scheduling at runtime.",
      "D) They execute concurrently on parallel threads of the libuv thread pool."
    ],
    marks: 3
  },
  {
    id: 3,
    type: "mcq",
    section: "A",
    number: 3,
    questionText: "In React 18, how does automatic batching behave inside asynchronous workflows like Promises, fetch callbacks, and setTimeout?",
    options: [
      "A) State updates are only batched inside native browser events; async flows trigger direct, synchronous re-renders.",
      "B) React 18 batches updates automatically across all microtask and macrotask queues, rendering once at the end of the batch.",
      "C) Async updates require wrapping in unstable_batchedUpdates to batch, otherwise they are bypassed.",
      "D) State updates inside async workflows are executed on separate web worker threads to avoid layout blocking."
    ],
    marks: 3
  },
  {
    id: 4,
    type: "mcq",
    section: "A",
    number: 4,
    questionText: "During React Fiber reconciliation, what is the primary operational difference between the 'render phase' and the 'commit phase'?",
    options: [
      "A) The render phase can be interrupted and paused to prioritize user interaction, whereas the commit phase is synchronous and cannot be interrupted.",
      "B) The render phase mutates the actual DOM directly, while the commit phase only builds the virtual tree representation.",
      "C) The render phase executes useEffect cleanups, while the commit phase performs state value initialization.",
      "D) The render phase is fully synchronous, while the commit phase uses requestIdleCallback for layout batching."
    ],
    marks: 3
  },
  {
    id: 5,
    type: "mcq",
    section: "A",
    number: 5,
    questionText: "Which of the following recursive object merge implementations is vulnerable to Prototype Pollution?",
    options: [
      "A) Assigning properties using Object.assign({}, source).",
      "B) Directly copying keys recursively without checking key names like '__proto__' or 'constructor.prototype'.",
      "C) Restructuring properties using the ES6 spread operator { ...target, ...source }.",
      "D) Performing checks using Object.defineProperty to shadow parent prototype descriptors."
    ],
    marks: 3
  },
  {
    id: 6,
    type: "mcq",
    section: "A",
    number: 6,
    questionText: "To optimize a MongoDB query db.users.find({ status: 'active', age: { $gt: 21 } }).sort({ name: 1 }) using a compound index, what order of keys adheres strictly to the ESR (Equality, Sort, Range) rule?",
    options: [
      "A) { age: 1, name: 1, status: 1 }",
      "B) { status: 1, name: 1, age: 1 }",
      "C) { name: 1, status: 1, age: 1 }",
      "D) { status: 1, age: 1, name: 1 }"
    ],
    marks: 3
  },
  {
    id: 7,
    type: "mcq",
    section: "A",
    number: 7,
    questionText: "In Express.js, if a middleware chains next(err), how does Express handle route resolution?",
    options: [
      "A) It skips all remaining non-error-handling middlewares and executes the first defined middleware with the signature (err, req, res, next).",
      "B) It returns an HTTP 500 error immediately and terminates the socket connection.",
      "C) It executes the next route path handler matching the original request string.",
      "D) It registers the error in the process.env context and continues executing subsequent normal middlewares."
    ],
    marks: 3
  },
  {
    id: 8,
    type: "mcq",
    section: "A",
    number: 8,
    questionText: "What is the security risk of configuring a JWT validator with a fallback that honors the 'alg: none' header field?",
    options: [
      "A) It allows attackers to craft a valid token with modified claims and signature section removed, bypassing verification.",
      "B) It forces the client to use public-key cryptography which slows down network performance.",
      "C) It leaks the server secret key via the token payload.",
      "D) It prevents key rotation, forcing developers to reuse expired tokens."
    ],
    marks: 3
  },
  {
    id: 9,
    type: "mcq",
    section: "A",
    number: 9,
    questionText: "What is the functional difference between the Cache-Control response directives 'no-cache' and 'no-store'?",
    options: [
      "A) 'no-cache' prevents local caching; 'no-store' prevents public proxy caching.",
      "B) 'no-cache' forces validation with the origin server before using cached content; 'no-store' completely prevents storing the response in any cache.",
      "C) 'no-store' instructs the browser to download files only via HTTP/2 stream multiplexing.",
      "D) 'no-cache' applies strictly to HTML files, whereas 'no-store' applies only to binary images and scripts."
    ],
    marks: 3
  },
  {
    id: 10,
    type: "mcq",
    section: "A",
    number: 10,
    questionText: "Under what condition does a MongoDB multi-document transaction throw a TransientTransactionError?",
    options: [
      "A) When updates are done on documents that do not contain a primary index key.",
      "B) Due to transient network errors or temporary write conflicts; the operation should be retried by the application.",
      "C) If the transaction lifetime limit (default 60 seconds) is exceeded by complex lookups.",
      "D) When attempting to create a collection inside the transaction container."
    ],
    marks: 3
  },
  {
    id: 11,
    type: "mcq",
    section: "A",
    number: 11,
    questionText: "A developer runs 'git reset --hard HEAD~5' by mistake and loses five commit records. How can they locate and restore these commits?",
    options: [
      "A) By running git checkout -f on the root repository directory.",
      "B) By inspecting git reflog to find the commit SHA-1 hashes before the reset and running git reset --hard <SHA-1>.",
      "C) By executing git merge origin/master with the --force-commit flag.",
      "D) By inspecting the index staging file using git diff-tree --cached."
    ],
    marks: 3
  },
  {
    id: 12,
    type: "mcq",
    section: "A",
    number: 12,
    questionText: "Which statement is correct about the behavior of WeakMap in JavaScript?",
    options: [
      "A) It allows primitive keys and locks them in memory to prevent GC collection.",
      "B) It holds weak references to its key objects; if no other references to a key object remain, it is eligible for garbage collection.",
      "C) It provides an active size property and iterator methods for tracking garbage-collected entities.",
      "D) It keeps its keys alive as long as their corresponding value references are stored in memory."
    ],
    marks: 3
  },
  {
    id: 13,
    type: "mcq",
    section: "A",
    number: 13,
    questionText: "Why does count print 0 inside setInterval callback on every tick even if count state has been incremented?\n\nuseEffect(() => {\n  const id = setInterval(() => { console.log(count); }, 1000);\n  return () => clearInterval(id);\n}, []);",
    options: [
      "A) setInterval executes on a separate V8 process thread with an isolated scope.",
      "B) Due to a stale closure: the hook effect closure only captures the initial count value (0) because count is missing from the dependency array.",
      "C) Because React state variables are automatically frozen when passed to global APIs.",
      "D) Because the compiler optimizations inline the state variables as constants."
    ],
    marks: 3
  },
  {
    id: 14,
    type: "mcq",
    section: "A",
    number: 14,
    questionText: "What is backpressure in Node.js streams and how does a writable stream signal it?",
    options: [
      "A) It is when a readable stream is faster than the writable stream, causing the writable stream's buffer to overflow; signaled when stream.write() returns false.",
      "B) It is a network layer congestion signal, triggered when the connection throws a packet drop exception.",
      "C) It is a memory heap crash event signaled by the process emitting a lowMemory warning.",
      "D) It occurs when a readable stream is piped directly into its own input buffer."
    ],
    marks: 3
  },
  {
    id: 15,
    type: "mcq",
    section: "A",
    number: 15,
    questionText: "In the JavaScript Proxy get(target, property, receiver) trap, what is the role of the 'receiver' argument?",
    options: [
      "A) It specifies the parent prototype configuration context of the target.",
      "B) It is the proxy object or an inheriting object, used to ensure correct 'this' context when forwarding the operation with Reflect.get(target, property, receiver).",
      "C) It is the target container which originally dispatched the property lookups.",
      "D) It is a fallback callback method executed when the property does not exist on the target."
    ],
    marks: 3
  },
  {
    id: 16,
    type: "mcq",
    section: "A",
    number: 16,
    questionText: "According to HTTP specifications, what is the correct conceptual/idempotency difference between HTTP PUT and PATCH methods?",
    options: [
      "A) Both are non-idempotent; PUT replaces a resource while PATCH deletes it.",
      "B) PUT is idempotent and must replace the resource entirely; PATCH is not guaranteed to be idempotent and applies partial modifications.",
      "C) PATCH is idempotent because it applies delta updates; PUT is non-idempotent because it creates new IDs.",
      "D) PUT is used for bulk operations; PATCH is used for asynchronous messaging."
    ],
    marks: 3
  },
  {
    id: 17,
    type: "mcq",
    section: "A",
    number: 17,
    questionText: "When fetch credentials: 'include' is specified, what CORS header combination must the server include to allow access?",
    options: [
      "A) Access-Control-Allow-Origin: * and Access-Control-Allow-Credentials: true",
      "B) Access-Control-Allow-Origin matching the exact request origin domain (not wildcard) and Access-Control-Allow-Credentials: true",
      "C) Access-Control-Allow-Origin: * and Access-Control-Allow-Headers: Authorization",
      "D) Access-Control-Allow-Origin: null and Access-Control-Allow-Credentials: false"
    ],
    marks: 3
  },
  {
    id: 18,
    type: "mcq",
    section: "A",
    number: 18,
    questionText: "What happens if a single MongoDB aggregation pipeline stage exceeds 100MB of RAM memory, and how is this handled?",
    options: [
      "A) The database automatically moves indexed records to local page caches without warnings.",
      "B) The operation fails with an error; resolved by setting the allowDiskUse: true option on the aggregation method call.",
      "C) MongoDB compresses the working memory chunks and restarts the primary node daemon.",
      "D) The server trims the dataset and returns the first 100MB of documents silently."
    ],
    marks: 3
  },
  {
    id: 19,
    type: "mcq",
    section: "A",
    number: 19,
    questionText: "What is a key difference between Node.js worker_threads and child_process modules?",
    options: [
      "A) worker_threads execute on separate OS processes; child_process spawns tasks in the same main process memory loop.",
      "B) worker_threads share the same process memory using SharedArrayBuffer; child_process runs in isolated OS processes with independent memory limits.",
      "C) child_process cannot run Javascript binaries; only worker_threads can.",
      "D) worker_threads communicate strictly via TCP sockets; child_process uses standard HTTP endpoints."
    ],
    marks: 3
  },
  {
    id: 20,
    type: "mcq",
    section: "A",
    number: 20,
    questionText: "What merge strategy does Git execute internally during a 'git cherry-pick <commit>' operation?",
    options: [
      "A) A simple patch string replacement of matching lines.",
      "B) A three-way merge between the parent of the cherry-picked commit, the cherry-picked commit itself, and the current HEAD commit.",
      "C) A fast-forward index pointer alignment matching parent timestamps.",
      "D) A clean copy of the commit tree replacing the index staging space."
    ],
    marks: 3
  },
  {
    id: 21,
    type: "mcq",
    section: "A",
    number: 21,
    questionText: "What is printed to the console when executing the following JavaScript snippet?\n\nvar x = 10;\nfunction foo() {\n  console.log(x);\n  var x = 20;\n}\nfoo();",
    options: [
      "A) 10",
      "B) 20",
      "C) undefined",
      "D) ReferenceError: Cannot access 'x' before initialization"
    ],
    marks: 3
  },
  {
    id: 22,
    type: "mcq",
    section: "A",
    number: 22,
    questionText: "To optimize React Context and prevent consumers from re-rendering when unrelated parts of the context value change, which pattern is recommended?",
    options: [
      "A) Wrap the context provider component itself in React.memo.",
      "B) Split the context value into multiple smaller providers, or memoize children components and read value slices using selectors.",
      "C) Set the context default value to a frozen object using Object.freeze.",
      "D) Force component state updates manually using forceUpdate methods."
    ],
    marks: 3
  },
  {
    id: 23,
    type: "mcq",
    section: "A",
    number: 23,
    questionText: "How does HTTP/2 stream multiplexing resolve the Head-of-Line (HoL) blocking issues present in HTTP/1.1?",
    options: [
      "A) By opening multiple TCP tunnels concurrently for every request path.",
      "B) By dividing requests and responses into binary frames and interleaving them concurrently over a single TCP connection.",
      "C) By converting all HTTP methods to GET requests and tunneling them via UDP streams.",
      "D) By using cache-control headers to resolve response assets on client engines."
    ],
    marks: 3
  },
  {
    id: 24,
    type: "mcq",
    section: "A",
    number: 24,
    questionText: "Under which SQL transaction isolation level can Write Skew anomalies occur, and which level is required to prevent it?",
    options: [
      "A) Can occur under Read Committed; prevented by Read Uncommitted.",
      "B) Can occur under Repeatable Read (Snapshot Isolation); prevented by Serializable.",
      "C) Can occur under Serializable; prevented by Repeatable Read.",
      "D) Can occur under Read Committed; prevented by Repeatable Read."
    ],
    marks: 3
  },
  {
    id: 25,
    type: "mcq",
    section: "A",
    number: 25,
    questionText: "What is the primary advantage of a MongoDB Partial Index compared to a Sparse Index?",
    options: [
      "A) Partial Indexes are loaded into RAM buffers, whereas Sparse Indexes are not.",
      "B) Partial Indexes accept filter expressions (e.g. $gt, $eq) to index documents selectively, while Sparse Indexes only check for field presence.",
      "C) Partial Indexes do not use index space in the database files.",
      "D) Partial Indexes can index arrays, whereas Sparse Indexes are limited to objects."
    ],
    marks: 3
  },
  {
    id: 26,
    type: "mcq",
    section: "A",
    number: 26,
    questionText: "What is the exact behavioral difference between Object.freeze() and Object.seal() in JavaScript?",
    options: [
      "A) Object.freeze makes all properties read-only and prevents configuration; Object.seal prevents adding/removing keys but allows editing writable property values.",
      "B) Object.seal makes all fields read-only; Object.freeze allows key deletions but blocks modifications.",
      "C) Object.freeze affects only prototype keys; Object.seal applies strictly to local properties.",
      "D) Object.seal is synchronous, while Object.freeze is asynchronous."
    ],
    marks: 3
  },
  {
    id: 27,
    type: "mcq",
    section: "A",
    number: 27,
    questionText: "Since JWTs are stateless, what is a secure and standard practice to revoke a JWT access token before its expiration?",
    options: [
      "A) Send an HTTP DELETE request to force the client browser to delete localStorage items.",
      "B) Use short access token lifetimes and maintain a backend database blacklist or whitelist of refresh tokens checked during validation.",
      "C) Modify the signature secret dynamically on each client device session.",
      "D) Request a security check from global DNS nameservers."
    ],
    marks: 3
  },
  {
    id: 28,
    type: "mcq",
    section: "A",
    number: 28,
    questionText: "What security vulnerability is directly associated with route matching regex patterns in Express route definitions?",
    options: [
      "A) Prototype pollution inside route parsers.",
      "B) ReDoS (Regular Expression Denial of Service) if user input triggers catastrophic backtracking in route-matching regular expressions.",
      "C) SQL injections through route segments mapping directly to tables.",
      "D) Out-of-memory buffer leaks in the V8 garbage collector."
    ],
    marks: 3
  },
  {
    id: 29,
    type: "mcq",
    section: "A",
    number: 29,
    questionText: "When should React useLayoutEffect be chosen over useEffect?",
    options: [
      "A) For initiating backend REST API fetch queries.",
      "B) To measure DOM dimensions and perform layout updates synchronously before the browser paints the screen, avoiding visual flickers.",
      "C) When the code has to execute exclusively on a Node.js SSR environment.",
      "D) When modifying state variables that do not affect any rendered JSX tags."
    ],
    marks: 3
  },
  {
    id: 30,
    type: "mcq",
    section: "A",
    number: 30,
    questionText: "Why are primitive values (e.g. strings or numbers) not permitted as keys in a JavaScript WeakMap?",
    options: [
      "A) Primitive values are allocated on the stack memory frame, which prevents object tagging.",
      "B) Primitives do not have unique object identities and cannot be garbage collected, making the concept of weak references inapplicable.",
      "C) Primitives are mutable, meaning their hash values can change unpredictably.",
      "D) Primitives require a custom hashing function that WeakMap does not implement."
    ],
    marks: 3
  },
  {
    id: 31,
    type: "mcq",
    section: "A",
    number: 31,
    questionText: "Which of the following is true regarding JavaScript generator functions (*fn)?",
    options: [
      "A) Generators yield control asynchronously using requestAnimationFrame.",
      "B) When calling fn(), the generator function body runs synchronously until the first yield.",
      "C) Calling fn() returns a Generator object that implements both the Iterable and Iterator protocols.",
      "D) Generators utilize secondary threads of the operating system to compute yielded values."
    ],
    marks: 3
  },
  {
    id: 32,
    type: "mcq",
    section: "A",
    number: 32,
    questionText: "In React, what does the term 'hydration' refer to in the context of Server-Side Rendering (SSR)?",
    options: [
      "A) The process of pre-fetching all API data during static site generation (SSG).",
      "B) React attaching event listeners to the server-rendered HTML markup in the browser.",
      "C) Downloading assets dynamically using service workers.",
      "D) Cleaning up memory leaks in the browser by purging the virtual DOM tree."
    ],
    marks: 3
  },
  {
    id: 33,
    type: "mcq",
    section: "A",
    number: 33,
    questionText: "What is the primary visual symptom of a hydration mismatch error in a Next.js application?",
    options: [
      "A) The entire server crashes and throws a 504 Gateway Timeout.",
      "B) The page displays a brief flash of unstyled content (FOUC) followed by a hard refresh.",
      "C) The rendered client DOM differs from the server-rendered HTML, causing layout bugs or content shifts.",
      "D) The application automatically rolls back all React state updates."
    ],
    marks: 3
  },
  {
    id: 34,
    type: "mcq",
    section: "A",
    number: 34,
    questionText: "Which of the following correctly describes the react hook useSyncExternalStore?",
    options: [
      "A) It is used to synchronize the React virtual DOM with database collections via WebSockets.",
      "B) It is a hook recommended for reading and subscribing to external mutable data sources in a way that is compatible with React concurrent rendering features.",
      "C) It allows React components to communicate directly with local worker threads.",
      "D) It dynamically updates component prop structures before the layout phase starts."
    ],
    marks: 3
  },
  {
    id: 35,
    type: "mcq",
    section: "A",
    number: 35,
    questionText: "In React Concurrent Mode, how are state updates prioritized?",
    options: [
      "A) Through execution speed; faster state operations are prioritized.",
      "B) By assigning updates to distinct lanes representing categories of events (e.g. synchronous user input vs transition updates).",
      "C) React assigns random priority factors using system load indicators.",
      "D) All async updates are queued in the browser microtask lane sequentially."
    ],
    marks: 3
  },
  {
    id: 36,
    type: "mcq",
    section: "A",
    number: 36,
    questionText: "What occurs if you attempt to mutate the value parameter returned by a React useState setter directly?",
    options: [
      "A) React throws a hard compile error complaining about read-only descriptors.",
      "B) The mutation modifies the internal state object reference but fails to trigger a re-render because React checks references for changes.",
      "C) The component re-renders recursively in an infinite loop.",
      "D) The state is synced directly to localStorage on the client system."
    ],
    marks: 3
  },
  {
    id: 37,
    type: "mcq",
    section: "A",
    number: 37,
    questionText: "In Node.js, what is the memory-specific characteristic of Buffer.allocUnsafe(size)?",
    options: [
      "A) It throws a security exception if the process is run in production.",
      "B) It does not initialize the allocated memory with zeros, meaning it may contain sensitive old data from previously freed memory.",
      "C) It bypasses V8 heap restrictions and writes directly into the OS kernel stack.",
      "D) It allocates memory in the browser local storage frame."
    ],
    marks: 3
  },
  {
    id: 38,
    type: "mcq",
    section: "A",
    number: 38,
    questionText: "What is the purpose of the 'exports' field in a package.json file compared to the classic 'main' field?",
    options: [
      "A) It registers external dependencies that must be downloaded on package publish.",
      "B) It defines entry points for subpaths, restricts access to internal files, and supports conditional exports for ESM vs CommonJS formats.",
      "C) It configures the Docker container variables for cloud environments.",
      "D) It locks the package compiler to a specific version of Node.js."
    ],
    marks: 3
  },
  {
    id: 39,
    type: "mcq",
    section: "A",
    number: 39,
    questionText: "In a Node.js cluster setup, how does the master process share server ports with worker processes?",
    options: [
      "A) By starting multiple server instances on separate ports and load-balancing with an Nginx proxy.",
      "B) The master process creates the socket handle and distributes it to workers using IPC, or load balances connections to them via round-robin distribution.",
      "C) The master process clones its entire memory space onto worker threads.",
      "D) The master process routes requests over HTTP/2 loopback sockets."
    ],
    marks: 3
  },
  {
    id: 40,
    type: "mcq",
    section: "A",
    number: 40,
    questionText: "Which Node.js core module provides sandboxing capabilities to run JavaScript code in isolated V8 contexts?",
    options: [
      "A) process",
      "B) child_process",
      "C) vm",
      "D) worker_threads"
    ],
    marks: 3
  },
  {
    id: 41,
    type: "mcq",
    section: "A",
    number: 41,
    questionText: "What is the role of Atomics object in Node.js worker_threads memory sharing?",
    options: [
      "A) It encrypts shared data records using AES-GCM.",
      "B) It provides thread-safe operations on SharedArrayBuffer instances, ensuring updates are atomic and preventing data race conditions.",
      "C) It executes garbage collection on worker threads concurrently.",
      "D) It speeds up JSON parsing operations across the thread pool."
    ],
    marks: 3
  },
  {
    id: 42,
    type: "mcq",
    section: "A",
    number: 42,
    questionText: "In Express.js, what is the default behavior if a route handler does not call next() or send a response?",
    options: [
      "A) The request hangs indefinitely until a timeout occurs (either browser or server timeout).",
      "B) Express automatically returns an HTTP 200 OK status code.",
      "C) Express throws a RouteHangingException.",
      "D) The server automatically redirects to a local 404 page."
    ],
    marks: 3
  },
  {
    id: 43,
    type: "mcq",
    section: "A",
    number: 43,
    questionText: "How does the 'helmet' middleware protect Express.js applications?",
    options: [
      "A) By encrypting the database connection strings.",
      "B) By setting various secure HTTP response headers (e.g. CSP, XSS-Protection, HSTS, Frame-Options).",
      "C) By blocking brute-force DDoS request pipelines.",
      "D) By validating the syntax of inbound JSON payloads."
    ],
    marks: 3
  },
  {
    id: 44,
    type: "mcq",
    section: "A",
    number: 44,
    questionText: "What security header should be configured to prevent clickjacking attacks by blocking the page from being framed?",
    options: [
      "A) Content-Security-Policy with 'frame-ancestors'",
      "B) Strict-Transport-Security",
      "C) Access-Control-Allow-Origin",
      "D) X-Content-Type-Options"
    ],
    marks: 3
  },
  {
    id: 45,
    type: "mcq",
    section: "A",
    number: 45,
    questionText: "In MongoDB, what is the difference between a sparse index and a partial index?",
    options: [
      "A) A sparse index only indexes documents where the indexed field exists; a partial index indexes documents matching a specific query filter.",
      "B) A sparse index uses less disk space; a partial index is cached in memory.",
      "C) Sparse indexes work only on strings; partial indexes work only on numbers.",
      "D) There is no difference; they are aliases for the same index format."
    ],
    marks: 3
  },
  {
    id: 46,
    type: "mcq",
    section: "A",
    number: 46,
    questionText: "What is the purpose of the $graphLookup stage in a MongoDB aggregation pipeline?",
    options: [
      "A) To render chart layouts from indexed coordinates.",
      "B) To perform transitive closure queries or recursive graph/tree traversal on a collection.",
      "C) To create spatial geographic indexes on coordinates.",
      "D) To execute parallel aggregations on different nodes."
    ],
    marks: 3
  },
  {
    id: 47,
    type: "mcq",
    section: "A",
    number: 47,
    questionText: "In MongoDB, how does the 'majority' write concern affect document updates?",
    options: [
      "A) The write is acknowledged only after being applied to the majority of replica set nodes in memory.",
      "B) The write is immediately committed to the primary node and synced asynchronously to secondary storage.",
      "C) The database locks the majority of collection indexes.",
      "D) It ensures that the document is written to at least three different shards."
    ],
    marks: 3
  },
  {
    id: 48,
    type: "mcq",
    section: "A",
    number: 48,
    questionText: "Under which MongoDB read concern can you ensure snapshot isolation for queries inside a transaction?",
    options: [
      "A) local",
      "B) majority",
      "C) snapshot",
      "D) linearizable"
    ],
    marks: 3
  },
  {
    id: 49,
    type: "mcq",
    section: "A",
    number: 49,
    questionText: "In PostgreSQL, what is Multiversion Concurrency Control (MVCC) designed to achieve?",
    options: [
      "A) To back up database transactions across multiple geographic locations.",
      "B) To allow readers to query data without blocking writers, and writers to modify data without blocking readers.",
      "C) To compress table data dynamically using column-based storage formats.",
      "D) To load balance SQL connections to read-only replica servers."
    ],
    marks: 3
  },
  {
    id: 50,
    type: "mcq",
    section: "A",
    number: 50,
    questionText: "Under a PostgreSQL Repeatable Read isolation level, what type of transaction anomaly is prevented that can occur under Read Committed?",
    options: [
      "A) Dirty Reads",
      "B) Non-repeatable Reads (and Phantom Reads in Postgres)",
      "C) Write Skew",
      "D) Dirty Writes"
    ],
    marks: 3
  },
  {
    id: 51,
    type: "mcq",
    section: "A",
    number: 51,
    questionText: "What is a GIN (Generalized Inverted Index) in PostgreSQL typically used for?",
    options: [
      "A) Speeding up range queries on primary keys.",
      "B) Indexing multi-valued data types like arrays, JSONB, and document search fields.",
      "C) Optimizing sequential scans on large transactional tables.",
      "D) Reordering rows in physical memory storage."
    ],
    marks: 3
  },
  {
    id: 52,
    type: "mcq",
    section: "A",
    number: 52,
    questionText: "What git command retrieves commits from another branch without merging the branch structures?",
    options: [
      "A) git rebase",
      "B) git cherry-pick",
      "C) git checkout -b",
      "D) git pull --rebase"
    ],
    marks: 3
  },
  {
    id: 53,
    type: "mcq",
    section: "A",
    number: 53,
    questionText: "How does Git represent a commit object internally?",
    options: [
      "A) As an array of string diff coordinates.",
      "B) As a metadata file referencing a root directory tree hash, parent commit hash(es), author info, and a message.",
      "C) As a direct pointer to the physical disk blocks on the system.",
      "D) As an XML tree mapping branch configurations."
    ],
    marks: 3
  },
  {
    id: 54,
    type: "mcq",
    section: "A",
    number: 54,
    questionText: "What is the key mechanism of the OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange)?",
    options: [
      "A) It encrypts the auth tokens inside browser cookies.",
      "B) It verifies the client secret on client devices via DNS check.",
      "C) It prevents authorization code interception attacks on public clients by requiring the client to dynamically generate and verify a secret code verifier.",
      "D) It uses client-side certificates for user authentication."
    ],
    marks: 3
  },
  {
    id: 55,
    type: "mcq",
    section: "A",
    number: 55,
    questionText: "What cookie attribute instructs the browser to restrict sending the cookie on cross-site requests?",
    options: [
      "A) Secure",
      "B) HttpOnly",
      "C) SameSite",
      "D) Domain"
    ],
    marks: 3
  },
  {
    id: 56,
    type: "mcq",
    section: "A",
    number: 56,
    questionText: "What is the output of the following JavaScript code snippet?\n\nconst obj = { a: 1 };\nObject.defineProperty(obj, 'b', {\n  value: 2,\n  writable: false,\n  enumerable: false\n});\nconsole.log(Object.keys(obj), obj.b);",
    options: [
      "A) ['a', 'b'] 2",
      "B) ['a'] 2",
      "C) ['a'] undefined",
      "D) [] 2"
    ],
    marks: 3
  },
  {
    id: 57,
    type: "mcq",
    section: "A",
    number: 57,
    questionText: "Which of the following functions will create a true memory leak in Node.js due to closure scope references?",
    options: [
      "A) let cache = []; function add(x) { cache.push(x); }",
      "B) function leaked() { let bigData = new Array(1000000); return () => console.log('Keep closure alive'); }",
      "C) Both A and B are potential leaks depending on usage, but B specifically keeps bigData in the closure context memory.",
      "D) Neither; V8 garbage collector resolves closure allocations dynamically in all scenarios."
    ],
    marks: 3
  },
  {
    id: 58,
    type: "mcq",
    section: "A",
    number: 58,
    questionText: "What is the primary difference between Object.preventExtensions() and Object.seal()?",
    options: [
      "A) preventExtensions blocks modifying property values; seal does not.",
      "B) preventExtensions only blocks adding properties; seal blocks adding/removing properties and sets all descriptors configurable to false.",
      "C) seal blocks reading properties, while preventExtensions does not.",
      "D) They are identical in V8 JavaScript engine runtime behavior."
    ],
    marks: 3
  },
  {
    id: 59,
    type: "mcq",
    section: "A",
    number: 59,
    questionText: "In JavaScript, what is the output of the expression 0.1 + 0.2 === 0.3?",
    options: [
      "A) true",
      "B) false, due to binary floating-point representation rounding issues.",
      "C) undefined",
      "D) ReferenceError"
    ],
    marks: 3
  },
  {
    id: 60,
    type: "mcq",
    section: "A",
    number: 60,
    questionText: "Which statement is true about ES Modules (ESM) compared to CommonJS (CJS) in Node.js?",
    options: [
      "A) CJS is loaded asynchronously, whereas ESM is loaded synchronously.",
      "B) ESM supports top-level await and static analysis for treeshaking; CJS does not.",
      "C) ESM uses require() to load packages, while CJS uses import.",
      "D) CJS modules are compiled into binary frames before execution."
    ],
    marks: 3
  },
  {
    id: 61,
    type: "mcq",
    section: "A",
    number: 61,
    questionText: "What React hook is used to defer updating a part of the UI until other urgent updates (e.g. typing) are completed?",
    options: [
      "A) useDeferredValue",
      "B) useTransition",
      "C) useMemo",
      "D) useSyncExternalStore"
    ],
    marks: 3
  },
  {
    id: 62,
    type: "mcq",
    section: "A",
    number: 62,
    questionText: "What is the key structural benefit of React Server Components (RSC)?",
    options: [
      "A) They reduce client bundle size by keeping heavy dependencies on the server and executing components server-side.",
      "B) They execute directly in a database container to speed up routing.",
      "C) They eliminate the need for client-side state management entirely.",
      "D) They run in a separate thread in the client browser environment."
    ],
    marks: 3
  },
  {
    id: 63,
    type: "mcq",
    section: "A",
    number: 63,
    questionText: "What happens if a component renders a dynamic list of elements but uses array indexes as keys?",
    options: [
      "A) React throws a compilation error immediately.",
      "B) It can cause visual inconsistencies or state bugs if elements are added, removed, or reordered.",
      "C) React defaults key indexing to local system variables.",
      "D) The list elements are rendered on separate server context threads."
    ],
    marks: 3
  },
  {
    id: 64,
    type: "mcq",
    section: "A",
    number: 64,
    questionText: "In React, when does a useLayoutEffect execute compared to a useEffect?",
    options: [
      "A) useLayoutEffect runs asynchronously after the browser paints the screen; useEffect runs synchronously.",
      "B) useLayoutEffect runs synchronously after DOM mutations but before the browser paints the screen; useEffect runs asynchronously after paint.",
      "C) useLayoutEffect only runs on the Node server, while useEffect runs on the client.",
      "D) useLayoutEffect runs only on secondary user interaction events."
    ],
    marks: 3
  },
  {
    id: 65,
    type: "mcq",
    section: "A",
    number: 65,
    questionText: "Which V8 event loop queue handles resolved Promise callbacks?",
    options: [
      "A) Macrotask Queue",
      "B) Microtask Queue",
      "C) Render Task Queue",
      "D) Call Stack"
    ],
    marks: 3
  },
  {
    id: 66,
    type: "mcq",
    section: "A",
    number: 66,
    questionText: "What Node.js stream method is used to redirect readable data output to a writable target destination?",
    options: [
      "A) redirect()",
      "B) pipe()",
      "C) link()",
      "D) stream()"
    ],
    marks: 3
  },
  {
    id: 67,
    type: "mcq",
    section: "A",
    number: 67,
    questionText: "In Express.js, what is the required signature for an error-handling middleware function?",
    options: [
      "A) (req, res, next)",
      "B) (err, req, res)",
      "C) (err, req, res, next)",
      "D) (err, next)"
    ],
    marks: 3
  },
  {
    id: 68,
    type: "mcq",
    section: "A",
    number: 68,
    questionText: "What HTTP method is used for making conditional requests using the If-Match header?",
    options: [
      "A) GET",
      "B) PUT or PATCH",
      "C) POST",
      "D) OPTIONS"
    ],
    marks: 3
  },
  {
    id: 69,
    type: "mcq",
    section: "A",
    number: 69,
    questionText: "In the HTTP cache verification protocol, what does the ETag header represent?",
    options: [
      "A) The expiration timestamp of the cached response.",
      "B) A unique identifier tag (usually a hash) representing a specific version of a resource.",
      "C) The encryption protocol hash used to secure the stream.",
      "D) The layout signature of the HTML element."
    ],
    marks: 3
  },
  {
    id: 70,
    type: "mcq",
    section: "A",
    number: 70,
    questionText: "What is a main difference between a SQL B-Tree index and a Hash index?",
    options: [
      "A) Hash indexes support range queries, while B-Tree indexes do not.",
      "B) B-Tree indexes support range queries and sorting operations, while Hash indexes only support equality comparisons.",
      "C) B-Tree indexes use more cache than Hash indexes.",
      "D) B-Tree indexes can only index text fields; Hash indexes only index numbers."
    ],
    marks: 3
  },
  {
    id: 71,
    type: "mcq",
    section: "A",
    number: 71,
    questionText: "What SQL join type searches for rows with matching values, and returns them combined with NULL rows if no match exists in the right table?",
    options: [
      "A) INNER JOIN",
      "B) LEFT OUTER JOIN",
      "C) FULL OUTER JOIN",
      "D) CROSS JOIN"
    ],
    marks: 3
  },
  {
    id: 72,
    type: "mcq",
    section: "A",
    number: 72,
    questionText: "In git, what is a tree object internally designed to store?",
    options: [
      "A) A directory structure mapping, matching subdirectories and files to their hashes.",
      "B) The author and committer names for a set of edits.",
      "C) The delta differences between commits.",
      "D) The history of branch resets."
    ],
    marks: 3
  },
  {
    id: 73,
    type: "mcq",
    section: "A",
    number: 73,
    questionText: "What is the purpose of CORS (Cross-Origin Resource Sharing)?",
    options: [
      "A) To encrypt requests sent to external domain servers.",
      "B) To allow servers to control which origins are permitted to read their responses via client browsers, bypassing default Same-Origin policies.",
      "C) To route traffic through secure global proxy servers.",
      "D) To optimize payload compression during fetch workflows."
    ],
    marks: 3
  },
  {
    id: 74,
    type: "mcq",
    section: "A",
    number: 74,
    questionText: "Which statement is true about JavaScript Symbol data types?",
    options: [
      "A) Symbol values are automatically converted to strings in JSON.stringify.",
      "B) Symbols are primitive values designed to be unique identifiers, which can be used as non-string object keys.",
      "C) Symbol values are mutable keys, supporting incremental hashing.",
      "D) Symbols are stack reference pointers to garbage-collected functions."
    ],
    marks: 3
  },
  {
    id: 75,
    type: "mcq",
    section: "A",
    number: 75,
    questionText: "In JavaScript, what is the behavior of the expression: typeof null?",
    options: [
      "A) 'null'",
      "B) 'undefined'",
      "C) 'object', which is a historical bug in the initial JavaScript implementation.",
      "D) 'function'"
    ],
    marks: 3
  },
  {
    id: 76,
    type: "mcq",
    section: "A",
    number: 76,
    questionText: "In React, what does ref.current represent inside a functional component?",
    options: [
      "A) The current state context index list.",
      "B) A mutable reference container whose modifications do not trigger component re-renders.",
      "C) The root Virtual DOM layout representation.",
      "D) A callback pointer to parent render nodes."
    ],
    marks: 3
  },
  {
    id: 77,
    type: "mcq",
    section: "A",
    number: 77,
    questionText: "Which React hook is used to optimize performance by memoizing a computed value across component re-renders?",
    options: [
      "A) useCallback",
      "B) useMemo",
      "C) useState",
      "D) useTransition"
    ],
    marks: 3
  },
  {
    id: 78,
    type: "mcq",
    section: "A",
    number: 78,
    questionText: "In Node.js streams, what event is emitted when a writable stream has processed its buffer and is ready to accept more data?",
    options: [
      "A) end",
      "B) finish",
      "C) drain",
      "D) close"
    ],
    marks: 3
  },
  {
    id: 79,
    type: "mcq",
    section: "A",
    number: 79,
    questionText: "What is the difference between spawn() and exec() methods in Node.js child_process module?",
    options: [
      "A) spawn compiles JavaScript, while exec compiles binary files.",
      "B) spawn streams output using stdout/stderr, which is memory-efficient; exec buffers the entire command output in memory before returning it.",
      "C) spawn only runs on Windows systems; exec is cross-platform.",
      "D) There is no difference; they compile to identical system calls."
    ],
    marks: 3
  },
  {
    id: 80,
    type: "mcq",
    section: "A",
    number: 80,
    questionText: "In Express.js routing, what is the wildcard character match suffix representing zero or more route parameter characters?",
    options: [
      "A) *",
      "B) ?",
      "C) :",
      "D) +"
    ],
    marks: 3
  },
  {
    id: 81,
    type: "mcq",
    section: "A",
    number: 81,
    questionText: "Which MongoDB aggregation pipeline stage is used to deconstruct an array field from the input documents to output a document for each element?",
    options: [
      "A) $lookup",
      "B) $unwind",
      "C) $match",
      "D) $group"
    ],
    marks: 3
  },
  {
    id: 82,
    type: "mcq",
    section: "A",
    number: 82,
    questionText: "In a MongoDB replica set setup, what is the role of the primary node?",
    options: [
      "A) It is the only node that receives write operations; replicates changes to secondary nodes.",
      "B) It acts strictly as a backup storage node, while secondaries manage queries.",
      "C) It executes spatial geolocation index builds exclusively.",
      "D) It partitions write data across shards."
    ],
    marks: 3
  },
  {
    id: 83,
    type: "mcq",
    section: "A",
    number: 83,
    questionText: "In PostgreSQL, what index type is highly optimized for full-text search indexing?",
    options: [
      "A) Hash index",
      "B) GIN (Generalized Inverted Index)",
      "C) B-Tree",
      "D) GiST"
    ],
    marks: 3
  },
  {
    id: 84,
    type: "mcq",
    section: "A",
    number: 84,
    questionText: "What SQL join type returns the Cartesian product of the two tables?",
    options: [
      "A) INNER JOIN",
      "B) CROSS JOIN",
      "C) LEFT OUTER JOIN",
      "D) SELF JOIN"
    ],
    marks: 3
  },
  {
    id: 85,
    type: "mcq",
    section: "A",
    number: 85,
    questionText: "In git, what object type represents file data content?",
    options: [
      "A) Blob",
      "B) Tree",
      "C) Commit",
      "D) Tag"
    ],
    marks: 3
  },
  {
    id: 86,
    type: "mcq",
    section: "A",
    number: 86,
    questionText: "Which HTTP header is configured to establish Content Security Policies, restricting resource sources?",
    options: [
      "A) Access-Control-Allow-Origin",
      "B) Content-Security-Policy",
      "C) Content-Type",
      "D) Strict-Transport-Security"
    ],
    marks: 3
  },
  {
    id: 87,
    type: "mcq",
    section: "A",
    number: 87,
    questionText: "In Javascript, how do you perform a deep clone of a nested object without copying prototype parameters using native browser APIs?",
    options: [
      "A) Object.assign({}, target)",
      "B) JSON.parse(JSON.stringify(target)) (loses non-serialize types); or structuredClone(target)",
      "C) Object.create(target)",
      "D) Target.slice(0)"
    ],
    marks: 3
  },
  {
    id: 88,
    type: "mcq",
    section: "A",
    number: 88,
    questionText: "What is the key functional difference between JavaScript Array.forEach and Array.map methods?",
    options: [
      "A) forEach runs synchronously; map runs asynchronously.",
      "B) forEach executes a callback on each element without returning a new array; map executes a callback and returns a new array with the mapped values.",
      "C) map can only index numbers; forEach indexes strings.",
      "D) map accepts up to 4 arguments; forEach accepts only 1."
    ],
    marks: 3
  },
  {
    id: 89,
    type: "mcq",
    section: "A",
    number: 89,
    questionText: "In React, when a parent component re-renders, what is the default rendering behavior of its children?",
    options: [
      "A) Children do not re-render unless their props have changed.",
      "B) All child components re-render recursively, unless optimized using React.memo or useMemo.",
      "C) Only children that consume context re-render.",
      "D) React delays rendering children to another thread loop."
    ],
    marks: 3
  },
  {
    id: 90,
    type: "mcq",
    section: "A",
    number: 90,
    questionText: "In JavaScript, what is the primary role of the 'use strict' directive?",
    options: [
      "A) It speeds up V8 execution loops by disabling scope tracing.",
      "B) It enforces stricter parsing and error handling, making silent bugs throw errors (e.g. assigning to undeclared variables).",
      "C) It encrypts the code outputs before browser processing.",
      "D) It forces the engine to run variables on the stack."
    ],
    marks: 3
  },
  {
    id: 91,
    type: "mcq",
    section: "A",
    number: 91,
    questionText: "In Node.js, what is the main benefit of streaming files over reading them into memory via fs.readFile?",
    options: [
      "A) Streams execute in the browser context.",
      "B) Streams process data in smaller chunks without loading the entire file into memory, keeping RAM usage low and constant.",
      "C) Streams compress files before reading.",
      "D) Streams run faster on multi-core environments."
    ],
    marks: 3
  },
  {
    id: 92,
    type: "mcq",
    section: "A",
    number: 92,
    questionText: "What is the purpose of the HTTP status code: 409 Conflict?",
    options: [
      "A) The request was rate limited by the server firewall.",
      "B) The request could not be processed due to a conflict in the current state of the resource (e.g. concurrent edits).",
      "C) The target URL has been deleted permanently.",
      "D) The user lacks valid authentication credentials."
    ],
    marks: 3
  },
  {
    id: 93,
    type: "mcq",
    section: "A",
    number: 93,
    questionText: "In SQL databases, what anomaly represents a transaction reading data that has been modified by another concurrent transaction but not yet committed?",
    options: [
      "A) Non-repeatable Read",
      "B) Phantom Read",
      "C) Dirty Read",
      "D) Write Skew"
    ],
    marks: 3
  },
  {
    id: 94,
    type: "mcq",
    section: "A",
    number: 94,
    questionText: "What is a git tag object internally?",
    options: [
      "A) A text file containing only a branch name.",
      "B) An object referencing a commit hash, containing signature, message, creator, and timestamp, stored in refs/tags.",
      "C) An encrypted key mapping staging configurations.",
      "D) A backup folder containing binary diffs."
    ],
    marks: 3
  },
  {
    id: 95,
    type: "mcq",
    section: "A",
    number: 95,
    questionText: "What is the main objective of the same-origin policy (SOP) in browser environments?",
    options: [
      "A) To force all requests to go through the same routing gateway.",
      "B) To prevent scripts from one origin from reading or modifying data from another origin, securing sites against CSRF and data leaks.",
      "C) To synchronize cookies across subdomains.",
      "D) To limit resource downloads to a single execution thread."
    ],
    marks: 3
  },
  {
    id: 96,
    type: "mcq",
    section: "A",
    number: 96,
    questionText: "Which HTTP header enables the server to specify CORS requirements for allowable API resources?",
    options: [
      "A) Access-Control-Allow-Origin",
      "B) Access-Control-Allow-Methods",
      "C) Both A and B are necessary CORS control headers.",
      "D) Content-Type: application/json"
    ],
    marks: 3
  },
  {
    id: 97,
    type: "mcq",
    section: "A",
    number: 97,
    questionText: "In Javascript, what does the expression: Object.create(null) create?",
    options: [
      "A) An empty object wrapper with no prototype chain, meaning it does not inherit methods like toString or hasOwnProperty.",
      "B) A null variable reference.",
      "C) A prototype pollution trigger object.",
      "D) An array of empty keys."
    ],
    marks: 3
  },
  {
    id: 98,
    type: "mcq",
    section: "A",
    number: 98,
    questionText: "In React context workflows, what is the main purpose of the useContext hook?",
    options: [
      "A) To fetch remote server context properties.",
      "B) To consume context values inside functional components without needing context consumer tags.",
      "C) To synchronize context values to secondary state components.",
      "D) To bypass React reconciliation routines."
    ],
    marks: 3
  },
  {
    id: 99,
    type: "mcq",
    section: "A",
    number: 99,
    questionText: "In Node.js, what is the output of the expression: Buffer.from('A').toJSON()?",
    options: [
      "A) { type: 'Buffer', data: [65] }",
      "B) { data: 'A' }",
      "C) [65]",
      "D) '65'"
    ],
    marks: 3
  },
  {
    id: 100,
    type: "mcq",
    section: "A",
    number: 100,
    questionText: "What is the purpose of HTTP/3 QUIC connection migration?",
    options: [
      "A) To change IP addresses dynamically without dropping the active connection socket, by utilizing UDP connection IDs.",
      "B) To compress headers across HTTP request streams.",
      "C) To route traffic through backup servers during failures.",
      "D) To resolve domain names using UDP queries."
    ],
    marks: 3
  },

  // SECTION B: CODING (101-110)
  {
    id: 101,
    type: "coding",
    section: "B",
    number: 1,
    questionText: "Custom Debounce with Leading, Trailing, and Cancel Options (10 Marks)\n\nImplement a custom debounce function in JavaScript that limits how often a function can be triggered. It must accept three parameters:\n1. func: The callback function to execute.\n2. wait: The timeout in milliseconds.\n3. options: An object with optional booleans { leading?: boolean, trailing?: boolean }.\n\nRequirements:\n- If options.leading is true, trigger the function on the leading edge of the timeout.\n- If options.trailing is true (default), trigger the function on the trailing edge of the timeout.\n- The returned function must have a .cancel() method to abort any scheduled executions.",
    sampleInput: "debounce(func, 200, { leading: true })",
    sampleOutput: "Callback executes immediately, then ignores triggers for 200ms",
    starterCode: "function debounce(func, wait, options = {}) {\n  // Write your code here\n  \n}",
    marks: 10
  },
  {
    id: 102,
    type: "coding",
    section: "B",
    number: 2,
    questionText: "Deep Object Diff & Patch Generator (10 Marks)\n\nWrite a JavaScript function that compares two deeply nested objects/arrays and returns a granular diff patch.\n\nRequirements:\n- The returned object must contain only the keys that have changed, been added, or been deleted.\n- For deleted keys, assign the value undefined or list them in a special deletions list.\n- It must support nested objects and arrays of arbitrary depth recursively.",
    sampleInput: "deepDiff({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3, d: 4 } })",
    sampleOutput: "{ b: { c: 3, d: 4 } }",
    starterCode: "function deepDiff(obj1, obj2) {\n  // Write your code here\n  \n}",
    marks: 10
  },
  {
    id: 103,
    type: "coding",
    section: "B",
    number: 3,
    questionText: "Promise Concurrency Limiter / Pool (10 Marks)\n\nImplement a promise pool manager that throttles the execution of async tasks.\n\nRequirements:\n- The function promisePool(functions, limit) must take an array of promise-returning functions and a maximum concurrency limit.\n- It must execute at most 'limit' promises in parallel at any given time.\n- It must return a Promise that resolves with an array containing the results of all input tasks in their original order once all are completed.",
    sampleInput: "promisePool([asyncTask1, asyncTask2, ...], 2)",
    sampleOutput: "Runs at most 2 async operations simultaneously, returning ordered results array.",
    starterCode: "async function promisePool(functions, limit) {\n  // Write your code here\n  \n}",
    marks: 10
  },
  {
    id: 104,
    type: "coding",
    section: "B",
    number: 4,
    questionText: "LRU Cache with Time-To-Live (TTL) (10 Marks)\n\nImplement a Least Recently Used (LRU) Cache class in JavaScript that supports capacity constraints and automatic key expiration via TTL.\n\nRequirements:\n- constructor(capacity): Initializes the cache with a maximum size capacity.\n- get(key): Returns the value if the key exists and has not expired, and marks it as recently used. Returns -1 if not found or expired.\n- put(key, value, ttlMs): Inserts or updates the key with an expiration time in milliseconds. If capacity is exceeded, evict the least recently used unexpired item.",
    sampleInput: "cache.put('a', 10, 100); setTimeout(() => cache.get('a'), 200);",
    sampleOutput: "Returns -1 (expired key)",
    starterCode: "class LRUCache {\n  constructor(capacity) {\n    // Write constructor\n  }\n\n  get(key) {\n    // Write get\n  }\n\n  put(key, value, ttlMs) {\n    // Write put\n  }\n}",
    marks: 10
  },
  {
    id: 105,
    type: "coding",
    section: "B",
    number: 5,
    questionText: "Package Dependency Cycle Detector & Topological Sort (10 Marks)\n\nWrite a dependency analyzer function that takes a graph of package dependencies and finds a valid installation order.\n\nRequirements:\n- input: An object mapping package names to list of dependencies: { A: ['B', 'C'], B: ['C'], C: [] }.\n- output: A sorted array representing a valid installation sequence where dependencies are installed first.\n- If a cyclic dependency is detected (e.g. A depends on B and B depends on A), throw an Error indicating 'Cyclic dependency detected'.",
    sampleInput: "{ pkgA: ['pkgB'], pkgB: [] }",
    sampleOutput: "['pkgB', 'pkgA']",
    starterCode: "function findBuildOrder(packages) {\n  // Write your code here\n  \n}",
    marks: 10
  },
  {
    id: 106,
    type: "coding",
    section: "B",
    number: 6,
    questionText: "SQL AST Query Parameterizer (10 Marks)\n\nImplement a query builder compiler that parses a logical query object tree and returns a safe SQL WHERE string and parameter values array (to prevent SQL injections).\n\nRequirements:\n- input: A logical filter object structure like { field: 'age', operator: 'gte', value: 18 } or logical grouping { AND: [{ field: 'status', operator: 'eq', value: 'active' }, { field: 'age', operator: 'lt', value: 30 }] }.\n- output: An object { sql: string, values: any[] } with query placeholders (e.g. $1, $2) and corresponding values array.",
    sampleInput: "{ field: 'email', operator: 'eq', value: 'test@sf.com' }",
    sampleOutput: "{ sql: 'email = $1', values: ['test@sf.com'] }",
    starterCode: "function buildWhereClause(filter) {\n  // Write your code here\n  \n}",
    marks: 10
  },
  {
    id: 107,
    type: "coding",
    section: "B",
    number: 7,
    questionText: "Custom Redux Store Creator with Middleware Support (10 Marks)\n\nImplement a custom createStore function from scratch in vanilla JavaScript that supports State Management, Listeners subscription, Actions dispatching, and Middleware enhancers.\n\nRequirements:\n- createStore(reducer, preloadedState, enhancer) must return an object with: getState(), dispatch(action), and subscribe(listener).\n- If enhancer is provided (e.g. applyMiddleware), it must wrap the store creator to support middleware chain execution during dispatch.",
    sampleInput: "createStore(counterReducer, 0, applyMiddleware(logger))",
    sampleOutput: "Store instance capable of piping actions through logger middleware",
    starterCode: "function createStore(reducer, preloadedState, enhancer) {\n  // Write your code here\n  \n}",
    marks: 10
  },
  {
    id: 108,
    type: "coding",
    section: "B",
    number: 8,
    questionText: "Namespace Event Emitter with Wildcards & Async hooks (10 Marks)\n\nCreate a custom Event Emitter class supporting namespaced events, wildcard matching, and awaiting asynchronous event handlers.\n\nRequirements:\n- on(eventPattern, listener): Registers a handler. Supports wildcard '*' (e.g. 'user.*' matches 'user.login' and 'user.logout').\n- emit(event, ...args): Dispatches event. If any listeners return Promises, emit must return a Promise resolving only after all matching event handlers have resolved.",
    sampleInput: "emitter.on('data.*', async (x) => { await delay(50); }); await emitter.emit('data.load', 42);",
    sampleOutput: "Emit resolves after the async delay finishes.",
    starterCode: "class EventEmitter {\n  // Write your class here\n  \n}",
    marks: 10
  },
  {
    id: 109,
    type: "coding",
    section: "B",
    number: 9,
    questionText: "HMAC-SHA256 JWT Token Generator & Signature Verifier (10 Marks)\n\nUsing Node.js 'crypto' core module, implement JWT sign and verify functions from scratch.\n\nRequirements:\n- signJWT(payload, secret): Encodes header and payload as Base64URL, creates an HMAC-SHA256 signature using the secret, and returns a 'header.payload.signature' string.\n- verifyJWT(token, secret): Parses the token, verifies the signature using the secret, checks if the token has expired (using 'exp' payload claim), and returns the decoded payload. If signature is invalid or expired, throw an error.",
    sampleInput: "signJWT({ user: 'SF', exp: Date.now() + 10000 }, 'my_secret')",
    sampleOutput: "Valid JWT token string",
    starterCode: "const crypto = require('crypto');\n\nfunction signJWT(payload, secret) {\n  // Write your sign code here\n  \n}\n\nfunction verifyJWT(token, secret) {\n  // Write your verify code here\n  \n}",
    marks: 10
  },
  {
    id: 110,
    type: "coding",
    section: "B",
    number: 10,
    questionText: "Declarative JSON Schema Validation Engine (10 Marks)\n\nWrite a lightweight schema validation function validateSchema(data, schema) that checks if an object conforms to a schema description.\n\nRequirements:\n- schema can specify properties with 'type' (string, number, array, object), required fields, and items types for arrays.\n- The function must return an object: { valid: boolean, errors?: { [path: string]: string } }.\n- Validate recursively for nested objects and array elements.",
    sampleInput: "validateSchema({ age: 'twenty' }, { properties: { age: { type: 'number' } }, required: ['age'] })",
    sampleOutput: "{ valid: false, errors: { age: 'Expected number, received string' } }",
    starterCode: "function validateSchema(data, schema) {\n  // Write your code here\n  \n}",
    marks: 10
  }
];
