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
  },

  // SECTION C — CODING QUESTIONS (26 - 50)
  {
    id: 2026,
    type: "coding",
    section: "C",
    number: 26,
    questionText: "Reverse a String: Write a program that reverses a string without using a built-in reverse function.\n\nExample: Input: 'StudentForge' -> Output: 'egroFtnedutS'",
    starterCode: `// Reverse a string without using built-in reverse()\nfunction reverseString(str) {\n  let reversed = "";\n  for (let i = str.length - 1; i >= 0; i--) {\n    reversed += str[i];\n  }\n  return reversed;\n}\n\nconsole.log(reverseString("StudentForge")); // egroFtnedutS`,
    marks: 2
  },
  {
    id: 2027,
    type: "coding",
    section: "C",
    number: 27,
    questionText: "Palindrome Checker: Write a program that checks whether a given string is a palindrome.\n\nExample: Input: 'madam' -> Output: Palindrome",
    starterCode: `// Palindrome Checker\nfunction isPalindrome(str) {\n  const clean = str.toLowerCase();\n  const len = clean.length;\n  for (let i = 0; i < len / 2; i++) {\n    if (clean[i] !== clean[len - 1 - i]) return false;\n  }\n  return true;\n}\n\nconsole.log(isPalindrome("madam") ? "Palindrome" : "Not Palindrome");`,
    marks: 2
  },
  {
    id: 2028,
    type: "coding",
    section: "C",
    number: 28,
    questionText: "Find Duplicate Elements: Write a program that finds all duplicate values in an array.\n\nExample: Input: [1, 2, 3, 2, 4, 1, 5] -> Output: [1, 2]",
    starterCode: `// Find Duplicate Elements in Array\nfunction findDuplicates(arr) {\n  const duplicates = [];\n  const seen = new Set();\n  for (const item of arr) {\n    if (seen.has(item) && !duplicates.includes(item)) {\n      duplicates.push(item);\n    }\n    seen.add(item);\n  }\n  return duplicates;\n}\n\nconsole.log(findDuplicates([1, 2, 3, 2, 4, 1, 5]));`,
    marks: 2
  },
  {
    id: 2029,
    type: "coding",
    section: "C",
    number: 29,
    questionText: "Find Second Largest Number: Write a program to find the second-largest unique number in an array without sorting the array.\n\nExample: Input: [10, 5, 20, 8, 20] -> Output: 10",
    starterCode: `// Find Second Largest Unique Number without sorting\nfunction secondLargest(arr) {\n  let largest = -Infinity;\n  let second = -Infinity;\n  for (const num of arr) {\n    if (num > largest) {\n      second = largest;\n      largest = num;\n    } else if (num > second && num < largest) {\n      second = num;\n    }\n  }\n  return second;\n}\n\nconsole.log(secondLargest([10, 5, 20, 8, 20]));`,
    marks: 2
  },
  {
    id: 2030,
    type: "coding",
    section: "C",
    number: 30,
    questionText: "Frequency Counter: Write a program that counts how many times each element occurs in an array.\n\nExample: Input: [\"JS\", \"Python\", \"JS\", \"Java\"]",
    starterCode: `// Frequency Counter\nfunction countFrequency(arr) {\n  const freq = {};\n  for (const item of arr) {\n    freq[item] = (freq[item] || 0) + 1;\n  }\n  return freq;\n}\n\nconsole.log(countFrequency(["JS", "Python", "JS", "Java"]));`,
    marks: 2
  },
  {
    id: 2031,
    type: "coding",
    section: "C",
    number: 31,
    questionText: "Two Sum: Write a program that finds two numbers whose sum equals a given target.\n\nExample: Input: [2, 7, 11, 15], Target: 9 -> Output: [2, 7]",
    starterCode: `// Two Sum Problem\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [diff, nums[i]];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
    marks: 2
  },
  {
    id: 2032,
    type: "coding",
    section: "C",
    number: 32,
    questionText: "Remove Duplicates: Write a program that removes duplicate values from an array without using a built-in Set.\n\nExample: Input: [1, 2, 2, 3, 3, 4] -> Output: [1, 2, 3, 4]",
    starterCode: `// Remove Duplicates without Set\nfunction removeDuplicates(arr) {\n  const unique = [];\n  for (const item of arr) {\n    if (!unique.includes(item)) {\n      unique.push(item);\n    }\n  }\n  return unique;\n}\n\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 4]));`,
    marks: 2
  },
  {
    id: 2033,
    type: "coding",
    section: "C",
    number: 33,
    questionText: "Fibonacci Sequence: Write a program to generate the first N Fibonacci numbers.\n\nExample: Input: 7 -> Output: 0 1 1 2 3 5 8",
    starterCode: `// Generate first N Fibonacci Numbers\nfunction fibonacci(n) {\n  if (n <= 0) return [];\n  if (n === 1) return [0];\n  const fib = [0, 1];\n  for (let i = 2; i < n; i++) {\n    fib.push(fib[i - 1] + fib[i - 2]);\n  }\n  return fib;\n}\n\nconsole.log(fibonacci(7).join(" "));`,
    marks: 2
  },
  {
    id: 2034,
    type: "coding",
    section: "C",
    number: 34,
    questionText: "Prime Number Checker: Write a program that determines whether a given number is prime.\n\nExample: Input: 29 -> Output: Prime",
    starterCode: `// Prime Number Checker\nfunction isPrime(num) {\n  if (num <= 1) return false;\n  for (let i = 2; i <= Math.sqrt(num); i++) {\n    if (num % i === 0) return false;\n  }\n  return true;\n}\n\nconsole.log(isPrime(29) ? "Prime" : "Not Prime");`,
    marks: 2
  },
  {
    id: 2035,
    type: "coding",
    section: "C",
    number: 35,
    questionText: "Find Missing Number: An array contains numbers from 1 to N, with one number missing. Write a program to find the missing number.\n\nExample: Input: [1, 2, 3, 5, 6], N = 6 -> Output: 4",
    starterCode: `// Find Missing Number in [1..N]\nfunction findMissingNumber(arr, n) {\n  const expectedSum = (n * (n + 1)) / 2;\n  const actualSum = arr.reduce((acc, curr) => acc + curr, 0);\n  return expectedSum - actualSum;\n}\n\nconsole.log(findMissingNumber([1, 2, 3, 5, 6], 6));`,
    marks: 2
  },
  {
    id: 2036,
    type: "coding",
    section: "C",
    number: 36,
    questionText: "Binary Search: Implement Binary Search from scratch on a sorted array. Return index or -1 if not found.",
    starterCode: `// Implement Binary Search\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nconsole.log(binarySearch([10, 20, 30, 40, 50], 30));`,
    marks: 2
  },
  {
    id: 2037,
    type: "coding",
    section: "C",
    number: 37,
    questionText: "Merge Two Sorted Arrays: Write a program that merges two sorted arrays into one sorted array without using built-in sort().\n\nExample: A = [1, 3, 5], B = [2, 4, 6] -> Output: [1, 2, 3, 4, 5, 6]",
    starterCode: `// Merge Two Sorted Arrays\nfunction mergeSortedArrays(arr1, arr2) {\n  const merged = [];\n  let i = 0, j = 0;\n  while (i < arr1.length && j < arr2.length) {\n    if (arr1[i] < arr2[j]) merged.push(arr1[i++]);\n    else merged.push(arr2[j++]);\n  }\n  while (i < arr1.length) merged.push(arr1[i++]);\n  while (j < arr2.length) merged.push(arr2[j++]);\n  return merged;\n}\n\nconsole.log(mergeSortedArrays([1, 3, 5], [2, 4, 6]));`,
    marks: 2
  },
  {
    id: 2038,
    type: "coding",
    section: "C",
    number: 38,
    questionText: "Implement a Stack: Implement a Stack data structure with push(), pop(), peek(), and isEmpty().",
    starterCode: `// Implement Stack Data Structure\nclass Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(element) {\n    this.items.push(element);\n  }\n  pop() {\n    return this.items.pop();\n  }\n  peek() {\n    return this.items[this.items.length - 1];\n  }\n  isEmpty() {\n    return this.items.length === 0;\n  }\n}\n\nconst stack = new Stack();\nstack.push(10);\nstack.push(20);\nconsole.log(stack.peek());`,
    marks: 2
  },
  {
    id: 2039,
    type: "coding",
    section: "C",
    number: 39,
    questionText: "Implement a Queue: Implement a Queue data structure with enqueue(), dequeue(), front(), and isEmpty().",
    starterCode: `// Implement Queue Data Structure\nclass Queue {\n  constructor() {\n    this.items = [];\n  }\n  enqueue(element) {\n    this.items.push(element);\n  }\n  dequeue() {\n    return this.items.shift();\n  }\n  front() {\n    return this.items[0];\n  }\n  isEmpty() {\n    return this.items.length === 0;\n  }\n}\n\nconst q = new Queue();\nq.enqueue("A");\nq.enqueue("B");\nconsole.log(q.front());`,
    marks: 2
  },
  {
    id: 2040,
    type: "coding",
    section: "C",
    number: 40,
    questionText: "SQL Employee Analysis: Write an SQL query to find average salary of each department (> 50000).",
    starterCode: `-- SQL Query for Average Salary per Department (> 50000)\nSELECT department, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 50000;`,
    marks: 2
  },
  {
    id: 2041,
    type: "coding",
    section: "C",
    number: 41,
    questionText: "SQL Top Employees: Write an SQL query to return the five employees with the highest salaries.",
    starterCode: `-- SQL Query for Top 5 Highest Paid Employees\nSELECT id, name, department, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;`,
    marks: 2
  },
  {
    id: 2042,
    type: "coding",
    section: "C",
    number: 42,
    questionText: "SQL Duplicate Emails: Write an SQL query that identifies all email addresses appearing more than once.",
    starterCode: `-- SQL Query for Duplicate Email Addresses\nSELECT email\nFROM users\nGROUP BY email\nHAVING COUNT(email) > 1;`,
    marks: 2
  },
  {
    id: 2043,
    type: "coding",
    section: "C",
    number: 43,
    questionText: "SQL JOIN: Write an SQL query that returns Employee Name and Department Name for every employee.",
    starterCode: `-- SQL INNER JOIN Employees & Departments\nSELECT e.name AS "Employee Name", d.department_name AS "Department Name"\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id;`,
    marks: 2
  },
  {
    id: 2044,
    type: "coding",
    section: "C",
    number: 44,
    questionText: "SQL Second Highest Salary: Write an SQL query to find the second-highest unique salary from employees.",
    starterCode: `-- SQL Query for Second Highest Unique Salary\nSELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);`,
    marks: 2
  },
  {
    id: 2045,
    type: "coding",
    section: "C",
    number: 45,
    questionText: "REST API GET Endpoint: Write Express GET /api/users endpoint returning JSON array of users.",
    starterCode: `// Express GET /api/users Endpoint\nconst express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  try {\n    const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];\n    res.status(200).json(users);\n  } catch (err) {\n    res.status(500).json({ error: 'Server Error' });\n  }\n});`,
    marks: 2
  },
  {
    id: 2046,
    type: "coding",
    section: "C",
    number: 46,
    questionText: "REST API POST Endpoint: Create POST /api/users accepting name & email with 400 validation.",
    starterCode: `// Express POST /api/users Endpoint\nconst express = require('express');\nconst app = express();\napp.use(express.json());\n\napp.post('/api/users', (req, res) => {\n  const { name, email } = req.body;\n  if (!name || !email) {\n    return res.status(400).json({ error: 'Name and email are required' });\n  }\n  res.status(201).json({ id: Date.now(), name, email });\n});`,
    marks: 2
  },
  {
    id: 2047,
    type: "coding",
    section: "C",
    number: 47,
    questionText: "Authentication Middleware: Write middleware checking for valid authentication token header.",
    starterCode: `// Express Authentication Middleware\nfunction authMiddleware(req, res, next) {\n  const token = req.headers.authorization;\n  if (!token || token !== 'Bearer secret_token') {\n    return res.status(401).json({ error: 'Unauthorized' });\n  }\n  next();\n}`,
    marks: 2
  },
  {
    id: 2048,
    type: "coding",
    section: "C",
    number: 48,
    questionText: "Responsive Web Page: Create responsive HTML/CSS with Header, Nav, Hero, 3 Cards, and Footer.",
    starterCode: `<!DOCTYPE html>\n<html>\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style>\n    body { font-family: sans-serif; margin: 0; }\n    header { background: #111; color: white; padding: 1rem; }\n    .hero { background: #f4f4f5; text-align: center; padding: 2rem; }\n    .cards { display: flex; flex-wrap: wrap; gap: 1rem; padding: 1rem; }\n    .card { flex: 1 1 200px; border: 1px solid #ccc; padding: 1rem; }\n    footer { background: #222; color: white; text-align: center; padding: 1rem; }\n  </style>\n</head>\n<body>\n  <header><nav>Home | About</nav></header>\n  <section className="hero"><h1>Hero Title</h1></section>\n  <section className="cards">\n    <div className="card">Card 1</div>\n    <div className="card">Card 2</div>\n    <div className="card">Card 3</div>\n  </section>\n  <footer>Footer</footer>\n</body>\n</html>`,
    marks: 2
  },
  {
    id: 2049,
    type: "coding",
    section: "C",
    number: 49,
    questionText: "JavaScript Search: Create search filter function for array of user objects.",
    starterCode: `// JavaScript Search Filter\nconst users = [\n  { name: "Ravi", email: "ravi@example.com" },\n  { name: "Priya", email: "priya@example.com" },\n  { name: "Arjun", email: "arjun@example.com" }\n];\n\nfunction searchUsers(query) {\n  const q = query.toLowerCase();\n  return users.filter(user => \n    user.name.toLowerCase().includes(q) || \n    user.email.toLowerCase().includes(q)\n  );\n}\n\nconsole.log(searchUsers("priya"));`,
    marks: 2
  },
  {
    id: 2050,
    type: "coding",
    section: "C",
    number: 50,
    questionText: "Full-Stack Mini Challenge: Build Task Management API supporting POST, GET, PUT, DELETE /tasks.",
    starterCode: `// Task Management REST API (CRUD)\nconst express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet tasks = [];\n\napp.post('/tasks', (req, res) => {\n  const { title, description } = req.body;\n  if (!title) return res.status(400).json({ error: 'Title required' });\n  const task = { id: Date.now(), title, description: description || '', status: 'pending', createdAt: new Date() };\n  tasks.push(task);\n  res.status(201).json(task);\n});\n\napp.get('/tasks', (req, res) => res.json(tasks));\n\napp.get('/tasks/:id', (req, res) => {\n  const task = tasks.find(t => t.id == req.params.id);\n  if (!task) return res.status(404).json({ error: 'Task not found' });\n  res.json(task);\n});\n\napp.put('/tasks/:id', (req, res) => {\n  const task = tasks.find(t => t.id == req.params.id);\n  if (!task) return res.status(404).json({ error: 'Task not found' });\n  Object.assign(task, req.body);\n  res.json(task);\n});\n\napp.delete('/tasks/:id', (req, res) => {\n  tasks = tasks.filter(t => t.id != req.params.id);\n  res.status(204).send();\n});`,
    marks: 2
  }
];
