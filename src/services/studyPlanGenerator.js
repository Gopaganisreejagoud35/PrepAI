// Personalized Study Plan Generator adhering strictly to Section 10 of prompt

export class StudyPlanGenerator {
  /**
   * Generates a detailed day-by-day study roadmap based on:
   * @param {Object} params
   * @param {string} params.targetRole - e.g. "Full Stack Developer"
   * @param {string} params.technology - e.g. "Java", "Python", "Full Stack"
   * @param {number} params.days - 3, 5, 7, 14, or 30 days
   * @param {string} params.skillLevel - "Beginner", "Intermediate", "Advanced"
   * @param {string[]} params.weakTopics - Topics the candidate struggled with
   * @param {string[]} params.strongTopics - Topics where candidate performed well
   * @param {string} params.interviewDate - optional date string
   */
  static generate({
    targetRole = "Software Engineer",
    technology = "Java",
    days = 7,
    skillLevel = "Intermediate",
    weakTopics = [],
    strongTopics = [],
    interviewDate = ""
  }) {
    const numDays = Math.max(3, Math.min(30, parseInt(days) || 7));
    const dailyHours = skillLevel === "Beginner" ? "3.5 hrs" : skillLevel === "Advanced" ? "2.5 hrs" : "3.0 hrs";

    // Build list of high-priority weak topics first
    const prioritizedWeak = weakTopics.length > 0 ? [...weakTopics] : [`${technology} Core Foundations`, "Memory & Architecture"];
    const candidateTech = technology === "All" || !technology ? "Software Engineering" : technology;

    // Standard syllabus modules based on technology
    const syllabusPool = this.getTopicModules(candidateTech);

    // Filter syllabus to prioritize weak topics
    const daysPlan = [];

    for (let day = 1; day <= numDays; day++) {
      let isFinalDay = day === numDays;
      let isPenultimate = day === numDays - 1;
      let isRevisionDay = day % 4 === 0 && !isFinalDay;

      let dayItem;

      if (isFinalDay) {
        dayItem = {
          dayNumber: day,
          title: "Full-Length Mock Interview & Behavioral Alignment",
          priority: "High",
          priorityBadge: "🔥 Urgent",
          recommendedTime: "4.0 hrs",
          topics: ["Full Mock Interview Simulation", "STAR Method Behavioral Stories", "System Questions Review"],
          practiceQuestions: [
            `Comprehensive ${candidateTech} technical mock round (5 questions)`,
            "Explain an architectural failure you troubleshot and how you resolved it.",
            "Describe how you handle conflicting technical opinions in a code review."
          ],
          codingExercises: [
            "Timed 45-minute LeetCode Medium problem under mock conditions",
            "Whiteboard architecture diagram walkthrough"
          ],
          revisionSchedule: "Evening: Review detailed scorecard, weak points recap, and sleep early."
        };
      } else if (isPenultimate && numDays >= 5) {
        dayItem = {
          dayNumber: day,
          title: "System Design, Edge Cases & Performance Tuning",
          priority: "High",
          priorityBadge: "🔥 High",
          recommendedTime: dailyHours,
          topics: ["Concurrency & Race Conditions", "Database Indexing & Query Latency", "API Scalability & Caching"],
          practiceQuestions: [
            `How do you diagnose high CPU and memory leaks in production ${candidateTech} applications?`,
            "What strategies prevent database connection pool starvation under spike traffic?",
            "Explain the trade-offs between Redis caching and local in-memory caching."
          ],
          codingExercises: [
            "Implement an LRU Cache with O(1) get and put",
            "Write a concurrent rate-limiter with token bucket logic"
          ],
          revisionSchedule: "30-minute flashcard review on HTTP status codes and SQL isolation levels."
        };
      } else if (isRevisionDay) {
        dayItem = {
          dayNumber: day,
          title: "Consolidation & Weak Area Remediation Sprint",
          priority: "Medium",
          priorityBadge: "⚡ Medium",
          recommendedTime: dailyHours,
          topics: ["Review Mistake Logs", "Follow-up Questions Mastery", "Flashcard Concepts Drill"],
          practiceQuestions: [
            `Re-attempt all missed questions from Days 1 to ${day - 1}`,
            "Explain the core differences between compile-time and runtime polymorphism with edge cases",
            "Walk through the event loop or execution memory model step-by-step"
          ],
          codingExercises: [
            "Re-code two previously failed coding problems without looking at solutions",
            "Optimize existing solutions from O(n^2) to O(n) or O(n log n)"
          ],
          revisionSchedule: "Review personal interview notes and common mistakes checklist."
        };
      } else {
        // Choose topic: Pick from weak topics first, else cycle through syllabus pool
        let selectedModule;
        if (prioritizedWeak.length > 0 && day <= 3) {
          const weakTopic = prioritizedWeak.shift();
          selectedModule = {
            title: `Mastering Weak Area: ${weakTopic}`,
            topics: [weakTopic, `${weakTopic} Internals`, "Production Edge Cases"],
            priority: "High",
            priorityBadge: "🔥 High",
            practiceQuestions: [
              `Deep-dive conceptual explanation of ${weakTopic}.`,
              `Common pitfalls, misconceptions, and interview traps in ${weakTopic}.`,
              `Real-world enterprise scenario requiring optimal use of ${weakTopic}.`
            ],
            codingExercises: [
              `Targeted coding challenge specifically testing ${weakTopic}.`,
              `Refactoring messy code using ${weakTopic} best practices.`
            ]
          };
        } else {
          const modIndex = (day - 1) % syllabusPool.length;
          selectedModule = syllabusPool[modIndex];
        }

        dayItem = {
          dayNumber: day,
          title: selectedModule.title,
          priority: selectedModule.priority || "Medium",
          priorityBadge: selectedModule.priority === "High" ? "🔥 High" : "⚡ Medium",
          recommendedTime: dailyHours,
          topics: selectedModule.topics,
          practiceQuestions: selectedModule.practiceQuestions,
          codingExercises: selectedModule.codingExercises,
          revisionSchedule: `Evening 20 mins: Summarize 3 key insights about ${selectedModule.topics[0]} in your own words.`
        };
      }

      daysPlan.push(dayItem);
    }

    return {
      metadata: {
        targetRole,
        technology: candidateTech,
        days: numDays,
        skillLevel,
        interviewDate: interviewDate || "Not Specified (Self-Paced)",
        weakTopicsCount: weakTopics.length,
        strongTopicsCount: strongTopics.length,
        totalStudyHours: Math.round(numDays * 3.2),
        generatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      },
      schedule: daysPlan
    };
  }

