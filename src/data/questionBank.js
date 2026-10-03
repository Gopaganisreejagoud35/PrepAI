// Comprehensive Question Bank for AI Interview Preparation Agent
// Covers: Java, Python, SQL, HTML, CSS, JavaScript, Spring Boot, DSA, OOP, REST APIs, Databases
// Structured with conceptual, technical, scenario-based, and coding questions with follow-ups

export const QUESTION_BANK = [
  // ==================== JAVA ====================
  {
    id: "java-oop-01",
    technology: "Java",
    topic: "OOP",
    subtopic: "Inheritance & Polymorphism",
    difficulty: "Beginner",
    interviewType: "Conceptual",
    question: "Explain the difference between Method Overloading and Method Overriding in Java. Can we override a private or static method?",
    context: "Core object-oriented programming concepts in Java.",
    keyPoints: [
      "Method overloading happens within the same class with same name but different parameter list (compile-time polymorphism).",
      "Method overriding occurs between parent and child class with identical signature and return type (runtime polymorphism).",
      "Private methods cannot be overridden because they are not visible/accessible to subclasses.",
      "Static methods cannot be overridden because static method calls are bound at compile time via method hiding, not dynamic dispatch.",
      "@Override annotation helps ensure compile-time checking."
    ],
    commonMistakes: [
      "Claiming static methods can be overridden polymorphically.",
      "Thinking changing only return type is sufficient for method overloading.",
      "Forgetting that private methods are invisible to subclasses."
    ],
    hints: [
      "Think about when the decision of which method to call is made: compile time vs runtime.",
      "Consider method resolution and inheritance scope."
    ],
    idealAnswer: "Method Overloading occurs within the same class when methods share the same name but differ in parameter count, type, or order. It represents compile-time (static) polymorphism with static binding. Changing only the return type does not constitute overloading.\n\nMethod Overriding occurs when a subclass provides a specific implementation of an inherited method with identical name, parameter signature, and compatible return type (covariant). It enables runtime (dynamic) polymorphism through Java's virtual method dispatch.\n\nRegarding private and static methods: No, neither can be overridden. Private methods are not inherited or visible to subclasses. Static methods belong to the class rather than instances; defining an identical static method in a subclass merely causes 'method hiding', determined at compile time by the reference type rather than runtime instance type.",
    followUpQuestion: {
      question: "Since static methods cannot be overridden, what actually happens if you declare a static method in a subclass with the exact same signature as a static method in the superclass?",
      concept: "Method Hiding vs Method Overriding",
      keyPoints: ["It is method hiding, resolved at compile-time based on reference type, not instance type."]
    }
  },
  {
    id: "java-coll-02",
    technology: "Java",
    topic: "Collections",
    subtopic: "HashMap Internals",
    difficulty: "Intermediate",
    interviewType: "Technical",
    question: "How does HashMap work internally in Java 8+? What happens when a hash collision occurs, and what is treeification?",
    context: "Fundamental Java collections and memory/data structure mechanics.",
    keyPoints: [
      "HashMap uses an array of Node<K,V> buckets with a default initial capacity of 16 and load factor of 0.75.",
      "The key's hashCode() is passed through a bitwise hash function (key.hashCode() ^ (h >>> 16)) to spread higher bits.",
      "Bucket index is calculated using (n - 1) & hash.",
      "Collisions are initially resolved using a singly linked list.",
      "In Java 8+, if a bucket's linked list length exceeds TREEIFY_THRESHOLD (8) and the total capacity is at least MIN_TREEIFY_CAPACITY (64), the linked list converts into a balanced Red-Black Tree (TreeNode).",
      "Treeification reduces worst-case lookup from O(n) to O(log n).",
      "Keys in treeified buckets must implement Comparable or use natural ordering for balance."
    ],
    commonMistakes: [
      "Forgetting that HashMap converts to Red-Black Tree only if table capacity >= 64.",
      "Not knowing the time complexity difference: O(1) average vs O(n) worst-case (Java 7) vs O(log n) worst-case (Java 8).",
      "Omitting equals() and hashCode() contract importance."
    ],
    hints: [
      "Mention the array of buckets, the hashing formula, and the threshold of 8 elements in a bucket.",
      "What data structure replaces the linked list in Java 8?"
    ],
    idealAnswer: "In Java 8+, HashMap is backed by an array of Node<K,V> (table) with default capacity 16 and load factor 0.75. When put(K, V) is invoked:\n1. A supplemental hash is computed via `(h = key.hashCode()) ^ (h >>> 16)` to mix upper bits and minimize collisions.\n2. The bucket index is calculated via bitwise AND: `(capacity - 1) & hash`.\n3. If the bucket is empty, a new Node is placed. If occupied (collision), it traverses the chain using `equals()` to check for duplicate keys.\n4. In Java 8, if collisions reach 8 nodes (TREEIFY_THRESHOLD) and table capacity is >= 64, the linked list is converted into a Red-Black Tree (TreeNode), reducing worst-case time complexity from O(n) to O(log n).\n5. If the count later drops to 6 (UNTREEIFY_THRESHOLD) during resizing, it reverts back to a linked list. Resizing doubles the table size when total entries exceed `capacity * loadFactor`.",
    followUpQuestion: {
      question: "Why does the hashCode() implementation in HashMap use the bitwise XOR with unsigned right shift `(h = key.hashCode()) ^ (h >>> 16)`?",
      concept: "Hash perturbation function to reduce collisions in power-of-two tables",
      keyPoints: ["Spreads higher 16 bits into lower 16 bits so high-order bits participate when index is computed with small table sizes."]
    }
  },
  {
    id: "java-thread-03",
    technology: "Java",
    topic: "Multithreading",
    subtopic: "Synchronization & Concurrency",
    difficulty: "Advanced",
    interviewType: "Scenario-based",
    question: "You have a high-throughput financial transaction processing service. Multiple worker threads update account balances concurrently. How would you design this to avoid race conditions while maximizing throughput, and what are the trade-offs between synchronized, ReentrantLock, and AtomicLong/CAS?",
    context: "Concurrency, low-latency, and thread safety in enterprise Java systems.",
    keyPoints: [
      "Race conditions occur when read-modify-write operations on balance are interleaved.",
      "synchronized block provides intrinsic locking (monitor lock); easy to use, optimized by JVM (biased, thin, fat locks), but blocks threads and lacks timed/interruptible lock acquisition.",
      "ReentrantLock provides explicit locking with tryLock(), timeouts, fair/unfair ordering, and multiple Condition variables, but requires explicit unlock() in finally blocks.",
      "AtomicLong / AtomicReference uses hardware-level lock-free Compare-And-Swap (CAS), avoiding OS thread context switching and thread suspension overhead.",
      "LongAdder is even superior to AtomicLong under extreme contention by maintaining striped cell counters to avoid false sharing and cache line bouncing.",
      "Deadlock prevention strategies (ordered resource acquisition)."
    ],
    commonMistakes: [
      "Using volatile alone for balance incrementing (volatile ensures visibility, not atomicity of compound operations).",
      "Recommending synchronized on the entire class, which serializes all accounts and destroys throughput.",
      "Ignoring LongAdder under high contention scenarios."
    ],
    hints: [
      "Consider per-account locking vs global locking.",
      "What hardware primitives do atomic variables rely on?"
    ],
    idealAnswer: "To handle concurrent balance updates with high throughput:\n1. Granular Concurrency: Never lock globally across all accounts. Lock at the specific account level (e.g., striped locks or fine-grained ConcurrentHashMap holding account monitors).\n2. For simple balance increments/decrements, use lock-free atomic constructs. `AtomicLong` uses CPU CAS (CMPXCHG) instructions to achieve non-blocking atomic updates without kernel context-switching.\n3. Under extremely high thread contention on the exact same counter, `LongAdder` or `Striped64` outperforms `AtomicLong` by striping writes across multiple CPU cache cells to prevent cache-coherency ping-pong.\n4. When multi-account transfers occur (A to B), use strict lock ordering (e.g., always lock the smaller account ID first) or `ReentrantLock.tryLock()` with timeout and rollback to completely prevent deadlocks.\n\nTrade-offs: `synchronized` is simpler but can stall threads; `ReentrantLock` adds timed acquisition and condition queues at slight cognitive complexity; CAS/Atomics provide best raw speed for single-variable state but suffer under extreme spin contention.",
    followUpQuestion: {
      question: "Why is declaring `private volatile long balance;` insufficient to ensure thread-safe balance updates when multiple threads execute `balance += amount;`?",
      concept: "Atomicity vs Visibility of compound operations",
      keyPoints: ["volatile only guarantees visibility of memory writes and instruction reordering prevention; balance += amount is three distinct bytecode operations (read, add, write), which can be interleaved."]
    }
  },
  {
    id: "java-jvm-04",
    technology: "Java",
    topic: "JVM Memory Management",
    subtopic: "Garbage Collection & Memory Leak",
    difficulty: "Advanced",
    interviewType: "Technical",
    question: "Explain the JVM memory model (Heap, Stack, Metaspace). How do generational garbage collectors (like G1 GC) work, and how can a memory leak happen in Java despite having automatic Garbage Collection?",
    context: "JVM architecture, runtime data areas, and troubleshooting performance bottlenecks.",
    keyPoints: [
      "Heap holds all objects and arrays; shared across threads; divided into Young Generation (Eden, S0, S1) and Old/Tenured Generation.",
      "Stack holds primitive local variables and method call frames; thread-private.",
      "Metaspace (Java 8+) stores class metadata in native OS memory (replaced PermGen).",
      "Generational Hypothesis: Most objects die young. Minor GC collects Young Gen via copying. Surviving objects age and promote to Old Gen.",
      "G1 GC divides heap into equal-sized regions (1MB-32MB), performs concurrent marking, and prioritizes regions with the most garbage ('Garbage-First') within a user-specified pause time target.",
      "Memory Leaks happen when unused objects remain strongly reachable from GC Roots (e.g., static collections, unclosed resources/streams, listeners/callbacks not deregistered, improper equals/hashCode in collections)."
    ],
    commonMistakes: [
      "Claiming Java has no memory leaks because it has automatic garbage collection.",
      "Confusing StackOverflowError (call recursion) with OutOfMemoryError: Java heap space.",
      "Thinking PermGen still exists in Java 17/21."
    ],
    hints: [
      "What are GC Roots?",
      "Think about static HashMaps that never evict entries."
    ],
    idealAnswer: "The JVM Memory consists of:\n1. Heap: Stores all object instances and arrays, shared by all threads. Split into Young Gen (Eden + Survivor spaces S0/S1) and Old Generation based on the Weak Generational Hypothesis.\n2. Stack: Thread-private memory containing stack frames for active method calls (primitives and object references). Freed automatically on method return.\n3. Metaspace: Out-of-heap native memory storing loaded class definitions, method bytecode, and constant pools.\n\nGarbage Collectors (like G1 GC):\nG1 partitions the heap into hundreds of discrete regions (1-32MB). It concurrently tracks object liveness and evacuates live objects from regions with highest garbage density ('Garbage-First') into empty regions, satisfying user-defined latency target `MaxGCPauseMillis` while avoiding heap fragmentation.\n\nMemory Leaks in Java:\nA memory leak occurs when an object is no longer needed by business logic, yet remains reachable via strong references tracing back to GC Roots. Classic causes include:\n- Static collections: A `static List` or `Map` continuously storing data without eviction.\n- Unregistered listeners/observers: Event listeners registered to long-lived publisher objects.\n- Unclosed resources: Database connections, network sockets, or file descriptors holding native memory buffers.\n- Incorrect `equals()` / `hashCode()`: Mutating a key in a HashSet prevents `remove()` from finding it, orphaning the object forever.",
    followUpQuestion: {
      question: "What JVM profiling tools or commands would you use to diagnose a suspected memory leak in production?",
      concept: "JVM Diagnostic Tools",
      keyPoints: ["jcmd, jmap, VisualVM, Eclipse Memory Analyzer (MAT), or generating heap dump on OutOfMemory via -XX:+HeapDumpOnOutOfMemoryError."]
    }
  },

  // ==================== PYTHON ====================
  {
    id: "py-gil-01",
    technology: "Python",
    topic: "Python Basics",
    subtopic: "Global Interpreter Lock (GIL)",
    difficulty: "Intermediate",
    interviewType: "Conceptual",
    question: "What is Python's Global Interpreter Lock (GIL)? How does it affect multithreaded programs, and how do you achieve true parallelism in Python?",
    context: "CPython runtime internals, threading limitations, and concurrency paradigms.",
    keyPoints: [
      "GIL is a mutex in CPython that protects access to Python objects, preventing multiple native threads from executing Python bytecode simultaneously.",
      "It exists because CPython's memory management is not thread-safe (reference counting).",
      "CPU-bound tasks do not benefit from threading in Python; multithreading can actually be slower due to lock acquisition contention and context switches.",
      "I/O-bound tasks (network, disk, DB) still benefit from threading because the GIL is released during system calls and I/O operations.",
      "To achieve true parallelism for CPU-bound tasks, use `multiprocessing` (separate processes with independent GILs and memory spaces), C-extensions/Cython, or alternative runtimes (like nogil/free-threaded Python 3.13+ or PyPy STM)."
    ],
    commonMistakes: [
      "Believing Python threads don't use OS threads (CPython threads are actual OS threads, but locked by GIL).",
      "Thinking GIL prevents all concurrency (I/O concurrency works well with threading and asyncio).",
      "Confusing multithreading with multiprocessing."
    ],
    hints: [
      "Why does CPython's reference counting necessitate a global lock?",
      "Differentiate between CPU-bound and I/O-bound operations."
    ],
    idealAnswer: "The Global Interpreter Lock (GIL) is a mutual exclusion lock in CPython designed to prevent multiple native OS threads from executing Python bytecodes concurrently. It was introduced to simplify CPython's reference-counting memory management, which is not thread-safe.\n\nImpact on Multithreading:\n- CPU-Bound Tasks: Threads cannot run across multiple CPU cores simultaneously. Due to lock contention and thread switching overhead, multithreaded CPU tasks often run slower than a single-threaded equivalent.\n- I/O-Bound Tasks: Threading is effective because CPython releases the GIL while waiting for network I/O, disk operations, or when executing intensive C libraries (like NumPy).\n\nAchieving True Parallelism:\n1. `multiprocessing` module: Spawns independent OS processes, each with its own Python interpreter, memory space, and GIL.\n2. `concurrent.futures.ProcessPoolExecutor` for clean task-pool dispatch.\n3. Native extensions (C/Rust/Cython) that explicitly release the GIL via `Py_BEGIN_ALLOW_THREADS`.\n4. Python 3.13+ Free-Threaded build (PEP 703) which disables the GIL using biased reference counting and mimalloc.",
    followUpQuestion: {
      question: "If the GIL guarantees that only one thread runs bytecode at a time, do we still need threading locks (`threading.Lock`) in Python user code?",
      concept: "GIL atomicity vs compound application operations",
      keyPoints: ["Yes, because operations like `n += 1` compile to multiple bytecode instructions (LOAD_FAST, INPLACE_ADD, STORE_FAST), and thread switches can occur between bytecodes."]
    }
  },
  {
    id: "py-gen-02",
    technology: "Python",
    topic: "Generators & Iterators",
    subtopic: "Yield & Memory Efficiency",
    difficulty: "Beginner",
    interviewType: "Technical",
    question: "What is the difference between a normal Python function and a Generator function? How does `yield` work, and why are generators memory efficient?",
    context: "Python memory management, lazy evaluation, and the iterator protocol.",
    keyPoints: [
      "A normal function executes to completion and returns a single value via `return`, destroying its stack frame.",
      "A generator function contains one or more `yield` statements; when called, it returns a generator object without executing immediately.",
      "Each call to `next()` executes code until it hits `yield`, yields the value, and suspends execution, preserving local variables and state.",
      "When execution finishes, it raises `StopIteration`.",
      "Memory efficiency: Generators evaluate lazily (one item at a time in O(1) memory) rather than creating and storing entire collections in RAM (O(n) memory)."
    ],
    commonMistakes: [
      "Thinking calling a generator function executes the code immediately.",
      "Believing generators can be indexed like lists `gen[0]` or reused after exhaustion."
    ],
    hints: [
      "Think about lazy evaluation vs eager evaluation.",
      "How does a generator remember where it left off?"
    ],
    idealAnswer: "A normal Python function calculates all results eagerly, returns them via `return`, and cleans up its local scope. In contrast, a generator function contains the `yield` keyword. When invoked, it returns a generator object conforming to the Python Iterator Protocol (`__iter__` and `__next__`) without executing immediately.\n\nWhen `next(generator)` is called, the function executes until it reaches `yield`. It produces the yielded value and pauses its state, freezing local variables and execution pointer. The next call resumes right after the `yield` statement until no more values remain, at which point it raises `StopIteration`.\n\nGenerators are exceptionally memory efficient because of lazy evaluation: items are computed on demand on the fly. For instance, processing a 50GB log file using a generator requires mere kilobytes of RAM (O(1) memory), whereas loading the entire file into a list would exhaust memory (O(n) memory).",
    followUpQuestion: {
      question: "Can you iterate over a generator twice using two separate for-loops?",
      concept: "Generator exhaustion",
      keyPoints: ["No, generators are one-time iterators. Once exhausted, subsequent calls raise StopIteration; you must create a new generator object."]
    }
  },
  {
    id: "py-async-03",
    technology: "Python",
    topic: "Asyncio",
    subtopic: "Event Loop & Coroutines",
    difficulty: "Advanced",
    interviewType: "Scenario-based",
    question: "You are building an API scraper that needs to query 5,000 independent external REST endpoints. How would you use `asyncio` and `aiohttp` to perform this efficiently? How do you prevent overwhelming the target server or running out of file descriptors?",
    context: "Asynchronous concurrency, rate limiting, and network throughput in Python.",
    keyPoints: [
      "Single-threaded asynchronous I/O using `asyncio` event loop and cooperative multitasking.",
      "Using `aiohttp.ClientSession` reused across requests (connection pooling).",
      "Using `asyncio.Semaphore(limit)` to restrict concurrent in-flight requests and avoid hitting socket/file descriptor limits (`ulimit`).",
      "Using `asyncio.gather(*tasks)` or `asyncio.as_completed(tasks)` with exception handling.",
      "Exponential backoff retry logic for 429 (Too Many Requests) or network transient errors."
    ],
    commonMistakes: [
      "Using `requests` inside an async function, which blocks the single-threaded event loop.",
      "Firing all 5,000 requests simultaneously with `asyncio.gather` without a concurrency semaphore.",
      "Creating a new `aiohttp.ClientSession` for every single request instead of reusing one session."
    ],
    hints: [
      "What primitive limits concurrent tasks in asyncio?",
      "Why must you avoid standard blocking libraries like `requests` or `time.sleep`?"
    ],
    idealAnswer: "To scrape 5,000 endpoints efficiently without crashing the local system or target servers:\n1. Use an asynchronous HTTP client like `aiohttp` or `httpx` so the event loop remains unblocked during network latency. Never use blocking libraries like `requests`.\n2. Concurrency Throttling with `asyncio.Semaphore`: Wrap each fetch call with `async with asyncio.Semaphore(100):` to cap concurrent sockets (e.g. 50-100 max).\n3. Session Reuse: Instantiate a single `aiohttp.ClientSession` context with a custom `TCPConnector(limit=100)` to reuse TCP connections (keep-alive) and prevent socket exhaustion.\n4. Error Handling & Backoff: Wrap queries in try/except blocks to catch HTTP 429 and network timeouts, applying jittered exponential backoff.\n5. Batching / Streaming: Use `asyncio.as_completed` or process in chunks to stream results to disk/database rather than accumulating all 5,000 JSON payloads in memory.",
    followUpQuestion: {
      question: "What happens to the entire asyncio program if a third-party library inside an `async def` function executes `time.sleep(5)`?",
      concept: "Blocking the asyncio event loop",
      keyPoints: ["It halts the entire OS thread and freezes the event loop for 5 seconds; no other concurrent coroutines can progress during that time."]
    }
  },
  {
    id: "py-decor-04",
    technology: "Python",
    topic: "Decorators & Metaprogramming",
    subtopic: "Function Decorators & functools.wraps",
    difficulty: "Intermediate",
    interviewType: "Technical",
    question: "How do Python Decorators work under the hood? Write a decorator that measures and logs the execution time of any function. Why is `@functools.wraps` essential?",
    context: "First-class functions, closures, and cross-cutting concerns in Python.",
    keyPoints: [
      "In Python, functions are first-class objects (can be passed as arguments, assigned, returned).",
      "A decorator is a higher-order function that takes another function as input, extends its behavior without modifying source code, and returns a wrapper function.",
      "Syntax `@my_decorator` is syntactic sugar for `my_function = my_decorator(my_function)`.",
      "`functools.wraps(fn)` copies metadata (`__name__`, `__doc__`, annotations) from the decorated function onto the wrapper.",
      "Without `@wraps`, inspection tools, debuggers, and doc generators see `wrapper` instead of the original function."
    ],
    commonMistakes: [
      "Omitting `*args, **kwargs` from the wrapper function, breaking parameterized functions.",
      "Forgetting to `return result` from the wrapper.",
      "Omitting `@functools.wraps`."
    ],
    hints: [
      "Remember that `@decorator` is syntax sugar for `fn = decorator(fn)`.",
      "What happens to `fn.__name__` if you don't use wraps?"
    ],
    idealAnswer: "In Python, functions are first-class objects that can be passed as arguments, wrapped in closures, and returned. A decorator is a callable that receives a target function, wraps it inside another function with augmented behavior, and returns that wrapper. The `@` syntax is syntactic sugar:\n```python\n@timing_decorator\ndef my_func(): pass\n# Equivalent to: my_func = timing_decorator(my_func)\n```\n\nExecution Time Decorator:\n```python\nimport time\nfrom functools import wraps\n\ndef measure_time(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        duration = time.perf_counter() - start\n        print(f\"{func.__name__} executed in {duration:.4f}s\")\n        return result\n    return wrapper\n```\n\nWhy `@functools.wraps` is essential: Without it, the wrapper replaces the original function's `__name__`, `__doc__`, and module attributes with `'wrapper'`. `@wraps` copies over introspection metadata, preserving debugging tracebacks, Sphinx doc generation, and testing frameworks.",
    followUpQuestion: {
      question: "How would you modify this decorator if you wanted it to accept arguments, e.g., `@measure_time(unit='ms')`?",
      concept: "Decorator with parameters (three-level function nest)",
      keyPoints: ["Add an outer factory function that takes unit='ms' and returns the actual decorator function, resulting in three levels of nested functions."]
    }
  },

  // ==================== SQL ====================
  {
    id: "sql-idx-01",
    technology: "SQL",
    topic: "Databases",
    subtopic: "Indexing & B-Trees",
    difficulty: "Intermediate",
    interviewType: "Technical",
    question: "How do B-Tree indexes work in relational databases like PostgreSQL or MySQL? When does an index NOT get used by the query planner?",
    context: "Database indexing mechanics, query optimization, and execution plans.",
    keyPoints: [
      "B-Tree (Balanced Tree) stores sorted keys with balanced depth, allowing search, insertion, and range queries in O(log n).",
      "Index leaf nodes form a doubly linked list, enabling fast range scans (`BETWEEN`, `<`, `>`).",
      "Clustered index stores table data rows directly in leaf nodes (e.g. InnoDB primary key), whereas secondary non-clustered index stores pointer/PK.",
      "Index is ignored when: applying functions on columns (e.g. `WHERE UPPER(name) = 'ALEX'`), leading wildcards (`WHERE name LIKE '%son'`), implicit type conversion (comparing string to int), composite index queries skipping the leftmost prefix, or when table is so small that full table scan is cheaper."
    ],
    commonMistakes: [
      "Assuming indexes speed up both read and write operations (indexes slow down INSERT/UPDATE/DELETE).",
      "Not understanding leftmost prefix rule in composite indexes.",
      "Thinking indexes are always picked regardless of data distribution (selectivity)."
    ],
    hints: [
      "Consider search time complexity.",
      "What happens when you wrap an indexed column inside a SQL function like `DATE()` or `LOWER()`?"
    ],
    idealAnswer: "A B-Tree (specifically B+Tree in most RDBMS) is a self-balancing search tree where internal nodes contain routing keys and pointers, while leaf nodes contain all keys and pointers to the actual data (or the row data itself in clustered indexes). Leaf nodes are linked sequentially, making range queries (`BETWEEN`, `<`, `>`) and ordered sorting (`ORDER BY`) extremely efficient in O(log n) time.\n\nScenarios where the Query Planner ignores an index:\n1. Functions or expressions on columns: `WHERE YEAR(created_at) = 2024` (unless a functional/expression index is created).\n2. Leading wildcards in LIKE queries: `WHERE email LIKE '%@gmail.com'` prevents tree traversal from the root.\n3. Violating Leftmost Prefix: On composite index `(A, B, C)`, querying `WHERE B = 10` will not use the index.\n4. Implicit type conversions: Comparing an indexed VARCHAR column against an integer.\n5. Low selectivity: If a query returns 30%+ of the table, sequential table scan is cheaper due to sequential I/O vs random disk seeks.",
    followUpQuestion: {
      question: "If you have a composite index on `(department_id, salary)`, can the database use this index for a query that only has `WHERE salary > 50000`?",
      concept: "Composite index leftmost prefix rule",
      keyPoints: ["No, because the tree is sorted primarily by department_id first; skipping the leading column prevents index tree navigation."]
    }
  },
  {
    id: "sql-joins-02",
    technology: "SQL",
    topic: "Query Optimization",
    subtopic: "Joins & Window Functions",
    difficulty: "Beginner",
    interviewType: "Technical",
    question: "Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. Also, what is the difference between `WHERE` and `HAVING`?",
    context: "Relational data extraction and aggregation foundations.",
    keyPoints: [
      "INNER JOIN returns only rows with matching keys in both tables.",
      "LEFT JOIN returns all rows from left table and matched rows from right; unmatched right columns are NULL.",
      "RIGHT JOIN returns all rows from right table and matched rows from left.",
      "FULL OUTER JOIN returns all rows when there is a match in either table, filling non-matching sides with NULL.",
      "WHERE filters individual rows BEFORE grouping and aggregation; cannot use aggregate functions (`COUNT`, `AVG`).",
      "HAVING filters grouped summary records AFTER `GROUP BY` aggregation; can filter on aggregate functions (`HAVING COUNT(*) > 5`)."
    ],
    commonMistakes: [
      "Attempting to use aggregate functions in a `WHERE` clause.",
      "Confusing `LEFT JOIN ... WHERE right.id IS NULL` with INNER JOIN.",
      "Thinking `HAVING` replaces `WHERE` in all situations."
    ],
    hints: [
      "When is grouping performed relative to WHERE and HAVING?",
      "Draw Venn diagrams in your mind for JOIN types."
    ],
    idealAnswer: "SQL Join Types:\n- INNER JOIN: Keeps only rows where the join condition matches in BOTH tables. Any unmatched rows from either side are discarded.\n- LEFT JOIN (LEFT OUTER): Retains every single row from the left table. If matching rows exist on the right, their columns are populated; otherwise, right columns contain NULL.\n- RIGHT JOIN: Mirrors LEFT JOIN; preserves all rows from the right table, filling unmatched left columns with NULL.\n- FULL OUTER JOIN: Combines the effect of LEFT and RIGHT joins, returning all rows from both tables, filling NULLs wherever a key match does not exist.\n\nWHERE vs HAVING:\n- `WHERE` filters individual base table records BEFORE any `GROUP BY` grouping occurs. It cannot evaluate aggregate expressions (e.g. `WHERE COUNT(*) > 2` throws a syntax error).\n- `HAVING` filters aggregated group records AFTER the `GROUP BY` clause has collapsed rows. It is specifically designed to filter on aggregate calculations (e.g. `HAVING SUM(amount) > 1000`).",
    followUpQuestion: {
      question: "How can you write a query using a LEFT JOIN to find all customers who have NEVER placed an order?",
      concept: "Anti-join pattern using LEFT JOIN and IS NULL",
      keyPoints: ["SELECT c.* FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL;"]
    }
  },

  // ==================== DATABASES ====================
  {
    id: "db-acid-01",
    technology: "Databases",
    topic: "Databases",
    subtopic: "ACID Properties & Isolation Levels",
    difficulty: "Advanced",
    interviewType: "Conceptual",
    question: "Explain the ACID properties of relational databases. What are the 4 standard SQL Transaction Isolation levels, and what anomalies (Dirty Read, Non-Repeatable Read, Phantom Read) does each prevent?",
    context: "Transaction safety, database consistency, and concurrency control.",
    keyPoints: [
      "Atomicity: All operations in a transaction succeed or all rollback.",
      "Consistency: State transitions preserve all database invariants and constraints.",
      "Isolation: Concurrent transactions execute without interfering with one another.",
      "Durability: Committed data survives crashes/power loss (via write-ahead logging / WAL).",
      "Read Uncommitted: Allows Dirty Read, Non-Repeatable Read, Phantom Read.",
      "Read Committed: Prevents Dirty Read; allows Non-Repeatable Read, Phantom Read.",
      "Repeatable Read: Prevents Dirty Read & Non-Repeatable Read; allows Phantom Read (mitigated in InnoDB via MVCC and Next-Key locks).",
      "Serializable: Prevents all anomalies; highest safety, lowest concurrency."
    ],
    commonMistakes: [
      "Confusing Non-Repeatable Read (row modified) with Phantom Read (new rows inserted).",
      "Thinking Serializable means single-threaded execution (it uses strict two-phase locking or SSI).",
      "Forgetting how Durability is physically achieved (Write-Ahead Log / redo log)."
    ],
    hints: [
      "Break down A-C-I-D one by one.",
      "Map the 4 isolation levels in increasing order of isolation."
    ],
    idealAnswer: "ACID guarantees transactional reliability:\n- Atomicity: All-or-nothing execution. Partial failures trigger rollback.\n- Consistency: Transactions transition the database from one valid state to another, upholding constraints and foreign keys.\n- Isolation: Controls how uncommitted changes in concurrent transactions are hidden.\n- Durability: Once committed, updates persist permanently even through power failure, guaranteed via Write-Ahead Logs (WAL) flushed to non-volatile storage.\n\nThe 4 SQL Isolation Levels and Anomalies:\n1. Read Uncommitted: Transactions can read uncommitted data from other transactions (Dirty Read allowed).\n2. Read Committed (Default in Postgres/Oracle): Only committed data is read. Prevents Dirty Read. Allows Non-Repeatable Read (re-reading a row yields updated values).\n3. Repeatable Read (Default in MySQL InnoDB): Guarantees that any row read within a transaction remains identical across repeated reads. Prevents Dirty & Non-Repeatable Reads. May allow Phantom Reads (new rows matching filter appearing).\n4. Serializable: Enforces strict serial order via locking or Serializable Snapshot Isolation (SSI). Completely eliminates Dirty Reads, Non-Repeatable Reads, and Phantom Reads.",
    followUpQuestion: {
      question: "What is the exact difference between a 'Non-Repeatable Read' and a 'Phantom Read'?",
      concept: "Database concurrency anomalies",
      keyPoints: ["Non-repeatable read involves an existing row being modified or deleted; phantom read involves new rows being inserted that match the query criteria."]
    }
  },
  {
    id: "db-nosql-02",
    technology: "Databases",
    topic: "Databases",
    subtopic: "SQL vs NoSQL & CAP Theorem",
    difficulty: "Intermediate",
    interviewType: "Scenario-based",
    question: "When would you choose a NoSQL database (Document, Key-Value, Columnar) over a traditional Relational SQL database? How does the CAP Theorem apply to this decision?",
    context: "System architecture, distributed databases, and database paradigm selection.",
    keyPoints: [
      "SQL is optimal for: structured relational data, complex multi-table joins, ACID transactions, strong consistency (finance, inventory, order processing).",
      "NoSQL is optimal for: horizontal scalability (sharding), flexible/dynamic schema, high write throughput, unstructured/semi-structured data.",
      "Key-Value (Redis): caching, session store; Document (MongoDB): user profiles, product catalogs, CMS; Wide-Column (Cassandra): time-series, analytics, massive writes; Graph (Neo4j): social networks, fraud detection.",
      "CAP Theorem: A distributed data store can guarantee at most 2 out of 3: Consistency, Availability, Partition Tolerance.",
      "Because network partitions (P) are inevitable in distributed systems, the trade-off is always between CP (consistency over availability) and AP (availability over consistency via eventual consistency)."
    ],
    commonMistakes: [
      "Claiming you can choose 'CA' in a distributed system across network nodes (partitions cannot be ignored).",
      "Saying NoSQL is always faster than SQL.",
      "Assuming NoSQL databases never support transactions."
    ],
    hints: [
      "Why is Partition Tolerance mandatory in real-world distributed networks?",
      "Match specific NoSQL types (Redis, Mongo, Cassandra) to appropriate use cases."
    ],
    idealAnswer: "Choose Relational SQL (Postgres, MySQL) when:\n- Data is structured and schema changes are planned.\n- Strict ACID transactional guarantees are non-negotiable (e.g. banking, ledger transactions).\n- Complex multi-table joins and ad-hoc analytical queries are frequent.\n\nChoose NoSQL when:\n- Horizontal scale-out (sharding across dozens of nodes) is required for terabytes/petabytes of data.\n- Data schema is hierarchical, polymorphous, or rapidly evolving (Document stores like MongoDB).\n- Ultra-low latency key lookups or caching is needed (Redis).\n- Write throughput dominates (Cassandra's LSM-tree architecture).\n\nCAP Theorem Context:\nIn any distributed system, Network Partitions (P) are unavoidable physical realities (split-brain, cable cuts, router dropped packets). Therefore, when a partition occurs, an architect must choose between:\n1. CP (Consistency): Reject writes or stall reads to prevent stale data (e.g., HBase, MongoDB primary).\n2. AP (Availability): Accept writes and reads on both partitions, trading immediate consistency for Eventual Consistency (e.g., Cassandra, DynamoDB).",
    followUpQuestion: {
      question: "What does 'Eventual Consistency' mean in practical terms for a system like Amazon DynamoDB or Apache Cassandra?",
      concept: "Eventual consistency in distributed systems",
      keyPoints: ["In the absence of new updates, all replicas will eventually converge to the same value, but stale reads may occur temporarily."]
    }
  },

  // ==================== JAVASCRIPT ====================
  {
    id: "js-loop-01",
    technology: "JavaScript",
    topic: "Asynchronous JavaScript",
    subtopic: "Event Loop & Task Queues",
    difficulty: "Intermediate",
    interviewType: "Technical",
    question: "Explain the JavaScript Event Loop. How do the Call Stack, Web APIs, Microtask Queue (Promises, queueMicrotask), and Macrotask Queue (setTimeout, setInterval) interact?",
    context: "JavaScript single-threaded runtime, concurrency model, and execution ordering.",
    keyPoints: [
      "JavaScript has a single-threaded Call Stack (executes synchronous code).",
      "Asynchronous tasks (fetch, setTimeout, DOM events) are offloaded to browser Web APIs / Node C++ APIs.",
      "When async operations complete, callbacks enter queues.",
      "Microtasks include: Promise callbacks (`.then()`, `.catch()`, `.finally()`), `queueMicrotask`, `process.nextTick` (Node).",
      "Macrotasks include: `setTimeout`, `setInterval`, `setImmediate`, I/O events, UI rendering.",
      "Event loop order of operations: Execute one macrotask / all current synchronous code in call stack -> drain ENTIRE microtask queue completely (including microtasks queued by other microtasks) -> render UI if needed -> pick next macrotask."
    ],
    commonMistakes: [
      "Believing `setTimeout(fn, 0)` executes immediately before subsequent promises.",
      "Not knowing that the microtask queue must be completely emptied before the next macrotask runs.",
      "Thinking JavaScript multi-threads async code."
    ],
    hints: [
      "Which queue has higher priority: Microtask or Macrotask?",
      "Trace: `console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);`"
    ],
    idealAnswer: "JavaScript is single-threaded with a non-blocking concurrency model powered by the Event Loop:\n1. Call Stack: Synchronous code executes in LIFO frames.\n2. Web APIs: Async tasks (timers, fetch, DOM events) run in browser background threads.\n3. Microtask Queue: Holds high-priority callbacks from Promises (`.then`, `.catch`), `queueMicrotask()`, and `MutationObserver`.\n4. Macrotask (Task) Queue: Holds `setTimeout`, `setInterval`, `setImmediate`, and I/O callbacks.\n\nExecution Algorithm:\n- The engine executes synchronous code on the Call Stack until empty.\n- Before picking the next macrotask, the Event Loop checks the Microtask Queue and drains it COMPLETELY until empty, even if microtasks schedule additional microtasks.\n- Browser performs UI rendering updates if necessary.\n- The Event Loop picks the oldest macrotask from the Macrotask Queue and pushes it onto the Call Stack.\n\nExample Output for `console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);` is `1, 4, 3, 2` because synchronous runs first (1, 4), microtask next (3), and macrotask last (2).",
    followUpQuestion: {
      question: "If a microtask continuously schedules another microtask recursively via `queueMicrotask()`, what happens to UI rendering and `setTimeout` timers?",
      concept: "Microtask queue starvation",
      keyPoints: ["It starves the event loop: the call stack never moves to rendering or macrotasks, freezing the browser tab/UI completely."]
    }
  },
  {
    id: "js-closure-02",
    technology: "JavaScript",
    topic: "Core JavaScript",
    subtopic: "Closures & Lexical Scope",
    difficulty: "Beginner",
    interviewType: "Conceptual",
    question: "What is a Closure in JavaScript? Provide a practical real-world use case for closures and explain what happens in memory.",
    context: "Lexical scoping, function scope, memory retention, and encapsulation.",
    keyPoints: [
      "A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment).",
      "A closure gives an inner function access to an outer function's scope even after the outer function has finished executing and returned.",
      "Practical use cases: Data privacy / encapsulation (private variables), function factories, currying, memoization, event handlers / callbacks.",
      "Memory: Variables referenced by the closure are kept in the heap and cannot be garbage collected as long as the inner function remains referenced."
    ],
    commonMistakes: [
      "Confusing scope with closure.",
      "Thinking closures only exist when using arrow functions.",
      "Ignoring the memory leak implications if large unused variables are closed over."
    ],
    hints: [
      "How can you create a private counter with `increment()` and `getValue()` without using ES6 classes?",
      "Why doesn't the garbage collector destroy the outer variables when the outer function returns?"
    ],
    idealAnswer: "A Closure is created whenever a function is defined, allowing the inner function to retain access to variables in its outer lexical scope even after the outer function has executed and returned from the call stack.\n\nHow it works in memory:\nNormally, when a function finishes executing, its local execution context and variables are garbage collected. However, if an inner function maintains a reference to variables in that outer scope, the JavaScript engine stores those variables on the heap rather than discarding them, keeping them alive as long as the inner function is reachable.\n\nPractical Use Case (Data Privacy / Encapsulation):\n```javascript\nfunction createBankAccount(initialBalance) {\n    let balance = initialBalance; // Private variable\n    return {\n        deposit(amount) { balance += amount; return balance; },\n        withdraw(amount) {\n            if (amount > balance) throw new Error('Insufficient funds');\n            balance -= amount;\n            return balance;\n        },\n        getBalance() { return balance; }\n    };\n}\nconst myAccount = createBankAccount(100);\nmyAccount.deposit(50); // balance cannot be accessed directly via myAccount.balance\n```",
    followUpQuestion: {
      question: "Why did `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }` print `3, 3, 3`, and how does `let` fix this using closures?",
      concept: "var function-scoping vs let block-scoped lexical environment per iteration",
      keyPoints: ["var is function-scoped so all callbacks share the single variable i; let creates a new binding and lexical scope for each loop iteration captured by closure."]
    }
  },
  {
    id: "js-proto-03",
    technology: "JavaScript",
    topic: "Core JavaScript",
    subtopic: "Prototypes & Prototypal Inheritance",
    difficulty: "Advanced",
    interviewType: "Technical",
    question: "How does prototypal inheritance work in JavaScript? Explain the difference between `prototype` and `__proto__`, and what happens during property lookup along the prototype chain.",
    context: "JavaScript object model, memory reuse, and ES6 classes vs prototypes.",
    keyPoints: [
      "JavaScript objects inherit properties directly from other objects via prototypal inheritance (not classical class blueprints).",
      "`prototype` is a property exclusively present on constructor functions (e.g. `Function.prototype`, `Array.prototype`); defines properties inherited by instances created with `new`.",
      "`__proto__` (or `Object.getPrototypeOf(obj)`) is the internal link pointer on every object pointing to its prototype.",
      "Property lookup: When accessing `obj.prop`, engine checks `obj` itself; if missing, traverses `obj.__proto__`, then `obj.__proto__.__proto__` up to `Object.prototype`, and finally `null` (returning `undefined`).",
      "ES6 `class` is primarily syntactic sugar over prototype chains and constructor functions."
    ],
    commonMistakes: [
      "Confusing `prototype` on functions with `__proto__` on instances.",
      "Mutating `__proto__` directly in production (destroys V8 hidden classes and inline caching).",
      "Thinking ES6 classes introduce a completely new inheritance engine."
    ],
    hints: [
      "Which one is on the function constructor and which is on the instance object?",
      "What is at the very top of the prototype chain?"
    ],
    idealAnswer: "JavaScript uses prototypal inheritance: objects inherit properties directly from other objects through an internal link (`[[Prototype]]`).\n\n`prototype` vs `__proto__`:\n- `prototype`: A property that exists on constructor functions (and classes). It serves as the blueprint object that will become the `[[Prototype]]` for all instances instantiated via `new Constructor()`.\n- `__proto__` (or standard `Object.getPrototypeOf(instance)`): An accessor property on object instances pointing directly to the prototype object from which it inherits.\n\nPrototype Chain Property Lookup:\nWhen evaluating `instance.method()`:\n1. The engine checks for an 'own property' on `instance`.\n2. If not found, it traverses `instance.__proto__`.\n3. It continues ascending up the chain until it finds the property or reaches `Object.prototype.__proto__` which equals `null`.\n4. If unresolved at `null`, it returns `undefined`.\n\nES6 `class` syntax is syntactic sugar over this exact prototype model: methods declared inside a class body are simply attached to `ClassName.prototype`.",
    followUpQuestion: {
      question: "Why does `Array.isArray([])` return true, but `typeof []` returns `'object'`?",
      concept: "JavaScript type system and Object.prototype.toString",
      keyPoints: ["In JS, arrays are specialized objects with integer keys and a length property; typeof returns 'object' for all non-primitive objects except functions."]
    }
  },

  // ==================== HTML ====================
  {
    id: "html-sem-01",
    technology: "HTML",
    topic: "Semantic HTML & Accessibility",
    subtopic: "SEO, ARIA, and Semantic Elements",
    difficulty: "Beginner",
    interviewType: "Conceptual",
    question: "What is Semantic HTML, and why is it important for SEO, accessibility (a11y), and maintainability? Give examples comparing semantic tags vs generic `<div>` tags.",
    context: "Web standards, screen reader compatibility, and search engine crawling.",
    keyPoints: [
      "Semantic HTML tags clearly describe their meaning and purpose to both browser and developer (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`).",
      "Generic tags like `<div>` and `<span>` convey zero semantic meaning or document structure.",
      "Accessibility (a11y): Screen readers use semantic tags to provide landmark navigation and announce roles to visually impaired users.",
      "SEO: Search engines (Googlebot) parse semantic headings (`<h1>`-`<h6>`) and `<article>` tags to understand content hierarchy and rank relevant keywords.",
      "Reduces need for arbitrary CSS classes and redundant ARIA attributes (`role='navigation'` is redundant on `<nav>`)."
    ],
    commonMistakes: [
      "Using `<div>` with `onclick` instead of a native `<button>` element (loses keyboard focus and Enter/Space triggers).",
      "Having multiple `<h1>` tags on a single page without section roots.",
      "Relying solely on visual styling instead of semantic tags."
    ],
    hints: [
      "Think about screen readers and search engine crawlers.",
      "Why is `<button>` vastly superior to `<div onclick='...'>`?"
    ],
    idealAnswer: "Semantic HTML involves utilizing HTML elements that clearly communicate the meaning, structure, and intent of the content contained within them (e.g. `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<button>`), rather than relying exclusively on unsemantic wrappers like `<div>` and `<span>`.\n\nWhy it matters:\n1. Accessibility (a11y): Screen readers utilize HTML landmarks to allow assistive technology users to jump directly between page sections (e.g., skip to `<main>`). Using `<button>` automatically provides keyboard focus (`Tab`), Enter/Space activation, and ARIA roles for free.\n2. SEO: Search engine web crawlers analyze the semantic hierarchy to identify primary content (`<main>`, `<article>`) vs boilerplate navigation or sidebars (`<aside>`), boosting search rankings for key topics.\n3. Code Maintainability & Readability: Semantic code is self-documenting for engineering teams, eliminating 'div soup'.\n\nExample comparison: Instead of `<div class='nav-bar'><div class='link'>Home</div></div>`, use `<nav aria-label='Main'><a href='/'>Home</a></nav>`.",
    followUpQuestion: {
      question: "If you replace a `<button>` with `<div class='btn' onclick='doSomething()'>`, what 3 critical accessibility features have you just broken?",
      concept: "Button accessibility mechanics",
      keyPoints: ["Keyboard focusability (tabindex), keyboard actuation (Enter and Space keypresses), and screen reader role announcement."]
    }
  },

  // ==================== CSS ====================
  {
    id: "css-box-01",
    technology: "CSS",
    topic: "CSS Layout",
    subtopic: "Box Model & Flexbox vs Grid",
    difficulty: "Beginner",
    interviewType: "Conceptual",
    question: "Explain the CSS Box Model. What is the difference between `content-box` and `border-box`? When would you choose CSS Grid over Flexbox?",
    context: "Fundamental web layout engine, sizing calculations, and modern responsive design.",
    keyPoints: [
      "Box Model consists of 4 layers: Content -> Padding -> Border -> Margin.",
      "`box-sizing: content-box` (default): `width` and `height` apply only to content; padding and border add to the total element rendered dimension.",
      "`box-sizing: border-box`: `width` and `height` include content + padding + border. Margin remains outside.",
      "Flexbox is one-dimensional (content-first): best for distributing space and aligning items along a single axis (row OR column).",
      "CSS Grid is two-dimensional (layout-first): best for rigid structures, rows AND columns simultaneously."
    ],
    commonMistakes: [
      "Thinking margin is included in `border-box` calculation (margin is always outside).",
      "Thinking Flexbox is outdated and Grid replaces it entirely (they are complementary)."
    ],
    hints: [
      "What happens to a 200px div with 20px padding under content-box vs border-box?",
      "Differentiate 1D vs 2D layout systems."
    ],
    idealAnswer: "The CSS Box Model represents every element as a rectangular box consisting of four concentric layers:\n1. Content: Where text, images, or child elements render.\n2. Padding: Transparent spacing between content and border.\n3. Border: Outlining boundary around padding and content.\n4. Margin: Transparent clearance outside the border separating neighboring elements.\n\n`content-box` vs `border-box`:\n- In `content-box` (default), setting `width: 200px; padding: 20px; border: 5px solid black;` results in a total rendered width of `200 + 40 + 10 = 250px`. Sizing is unpredictable.\n- In `border-box`, the specified `width: 200px` encompasses content + padding + border. The browser automatically compresses content width to 150px, ensuring the total element stays exactly 200px.\n\nFlexbox vs CSS Grid:\n- Flexbox is 1-Dimensional: Optimizes layout along a single axis (either row or column). Ideal for navbars, pill lists, button groups, and fluid alignment.\n- CSS Grid is 2-Dimensional: Controls both rows and columns simultaneously. Ideal for overall page scaffolding, photo galleries, dashboard widget layouts, and complex multi-track alignments.",
    followUpQuestion: {
      question: "What CSS rule do modern front-end developers apply globally at the top of their stylesheets to ensure consistent sizing across all elements?",
      concept: "Universal border-box reset",
      keyPoints: ["*, *::before, *::after { box-sizing: border-box; }"]
    }
  },
  {
    id: "css-spec-02",
    technology: "CSS",
    topic: "Core CSS",
    subtopic: "Specificity & Stacking Context",
    difficulty: "Intermediate",
    interviewType: "Technical",
    question: "How is CSS Specificity calculated? Calculate the specificity of `nav ul.menu li#active > a:hover`. Also, explain what creates a Stacking Context in CSS.",
    context: "Cascade rules, selector weighting, and 3D z-index layering in CSS.",
    keyPoints: [
      "CSS Specificity is calculated as a 3-part tuple (or 4-part): (Inline, ID, Class/Attribute/Pseudo-class, Element/Pseudo-element).",
      "Inline styles = (1, 0, 0, 0).",
      "IDs = (0, 1, 0, 0).",
      "Classes, attributes, pseudo-classes = (0, 0, 1, 0).",
      "Elements and pseudo-elements = (0, 0, 0, 1).",
      "`!important` overrides regular specificity cascade.",
      "Stacking context: Created by root element `<html>`, `position: relative/absolute` with `z-index != auto`, `position: fixed/sticky`, `opacity < 1`, `transform`, `filter`, or `isolation: isolate`.",
      "Within a stacking context, children are rendered relative to that context; a child with `z-index: 9999` cannot break out above an ancestor's lower stacking context."
    ],
    commonMistakes: [
      "Thinking 10 classes can equal 1 ID (specificity is hierarchical, not base-10).",
      "Assuming high `z-index` always places an element on top regardless of parent stacking context.",
      "Thinking universal selector `*` or combinators (`>`, `+`) add specificity."
    ],
    hints: [
      "Count IDs, Classes/Pseudo-classes, and Elements in the selector.",
      "Why doesn't `z-index: 999999` work when a parent has a lower z-index?"
    ],
    idealAnswer: "CSS Specificity Calculation:\nSpecificity uses a hierarchy represented as `(ID, Class, Element)`:\n- ID selectors (`#id`): 1, 0, 0\n- Class selectors (`.class`), attributes (`[type='text']`), and pseudo-classes (`:hover`): 0, 1, 0\n- Type/Element selectors (`div`, `li`) and pseudo-elements (`::before`): 0, 0, 1\n- Universal selector `*` and combinators (`>`, `+`, `~`) add 0 specificity.\n\nCalculation for `nav ul.menu li#active > a:hover`:\n- IDs: `#active` (1)\n- Classes / Pseudo-classes: `.menu`, `:hover` (2)\n- Elements: `nav`, `ul`, `li`, `a` (4)\n- Total Specificity: (1, 2, 4) or 1-2-4.\n\nStacking Context:\nA Stacking Context is an element's three-dimensional layer along the Z-axis in which its child elements are rendered. Created by: root `<html>`, `opacity < 1`, `transform` != none, `filter` != none, `position: fixed`, or `position: relative/absolute` with an integer `z-index`. Crucially, an element with `z-index: 99999` can NEVER appear in front of an element in another stacking context if its parent container is stacked behind it.",
    followUpQuestion: {
      question: "How can the modern CSS property `isolation: isolate;` be used to fix z-index pollution in component libraries?",
      concept: "isolation: isolate to create a new stacking context",
      keyPoints: ["It creates a new local stacking context without requiring position or transform hacks, trapping internal z-indexes inside the component."]
    }
  },

  // ==================== SPRING BOOT ====================
  {
    id: "spring-ioc-01",
    technology: "Spring Boot",
    topic: "Spring Framework",
    subtopic: "IoC Container & Dependency Injection",
    difficulty: "Intermediate",
    interviewType: "Technical",
    question: "What is Inversion of Control (IoC) and Dependency Injection (DI) in Spring Boot? Why is Constructor Injection preferred over Field Injection (@Autowired on fields)?",
    context: "Enterprise architecture, component lifecycle, testability, and Spring internals.",
    keyPoints: [
      "Inversion of Control (IoC) delegates object creation and lifecycle management to the Spring ApplicationContext container instead of manual `new` operator instantiation.",
      "Dependency Injection (DI) is the pattern used to implement IoC by supplying dependent objects at runtime.",
      "Field Injection (`@Autowired private MyService myService;`) suffers from: cannot make fields `final` (immutability violated), impossible to instantiate without Spring in unit tests (NullPointerException unless reflection is used), hides circular dependencies.",
      "Constructor Injection benefits: ensures dependencies are mandatory, fields can be declared `final` (thread-safe, immutable), enables simple POJO unit testing without reflection or Spring test context."
    ],
    commonMistakes: [
      "Confusing IoC and DI as different things instead of IoC being the principle and DI the mechanism.",
      "Thinking field injection is faster or recommended by modern Spring.",
      "Believing Spring requires `@Autowired` on single constructors in Spring 4.3+."
    ],
    hints: [
      "Think about unit testing without SpringRunner or Mockito reflection.",
      "Can a field injected with @Autowired be declared `final`?"
    ],
    idealAnswer: "Inversion of Control (IoC) is a design principle where the control of object creation, configuration, and lifecycle management is transferred from application code to the Spring Framework container (`ApplicationContext`). Dependency Injection (DI) is the specific architectural pattern Spring uses to implement IoC, injecting an object's dependencies at runtime.\n\nWhy Constructor Injection is superior to Field Injection (`@Autowired` on fields):\n1. Immutability: Dependencies can be declared `final`, preventing re-assignment after construction and guaranteeing thread safety.\n2. Testability: In unit tests (e.g. JUnit), you can directly instantiate the class using `new MyController(mockService)` without needing Spring context or reflection.\n3. Prevents NullPointerExceptions: Guarantees the object cannot be instantiated in an incomplete or broken state.\n4. Circular Dependency Detection: Spring detects cyclic dependencies at startup rather than encountering runtime failures.\n5. Modern Spring Convention: In Spring 4.3+, if a class has a single constructor, the `@Autowired` annotation can be omitted entirely.",
    followUpQuestion: {
      question: "What are the default bean scope in Spring and what are the lifecycle phases of a Spring Bean from instantiation to destruction?",
      concept: "Spring Bean Scopes & Lifecycle",
      keyPoints: ["Default is Singleton. Phases: Instantiation -> Populate properties -> BeanNameAware/BeanFactoryAware -> PostProcessBeforeInitialization -> @PostConstruct/InitializingBean -> PostProcessAfterInitialization -> Ready -> @PreDestroy/DisposableBean."]
    }
  },
  {
    id: "spring-boot-auto-02",
    technology: "Spring Boot",
    topic: "Spring Boot Internals",
    subtopic: "Auto-Configuration & @SpringBootApplication",
    difficulty: "Advanced",
    interviewType: "Scenario-based",
    question: "How does Spring Boot's Auto-Configuration work under the hood? What three annotations comprise `@SpringBootApplication`, and how do `@ConditionalOnClass` and `@ConditionalOnMissingBean` enable convention-over-configuration?",
    context: "Spring Boot starter mechanics, conditional bean loading, and modular microservices.",
    keyPoints: [
      "`@SpringBootApplication` combines `@SpringBootConfiguration` (specialized @Configuration), `@EnableAutoConfiguration`, and `@ComponentScan`.",
      "Auto-configuration is driven by `spring.factories` (pre-Spring Boot 3) or `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (Spring Boot 3+).",
      "During bootstrap, Spring scans candidate auto-configuration classes on the classpath.",
      "`@ConditionalOnClass(DataSource.class)` evaluates whether a required class is present on the classpath; if absent, the entire configuration is skipped.",
      "`@ConditionalOnMissingBean(MyService.class)` only instantiates the default bean if the developer has not provided their own custom `@Bean` definition.",
      "This enables seamless customization: developers override defaults simply by defining their own bean."
    ],
    commonMistakes: [
      "Thinking Spring Boot uses 'magic' rather than standard conditional annotations.",
      "Not knowing about the Spring Boot 3 migration from `spring.factories` to `.imports` file.",
      "Forgetting the role of `@ComponentScan` in scanning local packages."
    ],
    hints: [
      "What imports file does Spring Boot 3 check for auto-configurations?",
      "How does Spring know whether to configure an embedded Tomcat or H2 database?"
    ],
    idealAnswer: "Spring Boot Auto-Configuration automatically registers beans in the ApplicationContext based on classpath JARs, properties, and existing bean definitions:\n\n1. `@SpringBootApplication` composition:\n- `@SpringBootConfiguration`: Designates the class as a configuration source.\n- `@EnableAutoConfiguration`: Triggers Spring Boot's auto-configuration discovery mechanism.\n- `@ComponentScan`: Scans the current package and subpackages for `@Component`, `@Service`, `@Repository`, and `@Controller`.\n\n2. Underlying Mechanism:\nIn Spring Boot 3+, it reads `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` to discover pre-configured candidate classes. Each configuration class is guarded by conditional annotations:\n- `@ConditionalOnClass`: Checks if a specific class is present on the classpath (e.g. `DataSource.class` triggers database configuration).\n- `@ConditionalOnMissingBean`: Registers a default framework bean ONLY IF the user has not declared their own bean of that type.\n- `@ConditionalOnProperty`: Activates configuration based on application properties.\nThis embodies 'convention over configuration': sensible defaults out of the box with zero boilerplate, fully overridable at any time.",
    followUpQuestion: {
      question: "How can you view a complete diagnostic report of which auto-configurations were matched and which were skipped when your Spring Boot app starts?",
      concept: "Spring Boot Conditions Evaluation Report",
      keyPoints: ["Start with `--debug` flag or query the `/actuator/conditions` endpoint."]
    }
  },

  // ==================== REST APIS ====================
  {
    id: "rest-idem-01",
    technology: "REST APIs",
    topic: "API Design",
    subtopic: "HTTP Methods & Idempotency",
    difficulty: "Beginner",
    interviewType: "Conceptual",
    question: "What makes an HTTP method idempotent in REST API design? Classify GET, POST, PUT, DELETE, and PATCH by safety and idempotency.",
    context: "HTTP specifications (RFC 7231), RESTful architecture, and distributed system retry safety.",
    keyPoints: [
      "Idempotent: Making multiple identical requests produces the exact same server side-effect state as a single request.",
      "Safe methods: Read-only; do not modify server state (GET, HEAD, OPTIONS).",
      "GET: Safe & Idempotent.",
      "POST: Neither safe nor idempotent (each request creates a new resource or triggers side-effects).",
      "PUT: Idempotent (replaces entire resource with supplied representation; repeating yields identical end state), but not safe.",
      "DELETE: Idempotent (deleting a resource leaves it deleted regardless of repeat calls; response code may change from 200/204 to 404, but server state is identical), not safe.",
      "PATCH: Generally NOT idempotent by default (partial update; e.g. append operations), though specific implementations can be designed idempotently."
    ],
    commonMistakes: [
      "Confusing HTTP response code change (e.g. 200 vs 404 on repeat DELETE) with violation of idempotency (idempotency refers to server RESOURCE state, not status code).",
      "Assuming PUT and POST are interchangeable.",
      "Assuming PATCH is automatically idempotent."
    ],
    hints: [
      "Does repeating the request change the server's database state further?",
      "Differentiate between 'Safe' (no state change) and 'Idempotent' (repeated state changes equal single state change)."
    ],
    idealAnswer: "In REST API design, an HTTP method is Idempotent if executing the request multiple times produces the exact same intended effect on the server state as executing it once.\n\nClassification:\n- GET: Safe and Idempotent. Retrieves data without modifying server state.\n- POST: Neither Safe nor Idempotent. Typically creates a new resource; calling `POST /orders` 5 times creates 5 distinct order records.\n- PUT: Idempotent, but not Safe. Replaces the full representation of a resource at a known URI. Calling `PUT /users/42` with `{ name: 'Alex' }` 10 times results in the exact same database state as calling it once.\n- DELETE: Idempotent, but not Safe. Deletes the resource. The first call removes it (returning 200/204); subsequent calls find it already gone (returning 404), but the server state remains unchanged (the resource is gone).\n- PATCH: Non-idempotent by specification (though can be made idempotent). It applies partial mutations; if an operation appends an item to a list, repeating it alters state repeatedly.",
    followUpQuestion: {
      question: "If a DELETE request returns 204 No Content on the first call and 404 Not Found on the second call, does that violate idempotency?",
      concept: "Idempotency definition regarding server state vs HTTP status code",
      keyPoints: ["No, idempotency applies to the state of the resource on the server, not the HTTP response code returned to the client."]
    }
  },
  {
    id: "rest-auth-02",
    technology: "REST APIs",
    topic: "API Security",
    subtopic: "JWT vs Session & Rate Limiting",
    difficulty: "Advanced",
    interviewType: "Scenario-based",
    question: "Design a secure authentication and rate-limiting architecture for a public REST API. Compare JWT (JSON Web Tokens) with stateful server sessions, and explain how you would handle immediate token revocation with stateless JWTs.",
    context: "API security, token revocation strategies, Redis rate limiting, and distributed authentication.",
    keyPoints: [
      "Stateful Sessions: Server stores session state in memory/Redis; client holds cookie with session ID; easy revocation by deleting session key, but requires distributed session store for horizontal scaling.",
      "Stateless JWT: Contains Header, Payload, Signature; digitally signed via HMAC-SHA256 or RSA-256; validated statelessly by any service with public key/secret; difficult to revoke before expiration.",
      "JWT Revocation strategies: Short-lived Access Tokens (e.g. 10 mins) paired with revocable Refresh Tokens; distributed Denylist/Blocklist in Redis with TTL matching token expiration; Token Version / Epoch incrementing in user profile.",
      "Rate Limiting: Token Bucket or Leaky Bucket algorithm implemented in API Gateway or Redis (`redis.eval` with atomic sliding window script); returns `429 Too Many Requests` with `Retry-After` header."
    ],
    commonMistakes: [
      "Storing sensitive passwords or credit card info inside JWT payload (JWT payload is Base64Url encoded, NOT encrypted).",
      "Having 30-day long-lived stateless JWT access tokens with no revocation mechanism.",
      "Ignoring Redis atomic operations for rate limit race conditions."
    ],
    hints: [
      "Can a stateless JWT be revoked immediately if a user changes their password?",
      "What algorithm provides smooth rate limiting without boundary spikes?"
    ],
    idealAnswer: "Authentication Architecture:\n- Stateless JWTs vs Stateful Sessions: Stateful sessions store session records in Redis, enabling immediate revocation by deleting the key. Stateless JWTs encode user identity and claims directly in the signed payload, allowing any downstream microservice to verify identity without a database roundtrip.\n- The Revocation Challenge: Because a signed JWT is self-contained and valid until expiry (`exp`), you cannot revoke it purely statelessly. Best practice combines:\n  1. Short-lived Access Token (5-15 mins) for stateless API calls.\n  2. Long-lived Refresh Token stored securely in an HTTP-only, SameSite cookie and tracked in a database/Redis.\n  3. Immediate Revocation / Logout: Delete the Refresh Token and push the revoked Access Token's `jti` (unique JWT ID) into a Redis Denylist with a TTL equal to the token's remaining lifespan. Alternatively, maintain a `token_version` on the user table; incrementing it invalidates all previous tokens upon user DB checks.\n\nRate Limiting Architecture:\nImplement a Sliding Window Log or Token Bucket algorithm at the API Gateway using Redis. When a client exceeds the threshold (e.g. 100 requests/minute), return HTTP 429 Too Many Requests with `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers.",
    followUpQuestion: {
      question: "Why should you never store JWT tokens in localStorage in browser applications?",
      concept: "XSS vulnerability in localStorage vs HttpOnly cookies",
      keyPoints: ["localStorage is accessible to any malicious JavaScript executed via Cross-Site Scripting (XSS); HttpOnly cookies cannot be read by JS."]
    }
  },

  // ==================== OOP ====================
  {
    id: "oop-solid-01",
    technology: "OOP",
    topic: "Design Principles",
    subtopic: "SOLID Principles",
    difficulty: "Intermediate",
    interviewType: "Conceptual",
    question: "Walk through each of the SOLID principles with a concise real-world software engineering example. Focus particularly on Liskov Substitution Principle (LSP) and Dependency Inversion Principle (DIP).",
    context: "Maintainable object-oriented software design, clean code architecture, and decoupled systems.",
    keyPoints: [
      "S - Single Responsibility: A class should have one, and only one, reason to change.",
      "O - Open/Closed: Software entities should be open for extension, but closed for modification (use abstractions/interfaces).",
      "L - Liskov Substitution: Subtypes must be substitutable for their base types without altering program correctness (classic Square inheriting from Rectangle breaks area invariants).",
      "I - Interface Segregation: Clients should not be forced to depend on interfaces they do not use (lean, focused interfaces).",
      "D - Dependency Inversion: High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions."
    ],
    commonMistakes: [
      "Equating SRP to 'a class should only do one single thing' (it's about one actor / reason to change).",
      "Thinking Liskov Substitution is just having methods with matching signatures.",
      "Confusing Dependency Inversion Principle with Dependency Injection (DIP is the principle; DI is an implementation technique)."
    ],
    hints: [
      "Why does a Square inheriting from Rectangle violate LSP?",
      "How does Dependency Inversion invert the traditional top-down architectural dependency arrow?"
    ],
    idealAnswer: "The SOLID principles guide robust, extensible object-oriented design:\n\n1. Single Responsibility Principle (SRP): A class should have only one reason to change. Example: A `UserService` handles user logic, while an `EmailNotificationService` handles sending emails.\n\n2. Open/Closed Principle (OCP): Open for extension, closed for modification. Example: An `OrderPaymentProcessor` accepts any class implementing `PaymentMethod` (CreditCard, PayPal, Crypto) without modifying existing processor code.\n\n3. Liskov Substitution Principle (LSP): Subclasses must preserve the behavioral contracts and invariants of their superclasses. Example Violation: `Square` extending `Rectangle`. In a Rectangle, setting width does not alter height. If `Square.setWidth(5)` also changes height, any consumer testing `rect.setWidth(5); rect.setHeight(10); assert(rect.getArea() == 50)` will fail.\n\n4. Interface Segregation Principle (ISP): Split large 'fat' interfaces into role-specific ones. Rather than one massive `MachineInterface` with `print()`, `scan()`, `fax()`, create separate `Printer` and `Scanner` interfaces.\n\n5. Dependency Inversion Principle (DIP): High-level business logic must depend on abstractions (interfaces), not concrete low-level implementations. Instead of `OrderService` depending directly on `MySQLRepository`, it depends on an `OrderRepository` interface.",
    followUpQuestion: {
      question: "In Liskov Substitution Principle, what are the rules regarding preconditions and postconditions when overriding a superclass method?",
      concept: "Preconditions cannot be strengthened, postconditions cannot be weakened",
      keyPoints: ["Subclasses cannot require stricter input preconditions than the parent, and must guarantee at least all output postconditions guaranteed by the parent."]
    }
  },

  // ==================== DATA STRUCTURES & ALGORITHMS ====================
  {
    id: "dsa-lru-01",
    technology: "Data Structures and Algorithms",
    topic: "System Design & DSA",
    subtopic: "LRU Cache Design",
    difficulty: "Advanced",
    interviewType: "Scenario-based",
    question: "Design an LRU (Least Recently Used) Cache with `get(key)` and `put(key, value)` operations. What data structures must you combine to achieve O(1) time complexity for both operations, and how do they coordinate?",
    context: "Cache eviction policies, pointer manipulation, and hybrid data structure design.",
    keyPoints: [
      "Combine a Hash Map with a Doubly Linked List.",
      "Hash Map provides O(1) key-to-node lookup.",
      "Doubly Linked List provides O(1) node removal and insertion (unlike singly linked list which requires O(n) traversal to find previous pointer).",
      "Sentinel dummy head and dummy tail nodes simplify edge cases (avoiding null checks on head/tail).",
      "On `get(key)`: If key exists, look up node in map, detach node from current position in linked list, move to head/tail (most recently used), return value. Else return -1.",
      "On `put(key, value)`: If key exists, update value and move node to MRU. If key is new, create node, add to map and list. If size exceeds capacity, evict node at LRU end, remove from map and list."
    ],
    commonMistakes: [
      "Using a Singly Linked List, which requires O(n) to delete a middle node.",
      "Using an Array or Queue, which requires O(n) shifting on element access.",
      "Forgetting to delete the evicted node from the HashMap when capacity is breached."
    ],
    hints: [
      "Hash maps give O(1) lookup but have no order.",
      "Linked lists maintain order, but which type of linked list allows O(1) deletion of an arbitrary node?"
    ],
    idealAnswer: "To achieve O(1) time complexity for both `get` and `put` in an LRU Cache, we combine a Hash Map and a Doubly Linked List:\n\n1. Doubly Linked List: Maintains access order. The head represents Most Recently Used (MRU) and the tail represents Least Recently Used (LRU). A doubly linked list allows removing any arbitrary node in O(1) time because each node maintains pointers to both `prev` and `next`.\n2. Hash Map: Maps `key -> NodeReference`. Enables instant O(1) direct access to any node without linear traversal.\n3. Pseudo Head & Tail: Using dummy sentinel nodes (`dummyHead` and `dummyTail`) eliminates null checks during node insertions and deletions.\n\nMechanics:\n- `get(key)`: Query the map. If missing, return -1. If found, detach the node from its current position in the list and splice it directly after `dummyHead` (marked MRU). Return the node's value.\n- `put(key, value)`: If the key already exists, update its value and move to MRU. If it's a new key, instantiate a new node, insert after `dummyHead`, and add to map. If total items exceed capacity, remove the node before `dummyTail` (the LRU item) from both the list and the map in O(1).",
    followUpQuestion: {
      question: "How does Java's built-in `LinkedHashMap` allow you to implement an LRU cache in just a few lines of code?",
      concept: "LinkedHashMap accessOrder and removeEldestEntry",
      keyPoints: ["Set accessOrder=true in constructor and override removeEldestEntry(Map.Entry eldest) to return size() > capacity."]
    }
  },
  {
    id: "dsa-coding-two-sum",
    technology: "Data Structures and Algorithms",
    topic: "Arrays & Hashing",
    subtopic: "Two Sum Problem",
    difficulty: "Beginner",
    interviewType: "Coding",
    question: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice.",
    context: "Fundamental array and hash table lookup optimization.",
    codingDetails: {
      problemStatement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
      inputDescription: "nums: integer array (2 <= nums.length <= 10^4), target: integer (-10^9 <= target <= 10^9).",
      outputDescription: "Array of two indices [i, j].",
      constraints: "O(n) time complexity, O(n) space complexity. Can you do it in a single pass?",
      examples: [
        {
          input: "nums = [2, 7, 11, 15], target = 9",
          output: "[0, 1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          input: "nums = [3, 2, 4], target = 6",
          output: "[1, 2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
        }
      ],
      starterCode: `function twoSum(nums, target) {\n    // Write your solution here\n    \n}`
    },
    keyPoints: [
      "Use a hash map to store `number -> index`.",
      "For each element `x` at index `i`, calculate the complement `complement = target - x`.",
      "Check if `complement` is already in the map.",
      "If yes, return `[map.get(complement), i]`.",
      "If no, store `x` and `i` in the map and continue.",
      "Time complexity: O(n) single pass, Space complexity: O(n)."
    ],
    commonMistakes: [
      "Brute force nested loops with O(n^2) time complexity.",
      "Sorting the array first, which loses original indices and takes O(n log n).",
      "Using the same element twice when target is 2 * num."
    ],
    hints: [
      "Instead of searching the rest of the array with another loop, what data structure provides O(1) lookup?",
      "Can you check for the complement while iterating through the array in one pass?"
    ],
    idealAnswer: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    followUpQuestion: {
      question: "If the input array `nums` was already sorted in ascending order, how could you solve this in O(1) auxiliary space?",
      concept: "Two Pointers on sorted array",
      keyPoints: ["Use two pointers at start and end; increment left if sum < target, decrement right if sum > target."]
    }
  },
  {
    id: "dsa-coding-rev-linked-list",
    technology: "Data Structures and Algorithms",
    topic: "Linked Lists",
    subtopic: "Pointers & In-Place Reversal",
    difficulty: "Intermediate",
    interviewType: "Coding",
    question: "Reverse a singly linked list iteratively in-place. What is the time and space complexity, and how do you prevent losing references to subsequent nodes?",
    context: "Pointer manipulation, memory references, and in-place algorithms.",
    codingDetails: {
      problemStatement: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
      inputDescription: "head: ListNode head of linked list (number of nodes is [0, 5000]).",
      outputDescription: "ListNode head of the reversed linked list.",
      constraints: "O(n) time, O(1) auxiliary space.",
      examples: [
        {
          input: "head = [1, 2, 3, 4, 5]",
          output: "[5, 4, 3, 2, 1]",
          explanation: "Pointers reversed from 1->2->3->4->5 to 5->4->3->2->1."
        },
        {
          input: "head = []",
          output: "[]",
          explanation: "Empty list returns null."
        }
      ],
      starterCode: `/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction reverseList(head) {\n    // Your code here\n    \n}`
    },
    keyPoints: [
      "Maintain three pointers: prev (initialized to null), curr (initialized to head), and nextTemp.",
      "Before breaking curr.next, store nextTemp = curr.next.",
      "Reverse pointer: curr.next = prev.",
      "Advance pointers: prev = curr, curr = nextTemp.",
      "When curr reaches null, prev is the new head of the reversed list.",
      "Time complexity: O(n), Space complexity: O(1)."
    ],
    commonMistakes: [
      "Reversing curr.next without first caching nextTemp, causing loss of reference to remainder of list.",
      "Using recursion which consumes O(n) call stack space.",
      "Forgetting edge cases: null head or single node list."
    ],
    hints: [
      "You need 3 pointers to keep track of previous, current, and next.",
      "Always save `curr.next` before overwriting it."
    ],
    idealAnswer: `function reverseList(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        const nextTemp = curr.next; // Cache next node
        curr.next = prev;           // Reverse pointer
        prev = curr;                // Advance prev
        curr = nextTemp;            // Advance curr
    }
    return prev;
}`,
    followUpQuestion: {
      question: "How would you reverse only a specific sublist of the linked list between positions `left` and `right` (1-indexed)?",
      concept: "Reverse Linked List II with sentinel dummy node",
      keyPoints: ["Traverse to node left-1, perform in-place pointer splicing of subsequent nodes one by one."]
    }
  }
];

export function getFilteredQuestions({ technology, difficulty, interviewType, topic }) {
  return QUESTION_BANK.filter(q => {
    if (technology && technology !== "All" && q.technology.toLowerCase() !== technology.toLowerCase()) {
      return false;
    }
    if (difficulty && difficulty !== "All" && q.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
      return false;
    }
    if (interviewType && interviewType !== "All" && q.interviewType.toLowerCase() !== interviewType.toLowerCase()) {
      return false;
    }
    if (topic && topic !== "All" && q.topic.toLowerCase() !== topic.toLowerCase()) {
      return false;
    }
    return true;
  });
}
