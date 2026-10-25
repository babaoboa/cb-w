import type { Submission, TestRun, Verdict } from "@/lib/submission"

// Placeholder: a submission for each verdict, until a judge runs the code.

const TEST_COUNT = 12
// Later tests are bigger, so they take longer and use more memory.
const TIMES = [
  0.01, 0.01, 0.02, 0.02, 0.03, 0.04, 0.05, 0.08, 0.12, 0.15, 0.18, 0.21,
]
const MEMORY = [3, 3, 4, 4, 5, 6, 8, 10, 12, 14, 16, 18]

/** The first `passed` tests pass. The next one fails or is running, and the
    rest are skipped after a failure or waiting behind a running test. */
function runs(passed: number, next?: "failed" | "running"): TestRun[] {
  return Array.from({ length: TEST_COUNT }, (_, index): TestRun => {
    if (index < passed) {
      return { status: "passed", time: TIMES[index], memory: MEMORY[index] }
    }
    if (index === passed && next) return { status: next }
    return { status: next === "running" ? "waiting" : "skipped" }
  })
}

// A long corridor: room 1 to room 200 000, one hallway at a time.
const CORRIDOR = [
  "200000 199999",
  "1 2",
  "2 3",
  "3 4",
  "4 5",
  "5 6",
  "6 7",
  "7 8",
]

const submittedAt = new Date(2026, 9, 20, 14, 2)

export const MOCK_SUBMISSIONS: Record<Verdict, Submission> = {
  running: { verdict: "running", submittedAt, tests: runs(5, "running") },
  accepted: { verdict: "accepted", submittedAt, tests: runs(TEST_COUNT) },
  "wrong-answer": {
    verdict: "wrong-answer",
    submittedAt,
    tests: runs(6, "failed"),
    failed: {
      number: 7,
      input: "6 4\n1 2\n2 3\n1 4\n5 6",
      expected: "0 1 2 1 -1 -1",
      output: "0 1 2 1 0 0",
    },
  },
  "time-limit": {
    verdict: "time-limit",
    submittedAt,
    tests: runs(8, "failed"),
    failed: {
      number: 9,
      input: CORRIDOR.join("\n"),
      inputLines: 200_000,
      output: "",
    },
  },
  "memory-limit": {
    verdict: "memory-limit",
    submittedAt,
    tests: runs(10, "failed"),
    failed: {
      number: 11,
      input: CORRIDOR.join("\n"),
      inputLines: 200_000,
      memory: 384,
    },
  },
  "runtime-error": {
    verdict: "runtime-error",
    submittedAt,
    tests: runs(3, "failed"),
    failed: {
      number: 4,
      // Crashes code that sizes adj as n, not n + 1, on the hallway to room n.
      input: "3 2\n1 2\n2 3",
      output: "",
      stderr: "Segmentation fault (core dumped)",
      exitCode: 139,
    },
  },
  "compile-error": {
    verdict: "compile-error",
    submittedAt,
    tests: runs(0),
    log: `main.cpp: In function 'int main()':
main.cpp:11:22: error: expected ';' before 'adj'
   11 |         cin >> a >> b
      |                      ^
      |                      ;
   12 |         adj[a].push_back(b);
      |         ~~~`,
  },
}
