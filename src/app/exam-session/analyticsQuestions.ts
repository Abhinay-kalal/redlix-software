import { Question } from "./questions";

export const ANALYTICS_QUESTIONS: Question[] = [
  // SECTION A — ADVANCED MCQs (1 - 25)
  {
    id: 4001,
    type: "mcq",
    section: "A",
    number: 1,
    questionText: "A dataset contains the values 10, 12, 13, 14, 15, 100. Which measure is most appropriate for representing the central tendency?",
    options: ["A. Mean", "B. Median", "C. Variance", "D. Standard deviation"],
    marks: 2
  },
  {
    id: 4002,
    type: "mcq",
    section: "A",
    number: 2,
    questionText: "A model has an accuracy of 95%, but only 1% of the dataset represents the positive class. Why can accuracy be misleading?",
    options: [
      "A. Accuracy cannot be calculated on imbalanced data",
      "B. The model may classify almost everything as negative and still achieve high accuracy",
      "C. Precision is always greater than accuracy",
      "D. Recall becomes zero automatically"
    ],
    marks: 2
  },
  {
    id: 4003,
    type: "mcq",
    section: "A",
    number: 3,
    questionText: "Which SQL clause filters aggregated results after GROUP BY?",
    options: ["A. WHERE", "B. ORDER BY", "C. HAVING", "D. DISTINCT"],
    marks: 2
  },
  {
    id: 4004,
    type: "mcq",
    section: "A",
    number: 4,
    questionText: "A correlation coefficient of -0.92 between two variables indicates:",
    options: [
      "A. Strong positive causation",
      "B. Strong negative linear association",
      "C. No relationship",
      "D. Perfect causation"
    ],
    marks: 2
  },
  {
    id: 4005,
    type: "mcq",
    section: "A",
    number: 5,
    questionText: "Which operation is most likely to introduce data leakage into a machine-learning workflow?",
    options: [
      "A. Scaling training data using parameters calculated only from training data",
      "B. Removing duplicate records",
      "C. Computing normalization parameters using the entire dataset before train-test splitting",
      "D. Encoding categorical variables"
    ],
    marks: 2
  },
  {
    id: 4006,
    type: "mcq",
    section: "A",
    number: 6,
    questionText: "Which JOIN returns all records from the left table and matching records from the right table?",
    options: ["A. INNER JOIN", "B. RIGHT JOIN", "C. LEFT JOIN", "D. CROSS JOIN"],
    marks: 2
  },
  {
    id: 4007,
    type: "mcq",
    section: "A",
    number: 7,
    questionText: "A dataset has a standard deviation of 0. What can be concluded?",
    options: [
      "A. All values are different",
      "B. All values are identical",
      "C. The mean is zero",
      "D. The dataset contains missing values"
    ],
    marks: 2
  },
  {
    id: 4008,
    type: "mcq",
    section: "A",
    number: 8,
    questionText: "Which algorithm is primarily used for clustering?",
    options: ["A. Linear Regression", "B. K-Means", "C. Logistic Regression", "D. Naive Bayes"],
    marks: 2
  },
  {
    id: 4009,
    type: "mcq",
    section: "A",
    number: 9,
    questionText: "In K-Means clustering, what happens if K is increased excessively?",
    options: [
      "A. Clusters become more generalized",
      "B. The model may create overly fragmented clusters",
      "C. All clusters disappear",
      "D. The algorithm becomes supervised"
    ],
    marks: 2
  },
  {
    id: 4010,
    type: "mcq",
    section: "A",
    number: 10,
    questionText: "Which visualization is most appropriate for identifying the relationship between two continuous variables?",
    options: ["A. Pie chart", "B. Histogram", "C. Scatter plot", "D. Stacked bar chart"],
    marks: 2
  },
  {
    id: 4011,
    type: "mcq",
    section: "A",
    number: 11,
    questionText: "A company's revenue increased from ₹5 lakh to ₹6.5 lakh. What is the percentage increase?",
    options: ["A. 15%", "B. 20%", "C. 25%", "D. 30%"],
    marks: 2
  },
  {
    id: 4012,
    type: "mcq",
    section: "A",
    number: 12,
    questionText: "Which statistical concept measures how spread out observations are around the mean?",
    options: ["A. Variance", "B. Median", "C. Percentile", "D. Mode"],
    marks: 2
  },
  {
    id: 4013,
    type: "mcq",
    section: "A",
    number: 13,
    questionText: "If a dataset contains extreme outliers, which scaling technique is generally more resistant to their influence?",
    options: [
      "A. Standardization using mean and standard deviation",
      "B. Robust scaling using median and IQR",
      "C. Min-max scaling",
      "D. Binary encoding"
    ],
    marks: 2
  },
  {
    id: 4014,
    type: "mcq",
    section: "A",
    number: 14,
    questionText: "Which SQL function is commonly used to assign a sequential ranking within an ordered result set?",
    options: ["A. COUNT()", "B. ROW_NUMBER()", "C. SUM()", "D. CONCAT()"],
    marks: 2
  },
  {
    id: 4015,
    type: "mcq",
    section: "A",
    number: 15,
    questionText: "A dashboard shows revenue increasing while profit decreases. What should an analyst investigate first?",
    options: [
      "A. Number of dashboard users",
      "B. Changes in costs, margins and product/channel mix",
      "C. Screen resolution",
      "D. Number of charts"
    ],
    marks: 2
  },
  {
    id: 4016,
    type: "mcq",
    section: "A",
    number: 16,
    questionText: "What is the primary purpose of normalization in a relational database?",
    options: [
      "A. Increase data duplication",
      "B. Reduce redundancy and improve data integrity",
      "C. Make every query slower",
      "D. Remove relationships between tables"
    ],
    marks: 2
  },
  {
    id: 4017,
    type: "mcq",
    section: "A",
    number: 17,
    questionText: "Which metric is particularly important when false negatives are significantly more costly than false positives?",
    options: ["A. Accuracy", "B. Recall", "C. Specificity", "D. R²"],
    marks: 2
  },
  {
    id: 4018,
    type: "mcq",
    section: "A",
    number: 18,
    questionText: "What does a p-value generally help assess in hypothesis testing?",
    options: [
      "A. The probability that the null hypothesis is definitely true",
      "B. Evidence against the null hypothesis under the assumed model",
      "C. The size of a dataset",
      "D. The correlation coefficient"
    ],
    marks: 2
  },
  {
    id: 4019,
    type: "mcq",
    section: "A",
    number: 19,
    questionText: "Which technique is most appropriate for reducing dimensionality while retaining as much variance as possible?",
    options: ["A. PCA", "B. K-Means", "C. Apriori", "D. Linear Search"],
    marks: 2
  },
  {
    id: 4020,
    type: "mcq",
    section: "A",
    number: 20,
    questionText: "A time-series dataset contains strong yearly patterns. What type of pattern is this?",
    options: ["A. Random noise", "B. Seasonality", "C. Data leakage", "D. Multicollinearity"],
    marks: 2
  },
  {
    id: 4021,
    type: "mcq",
    section: "A",
    number: 21,
    questionText: "What does an R² value of 0.85 indicate in a regression model?",
    options: [
      "A. The model is 85% accurate",
      "B. Approximately 85% of the variance in the dependent variable is explained by the model",
      "C. 85% of predictions are necessarily correct",
      "D. The correlation is exactly 0.85"
    ],
    marks: 2
  },
  {
    id: 4022,
    type: "mcq",
    section: "A",
    number: 22,
    questionText: "Which problem occurs when independent variables in a regression model are highly correlated with one another?",
    options: ["A. Underflow", "B. Multicollinearity", "C. Data normalization", "D. Sampling bias"],
    marks: 2
  },
  {
    id: 4023,
    type: "mcq",
    section: "A",
    number: 23,
    questionText: "A company wants to identify customers who are likely to stop using its service. Which analytical approach is most appropriate?",
    options: [
      "A. Churn prediction",
      "B. Sentiment-independent aggregation",
      "C. Random sampling only",
      "D. Descriptive counting only"
    ],
    marks: 2
  },
  {
    id: 4024,
    type: "mcq",
    section: "A",
    number: 24,
    questionText: "Which sampling method ensures every member of a population has an equal probability of selection?",
    options: [
      "A. Convenience sampling",
      "B. Snowball sampling",
      "C. Simple random sampling",
      "D. Purposive sampling"
    ],
    marks: 2
  },
  {
    id: 4025,
    type: "mcq",
    section: "A",
    number: 25,
    questionText: "An analyst finds that ice-cream sales and drowning incidents increase during the same months. What is the most important conclusion?",
    options: [
      "A. Ice cream causes drowning",
      "B. Drowning causes ice-cream sales",
      "C. A third variable such as seasonal temperature may influence both",
      "D. The variables must be unrelated"
    ],
    marks: 2
  },

  // SECTION B — CODE & ALGORITHM ANALYSIS (26 - 50)
  {
    id: 4026,
    type: "mcq",
    section: "B",
    number: 26,
    questionText: "Python — Output:\n\ndata = [10, 20, 30, 40, 50]\nresult = [x for x in data if x > 20 and x % 20 == 0]\nprint(result)",
    options: ["A. [10, 20]", "B. [30, 40, 50]", "C. [40]", "D. [20, 40]"],
    marks: 2
  },
  {
    id: 4027,
    type: "mcq",
    section: "B",
    number: 27,
    questionText: "Python — Dictionary Analysis:\n\ndata = ['A', 'B', 'A', 'C', 'B', 'A']\ncount = {}\nfor item in data:\n    count[item] = count.get(item, 0) + 1\nprint(count['A'])",
    options: ["A. 1", "B. 2", "C. 3", "D. 4"],
    marks: 2
  },
  {
    id: 4028,
    type: "mcq",
    section: "B",
    number: 28,
    questionText: "Python — List Comprehension Output:\n\nnumbers = range(1, 11)\nresult = [x*x for x in numbers if x % 2 == 0]\nprint(result)",
    options: [
      "A. [1, 9, 25, 49, 81]",
      "B. [4, 16, 36, 64, 100]",
      "C. [2, 4, 6, 8, 10]",
      "D. [1, 4, 9, 16, 25]"
    ],
    marks: 2
  },
  {
    id: 4029,
    type: "mcq",
    section: "B",
    number: 29,
    questionText: "Algorithm Complexity:\n\nfor i in range(n):\n    for j in range(n):\n        print(i, j)\n\nWhat is the time complexity?",
    options: ["A. O(n)", "B. O(log n)", "C. O(n²)", "D. O(2ⁿ)"],
    marks: 2
  },
  {
    id: 4030,
    type: "mcq",
    section: "B",
    number: 30,
    questionText: "Algorithm Complexity:\n\ni = 1\nwhile i < n:\n    i = i * 2\n\nWhat is the time complexity?",
    options: ["A. O(n)", "B. O(n²)", "C. O(log n)", "D. O(2ⁿ)"],
    marks: 2
  },
  {
    id: 4031,
    type: "mcq",
    section: "B",
    number: 31,
    questionText: "SQL Aggregation:\nSales: (id: 1, prod: A, amt: 100), (2, A, 200), (3, B, 300), (4, B, 100)\nSELECT product, SUM(amount) FROM Sales GROUP BY product;",
    options: ["A. A = 100, B = 300", "B. A = 300, B = 400", "C. A = 400, B = 300", "D. A = 600, B = 0"],
    marks: 2
  },
  {
    id: 4032,
    type: "mcq",
    section: "B",
    number: 32,
    questionText: "SQL HAVING: Which query correctly identifies departments whose average salary exceeds ₹50,000?",
    options: [
      "A. SELECT department FROM employees WHERE AVG(salary) > 50000;",
      "B. SELECT department FROM employees GROUP BY department HAVING AVG(salary) > 50000;",
      "C. SELECT department FROM employees HAVING salary > 50000;",
      "D. SELECT department FROM employees ORDER BY AVG(salary);"
    ],
    marks: 2
  },
  {
    id: 4033,
    type: "mcq",
    section: "B",
    number: 33,
    questionText: "SQL Duplicate Detection: Which query identifies duplicate email addresses?",
    options: [
      "A. SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1;",
      "B. SELECT DISTINCT email FROM users;",
      "C. SELECT email FROM users WHERE COUNT(email) > 1;",
      "D. SELECT email FROM users ORDER BY email;"
    ],
    marks: 2
  },
  {
    id: 4034,
    type: "mcq",
    section: "B",
    number: 34,
    questionText: "SQL Ranking: Which function assigns rank values while allowing ties to share the same rank?",
    options: ["A. ROW_NUMBER()", "B. RANK()", "C. COUNT()", "D. GROUP_RANK()"],
    marks: 2
  },
  {
    id: 4035,
    type: "mcq",
    section: "B",
    number: 35,
    questionText: "Python Pandas: What does the operation df.groupby('department')['salary'].mean() primarily do?",
    options: [
      "A. Calculates the overall salary",
      "B. Calculates average salary for each department",
      "C. Removes duplicate departments",
      "D. Sorts salaries alphabetically"
    ],
    marks: 2
  },
  {
    id: 4036,
    type: "mcq",
    section: "B",
    number: 36,
    questionText: "Python Missing Data: Which Pandas operation replaces missing values with zero?",
    options: ["A. df.dropna()", "B. df.fillna(0)", "C. df.removeNA()", "D. df.replaceNA()"],
    marks: 2
  },
  {
    id: 4037,
    type: "mcq",
    section: "B",
    number: 37,
    questionText: "Python Filtering: What does df[df['salary'] > 50000] return?",
    options: [
      "A. Rows where salary is greater than ₹50,000",
      "B. Columns where salary is greater than ₹50,000",
      "C. All salaries below ₹50,000",
      "D. The average salary"
    ],
    marks: 2
  },
  {
    id: 4038,
    type: "mcq",
    section: "B",
    number: 38,
    questionText: "Algorithm Searching: A sorted array contains 1,000,000 elements. Which search algorithm provides O(log n) worst-case search time?",
    options: ["A. Linear Search", "B. Binary Search", "C. Bubble Sort", "D. Selection Sort"],
    marks: 2
  },
  {
    id: 4039,
    type: "mcq",
    section: "B",
    number: 39,
    questionText: "Algorithm Sorting: Which sorting algorithm has an average-case time complexity of O(n log n)?",
    options: ["A. Bubble Sort", "B. Selection Sort", "C. Merge Sort", "D. Linear Search"],
    marks: 2
  },
  {
    id: 4040,
    type: "mcq",
    section: "B",
    number: 40,
    questionText: "Algorithm Two Sum: Given numbers = [2, 7, 11, 15] and target = 9, which pair produces the target?",
    options: ["A. 2 + 11", "B. 7 + 15", "C. 2 + 7", "D. 11 + 15"],
    marks: 2
  },
  {
    id: 4041,
    type: "mcq",
    section: "B",
    number: 41,
    questionText: "Algorithm Hashing: What is the expected lookup complexity of a key in a well-designed hash table?",
    options: ["A. O(n)", "B. O(log n)", "C. O(1)", "D. O(n²)"],
    marks: 2
  },
  {
    id: 4042,
    type: "mcq",
    section: "B",
    number: 42,
    questionText: "Python Logic:\n\nx = [1, 2, 3, 4, 5]\nresult = []\nfor i in x:\n    if i % 2:\n        result.append(i * 2)\nprint(result)",
    options: ["A. [2, 4, 6, 8, 10]", "B. [1, 3, 5]", "C. [2, 6, 10]", "D. [4, 8]"],
    marks: 2
  },
  {
    id: 4043,
    type: "mcq",
    section: "B",
    number: 43,
    questionText: "SQL JOIN: SELECT e.name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id; What happens to an employee whose department_id has no match?",
    options: [
      "A. The employee is still returned with NULL",
      "B. The employee is excluded",
      "C. The department is automatically created",
      "D. The query fails automatically"
    ],
    marks: 2
  },
  {
    id: 4044,
    type: "mcq",
    section: "B",
    number: 44,
    questionText: "SQL Top-N Analysis: Which query returns the three highest salaries?",
    options: [
      "A. SELECT * FROM employees LIMIT 3;",
      "B. SELECT * FROM employees ORDER BY salary DESC LIMIT 3;",
      "C. SELECT * FROM employees ORDER BY salary ASC LIMIT 3;",
      "D. SELECT TOP salary FROM employees;"
    ],
    marks: 2
  },
  {
    id: 4045,
    type: "mcq",
    section: "B",
    number: 45,
    questionText: "Algorithm Frequency Analysis: To find the most frequently occurring element in an array of 1,000,000 values, which approach is generally most efficient?",
    options: [
      "A. Compare every element with every other element",
      "B. Use a frequency hash map",
      "C. Randomly select elements",
      "D. Sort repeatedly inside nested loops"
    ],
    marks: 2
  },
  {
    id: 4046,
    type: "mcq",
    section: "B",
    number: 46,
    questionText: "Data Cleaning Logic: A dataset contains Age values [21, 22, 23, 999, 24]. What is the most appropriate first analytical action regarding 999?",
    options: [
      "A. Automatically delete the entire dataset",
      "B. Treat it as a potential invalid/outlier value and investigate its meaning",
      "C. Replace every value with 999",
      "D. Calculate the mean without investigation"
    ],
    marks: 2
  },
  {
    id: 4047,
    type: "mcq",
    section: "B",
    number: 47,
    questionText: "Algorithm Big-O: Which operation is generally O(1) for a Python list?",
    options: [
      "A. Searching for an arbitrary value",
      "B. Accessing an element by index",
      "C. Sorting the list",
      "D. Removing an arbitrary value"
    ],
    marks: 2
  },
  {
    id: 4048,
    type: "mcq",
    section: "B",
    number: 48,
    questionText: "Python Aggregation:\n\nvalues = [5, 10, 15, 20]\ntotal = 0\nfor value in values:\n    total += value\nprint(total / len(values))",
    options: ["A. 10", "B. 12.5", "C. 15", "D. 50"],
    marks: 2
  },
  {
    id: 4049,
    type: "mcq",
    section: "B",
    number: 49,
    questionText: "Algorithm Optimization: A program compares every pair of elements (O(n²)). Which approach can typically reduce expected complexity to O(n)?",
    options: [
      "A. Nested loops",
      "B. Hash set",
      "C. Bubble sort",
      "D. Recursion without memoization"
    ],
    marks: 2
  },
  {
    id: 4050,
    type: "mcq",
    section: "B",
    number: 50,
    questionText: "Data Analytics Complete Scenario: Monthly data -> Jan (10k visitors, 500 leads, 50 customers), Feb (12k visitors, 600 leads, 54 customers), Mar (15k visitors, 900 leads, 63 customers). Which month has the highest visitor-to-customer conversion rate?",
    options: [
      "A. January (0.50%)",
      "B. February (0.45%)",
      "C. March (0.42%)",
      "D. All are equal"
    ],
    marks: 2
  }
];