  static getTopicModules(technology) {
    const lower = (technology || "").toLowerCase();

    if (lower.includes("java")) {
      return [
        {
          title: "Java OOP, Inheritance & Memory Model",
          priority: "High",
          topics: ["Polymorphism & Abstraction", "JVM Memory (Heap vs Stack)", "Garbage Collection & GC Roots"],
          practiceQuestions: [
            "Difference between method overloading and overriding with static method rules",
            "How does JVM Garbage Collection work (G1 GC vs ZGC)?",
            "Why is Java string immutable and what is the String Constant Pool?"
          ],
          codingExercises: [
            "Implement a custom immutable class with deep copy",
            "Write a custom LinkedList with cycle detection (Floyd's algorithm)"
          ]
        },
        {
          title: "Java Collections Framework & Internals",
          priority: "High",
          topics: ["HashMap & ConcurrentHashMap Internals", "TreeSet vs HashSet", "Comparable vs Comparator"],
          practiceQuestions: [
            "Step-by-step explanation of HashMap put() in Java 8+ and treeification",
            "Why does ConcurrentHashMap not allow null keys or values?",
            "What is the equals() and hashCode() contract and what breaks if violated?"
          ],
          codingExercises: [
            "Design an LRU Cache using LinkedHashMap or custom doubly linked list",
            "Top K Frequent Elements in an array using PriorityQueue (Min-Heap)"
          ]
        },
        {
          title: "Java Multithreading & Concurrency",
          priority: "High",
          topics: ["Thread Lifecycle & Synchronization", "ReentrantLock vs synchronized", "CompletableFuture & Virtual Threads"],
          practiceQuestions: [
            "Volatile vs AtomicLong vs LongAdder under high contention",
            "How do you prevent deadlocks in multi-account balance transfers?",
            "What are Project Loom Virtual Threads and how do they differ from OS threads?"
          ],
          codingExercises: [
            "Implement a thread-safe Producer-Consumer queue with wait/notify or BlockingQueue",
            "Write a parallel word counter using Java 8 Streams and ForkJoinPool"
          ]
        },
        {
          title: "Spring Boot & RESTful Microservices",
          priority: "Medium",
          topics: ["IoC & Dependency Injection", "Spring Bean Lifecycle & Scopes", "Spring Data JPA & N+1 Problem"],
          practiceQuestions: [
            "Why is Constructor Injection preferred over @Autowired field injection?",
            "How does Spring Boot Auto-Configuration work under the hood?",
            "How do you solve the Hibernate N+1 query problem with entity graphs or fetch joins?"
          ],
          codingExercises: [
            "Create a clean REST Controller with validation and global exception handling (@ControllerAdvice)",
            "Write a JPA specification for dynamic multi-filter database queries"
          ]
        }
      ];
    } else if (lower.includes("python")) {
      return [
        {
          title: "Python Data Structures, Memory & GIL",
          priority: "High",
          topics: ["Lists vs Tuples vs Sets vs Dicts", "CPython Memory & Reference Counting", "Global Interpreter Lock (GIL)"],
          practiceQuestions: [
            "How does the GIL affect multithreading vs multiprocessing?",
            "How are Python dictionaries implemented (compact dict in 3.6+)?",
            "Explain shallow copy vs deep copy with memory diagram"
          ],
          codingExercises: [
            "Implement a Flatten Nested Dictionary function",
            "Two Sum problem with single-pass hash map"
          ]
        },
        {
          title: "Python Iterators, Generators & Functional Tools",
          priority: "High",
          topics: ["Iterator Protocol (__iter__, __next__)", "Yield & Memory Efficiency", "List/Dict Comprehensions"],
          practiceQuestions: [
            "Why are generators memory efficient when processing multi-gigabyte files?",
            "Difference between map/filter and list comprehensions",
            "What is generator delegation with yield from?"
          ],
          codingExercises: [
            "Build a custom chunking generator to stream CSV rows",
            "Implement an infinite Fibonacci generator with memoization"
          ]
        },
        {
          title: "Asyncio, Decorators & Metaprogramming",
          priority: "Medium",
          topics: ["Asyncio Event Loop & Coroutines", "Function Decorators & wraps", "Context Managers (with statement)"],
          practiceQuestions: [
            "How do you write a decorator that accepts parameters?",
            "What happens if you run a blocking time.sleep inside an asyncio coroutine?",
            "How do you build a context manager using @contextlib.contextmanager?"
          ],
          codingExercises: [
            "Build an async web scraper with asyncio.Semaphore rate limiting",
            "Write a retry decorator with exponential backoff and jitter"
          ]
        }
      ];
    } else {
      // General Software Engineering / Fullstack / SQL / DSA Syllabus
      return [
        {
          title: "Core Data Structures & Complexity (Big-O)",
          priority: "High",
          topics: ["Arrays & Dynamic Arrays", "Hash Tables & Collision Resolution", "Two Pointers & Sliding Window"],
          practiceQuestions: [
            "Explain amortized time complexity with dynamic array resizing",
            "Why does a hash table degrade to O(n) under heavy collision?",
            "When should you choose Sliding Window vs Two Pointers?"
          ],
          codingExercises: [
            "Longest Substring Without Repeating Characters",
            "Valid Palindrome with two pointers"
          ]
        },
        {
          title: "Trees, Graphs & Algorithmic Patterns",
          priority: "High",
          topics: ["Binary Search Trees & Traversal", "BFS vs DFS on Graphs", "Dijkstra & Topological Sort"],
          practiceQuestions: [
            "Explain in-order, pre-order, and post-order traversals and their applications",
            "How do you detect cycles in directed vs undirected graphs?",
            "Time and space complexity of BFS vs DFS"
          ],
          codingExercises: [
            "Invert a Binary Tree and Validate BST",
            "Number of Islands using DFS/BFS matrix traversal"
          ]
        },
        {
          title: "Databases, SQL Optimization & ACID",
          priority: "High",
          topics: ["B-Tree Indexes & Execution Plans", "ACID & Transaction Isolation Levels", "SQL Joins & Window Functions"],
          practiceQuestions: [
            "Why does wrapping an indexed column in UPPER() bypass the index?",
            "Explain Dirty Read vs Non-Repeatable Read vs Phantom Read",
            "Difference between ROW_NUMBER(), RANK(), and DENSE_RANK()"
          ],
          codingExercises: [
            "Write a SQL query to find the 2nd highest salary in each department",
            "Write a self-join query to find employees earning more than their managers"
          ]
        },
        {
          title: "REST APIs, Security & Distributed Systems",
          priority: "Medium",
          topics: ["HTTP Methods & Idempotency", "Stateless JWT vs Stateful Sessions", "Rate Limiting & Caching Strategies"],
          practiceQuestions: [
            "Why is PUT idempotent while POST is not?",
            "How do you revoke stateless JWT access tokens before expiration?",
            "Explain the CAP Theorem and why Network Partition tolerance is unavoidable"
          ],
          codingExercises: [
            "Design a URL Shortener service (like bit.ly) schema and API endpoints",
            "Implement a token-bucket rate limiter algorithm"
          ]
        }
      ];
    }
  }
}
