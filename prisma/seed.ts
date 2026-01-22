import {
  ContestStatus,
  Difficulty,
  PrismaClient,
  Problem,
  ProblemStatus,
  ProblemVisibility,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.contestInvitation.deleteMany();
  await prisma.contestParticipant.deleteMany();
  await prisma.contestProblem.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.problemComment.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.problemConstrain.deleteMany();
  await prisma.testcase.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.language.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleaned existing data');

  // Create Languages
  const languages = await Promise.all([
    prisma.language.create({ data: { name: 'Cpp' } }),
    prisma.language.create({ data: { name: 'Python' } }),
    prisma.language.create({ data: { name: 'Java' } }),
    prisma.language.create({ data: { name: 'JavaScript' } }),
    prisma.language.create({ data: { name: 'Go' } }),
    prisma.language.create({ data: { name: 'Rust' } }),
  ]);
  console.log('📝 Created languages');

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Array' } }),
    prisma.tag.create({ data: { name: 'String' } }),
    prisma.tag.create({ data: { name: 'Dynamic Programming' } }),
    prisma.tag.create({ data: { name: 'Graph' } }),
    prisma.tag.create({ data: { name: 'Tree' } }),
    prisma.tag.create({ data: { name: 'Math' } }),
    prisma.tag.create({ data: { name: 'Sorting' } }),
    prisma.tag.create({ data: { name: 'Binary Search' } }),
    prisma.tag.create({ data: { name: 'Greedy' } }),
    prisma.tag.create({ data: { name: 'Hash Table' } }),
    prisma.tag.create({ data: { name: 'Stack' } }),
    prisma.tag.create({ data: { name: 'Queue' } }),
    prisma.tag.create({ data: { name: 'Two Pointers' } }),
    prisma.tag.create({ data: { name: 'Recursion' } }),
    prisma.tag.create({ data: { name: 'Backtracking' } }),
  ]);
  console.log('🏷️ Created tags');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hustcode.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      rating: 2500,
      contributions: 100,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 1800,
        contributions: 25,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 2100,
        contributions: 50,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Wilson',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 1500,
        contributions: 10,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 1950,
        contributions: 30,
      },
    }),
    // Additional users for leaderboard testing
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 1600,
        contributions: 15,
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@example.com',
        name: 'David Lee',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 2200,
        contributions: 60,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        name: 'Emma Watson',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 1750,
        contributions: 20,
      },
    }),
    prisma.user.create({
      data: {
        email: 'frank@example.com',
        name: 'Frank Miller',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 1900,
        contributions: 35,
      },
    }),
    prisma.user.create({
      data: {
        email: 'grace@example.com',
        name: 'Grace Kim',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 2050,
        contributions: 45,
      },
    }),
    prisma.user.create({
      data: {
        email: 'henry@example.com',
        name: 'Henry Nguyen',
        password: hashedPassword,
        role: UserRole.USER,
        rating: 1850,
        contributions: 28,
      },
    }),
  ]);
  console.log('👤 Created users');

  // Create Problems
  const problemsData = [
    {
      title: 'Two Sum',
      description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      taskDescription:
        'You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      inputDescription:
        'First line contains n (2 ≤ n ≤ 10^4) - the size of the array.\nSecond line contains n integers nums[i] (-10^9 ≤ nums[i] ≤ 10^9).\nThird line contains the target integer (-10^9 ≤ target ≤ 10^9).',
      outputDescription:
        'Output two space-separated integers representing the indices of the two numbers.',
      difficulty: Difficulty.EASY,
      tags: [tags[0], tags[9]], // Array, Hash Table
      testcases: [
        { input: '4\n2 7 11 15\n9', output: '0 1', isSample: true },
        { input: '3\n3 2 4\n6', output: '1 2', isSample: true },
        { input: '2\n3 3\n6', output: '0 1', isSample: false },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int target;\n    cin >> target;\n    \n    unordered_map<int, int> mp;\n    for (int i = 0; i < n; i++) {\n        int complement = target - nums[i];\n        if (mp.count(complement)) {\n            cout << mp[complement] << " " << i << endl;\n            return 0;\n        }\n        mp[nums[i]] = i;\n    }\n    return 0;\n}',
    },
    {
      title: 'Valid Parentheses',
      description:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      taskDescription:
        'An input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      inputDescription:
        'A single line containing string s (1 ≤ |s| ≤ 10^4) consisting of parentheses characters.',
      outputDescription:
        'Output "true" if the string is valid, "false" otherwise.',
      difficulty: Difficulty.EASY,
      tags: [tags[1], tags[10]], // String, Stack
      testcases: [
        { input: '()', output: 'true', isSample: true },
        { input: '()[]{}', output: 'true', isSample: true },
        { input: '(]', output: 'false', isSample: true },
        { input: '([)]', output: 'false', isSample: false },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solution:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    stack<char> st;\n    \n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') {\n            st.push(c);\n        } else {\n            if (st.empty()) { cout << \"false\" << endl; return 0; }\n            char top = st.top();\n            if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) {\n                cout << \"false\" << endl;\n                return 0;\n            }\n            st.pop();\n        }\n    }\n    cout << (st.empty() ? \"true\" : \"false\") << endl;\n    return 0;\n}",
    },
    {
      title: 'Merge Two Sorted Lists',
      description:
        'You are given two sorted linked lists. Merge them into one sorted list.',
      taskDescription:
        'Given the heads of two sorted linked lists list1 and list2, merge them in a sorted manner and return the head of the merged linked list.',
      inputDescription:
        'First line: n m - sizes of two lists.\nSecond line: n integers representing list1.\nThird line: m integers representing list2.',
      outputDescription:
        'Output the merged sorted list as space-separated integers.',
      difficulty: Difficulty.EASY,
      tags: [tags[0], tags[12]], // Array, Two Pointers
      testcases: [
        { input: '3 3\n1 2 4\n1 3 4', output: '1 1 2 3 4 4', isSample: true },
        { input: '0 0\n\n', output: '', isSample: true },
        { input: '0 1\n\n0', output: '0', isSample: false },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<int> a(n), b(m);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    for (int i = 0; i < m; i++) cin >> b[i];\n    \n    vector<int> result;\n    int i = 0, j = 0;\n    while (i < n && j < m) {\n        if (a[i] <= b[j]) result.push_back(a[i++]);\n        else result.push_back(b[j++]);\n    }\n    while (i < n) result.push_back(a[i++]);\n    while (j < m) result.push_back(b[j++]);\n    \n    for (int k = 0; k < result.size(); k++) {\n        if (k > 0) cout << " ";\n        cout << result[k];\n    }\n    cout << endl;\n    return 0;\n}',
    },
    {
      title: 'Maximum Subarray',
      description:
        'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
      taskDescription: 'A subarray is a contiguous part of an array.',
      inputDescription:
        'First line contains n (1 ≤ n ≤ 10^5) - the size of the array.\nSecond line contains n integers nums[i] (-10^4 ≤ nums[i] ≤ 10^4).',
      outputDescription: 'Output a single integer - the maximum subarray sum.',
      difficulty: Difficulty.MEDIUM,
      tags: [tags[0], tags[2]], // Array, Dynamic Programming
      testcases: [
        { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', isSample: true },
        { input: '1\n1', output: '1', isSample: true },
        { input: '5\n5 4 -1 7 8', output: '23', isSample: false },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    \n    int maxSum = nums[0], currentSum = nums[0];\n    for (int i = 1; i < n; i++) {\n        currentSum = max(nums[i], currentSum + nums[i]);\n        maxSum = max(maxSum, currentSum);\n    }\n    cout << maxSum << endl;\n    return 0;\n}',
    },
    {
      title: 'Longest Increasing Subsequence',
      description:
        'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
      taskDescription:
        'A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.',
      inputDescription:
        'First line contains n (1 ≤ n ≤ 2500) - the size of the array.\nSecond line contains n integers nums[i] (-10^4 ≤ nums[i] ≤ 10^4).',
      outputDescription:
        'Output a single integer - the length of the longest increasing subsequence.',
      difficulty: Difficulty.MEDIUM,
      tags: [tags[0], tags[2], tags[7]], // Array, DP, Binary Search
      testcases: [
        { input: '8\n10 9 2 5 3 7 101 18', output: '4', isSample: true },
        { input: '4\n0 1 0 3 2 3', output: '4', isSample: true },
        { input: '7\n7 7 7 7 7 7 7', output: '1', isSample: false },
      ],
      timeLimit: 2000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    \n    vector<int> dp;\n    for (int num : nums) {\n        auto it = lower_bound(dp.begin(), dp.end(), num);\n        if (it == dp.end()) dp.push_back(num);\n        else *it = num;\n    }\n    cout << dp.size() << endl;\n    return 0;\n}',
    },
    {
      title: 'Binary Tree Level Order Traversal',
      description:
        "Given the root of a binary tree, return the level order traversal of its nodes' values.",
      taskDescription:
        'Level order traversal means visiting nodes level by level from left to right.',
      inputDescription:
        'First line: n - number of nodes.\nNext n lines: node value, left child index, right child index (-1 if null).',
      outputDescription:
        'Output level order traversal, each level on a new line.',
      difficulty: Difficulty.MEDIUM,
      tags: [tags[4], tags[11]], // Tree, Queue
      testcases: [
        {
          input:
            '7\n3 1 2\n9 -1 -1\n20 3 4\n15 -1 -1\n7 -1 -1\n-1 -1 -1\n-1 -1 -1',
          output: '3\n9 20\n15 7',
          isSample: true,
        },
        { input: '1\n1 -1 -1', output: '1', isSample: true },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // BFS implementation\n    return 0;\n}',
    },
    {
      title: 'Coin Change',
      description:
        'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.',
      taskDescription:
        'Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
      inputDescription:
        'First line: n amount - number of coin types and target amount.\nSecond line: n integers representing coin denominations.',
      outputDescription:
        'Output the minimum number of coins, or -1 if impossible.',
      difficulty: Difficulty.MEDIUM,
      tags: [tags[0], tags[2]], // Array, Dynamic Programming
      testcases: [
        { input: '3 11\n1 2 5', output: '3', isSample: true },
        { input: '1 3\n2', output: '-1', isSample: true },
        { input: '1 0\n1', output: '0', isSample: false },
      ],
      timeLimit: 2000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, amount;\n    cin >> n >> amount;\n    vector<int> coins(n);\n    for (int i = 0; i < n; i++) cin >> coins[i];\n    \n    vector<int> dp(amount + 1, INT_MAX);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; i++) {\n        for (int coin : coins) {\n            if (coin <= i && dp[i - coin] != INT_MAX) {\n                dp[i] = min(dp[i], dp[i - coin] + 1);\n            }\n        }\n    }\n    cout << (dp[amount] == INT_MAX ? -1 : dp[amount]) << endl;\n    return 0;\n}',
    },
    {
      title: 'Word Search',
      description:
        'Given an m x n grid of characters board and a string word, return true if word exists in the grid.',
      taskDescription:
        'The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
      inputDescription:
        'First line: m n - grid dimensions.\nNext m lines: n characters each representing the grid.\nLast line: the word to search.',
      outputDescription: 'Output "true" if word exists, "false" otherwise.',
      difficulty: Difficulty.MEDIUM,
      tags: [tags[0], tags[14]], // Array, Backtracking
      testcases: [
        {
          input: '3 4\nABCE\nSFCS\nADEE\nABCCED',
          output: 'true',
          isSample: true,
        },
        { input: '3 4\nABCE\nSFCS\nADEE\nSEE', output: 'true', isSample: true },
        {
          input: '3 4\nABCE\nSFCS\nADEE\nABCB',
          output: 'false',
          isSample: false,
        },
      ],
      timeLimit: 2000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\n// Backtracking solution\nint main() {\n    return 0;\n}',
    },
    {
      title: 'Median of Two Sorted Arrays',
      description:
        'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
      taskDescription:
        'The overall run time complexity should be O(log (m+n)).',
      inputDescription:
        'First line: m n - sizes of two arrays.\nSecond line: m integers of nums1.\nThird line: n integers of nums2.',
      outputDescription:
        'Output the median as a decimal number with one decimal place.',
      difficulty: Difficulty.HARD,
      tags: [tags[0], tags[7]], // Array, Binary Search
      testcases: [
        { input: '2 1\n1 3\n2', output: '2.0', isSample: true },
        { input: '2 2\n1 2\n3 4', output: '2.5', isSample: true },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Binary search solution\n    return 0;\n}',
    },
    {
      title: 'N-Queens',
      description:
        'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.',
      taskDescription:
        "Given an integer n, return all distinct solutions to the n-queens puzzle. Each solution contains a distinct board configuration of the n-queens' placement.",
      inputDescription: 'A single integer n (1 ≤ n ≤ 9).',
      outputDescription:
        'Output each solution on a separate line, with queen positions for each row.',
      difficulty: Difficulty.HARD,
      tags: [tags[0], tags[14]], // Array, Backtracking
      testcases: [
        {
          input: '4',
          output: '.Q..\n...Q\nQ...\n..Q.\n\n..Q.\nQ...\n...Q\n.Q..',
          isSample: true,
        },
        { input: '1', output: 'Q', isSample: true },
      ],
      timeLimit: 2000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\n// Backtracking solution\nint main() {\n    return 0;\n}',
    },
    {
      title: 'Shortest Path in Graph',
      description:
        'Given a weighted directed graph, find the shortest path from source to destination.',
      taskDescription:
        "Use Dijkstra's algorithm to find the shortest path between two nodes.",
      inputDescription:
        'First line: n m - number of nodes and edges.\nNext m lines: u v w - edge from u to v with weight w.\nLast line: source destination.',
      outputDescription:
        'Output the shortest path distance, or -1 if no path exists.',
      difficulty: Difficulty.HARD,
      tags: [tags[3], tags[8]], // Graph, Greedy
      testcases: [
        {
          input: '5 6\n0 1 10\n0 2 3\n1 2 1\n1 3 2\n2 3 8\n3 4 5\n0 4',
          output: '15',
          isSample: true,
        },
        { input: '3 2\n0 1 5\n1 2 5\n0 2', output: '10', isSample: true },
      ],
      timeLimit: 2000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\n// Dijkstra implementation\nint main() {\n    return 0;\n}',
    },
    {
      title: 'Edit Distance',
      description:
        'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.',
      taskDescription:
        'You have three operations:\n- Insert a character\n- Delete a character\n- Replace a character',
      inputDescription:
        'Two lines, each containing a string (1 ≤ |string| ≤ 500).',
      outputDescription: 'Output the minimum number of operations.',
      difficulty: Difficulty.HARD,
      tags: [tags[1], tags[2]], // String, Dynamic Programming
      testcases: [
        { input: 'horse\nros', output: '3', isSample: true },
        { input: 'intention\nexecution', output: '5', isSample: true },
      ],
      timeLimit: 2000,
      memoryLimit: 256,
      solution:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s1, s2;\n    cin >> s1 >> s2;\n    int m = s1.size(), n = s2.size();\n    vector<vector<int>> dp(m + 1, vector<int>(n + 1));\n    \n    for (int i = 0; i <= m; i++) dp[i][0] = i;\n    for (int j = 0; j <= n; j++) dp[0][j] = j;\n    \n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (s1[i-1] == s2[j-1]) dp[i][j] = dp[i-1][j-1];\n            else dp[i][j] = 1 + min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]});\n        }\n    }\n    cout << dp[m][n] << endl;\n    return 0;\n}',
    },
  ];

  const problems: Problem[] = [];
  for (const data of problemsData) {
    const problem = await prisma.problem.create({
      data: {
        title: data.title,
        description: data.description,
        taskDescription: data.taskDescription,
        inputDescription: data.inputDescription,
        outputDescription: data.outputDescription,
        difficulty: data.difficulty,
        status: ProblemStatus.APPROVED,
        visibility: ProblemVisibility.PUBLIC,
        authorId: admin.id,
        likeNumber: Math.floor(Math.random() * 1000),
        tags: {
          connect: data.tags.map((tag) => ({ id: tag.id })),
        },
      },
    });

    // Create testcases
    for (const tc of data.testcases) {
      await prisma.testcase.create({
        data: {
          input: tc.input,
          output: tc.output,
          isSample: tc.isSample,
          problemId: problem.id,
        },
      });
    }

    // Create problem constraints
    await prisma.problemConstrain.create({
      data: {
        problemId: problem.id,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
      },
    });

    // Create solution
    await prisma.solution.create({
      data: {
        code: data.solution,
        languageId: languages[0].id, // C++
        problemId: problem.id,
      },
    });

    problems.push(problem);
  }
  console.log(
    `📚 Created ${problems.length} problems with testcases, constraints, and solutions`,
  );

  // Create Contest-only problems
  const contestOnlyProblems: Problem[] = [];
  const contestProblemsData = [
    {
      title: 'Contest Special: Array Rotation',
      description: 'Rotate an array to the right by k steps.',
      taskDescription:
        'Given an array, rotate it to the right by k steps, where k is non-negative.',
      inputDescription: 'First line: n k\nSecond line: n integers',
      outputDescription: 'Output the rotated array',
      difficulty: Difficulty.EASY,
      tags: [tags[0]],
    },
    {
      title: 'Contest Special: Matrix Chain Multiplication',
      description: 'Find the minimum cost to multiply a chain of matrices.',
      taskDescription:
        'Given dimensions of matrices, find the minimum number of scalar multiplications needed.',
      inputDescription:
        'First line: n - number of matrices\nSecond line: n+1 integers representing dimensions',
      outputDescription: 'Output the minimum cost',
      difficulty: Difficulty.HARD,
      tags: [tags[2]],
    },
    {
      title: 'Contest Special: Topological Sort',
      description: 'Perform topological sorting on a DAG.',
      taskDescription:
        'Given a directed acyclic graph, return any topological ordering.',
      inputDescription: 'First line: n m\nNext m lines: u v (edge from u to v)',
      outputDescription: 'Output any valid topological order',
      difficulty: Difficulty.MEDIUM,
      tags: [tags[3]],
    },
  ];

  for (const data of contestProblemsData) {
    const problem = await prisma.problem.create({
      data: {
        title: data.title,
        description: data.description,
        taskDescription: data.taskDescription,
        inputDescription: data.inputDescription,
        outputDescription: data.outputDescription,
        difficulty: data.difficulty,
        status: ProblemStatus.APPROVED,
        visibility: ProblemVisibility.CONTEST_ONLY,
        authorId: admin.id,
        likeNumber: 0,
        tags: {
          connect: data.tags.map((tag) => ({ id: tag.id })),
        },
      },
    });

    await prisma.testcase.create({
      data: {
        input: 'Sample input',
        output: 'Sample output',
        isSample: true,
        problemId: problem.id,
      },
    });

    await prisma.problemConstrain.create({
      data: {
        problemId: problem.id,
        timeLimit: 1000,
        memoryLimit: 256,
      },
    });

    contestOnlyProblems.push(problem);
  }
  console.log(`🔒 Created ${contestOnlyProblems.length} contest-only problems`);

  // Create Contests
  const now = new Date();

  // Contest 1: Upcoming Contest
  const contest1 = await prisma.contest.create({
    data: {
      title: 'HUST Code Weekly Contest #1',
      description:
        'Weekly programming contest for all skill levels. Solve interesting algorithmic problems and compete with other programmers!\n\n## Rules:\n- Contest duration: 2 hours\n- 5 problems of varying difficulty\n- Partial scoring enabled\n- No late submissions allowed',
      startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endTime: new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      ), // +2 hours
      duration: 120, // 2 hours in minutes
      status: ContestStatus.UPCOMING,
      isPublic: true,
      maxScore: 500,
      createdById: admin.id,
    },
  });

  // Add problems to contest 1
  await Promise.all([
    prisma.contestProblem.create({
      data: {
        contestId: contest1.id,
        problemId: problems[0].id,
        order: 1,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest1.id,
        problemId: problems[1].id,
        order: 2,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest1.id,
        problemId: problems[3].id,
        order: 3,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest1.id,
        problemId: problems[8].id,
        order: 4,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest1.id,
        problemId: contestOnlyProblems[0].id,
        order: 5,
        points: 100,
      },
    }),
  ]);

  // Contest 2: Running Contest
  const contest2 = await prisma.contest.create({
    data: {
      title: 'HUST Code Algorithm Challenge',
      description:
        'A challenging contest focused on advanced algorithms including Dynamic Programming, Graph Theory, and more.\n\n## Prizes:\n- 1st Place: Premium subscription\n- 2nd-3rd Place: Pro subscription\n- Top 10: Special badge',
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Started 1 hour ago
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Ends in 2 hours
      duration: 180, // 3 hours
      status: ContestStatus.RUNNING,
      isPublic: true,
      maxScore: 600,
      createdById: admin.id,
    },
  });

  // Add problems to contest 2
  await Promise.all([
    prisma.contestProblem.create({
      data: {
        contestId: contest2.id,
        problemId: problems[4].id,
        order: 1,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest2.id,
        problemId: problems[6].id,
        order: 2,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest2.id,
        problemId: problems[10].id,
        order: 3,
        points: 150,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest2.id,
        problemId: problems[11].id,
        order: 4,
        points: 150,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest2.id,
        problemId: contestOnlyProblems[1].id,
        order: 5,
        points: 100,
      },
    }),
  ]);

  // Contest 2 problems with points:
  // Problem 0 (problems[4]): 100 points
  // Problem 1 (problems[6]): 100 points
  // Problem 2 (problems[10]): 150 points
  // Problem 3 (problems[11]): 150 points
  // Problem 4 (contestOnlyProblems[1]): 100 points
  // Total: 600 points

  const contest2ProblemsList = [
    { problem: problems[4], points: 100 },
    { problem: problems[6], points: 100 },
    { problem: problems[10], points: 150 },
    { problem: problems[11], points: 150 },
    { problem: contestOnlyProblems[1], points: 100 },
  ];

  // Define which problems each user solved (ACCEPTED) with submission time
  // Score will be calculated from solved problems
  const contest2UserSolutions: {
    userIndex: number;
    solvedProblems: { problemIndex: number; minutesAgo: number }[];
    failedAttempts: {
      problemIndex: number;
      status: string;
      minutesAgo: number;
    }[];
  }[] = [
    {
      // David - Full score 600 (solved all 5 problems) - RANK 1
      userIndex: 5,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 55 },
        { problemIndex: 1, minutesAgo: 48 },
        { problemIndex: 2, minutesAgo: 40 },
        { problemIndex: 3, minutesAgo: 32 },
        { problemIndex: 4, minutesAgo: 25 },
      ],
      failedAttempts: [],
    },
    {
      // Jane - 450 points (problems 0,1,2,4 = 100+100+150+100) - RANK 2 (earlier submit)
      userIndex: 1,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 58 },
        { problemIndex: 1, minutesAgo: 52 },
        { problemIndex: 2, minutesAgo: 45 },
        { problemIndex: 4, minutesAgo: 42 },
      ],
      failedAttempts: [
        { problemIndex: 3, status: 'WRONG_ANSWER', minutesAgo: 50 },
        { problemIndex: 3, status: 'TIME_LIMIT_EXCEEDED', minutesAgo: 48 },
      ],
    },
    {
      // John - 450 points (problems 0,1,2,4 = 100+100+150+100) - RANK 3 (later submit)
      userIndex: 0,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 50 },
        { problemIndex: 1, minutesAgo: 42 },
        { problemIndex: 2, minutesAgo: 35 },
        { problemIndex: 4, minutesAgo: 30 },
      ],
      failedAttempts: [
        { problemIndex: 2, status: 'WRONG_ANSWER', minutesAgo: 40 },
        { problemIndex: 3, status: 'RUNTIME_ERROR', minutesAgo: 33 },
      ],
    },
    {
      // Emma - 400 points (problems 0,1,2,4 nhưng không có problem 4) = 100+100+150+50partial
      // Actually: problems 0,1,3 = 100+100+150 = 350, + partial on 2 = 50 => 400
      // Let's do: problems 0,1,2 = 100+100+150 = 350, need 50 more => partial not supported
      // Simplify: Emma - 400 = problems 0,1,4 + problem 2 partial không hợp lý
      // Better: Emma - 400 = 100+100+100+100 = problems 0,1,4 and one more
      // Wait, points are: 100, 100, 150, 150, 100
      // 400 = 100+100+100+100 = problems 0,1,4 + ? không có problem 100 nào khác
      // 400 = 100+100+100+100 impossible with these points
      // Let's recalculate: 400 = 100+100+100+100 (need 4 problems of 100) but we only have 3
      // Or: 400 = 100+150+150 = problems 0 or 1 + problems 2 + 3
      // Let's use: problems 1,2,3 = 100+150+150 = 400
      userIndex: 6,
      solvedProblems: [
        { problemIndex: 1, minutesAgo: 45 },
        { problemIndex: 2, minutesAgo: 35 },
        { problemIndex: 3, minutesAgo: 10 },
      ],
      failedAttempts: [
        { problemIndex: 0, status: 'WRONG_ANSWER', minutesAgo: 50 },
        { problemIndex: 0, status: 'COMPILATION_ERROR', minutesAgo: 48 },
        { problemIndex: 4, status: 'TIME_LIMIT_EXCEEDED', minutesAgo: 20 },
      ],
    },
    {
      // Alice - 350 points (problems 0,1,2 = 100+100+150) - RANK 5 (earlier)
      userIndex: 3,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 40 },
        { problemIndex: 1, minutesAgo: 32 },
        { problemIndex: 2, minutesAgo: 15 },
      ],
      failedAttempts: [
        { problemIndex: 3, status: 'WRONG_ANSWER', minutesAgo: 25 },
        { problemIndex: 4, status: 'RUNTIME_ERROR', minutesAgo: 20 },
      ],
    },
    {
      // Henry - 350 points (problems 0,1,2 = 100+100+150) - RANK 6 (later than Alice)
      userIndex: 9,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 48 },
        { problemIndex: 1, minutesAgo: 38 },
        { problemIndex: 2, minutesAgo: 18 },
      ],
      failedAttempts: [
        { problemIndex: 0, status: 'WRONG_ANSWER', minutesAgo: 52 },
        { problemIndex: 2, status: 'TIME_LIMIT_EXCEEDED', minutesAgo: 28 },
      ],
    },
    {
      // Frank - 250 points (problems 0,2 = 100+150) - RANK 7 (earliest among 3-way tie)
      userIndex: 7,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 50 },
        { problemIndex: 2, minutesAgo: 35 },
      ],
      failedAttempts: [
        { problemIndex: 1, status: 'TIME_LIMIT_EXCEEDED', minutesAgo: 45 },
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesAgo: 40 },
      ],
    },
    {
      // Bob - 250 points (problems 0,2 = 100+150) - RANK 8 (middle)
      userIndex: 2,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 42 },
        { problemIndex: 2, minutesAgo: 20 },
      ],
      failedAttempts: [
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesAgo: 35 },
        { problemIndex: 1, status: 'RUNTIME_ERROR', minutesAgo: 30 },
        { problemIndex: 3, status: 'WRONG_ANSWER', minutesAgo: 25 },
      ],
    },
    {
      // Grace - 250 points (problems 1,3 = 100+150) - RANK 9 (latest)
      userIndex: 8,
      solvedProblems: [
        { problemIndex: 1, minutesAgo: 55 },
        { problemIndex: 3, minutesAgo: 40 },
      ],
      failedAttempts: [
        { problemIndex: 0, status: 'WRONG_ANSWER', minutesAgo: 58 },
        { problemIndex: 2, status: 'TIME_LIMIT_EXCEEDED', minutesAgo: 50 },
      ],
    },
    {
      // Charlie - 100 points (problem 0 = 100) - RANK 10 (lowest)
      userIndex: 4,
      solvedProblems: [{ problemIndex: 0, minutesAgo: 50 }],
      failedAttempts: [
        { problemIndex: 0, status: 'WRONG_ANSWER', minutesAgo: 58 },
        { problemIndex: 0, status: 'WRONG_ANSWER', minutesAgo: 55 },
        { problemIndex: 1, status: 'COMPILATION_ERROR', minutesAgo: 45 },
        { problemIndex: 1, status: 'TIME_LIMIT_EXCEEDED', minutesAgo: 40 },
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesAgo: 35 },
      ],
    },
  ];

  // Create submissions and participants for Contest 2
  for (const userData of contest2UserSolutions) {
    // Create failed attempt submissions first
    for (const attempt of userData.failedAttempts) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest2ProblemsList[attempt.problemIndex].problem.title} - ${attempt.status}\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* ${attempt.status} */ return 0; }`,
          languageId: languages[0].id,
          status: attempt.status as any,
          userId: users[userData.userIndex].id,
          problemId: contest2ProblemsList[attempt.problemIndex].problem.id,
          contestId: contest2.id,
          consumedTime:
            attempt.status === 'TIME_LIMIT_EXCEEDED'
              ? 2000
              : Math.floor(Math.random() * 500) + 100,
          consumedMemory: Math.floor(Math.random() * 128) + 32,
          submittedAt: new Date(now.getTime() - attempt.minutesAgo * 60 * 1000),
        },
      });
    }

    // Create ACCEPTED submissions
    for (const solved of userData.solvedProblems) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest2ProblemsList[solved.problemIndex].problem.title} - ACCEPTED\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* AC - ${contest2ProblemsList[solved.problemIndex].points} points */ return 0; }`,
          languageId: languages[0].id,
          status: 'ACCEPTED',
          userId: users[userData.userIndex].id,
          problemId: contest2ProblemsList[solved.problemIndex].problem.id,
          contestId: contest2.id,
          consumedTime: Math.floor(Math.random() * 400) + 50,
          consumedMemory: Math.floor(Math.random() * 100) + 20,
          submittedAt: new Date(now.getTime() - solved.minutesAgo * 60 * 1000),
        },
      });
    }

    // Calculate total score from solved problems
    const totalScore = userData.solvedProblems.reduce(
      (sum, solved) => sum + contest2ProblemsList[solved.problemIndex].points,
      0,
    );

    // Find last submission time (minimum minutesAgo = most recent)
    const allSubmissions = [
      ...userData.solvedProblems.map((s) => s.minutesAgo),
      ...userData.failedAttempts.map((a) => a.minutesAgo),
    ];
    const lastSubmitMinutesAgo = Math.min(...allSubmissions);

    // Create participant with calculated score
    await prisma.contestParticipant.create({
      data: {
        contestId: contest2.id,
        userId: users[userData.userIndex].id,
        totalScore: totalScore,
        lastSubmitTime: new Date(
          now.getTime() - lastSubmitMinutesAgo * 60 * 1000,
        ),
      },
    });
  }

  console.log(
    '📊 Created Contest 2 submissions and participants with calculated scores',
  );

  // Contest 3: Finished Contest
  const contest3 = await prisma.contest.create({
    data: {
      title: 'HUST Code Beginner Contest',
      description:
        'A beginner-friendly contest to help newcomers get started with competitive programming.\n\nPerfect for those who are new to coding competitions!',
      startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      endTime: new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      ), // +2 hours
      duration: 120,
      status: ContestStatus.FINISHED,
      isPublic: true,
      maxScore: 300,
      createdById: admin.id,
    },
  });

  // Add problems to contest 3
  await Promise.all([
    prisma.contestProblem.create({
      data: {
        contestId: contest3.id,
        problemId: problems[0].id,
        order: 1,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest3.id,
        problemId: problems[1].id,
        order: 2,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest3.id,
        problemId: problems[2].id,
        order: 3,
        points: 100,
      },
    }),
  ]);

  // Contest 3 problems with points:
  // Problem 0 (problems[0]): 100 points - Two Sum
  // Problem 1 (problems[1]): 100 points - Valid Parentheses
  // Problem 2 (problems[2]): 100 points - Merge Two Sorted Lists
  // Total: 300 points

  const contest3ProblemsList = [
    { problem: problems[0], points: 100 },
    { problem: problems[1], points: 100 },
    { problem: problems[2], points: 100 },
  ];

  // Contest 3 happened 1 week ago, so minutesOffset is from contest start time
  const contest3StartTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  const contest3UserSolutions: {
    userIndex: number;
    solvedProblems: { problemIndex: number; minutesOffset: number }[];
    failedAttempts: {
      problemIndex: number;
      status: string;
      minutesOffset: number;
    }[];
  }[] = [
    {
      // Jane - 300 points (all 3 problems) - RANK 1 (earlier)
      userIndex: 1,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 15 },
        { problemIndex: 1, minutesOffset: 35 },
        { problemIndex: 2, minutesOffset: 70 },
      ],
      failedAttempts: [],
    },
    {
      // John - 300 points (all 3 problems) - RANK 2 (later than Jane)
      userIndex: 0,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 20 },
        { problemIndex: 1, minutesOffset: 45 },
        { problemIndex: 2, minutesOffset: 85 },
      ],
      failedAttempts: [
        { problemIndex: 2, status: 'WRONG_ANSWER', minutesOffset: 75 },
      ],
    },
    {
      // Alice - 200 points (problems 0,1) - RANK 3
      userIndex: 3,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 18 },
        { problemIndex: 1, minutesOffset: 50 },
      ],
      failedAttempts: [
        { problemIndex: 2, status: 'TIME_LIMIT_EXCEEDED', minutesOffset: 65 },
        { problemIndex: 2, status: 'WRONG_ANSWER', minutesOffset: 80 },
      ],
    },
    {
      // Bob - 200 points (problems 0,1) - RANK 4 (later than Alice)
      userIndex: 2,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 25 },
        { problemIndex: 1, minutesOffset: 60 },
      ],
      failedAttempts: [
        { problemIndex: 2, status: 'RUNTIME_ERROR', minutesOffset: 90 },
      ],
    },
    {
      // David - 200 points (problems 0,2) - RANK 5
      userIndex: 5,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 22 },
        { problemIndex: 2, minutesOffset: 95 },
      ],
      failedAttempts: [
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesOffset: 40 },
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesOffset: 55 },
      ],
    },
    {
      // Emma - 100 points (problem 0 only) - RANK 6
      userIndex: 6,
      solvedProblems: [{ problemIndex: 0, minutesOffset: 28 }],
      failedAttempts: [
        { problemIndex: 1, status: 'COMPILATION_ERROR', minutesOffset: 45 },
        { problemIndex: 2, status: 'TIME_LIMIT_EXCEEDED', minutesOffset: 70 },
      ],
    },
    {
      // Charlie - 100 points (problem 1 only) - RANK 7
      userIndex: 4,
      solvedProblems: [{ problemIndex: 1, minutesOffset: 100 }],
      failedAttempts: [
        { problemIndex: 0, status: 'WRONG_ANSWER', minutesOffset: 30 },
        { problemIndex: 0, status: 'WRONG_ANSWER', minutesOffset: 50 },
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesOffset: 80 },
      ],
    },
  ];

  // Create submissions and participants for Contest 3
  for (const userData of contest3UserSolutions) {
    // Create failed attempt submissions
    for (const attempt of userData.failedAttempts) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest3ProblemsList[attempt.problemIndex].problem.title} - ${attempt.status}\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* ${attempt.status} */ return 0; }`,
          languageId: languages[0].id,
          status: attempt.status as any,
          userId: users[userData.userIndex].id,
          problemId: contest3ProblemsList[attempt.problemIndex].problem.id,
          contestId: contest3.id,
          consumedTime:
            attempt.status === 'TIME_LIMIT_EXCEEDED'
              ? 2000
              : Math.floor(Math.random() * 500) + 100,
          consumedMemory: Math.floor(Math.random() * 128) + 32,
          submittedAt: new Date(
            contest3StartTime + attempt.minutesOffset * 60 * 1000,
          ),
        },
      });
    }

    // Create ACCEPTED submissions
    for (const solved of userData.solvedProblems) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest3ProblemsList[solved.problemIndex].problem.title} - ACCEPTED\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* AC - ${contest3ProblemsList[solved.problemIndex].points} points */ return 0; }`,
          languageId: languages[0].id,
          status: 'ACCEPTED',
          userId: users[userData.userIndex].id,
          problemId: contest3ProblemsList[solved.problemIndex].problem.id,
          contestId: contest3.id,
          consumedTime: Math.floor(Math.random() * 400) + 50,
          consumedMemory: Math.floor(Math.random() * 100) + 20,
          submittedAt: new Date(
            contest3StartTime + solved.minutesOffset * 60 * 1000,
          ),
        },
      });
    }

    // Calculate total score
    const totalScore = userData.solvedProblems.reduce(
      (sum, solved) => sum + contest3ProblemsList[solved.problemIndex].points,
      0,
    );

    // Find last submission time (maximum minutesOffset = most recent in contest)
    const allSubmissions = [
      ...userData.solvedProblems.map((s) => s.minutesOffset),
      ...userData.failedAttempts.map((a) => a.minutesOffset),
    ];
    const lastSubmitMinutesOffset = Math.max(...allSubmissions);

    await prisma.contestParticipant.create({
      data: {
        contestId: contest3.id,
        userId: users[userData.userIndex].id,
        totalScore: totalScore,
        lastSubmitTime: new Date(
          contest3StartTime + lastSubmitMinutesOffset * 60 * 1000,
        ),
      },
    });
  }

  console.log(
    '📊 Created Contest 3 submissions and participants with calculated scores',
  );

  // Contest 4: Private Contest
  const contest4 = await prisma.contest.create({
    data: {
      title: 'HUST Code Invitational',
      description:
        'An exclusive invitation-only contest for advanced programmers.\n\nOnly invited participants can join this contest.',
      startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
      ), // +3 hours
      duration: 180,
      status: ContestStatus.UPCOMING,
      isPublic: false,
      maxScore: 500,
      createdById: admin.id,
    },
  });

  // Add problems to contest 4
  await Promise.all([
    prisma.contestProblem.create({
      data: {
        contestId: contest4.id,
        problemId: problems[8].id,
        order: 1,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest4.id,
        problemId: problems[9].id,
        order: 2,
        points: 150,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest4.id,
        problemId: problems[10].id,
        order: 3,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest4.id,
        problemId: contestOnlyProblems[2].id,
        order: 4,
        points: 150,
      },
    }),
  ]);

  // Add invitations for private contest
  for (const user of [users[0], users[1]]) {
    await prisma.contestInvitation.create({
      data: {
        contestId: contest4.id,
        userId: user.id,
      },
    });
  }

  // Contest 5: Currently Running Contest (Long Duration)
  const contest5 = await prisma.contest.create({
    data: {
      title: 'HUST Code Marathon 2026',
      description:
        'A long-running marathon contest for all skill levels. You have plenty of time to solve problems!\n\n## Rules:\n- Contest duration: 24 hours\n- 6 problems of varying difficulty\n- Solve at your own pace\n- Great for practice!',
      startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000), // Started 6 hours ago
      endTime: new Date(now.getTime() + 18 * 60 * 60 * 1000), // Ends in 18 hours
      duration: 1440, // 24 hours in minutes
      status: ContestStatus.RUNNING,
      isPublic: true,
      maxScore: 700,
      createdById: admin.id,
    },
  });

  // Add problems to contest 5
  await Promise.all([
    prisma.contestProblem.create({
      data: {
        contestId: contest5.id,
        problemId: problems[0].id,
        order: 1,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest5.id,
        problemId: problems[2].id,
        order: 2,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest5.id,
        problemId: problems[3].id,
        order: 3,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest5.id,
        problemId: problems[5].id,
        order: 4,
        points: 150,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest5.id,
        problemId: problems[7].id,
        order: 5,
        points: 150,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest5.id,
        problemId: contestOnlyProblems[0].id,
        order: 6,
        points: 100,
      },
    }),
  ]);

  // Add participants to marathon contest
  for (const user of users) {
    await prisma.contestParticipant.create({
      data: {
        contestId: contest5.id,
        userId: user.id,
        totalScore: Math.floor(Math.random() * 350),
        lastSubmitTime: new Date(
          now.getTime() - Math.random() * 4 * 60 * 60 * 1000,
        ),
      },
    });
  }

  // Contest 6: Private Running Contest
  const contest6 = await prisma.contest.create({
    data: {
      title: 'HUST Code Private Challenge',
      description:
        'An exclusive private contest currently running. Only invited members can participate.\n\n## Features:\n- Private leaderboard\n- Real-time ranking\n- Exclusive problems',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Started 2 hours ago
      endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // Ends in 4 hours
      duration: 360, // 6 hours
      status: ContestStatus.RUNNING,
      isPublic: false,
      maxScore: 400,
      createdById: admin.id,
    },
  });

  // Add problems to contest 6
  await Promise.all([
    prisma.contestProblem.create({
      data: {
        contestId: contest6.id,
        problemId: problems[5].id,
        order: 1,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest6.id,
        problemId: problems[7].id,
        order: 2,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest6.id,
        problemId: problems[9].id,
        order: 3,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest6.id,
        problemId: contestOnlyProblems[1].id,
        order: 4,
        points: 100,
      },
    }),
  ]);

  // Add invitations for private running contest
  for (const user of [users[0], users[1], users[2], users[3]]) {
    await prisma.contestInvitation.create({
      data: {
        contestId: contest6.id,
        userId: user.id,
      },
    });
  }

  // Contest 6 problems with points:
  // Problem 0 (problems[5]): 100 points
  // Problem 1 (problems[7]): 100 points
  // Problem 2 (problems[9]): 100 points
  // Problem 3 (contestOnlyProblems[1]): 100 points
  // Total: 400 points

  const contest6ProblemsList = [
    { problem: problems[5], points: 100 },
    { problem: problems[7], points: 100 },
    { problem: problems[9], points: 100 },
    { problem: contestOnlyProblems[1], points: 100 },
  ];

  const contest6UserSolutions: {
    userIndex: number;
    solvedProblems: { problemIndex: number; minutesAgo: number }[];
    failedAttempts: {
      problemIndex: number;
      status: string;
      minutesAgo: number;
    }[];
  }[] = [
    {
      // Jane - 300 points (problems 0,1,2) - RANK 1
      userIndex: 1,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 90 },
        { problemIndex: 1, minutesAgo: 60 },
        { problemIndex: 2, minutesAgo: 30 },
      ],
      failedAttempts: [
        { problemIndex: 3, status: 'WRONG_ANSWER', minutesAgo: 45 },
      ],
    },
    {
      // Alice - 200 points (problems 0,1) - RANK 2
      userIndex: 3,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 85 },
        { problemIndex: 1, minutesAgo: 20 },
      ],
      failedAttempts: [
        { problemIndex: 2, status: 'TIME_LIMIT_EXCEEDED', minutesAgo: 50 },
        { problemIndex: 2, status: 'WRONG_ANSWER', minutesAgo: 35 },
      ],
    },
    {
      // John - 200 points (problems 0,2) - RANK 3 (later than Alice)
      userIndex: 0,
      solvedProblems: [
        { problemIndex: 0, minutesAgo: 80 },
        { problemIndex: 2, minutesAgo: 45 },
      ],
      failedAttempts: [
        { problemIndex: 1, status: 'RUNTIME_ERROR', minutesAgo: 65 },
      ],
    },
    {
      // Bob - 100 points (problem 0 only) - RANK 4
      userIndex: 2,
      solvedProblems: [{ problemIndex: 0, minutesAgo: 60 }],
      failedAttempts: [
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesAgo: 75 },
        { problemIndex: 1, status: 'COMPILATION_ERROR', minutesAgo: 70 },
      ],
    },
  ];

  // Create submissions and participants for Contest 6
  for (const userData of contest6UserSolutions) {
    for (const attempt of userData.failedAttempts) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest6ProblemsList[attempt.problemIndex].problem.title} - ${attempt.status}\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* ${attempt.status} */ return 0; }`,
          languageId: languages[0].id,
          status: attempt.status as any,
          userId: users[userData.userIndex].id,
          problemId: contest6ProblemsList[attempt.problemIndex].problem.id,
          contestId: contest6.id,
          consumedTime:
            attempt.status === 'TIME_LIMIT_EXCEEDED'
              ? 2000
              : Math.floor(Math.random() * 500) + 100,
          consumedMemory: Math.floor(Math.random() * 128) + 32,
          submittedAt: new Date(now.getTime() - attempt.minutesAgo * 60 * 1000),
        },
      });
    }

    for (const solved of userData.solvedProblems) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest6ProblemsList[solved.problemIndex].problem.title} - ACCEPTED\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* AC - ${contest6ProblemsList[solved.problemIndex].points} points */ return 0; }`,
          languageId: languages[0].id,
          status: 'ACCEPTED',
          userId: users[userData.userIndex].id,
          problemId: contest6ProblemsList[solved.problemIndex].problem.id,
          contestId: contest6.id,
          consumedTime: Math.floor(Math.random() * 400) + 50,
          consumedMemory: Math.floor(Math.random() * 100) + 20,
          submittedAt: new Date(now.getTime() - solved.minutesAgo * 60 * 1000),
        },
      });
    }

    const totalScore = userData.solvedProblems.reduce(
      (sum, solved) => sum + contest6ProblemsList[solved.problemIndex].points,
      0,
    );

    const allSubmissions = [
      ...userData.solvedProblems.map((s) => s.minutesAgo),
      ...userData.failedAttempts.map((a) => a.minutesAgo),
    ];
    const lastSubmitMinutesAgo = Math.min(...allSubmissions);

    await prisma.contestParticipant.create({
      data: {
        contestId: contest6.id,
        userId: users[userData.userIndex].id,
        totalScore: totalScore,
        lastSubmitTime: new Date(
          now.getTime() - lastSubmitMinutesAgo * 60 * 1000,
        ),
      },
    });
  }

  console.log(
    '📊 Created Contest 6 submissions and participants with calculated scores',
  );

  // Contest 7: Private Finished Contest
  const contest7 = await prisma.contest.create({
    data: {
      title: 'HUST Code Elite Cup 2025',
      description:
        'A completed private contest for elite programmers.\n\n## Results:\nThis contest has ended. Final rankings are now available.',
      startTime: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      endTime: new Date(
        now.getTime() - 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
      ), // +3 hours
      duration: 180, // 3 hours
      status: ContestStatus.FINISHED,
      isPublic: false,
      maxScore: 500,
      createdById: admin.id,
    },
  });

  // Add problems to contest 7
  await Promise.all([
    prisma.contestProblem.create({
      data: {
        contestId: contest7.id,
        problemId: problems[4].id,
        order: 1,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest7.id,
        problemId: problems[6].id,
        order: 2,
        points: 100,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest7.id,
        problemId: problems[10].id,
        order: 3,
        points: 150,
      },
    }),
    prisma.contestProblem.create({
      data: {
        contestId: contest7.id,
        problemId: contestOnlyProblems[2].id,
        order: 4,
        points: 150,
      },
    }),
  ]);

  // Add invitations for private finished contest
  for (const user of [users[1], users[3], users[5], users[8]]) {
    await prisma.contestInvitation.create({
      data: {
        contestId: contest7.id,
        userId: user.id,
      },
    });
  }

  // Contest 7 problems with points:
  // Problem 0 (problems[4]): 100 points
  // Problem 1 (problems[6]): 100 points
  // Problem 2 (problems[10]): 150 points
  // Problem 3 (contestOnlyProblems[2]): 150 points
  // Total: 500 points

  const contest7ProblemsList = [
    { problem: problems[4], points: 100 },
    { problem: problems[6], points: 100 },
    { problem: problems[10], points: 150 },
    { problem: contestOnlyProblems[2], points: 150 },
  ];

  const contest7StartTime = now.getTime() - 14 * 24 * 60 * 60 * 1000;

  const contest7UserSolutions: {
    userIndex: number;
    solvedProblems: { problemIndex: number; minutesOffset: number }[];
    failedAttempts: {
      problemIndex: number;
      status: string;
      minutesOffset: number;
    }[];
  }[] = [
    {
      // David - 500 points (all 4 problems) - RANK 1 Champion
      userIndex: 5,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 25 },
        { problemIndex: 1, minutesOffset: 55 },
        { problemIndex: 2, minutesOffset: 100 },
        { problemIndex: 3, minutesOffset: 140 },
      ],
      failedAttempts: [],
    },
    {
      // Jane - 350 points (problems 0,1,2 = 100+100+150) - RANK 2
      userIndex: 1,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 20 },
        { problemIndex: 1, minutesOffset: 50 },
        { problemIndex: 2, minutesOffset: 110 },
      ],
      failedAttempts: [
        { problemIndex: 3, status: 'WRONG_ANSWER', minutesOffset: 130 },
        { problemIndex: 3, status: 'TIME_LIMIT_EXCEEDED', minutesOffset: 150 },
      ],
    },
    {
      // Alice - 250 points (problems 0,2 = 100+150) - RANK 3
      userIndex: 3,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 30 },
        { problemIndex: 2, minutesOffset: 120 },
      ],
      failedAttempts: [
        { problemIndex: 1, status: 'WRONG_ANSWER', minutesOffset: 60 },
        { problemIndex: 3, status: 'RUNTIME_ERROR', minutesOffset: 145 },
      ],
    },
    {
      // Grace - 200 points (problems 0,1 = 100+100) - RANK 4
      userIndex: 8,
      solvedProblems: [
        { problemIndex: 0, minutesOffset: 35 },
        { problemIndex: 1, minutesOffset: 90 },
      ],
      failedAttempts: [
        { problemIndex: 2, status: 'TIME_LIMIT_EXCEEDED', minutesOffset: 130 },
        { problemIndex: 2, status: 'WRONG_ANSWER', minutesOffset: 160 },
      ],
    },
  ];

  // Create submissions and participants for Contest 7
  for (const userData of contest7UserSolutions) {
    for (const attempt of userData.failedAttempts) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest7ProblemsList[attempt.problemIndex].problem.title} - ${attempt.status}\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* ${attempt.status} */ return 0; }`,
          languageId: languages[0].id,
          status: attempt.status as any,
          userId: users[userData.userIndex].id,
          problemId: contest7ProblemsList[attempt.problemIndex].problem.id,
          contestId: contest7.id,
          consumedTime:
            attempt.status === 'TIME_LIMIT_EXCEEDED'
              ? 2000
              : Math.floor(Math.random() * 500) + 100,
          consumedMemory: Math.floor(Math.random() * 128) + 32,
          submittedAt: new Date(
            contest7StartTime + attempt.minutesOffset * 60 * 1000,
          ),
        },
      });
    }

    for (const solved of userData.solvedProblems) {
      await prisma.submission.create({
        data: {
          code: `// ${users[userData.userIndex].name} - ${contest7ProblemsList[solved.problemIndex].problem.title} - ACCEPTED\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { /* AC - ${contest7ProblemsList[solved.problemIndex].points} points */ return 0; }`,
          languageId: languages[0].id,
          status: 'ACCEPTED',
          userId: users[userData.userIndex].id,
          problemId: contest7ProblemsList[solved.problemIndex].problem.id,
          contestId: contest7.id,
          consumedTime: Math.floor(Math.random() * 400) + 50,
          consumedMemory: Math.floor(Math.random() * 100) + 20,
          submittedAt: new Date(
            contest7StartTime + solved.minutesOffset * 60 * 1000,
          ),
        },
      });
    }

    const totalScore = userData.solvedProblems.reduce(
      (sum, solved) => sum + contest7ProblemsList[solved.problemIndex].points,
      0,
    );

    const allSubmissions = [
      ...userData.solvedProblems.map((s) => s.minutesOffset),
      ...userData.failedAttempts.map((a) => a.minutesOffset),
    ];
    const lastSubmitMinutesOffset = Math.max(...allSubmissions);

    await prisma.contestParticipant.create({
      data: {
        contestId: contest7.id,
        userId: users[userData.userIndex].id,
        totalScore: totalScore,
        lastSubmitTime: new Date(
          contest7StartTime + lastSubmitMinutesOffset * 60 * 1000,
        ),
      },
    });
  }

  console.log(
    '📊 Created Contest 7 submissions and participants with calculated scores',
  );

  console.log('🏆 Created 7 contests (3 public, 4 private)');

  // Create some sample submissions (without contest)
  const statuses = [
    'ACCEPTED',
    'WRONG_ANSWER',
    'TIME_LIMIT_EXCEEDED',
    'ACCEPTED',
    'ACCEPTED',
  ];

  for (let i = 0; i < 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    const randomLanguage =
      languages[Math.floor(Math.random() * languages.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    await prisma.submission.create({
      data: {
        code: `// Sample submission ${i + 1}\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Solution code here\n    return 0;\n}`,
        languageId: randomLanguage.id,
        status: randomStatus as any,
        userId: randomUser.id,
        problemId: randomProblem.id,
        consumedTime: Math.floor(Math.random() * 1000),
        consumedMemory: Math.floor(Math.random() * 256),
        submittedAt: new Date(
          now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ),
      },
    });
  }
  console.log('📤 Created 20 sample submissions (no contest)');

  // Create some problem comments
  for (let i = 0; i < 10; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProblem =
      problems[Math.floor(Math.random() * Math.min(5, problems.length))];

    await prisma.problemComment.create({
      data: {
        content: [
          'Great problem! Really enjoyed solving it.',
          'This one was tricky, took me a while to figure out the optimal solution.',
          'Can someone give a hint without spoiling the solution?',
          'The edge cases in this problem are interesting.',
          'Nice problem for practicing dynamic programming!',
          'I think there might be multiple approaches to this problem.',
          'Solved it using binary search, runs in O(n log n).',
          'The test cases seem comprehensive.',
          'Would love to see more problems like this!',
          'Finally got AC after 5 attempts!',
        ][i],
        userId: randomUser.id,
        problemId: randomProblem.id,
      },
    });
  }
  console.log('💬 Created 10 problem comments');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${languages.length} languages`);
  console.log(`   - ${tags.length} tags`);
  console.log(`   - 1 admin + ${users.length} users`);
  console.log(`   - ${problems.length} public problems`);
  console.log(`   - ${contestOnlyProblems.length} contest-only problems`);
  console.log(`   - 7 contests (3 public, 4 private)`);
  console.log(`   - Submissions created based on solved problems`);
  console.log(`   - 10 comments`);
  console.log('\n🔐 Login credentials:');
  console.log('   Admin: admin@hustcode.com / password123');
  console.log('   User: john@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
