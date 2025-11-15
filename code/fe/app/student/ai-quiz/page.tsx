"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { QuizSource, QuizStatus, QuizDifficulty, QuizItem } from "@/src/types";

export default function AIQuizGeneratorPage() {
  const [source, setSource] = useState<QuizSource>("trusted-bank");
  const [topic, setTopic] = useState("CO1001 – Recursion / Pointer Debugging");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("Intro / warm-up");
  const [confuse, setConfuse] = useState("");
  const [lastGenerated, setLastGenerated] = useState<QuizItem[]>([]);
  const [highlightMyQuestions, setHighlightMyQuestions] = useState(false);
  const myQuestionsRef = useRef<HTMLAnchorElement | null>(null);

  // MCQ Question banks by topic and difficulty
  const trustedBankQuestions: Record<
    string,
    Record<
      string,
      Array<{
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
      }>
    >
  > = {
    "CO1001 – Recursion / Pointer Debugging": {
      "Intro / warm-up": [
        {
          question: "What is the base case in a recursive function?",
          options: [
            "The case that calls the function again",
            "The condition that stops the recursion",
            "The first parameter of the function",
            "The return type of the function",
          ],
          correctAnswer: "B",
          explanation:
            "The base case is the condition that stops the recursion. Without it, the function would call itself infinitely, leading to a stack overflow.",
        },
        {
          question: "What happens when you dereference a NULL pointer in C?",
          options: [
            "Returns 0",
            "Returns NULL",
            "Causes undefined behavior (likely segmentation fault)",
            "Automatically allocates memory",
          ],
          correctAnswer: "C",
          explanation:
            "Dereferencing a NULL pointer causes undefined behavior, typically resulting in a segmentation fault because you're trying to access memory at address 0.",
        },
        {
          question: "Where is local variable data stored during function execution?",
          options: [
            "Heap memory",
            "Stack memory",
            "Static memory",
            "Register memory only",
          ],
          correctAnswer: "B",
          explanation:
            "Local variables are stored on the stack memory. They are automatically allocated when the function is called and deallocated when it returns.",
        },
      ],
      "Medium exam-style": [
        {
          question:
            "What will fact(4) return? int fact(int n) { return n <= 1 ? 1 : n * fact(n-1); }",
          options: ["4", "10", "24", "120"],
          correctAnswer: "C",
          explanation:
            "fact(4) = 4 × fact(3) = 4 × 3 × fact(2) = 4 × 3 × 2 × fact(1) = 4 × 3 × 2 × 1 = 24",
        },
        {
          question: "How do you allocate memory for an array of 5 integers using malloc?",
          options: [
            "int *p = malloc(5);",
            "int *p = malloc(5 * sizeof(int));",
            "int *p = new int[5];",
            "int *p = alloc(5);",
          ],
          correctAnswer: "B",
          explanation:
            "malloc requires the size in bytes, so you multiply the number of elements (5) by sizeof(int) to get the correct allocation size.",
        },
        {
          question:
            "What is wrong with this code? void foo() { int *p = malloc(10 * sizeof(int)); p = NULL; }",
          options: [
            "malloc is used incorrectly",
            "Memory leak - allocated memory is not freed",
            "NULL assignment is invalid",
            "sizeof(int) is wrong",
          ],
          correctAnswer: "B",
          explanation:
            "Setting p = NULL loses the reference to the allocated memory without freeing it first, causing a memory leak. Should call free(p) before setting to NULL.",
        },
      ],
      "Hard / stress test": [
        {
          question:
            "Why can passing int **ptr to a recursive function modify the caller's pointer?",
          options: [
            "Because pointers are always global",
            "Because it passes the address of the pointer, allowing modification",
            "Because recursion copies all parameters",
            "It cannot modify the caller's pointer",
          ],
          correctAnswer: "B",
          explanation:
            "A pointer-to-pointer (**ptr) passes the address of the original pointer, so dereferencing it (*ptr) accesses and can modify the actual pointer variable in the caller's scope.",
        },
        {
          question:
            "In linked list reversal, what must be carefully tracked to avoid losing nodes?",
          options: [
            "Only the head pointer",
            "Previous, current, and next pointers",
            "Only the tail pointer",
            "The size of the list",
          ],
          correctAnswer: "B",
          explanation:
            "You need three pointers: 'prev' for the reversed part, 'current' for processing, and 'next' to save the remaining list before reversing the link.",
        },
        {
          question: "What does &(*ptr) evaluate to?",
          options: [
            "The value pointed to by ptr",
            "The address stored in ptr",
            "A syntax error",
            "NULL",
          ],
          correctAnswer: "B",
          explanation:
            "&(*ptr) means 'address of (value at ptr)' which simplifies back to ptr itself - the address. The dereference (*) and address-of (&) cancel each other out.",
        },
      ],
    },
    "MA1001 – Derivatives practice": {
      "Intro / warm-up": [
        {
          question: "What is the derivative of f(x) = x²?",
          options: ["x", "2x", "x²", "2"],
          correctAnswer: "B",
          explanation:
            "Using the power rule d/dx(xⁿ) = nxⁿ⁻¹, the derivative of x² is 2x¹ = 2x.",
        },
        {
          question: "What is the power rule for derivatives?",
          options: [
            "d/dx(xⁿ) = xⁿ⁻¹",
            "d/dx(xⁿ) = nxⁿ⁻¹",
            "d/dx(xⁿ) = nxⁿ",
            "d/dx(xⁿ) = xⁿ/n",
          ],
          correctAnswer: "B",
          explanation:
            "The power rule states that the derivative of xⁿ is nxⁿ⁻¹. You multiply by the exponent and reduce the exponent by 1.",
        },
        {
          question: "Find f'(x) if f(x) = 3x + 5",
          options: ["3x", "3", "3x + 5", "8"],
          correctAnswer: "B",
          explanation:
            "The derivative of 3x is 3 (coefficient of x), and the derivative of the constant 5 is 0. So f'(x) = 3.",
        },
      ],
      "Medium exam-style": [
        {
          question: "What rule is needed to find d/dx[(2x² + 1)³]?",
          options: ["Product rule", "Chain rule", "Quotient rule", "Power rule only"],
          correctAnswer: "B",
          explanation:
            "Chain rule is needed because you have a function (2x² + 1) raised to a power. You differentiate the outer function (cube) then multiply by the derivative of the inner function.",
        },
        {
          question: "Using product rule, d/dx[sin(x)·eˣ] = ?",
          options: [
            "cos(x)·eˣ",
            "sin(x)·eˣ + cos(x)·eˣ",
            "cos(x) + eˣ",
            "sin(x) + eˣ",
          ],
          correctAnswer: "B",
          explanation:
            "Product rule: (uv)' = u'v + uv'. Here u=sin(x), v=eˣ. So: cos(x)·eˣ + sin(x)·eˣ.",
        },
        {
          question: "Where does f(x) = x³ - 3x² + 2 have horizontal tangent?",
          options: [
            "x = 0 and x = 2",
            "x = 1 and x = 3",
            "x = 0 only",
            "No horizontal tangents",
          ],
          correctAnswer: "A",
          explanation:
            "Horizontal tangent when f'(x) = 0. f'(x) = 3x² - 6x = 3x(x - 2) = 0, so x = 0 or x = 2.",
        },
      ],
      "Hard / stress test": [
        {
          question: "The quotient rule can be derived from which combination?",
          options: [
            "Product rule only",
            "Product rule + chain rule",
            "Power rule + chain rule",
            "Cannot be derived",
          ],
          correctAnswer: "B",
          explanation:
            "Write u/v as u·v⁻¹, apply product rule to get u'v⁻¹ + u·(-v⁻²)·v', which simplifies to the quotient rule (u'v - uv')/v².",
        },
        {
          question: "For f(x,y) = x² + y² - 2xy, what is ∂f/∂x?",
          options: ["2x - 2y", "2x + 2y", "2x - y", "x - 2y"],
          correctAnswer: "A",
          explanation:
            "Partial derivative with respect to x treats y as constant: ∂f/∂x = 2x + 0 - 2y = 2x - 2y.",
        },
        {
          question: "For x² + y² = 25, find dy/dx using implicit differentiation",
          options: ["-x/y", "x/y", "-y/x", "y/x"],
          correctAnswer: "A",
          explanation:
            "Differentiate both sides: 2x + 2y(dy/dx) = 0. Solve for dy/dx: dy/dx = -2x/2y = -x/y.",
        },
      ],
    },
    "Digital Systems – Flip-flops timing": {
      "Intro / warm-up": [
        {
          question: "What is the main difference between a latch and a flip-flop?",
          options: [
            "Latches are level-triggered, flip-flops are edge-triggered",
            "Latches are faster than flip-flops",
            "Flip-flops use more power",
            "There is no difference",
          ],
          correctAnswer: "A",
          explanation:
            "Latches are level-triggered (transparent when clock is high/low), while flip-flops are edge-triggered (only change on clock edge).",
        },
        {
          question: "What does a D flip-flop do?",
          options: [
            "Doubles the input",
            "Delays the input by one clock cycle",
            "Inverts the input",
            "Divides the clock frequency",
          ],
          correctAnswer: "B",
          explanation:
            "A D flip-flop captures the D input on the clock edge and holds it, effectively delaying the signal by one clock cycle.",
        },
        {
          question: "What is setup time in digital circuits?",
          options: [
            "Time after clock edge when data must be stable",
            "Time before clock edge when data must be stable",
            "Time to power on the circuit",
            "Time between clock edges",
          ],
          correctAnswer: "B",
          explanation:
            "Setup time is the minimum time before the clock edge that the input data must be stable to be reliably captured.",
        },
      ],
      "Medium exam-style": [
        {
          question: "If setup time is 2ns and hold time is 1ns, what limits max frequency?",
          options: [
            "Setup time only",
            "Hold time only",
            "Both setup and propagation delay",
            "Hold time is irrelevant",
          ],
          correctAnswer: "C",
          explanation:
            "Maximum frequency is limited by: T_clock ≥ T_propagation + T_setup. Hold time must be met but doesn't directly limit frequency.",
        },
        {
          question: "What is metastability in flip-flops?",
          options: [
            "When output is always 0",
            "When output oscillates indefinitely",
            "When output settles to an unpredictable value after delay",
            "When flip-flop uses less power",
          ],
          correctAnswer: "C",
          explanation:
            "Metastability occurs when input changes too close to clock edge, violating timing constraints. The output may oscillate then settle to an unpredictable value.",
        },
        {
          question: "How many D flip-flops needed for a 0-7 counter?",
          options: ["2", "3", "4", "8"],
          correctAnswer: "B",
          explanation:
            "To count 0-7 (8 states), you need 3 flip-flops since 2³ = 8. Each flip-flop represents one bit of the count.",
        },
      ],
      "Hard / stress test": [
        {
          question: "In a 3-stage pipeline, which timing path is most critical?",
          options: [
            "Input to first stage",
            "Between any two adjacent stages",
            "Last stage to output",
            "All paths are equally critical",
          ],
          correctAnswer: "B",
          explanation:
            "The critical path is the longest combinational delay between any two flip-flop stages, which determines the minimum clock period.",
        },
        {
          question: "Why use multiple flip-flops in a clock domain crossing synchronizer?",
          options: [
            "To increase speed",
            "To reduce metastability probability",
            "To save power",
            "To invert the signal",
          ],
          correctAnswer: "B",
          explanation:
            "Multiple flip-flops in series reduce the probability that metastability will propagate through. Each stage gives time to resolve to a stable value.",
        },
        {
          question:
            "If 5 flip-flops have delays of 1,2,1,3,2 ns, what's total propagation?",
          options: ["9 ns", "5 ns", "3 ns", "Cannot be determined"],
          correctAnswer: "A",
          explanation:
            "In a chain, signals propagate through all flip-flops sequentially, so total delay is the sum: 1+2+1+3+2 = 9 ns.",
        },
      ],
    },
    "Data structures – Linked list traps": {
      "Intro / warm-up": [
        {
          question: "How does a linked list differ from an array?",
          options: [
            "Arrays are faster for all operations",
            "Linked lists allow dynamic size and efficient insertion/deletion",
            "Linked lists provide O(1) random access",
            "Arrays cannot store pointers",
          ],
          correctAnswer: "B",
          explanation:
            "Linked lists can grow/shrink dynamically and allow O(1) insertion/deletion at known positions, unlike arrays which require shifting elements.",
        },
        {
          question: "What happens if you access a node after the tail of a linked list?",
          options: [
            "Returns the head node",
            "Returns 0",
            "Undefined behavior (likely segmentation fault)",
            "Automatically extends the list",
          ],
          correctAnswer: "C",
          explanation:
            "After the tail, the next pointer is NULL. Trying to access NULL->data causes undefined behavior, typically a segmentation fault.",
        },
        {
          question: "What is the time complexity of traversing a linked list?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctAnswer: "C",
          explanation:
            "You must follow n links to visit all n nodes, so traversal is O(n). There's no way to jump directly to a position.",
        },
      ],
      "Medium exam-style": [
        {
          question: "To reverse a linked list iteratively, what pointers do you need?",
          options: [
            "Only current",
            "Current and next",
            "Previous, current, and next",
            "Head and tail only",
          ],
          correctAnswer: "C",
          explanation:
            "You need: prev (reversed part), current (processing), and next (save remaining list before reversing current->next link).",
        },
        {
          question: "What is Floyd's cycle detection algorithm also called?",
          options: [
            "Fast-slow pointer / Tortoise and Hare",
            "Binary search method",
            "Hash table method",
            "Recursive detection",
          ],
          correctAnswer: "A",
          explanation:
            "Floyd's algorithm uses two pointers moving at different speeds (slow: 1 step, fast: 2 steps). If there's a cycle, they'll eventually meet.",
        },
        {
          question:
            "How to remove duplicates from unsorted linked list without extra space?",
          options: [
            "Sort first then remove",
            "Use nested loops to check each pair",
            "Use a hash table (violates no extra space)",
            "Cannot be done without extra space",
          ],
          correctAnswer: "B",
          explanation:
            "Without extra space, use two pointers: outer to select each element, inner to remove duplicates of that element. Time: O(n²), Space: O(1).",
        },
      ],
      "Hard / stress test": [
        {
          question: "What's the optimal time complexity to merge two sorted linked lists?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctAnswer: "C",
          explanation:
            "You must examine each node once to compare and link them in order, making it O(n) where n is total nodes.",
        },
        {
          question: "To find intersection point of two lists without modifying them, use:",
          options: [
            "Hash table to store nodes of first list",
            "Calculate lengths and align starting points",
            "Reverse both lists",
            "Sort both lists first",
          ],
          correctAnswer: "B",
          explanation:
            "Find lengths of both lists, advance the longer list by the difference, then move both together until they meet at intersection. O(n) time, O(1) space.",
        },
        {
          question: "Why use doubly linked list for LRU cache?",
          options: [
            "Faster than singly linked list",
            "Allows O(1) removal of any node",
            "Uses less memory",
            "Easier to implement",
          ],
          correctAnswer: "B",
          explanation:
            "With doubly linked list + hash map, you can remove any node in O(1) (hash map finds it, prev/next pointers allow quick removal) - essential for efficient LRU.",
        },
      ],
    },
  };

  const handleGenerate = () => {
    const now = Date.now();
    const timestamp = new Date().toLocaleString("en-US");
    let questions: QuizItem[] = [];

    if (source === "trusted-bank") {
      // Get MCQ questions from trusted bank
      const topicBank = trustedBankQuestions[topic] || {};
      const difficultyQuestions = topicBank[difficulty] || [];

      questions = difficultyQuestions.slice(0, 3).map((q, idx) => ({
        id: `Q-${now}-${idx}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        source: "trusted-bank",
        topic,
        difficulty,
        status: "new" as QuizStatus,
        createdAt: timestamp,
      }));
    } else {
      // AI freeform - generate MCQ questions with confusion context
      const confusionContext =
        confuse.trim().length > 0 ? ` Focus on: "${confuse}"` : "";

      const templates = [
        {
          question: `${topic}: Which approach is most effective?${confusionContext}`,
          options: [
            "Approach A - Basic",
            "Approach B - Optimized",
            "Approach C - Advanced",
            "Approach D - Alternative",
          ],
          correctAnswer: "B",
          explanation:
            "Approach B is typically most effective as it balances simplicity with optimization.",
        },
        {
          question: `${topic}: What is the key concept to understand?${confusionContext}`,
          options: [
            "Syntax only",
            "Core principle and application",
            "Memorization",
            "Tool usage",
          ],
          correctAnswer: "B",
          explanation:
            "Understanding core principles and their applications is essential for mastery.",
        },
        {
          question: `${topic}: Which statement is correct?${confusionContext}`,
          options: ["Statement A", "Statement B", "Statement C", "All of the above"],
          correctAnswer: "C",
          explanation: "Statement C correctly captures the main concept of this topic.",
        },
      ];

      questions = templates.slice(0, 3).map((q, idx) => ({
        id: `Q-${now}-${idx}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        source: "ai-freeform",
        topic,
        difficulty,
        status: "new" as QuizStatus,
        createdAt: timestamp,
      }));
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      const existingQuizzes = JSON.parse(
        localStorage.getItem("myQuizzes") || "[]"
      );
      localStorage.setItem(
        "myQuizzes",
        JSON.stringify([...existingQuizzes, ...questions])
      );
    }

    setLastGenerated(questions);
    // briefly highlight the My Questions link and focus it for accessibility
    setHighlightMyQuestions(true);
    setTimeout(() => setHighlightMyQuestions(false), 2200);
    setTimeout(() => myQuestionsRef.current?.focus(), 300);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue py-6">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-6">
        <h1 className="text-2xl font-semibold text-dark-blue mb-2">
          AI Quiz Generator
        </h1>
        <p className="text-sm text-black/70 max-w-2xl">
          Generate practice questions based on your topic, difficulty, and confusion
          notes.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm space-y-6">
          {/* form head */}
          <div className="flex flex-wrap justify-between gap-3 items-start">
            <div>
              <h2 className="text-sm font-semibold text-dark-blue">Your request</h2>
              <p className="text-[0.7rem] text-black/50">
                Tell us what you&apos;re struggling with. We&apos;ll generate questions.
              </p>
            </div>
            <p className="text-[0.6rem] text-black/40">
              FR-ADV.03 · Adaptive difficulty
            </p>
          </div>

          {/* Source Selector */}
          <div>
            <label className="block text-[0.7rem] font-semibold text-dark-blue mb-2">
              Question source
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSource("trusted-bank")}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  source === "trusted-bank"
                    ? "border-light-heavy-blue bg-blue-50"
                    : "border-soft-white-blue bg-white hover:border-light-light-blue"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      source === "trusted-bank"
                        ? "border-light-heavy-blue"
                        : "border-black/20"
                    }`}
                  >
                    {source === "trusted-bank" && (
                      <div className="w-2 h-2 rounded-full bg-light-heavy-blue"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark-blue">
                      Trusted bank (recommended)
                    </p>
                    <p className="text-xs text-black/60 mt-1">
                      Reliable, exam-like, but may repeat.
                    </p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSource("ai-freeform")}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  source === "ai-freeform"
                    ? "border-light-heavy-blue bg-blue-50"
                    : "border-soft-white-blue bg-white hover:border-light-light-blue"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      source === "ai-freeform"
                        ? "border-light-heavy-blue"
                        : "border-black/20"
                    }`}
                  >
                    {source === "ai-freeform" && (
                      <div className="w-2 h-2 rounded-full bg-light-heavy-blue"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark-blue">
                      AI creative
                    </p>
                    <p className="text-xs text-black/60 mt-1">
                      More variety, targets confusion, may need review.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* form grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* topic */}
            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] font-semibold text-dark-blue">
                Topic / Course
              </span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option>CO1001 – Recursion / Pointer Debugging</option>
                <option>MA1001 – Derivatives practice</option>
                <option>Digital Systems – Flip-flops timing</option>
                <option>Data structures – Linked list traps</option>
              </select>
              <span className="text-[0.65rem] text-black/50">
                We&apos;ll match this to tutor logs and your feedback.
              </span>
            </label>

            {/* difficulty */}
            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] font-semibold text-dark-blue">
                Difficulty
              </span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option>Intro / warm-up</option>
                <option>Medium exam-style</option>
                <option>Hard / stress test</option>
              </select>
              <span className="text-[0.65rem] text-black/50">
                Higher difficulty simulates midterm/final.
              </span>
            </label>
          </div>

          {/* confuse text */}
          <label className="flex flex-col gap-1">
            <span className="text-[0.7rem] font-semibold text-dark-blue">
              What confuses you most?
            </span>
            <textarea
              value={confuse}
              onChange={(e) => setConfuse(e.target.value)}
              rows={3}
              placeholder="Example: I keep losing track of pointer references inside recursive calls when they return new addresses."
              className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white resize-y"
            />
            <span className="text-[0.65rem] text-black/50">
              This will bias the quiz to force you to explain that exact weak spot.
            </span>
          </label>

          {/* action */}
          <div>
            <button
              onClick={handleGenerate}
              type="button"
              className="bg-light-heavy-blue text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-light-blue transition"
            >
              Generate Quiz
            </button>
          </div>

          {/* generated block */}
          {lastGenerated.length > 0 && (
            <div className="bg-soft-white-blue/60 border border-black/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[0.75rem] font-semibold text-dark-blue">
                  Last generated ({lastGenerated.length} questions)
                </p>
                <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">
                  Saved to My Questions
                </span>
              </div>
              <div className="space-y-3">
                {lastGenerated.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white border border-black/5 rounded-md p-3"
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <p className="text-[0.75rem] font-semibold text-dark-blue flex-1">
                        Q{idx + 1}. {q.question}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          q.source === "trusted-bank"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-purple-100 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {q.source === "trusted-bank" ? "Bank" : "AI"}
                      </span>
                    </div>
                    <div className="space-y-1 text-[0.7rem] text-black/70">
                      {q.options.map((opt: string, i: number) => (
                        <p key={i}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <Link
                  href="/student/ai-quiz-my-questions"
                  ref={myQuestionsRef}
                  className={`inline-block px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-light-heavy-blue transition ${
                    highlightMyQuestions
                      ? 'bg-light-heavy-blue text-white ring-4 ring-light-heavy-blue/40 shadow-lg scale-[1.02] animate-pulse'
                      : 'bg-white border border-black/10 text-dark-blue hover:bg-light-blue hover:text-white'
                  }`}
                  aria-label="Go to My Questions (opens My Questions page)"
                >
                  Go to My Questions
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[0.6rem] text-black/40 mt-6">
          Generated quizzes are automatically saved to &quot;My Questions&quot; page.
        </p>
      </div>
    </div>
  );
}
