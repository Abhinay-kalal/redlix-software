import { Question } from "./questions";

export const TECHNICAL_QUESTIONS: Question[] = [
  // SECTION A — ADVANCED MCQs (1 - 15)
  {
    id: 2001,
    type: "mcq",
    section: "A",
    number: 1,
    questionText: "Which HTTP status code is most appropriate when a request is valid but the server refuses to authorize the authenticated user?",
    options: ["A. 400", "B. 401", "C. 403", "D. 404"],
    marks: 2
  },
  {
    id: 2002,
    type: "mcq",
    section: "A",
    number: 2,
    questionText: "Which database index is generally most appropriate for efficiently searching users by a unique email address?",
    options: [
      "A. Full table scan",
      "B. Unique index on email",
      "C. Foreign key only",
      "D. Composite index on unrelated columns"
    ],
    marks: 2
  },
  {
    id: 2003,
    type: "mcq",
    section: "A",
    number: 3,
    questionText: "Which principle is most important when storing passwords in a production application?",
    options: [
      "A. Encrypt passwords using Base64",
      "B. Store passwords as plain text",
      "C. Hash passwords using a password-hashing algorithm such as Argon2 or bcrypt",
      "D. Store passwords inside JWTs"
    ],
    marks: 2
  },
  {
    id: 2004,
    type: "mcq",
    section: "A",
    number: 4,
    questionText: "What is the primary purpose of a database transaction?",
    options: [
      "A. Increase network bandwidth",
      "B. Ensure a group of operations follows defined atomicity and consistency guarantees",
      "C. Automatically create indexes",
      "D. Compress database tables"
    ],
    marks: 2
  },
  {
    id: 2005,
    type: "mcq",
    section: "A",
    number: 5,
    questionText: "A REST API receives the same payment request twice because of a network retry. Which design concept helps prevent duplicate processing?",
    options: ["A. Idempotency", "B. Minification", "C. Recursion", "D. Serialization only"],
    marks: 2
  },
  {
    id: 2006,
    type: "mcq",
    section: "A",
    number: 6,
    questionText: "What is the main purpose of environment variables?",
    options: [
      "A. Store application configuration separately from source code",
      "B. Increase CPU speed",
      "C. Replace databases",
      "D. Compile JavaScript"
    ],
    marks: 2
  },
  {
    id: 2007,
    type: "mcq",
    section: "A",
    number: 7,
    questionText: "Which algorithm is generally appropriate for finding the shortest path in a graph with non-negative edge weights?",
    options: ["A. Binary Search", "B. Dijkstra's Algorithm", "C. Bubble Sort", "D. DFS only"],
    marks: 2
  },
  {
    id: 2008,
    type: "mcq",
    section: "A",
    number: 8,
    questionText: "What is the average-case lookup complexity of a well-designed hash table?",
    options: ["A. O(n²)", "B. O(n)", "C. O(log n)", "D. O(1)"],
    marks: 2
  },
  {
    id: 2009,
    type: "mcq",
    section: "A",
    number: 9,
    questionText: "Which SQL clause is used to filter rows BEFORE grouping?",
    options: ["A. HAVING", "B. WHERE", "C. ORDER BY", "D. GROUP BY"],
    marks: 2
  },
  {
    id: 2010,
    type: "mcq",
    section: "A",
    number: 10,
    questionText: "Which Git operation is most appropriate for incorporating the latest changes from a remote branch while preserving a linear project history?",
    options: ["A. git status", "B. git log", "C. git rebase", "D. git init"],
    marks: 2
  },
  {
    id: 2011,
    type: "mcq",
    section: "A",
    number: 11,
    questionText: "What is the primary purpose of a reverse proxy such as Nginx?",
    options: [
      "A. Act as an intermediary between clients and backend services",
      "B. Replace the database",
      "C. Compile TypeScript",
      "D. Hash passwords"
    ],
    marks: 2
  },
  {
    id: 2012,
    type: "mcq",
    section: "A",
    number: 12,
    questionText: "Which caching strategy removes or invalidates stale cached data when the underlying data changes?",
    options: [
      "A. Cache invalidation",
      "B. Recursion",
      "C. Database normalization",
      "D. Static typing"
    ],
    marks: 2
  },
  {
    id: 2013,
    type: "mcq",
    section: "A",
    number: 13,
    questionText: "Which HTTP method is generally considered idempotent?",
    options: ["A. POST", "B. GET", "C. CONNECT", "D. PATCH always"],
    marks: 2
  },
  {
    id: 2014,
    type: "mcq",
    section: "A",
    number: 14,
    questionText: "What problem does database normalization primarily attempt to reduce?",
    options: [
      "A. CPU usage",
      "B. Data redundancy and update anomalies",
      "C. Network latency",
      "D. Password complexity"
    ],
    marks: 2
  },
  {
    id: 2015,
    type: "mcq",
    section: "A",
    number: 15,
    questionText: "An application works locally but fails in production because it expects a secret API key that isn't available there. What is the most likely issue?",
    options: [
      "A. Missing production configuration/environment variable",
      "B. Incorrect HTML semantics",
      "C. Sorting algorithm",
      "D. Database normalization"
    ],
    marks: 2
  },

  // SECTION B — CODE ANALYSIS (16 - 25)
  {
    id: 2016,
    type: "mcq",
    section: "B",
    number: 16,
    questionText: "JavaScript Output:\n\nconst numbers = [1, 2, 3, 4, 5];\nconst result = numbers.filter(n => n % 2 === 0).map(n => n * 2);\nconsole.log(result);\n\nWhat is printed?",
    options: ["A. [1, 3, 5]", "B. [2, 4]", "C. [4, 8]", "D. [2, 4, 6, 8, 10]"],
    marks: 2
  },
  {
    id: 2017,
    type: "mcq",
    section: "B",
    number: 17,
    questionText: "JavaScript Scope:\n\nlet x = 10;\nfunction test() {\n    let x = 20;\n    return x;\n}\nconsole.log(test());\n\nWhat is printed?",
    options: ["A. 10", "B. 20", "C. undefined", "D. Error"],
    marks: 2
  },
  {
    id: 2018,
    type: "mcq",
    section: "B",
    number: 18,
    questionText: "JavaScript Async:\n\nconst response = await fetch(\"/api/users\");\n\nWhat does await primarily do inside an async function?",
    options: [
      "A. Converts HTTP into WebSocket",
      "B. Waits for the Promise to settle before continuing that async function",
      "C. Makes the request synchronous for the entire browser",
      "D. Deletes the Promise"
    ],
    marks: 2
  },
  {
    id: 2019,
    type: "mcq",
    section: "B",
    number: 19,
    questionText: "Algorithm Complexity:\n\nfor (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n        console.log(i, j);\n    }\n}\n\nWhat is the time complexity?",
    options: ["A. O(1)", "B. O(log n)", "C. O(n)", "D. O(n²)"],
    marks: 2
  },
  {
    id: 2020,
    type: "mcq",
    section: "B",
    number: 20,
    questionText: "Algorithm Binary Search:\n\nA sorted array contains 1,000,000 elements. Which algorithm can search for an element in O(log n) time?",
    options: ["A. Linear Search", "B. Binary Search", "C. Bubble Sort", "D. DFS"],
    marks: 2
  },
  {
    id: 2021,
    type: "mcq",
    section: "B",
    number: 21,
    questionText: "SQL GROUP BY:\n\nSELECT department, COUNT(*)\nFROM employees\nGROUP BY department;\n\nWhat does this query return?",
    options: [
      "A. Total number of employees only",
      "B. Number of employees in each department",
      "C. Employees with duplicate departments",
      "D. Departments sorted alphabetically only"
    ],
    marks: 2
  },
  {
    id: 2022,
    type: "mcq",
    section: "B",
    number: 22,
    questionText: "SQL HAVING:\n\nSELECT department, AVG(salary)\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 50000;\n\nWhat does HAVING do?",
    options: [
      "A. Filters individual rows before grouping",
      "B. Filters groups after aggregation",
      "C. Sorts departments",
      "D. Removes NULL values"
    ],
    marks: 2
  },
  {
    id: 2023,
    type: "mcq",
    section: "B",
    number: 23,
    questionText: "Python Dictionary:\n\ndata = [\"A\", \"B\", \"A\", \"C\", \"A\"]\ncount = {}\nfor item in data:\n    count[item] = count.get(item, 0) + 1\nprint(count[\"A\"])\n\nWhat is printed?",
    options: ["A. 1", "B. 2", "C. 3", "D. 5"],
    marks: 2
  },
  {
    id: 2024,
    type: "mcq",
    section: "B",
    number: 24,
    questionText: "Python List Comprehension:\n\nnumbers = range(1, 6)\nresult = [n ** 2 for n in numbers if n % 2 == 1]\nprint(result)\n\nWhat is printed?",
    options: ["A. [1, 4, 9, 16, 25]", "B. [1, 9, 25]", "C. [2, 4]", "D. [3, 9]"],
    marks: 2
  },
  {
    id: 2025,
    type: "mcq",
    section: "B",
    number: 25,
    questionText: "API Security:\n\napp.get(\"/admin\", (req, res) => {\n    res.json({ message: \"Admin data\" });\n});\n\nWhat is the primary security concern?",
    options: [
      "A. Memory leak",
      "B. Unauthorized access to protected resources",
      "C. Slow CSS",
      "D. SQL normalization"
    ],
    marks: 2
  }
];
