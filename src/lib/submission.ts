/** Where one test stands in a submission. Tests run in order and stop at
    the first failure, so the rest are skipped, or waiting while it runs. */
export type TestStatus = "passed" | "failed" | "running" | "waiting" | "skipped"

export interface TestRun {
  status: TestStatus
  /** Seconds, for a test that finished. */
  time?: number
  /** Megabytes, for a test that finished. */
  memory?: number
}

/** The test a submission failed on. */
interface FailedTest {
  /** Counting from 1. */
  number: number
  /** The input, or for a large test, just its first lines. */
  input: string
  /** How many lines the whole input has, when only its start is kept. */
  inputLines?: number
}

export type Submission = { submittedAt: Date; tests: TestRun[] } & (
  | { verdict: "running" }
  | { verdict: "accepted" }
  | {
      verdict: "wrong-answer"
      failed: FailedTest & { expected: string; output: string }
    }
  | { verdict: "time-limit"; failed: FailedTest & { output: string } }
  | { verdict: "memory-limit"; failed: FailedTest & { memory: number } }
  | {
      verdict: "runtime-error"
      failed: FailedTest & { output: string; stderr: string; exitCode: number }
    }
  | { verdict: "compile-error"; log: string }
)

export type Verdict = Submission["verdict"]

export interface DiffToken {
  text: string
  differs: boolean
}

const tokensOf = (text: string) =>
  text
    .trimEnd()
    .split("\n")
    .map((line) => line.split(/\s+/).filter(Boolean))

/** Expected and actual output split into lines of tokens, each marked where
    it differs from the other side. Judges compare tokens, so spacing alone
    never counts as a difference. */
export function diffOutputs(expected: string, actual: string) {
  const want = tokensOf(expected)
  const got = tokensOf(actual)
  const mark = (line: string[], other: string[] | undefined) =>
    line.map((text, index) => ({ text, differs: other?.[index] !== text }))
  return {
    expected: want.map((line, index) => mark(line, got[index])),
    actual: got.map((line, index) => mark(line, want[index])),
  }
}
