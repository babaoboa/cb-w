import {
  Check,
  Clock,
  Cpu,
  FileX,
  SquareTerminal,
  X,
  Zap,
} from "@keyline-icons/react"
import { cn } from "cn"

import { TestIoBox, TestIoLabel } from "@/components/test-io"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  type DiffToken,
  diffOutputs,
  type Submission,
  type TestRun,
  type Verdict,
} from "@/lib/submission"

// Failures that come from speed or size, not a wrong idea, are amber.
const TONES = {
  neutral: { text: "text-foreground", soft: "bg-muted text-muted-foreground" },
  success: {
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  },
  danger: {
    text: "text-destructive",
    soft: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
  warning: {
    text: "text-warning-foreground",
    soft: "bg-warning/15 text-warning-foreground",
  },
}

const VERDICTS = {
  running: { title: "Running tests…", icon: null, tone: "neutral" },
  accepted: { title: "Accepted", icon: Check, tone: "success" },
  "wrong-answer": { title: "Wrong answer", icon: X, tone: "danger" },
  "time-limit": { title: "Time limit exceeded", icon: Clock, tone: "warning" },
  "memory-limit": {
    title: "Memory limit exceeded",
    icon: Cpu,
    tone: "warning",
  },
  "runtime-error": { title: "Runtime error", icon: Zap, tone: "danger" },
  "compile-error": { title: "Compilation error", icon: FileX, tone: "danger" },
} as const satisfies Record<
  Verdict,
  { title: string; icon: typeof Check | null; tone: keyof typeof TONES }
>

// The squares for each test, filled by how it went.
const SQUARES = {
  passed: "bg-emerald-600 text-white",
  danger: "bg-destructive text-white",
  warning: "bg-warning text-amber-950",
  empty: "border bg-background",
}

// Longer inputs show only their start.
const INPUT_PREVIEW_LINES = 8

const seconds = (time: number) => `${time.toFixed(2)} s`

/** How a submission did: its verdict, a square per test, and what went
    wrong on the test it failed. */
export function SubmissionResult({
  submission,
  limits,
}: {
  submission: Submission
  limits: { time: string; memory: string }
}) {
  const verdict = VERDICTS[submission.verdict]
  const tone = TONES[verdict.tone]
  const Icon = verdict.icon
  const { tests } = submission
  const passed = tests.filter((test) => test.status === "passed").length
  const failed = "failed" in submission ? submission.failed : undefined

  return (
    <div className="@container space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2
            className={cn(
              "flex items-center gap-2 text-lg font-semibold tracking-tight",
              tone.text
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full [&>svg]:size-3.5",
                tone.soft
              )}
            >
              {Icon ? <Icon /> : <Spinner className="size-3.5" />}
            </span>
            {verdict.title}
            {failed && ` on test ${failed.number}`}
          </h2>
          <p className="text-xs text-muted-foreground">
            {submission.verdict === "compile-error" ? (
              "No tests ran"
            ) : (
              <>
                <span className="font-semibold text-foreground tabular-nums">
                  {passed}/{tests.length}
                </span>{" "}
                passed
              </>
            )}
          </p>
        </div>
        <TestSquares submission={submission} />
      </div>
      <Explanation submission={submission} limits={limits} />
      <Details submission={submission} />
    </div>
  )
}

function TestSquares({ submission }: { submission: Submission }) {
  const verdict = VERDICTS[submission.verdict]
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Tests">
      {submission.tests.map((test, index) => {
        const label = `Test ${index + 1}: ${statusLabel(test, verdict.title)}`
        const FailIcon = verdict.icon ?? X
        return (
          <li key={index}>
            <Tooltip>
              <TooltipTrigger
                aria-label={label}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:size-3.5",
                  test.status === "passed"
                    ? SQUARES.passed
                    : test.status === "failed"
                      ? SQUARES[
                          verdict.tone === "warning" ? "warning" : "danger"
                        ]
                      : SQUARES.empty
                )}
              >
                {test.status === "passed" && <Check />}
                {test.status === "failed" && <FailIcon />}
                {test.status === "running" && (
                  <Spinner className="text-muted-foreground" />
                )}
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </li>
        )
      })}
    </ol>
  )
}

function statusLabel(test: TestRun, verdictTitle: string) {
  switch (test.status) {
    case "passed":
      return `Passed in ${seconds(test.time ?? 0)}`
    case "failed":
      return verdictTitle
    case "running":
      return "Running"
    case "waiting":
      return "Waiting"
    case "skipped":
      return "Not run"
  }
}

/** A sentence on what the verdict means, for the ones the details don't
    already make plain. */
function Explanation({
  submission,
  limits,
}: {
  submission: Submission
  limits: { time: string; memory: string }
}) {
  let text: React.ReactNode
  switch (submission.verdict) {
    case "accepted": {
      const time = Math.max(...submission.tests.map((test) => test.time ?? 0))
      const memory = Math.max(
        ...submission.tests.map((test) => test.memory ?? 0)
      )
      return (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Slowest test</dt>
            <dd className="tabular-nums">
              {seconds(time)}{" "}
              <span className="text-muted-foreground">of {limits.time}</span>
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Most memory</dt>
            <dd className="tabular-nums">
              {memory} MB{" "}
              <span className="text-muted-foreground">of {limits.memory}</span>
            </dd>
          </div>
        </dl>
      )
    }
    case "wrong-answer":
      text = "Your output differs from the expected output where it's marked."
      break
    case "time-limit":
      text = `Your program was still running after ${limits.time}, the time limit, so it was stopped. Look for work it repeats more often than it needs to.`
      break
    case "memory-limit":
      text = `Your program used ${submission.failed.memory} MB, over the ${limits.memory} limit.`
      break
    case "runtime-error":
      text = `Your program crashed with exit code ${submission.failed.exitCode}. This often means reading or writing past the end of an array.`
      break
    case "compile-error":
      text = "Your code didn't compile, so no tests ran."
      break
    case "running":
      return null
  }
  return <p className="text-sm text-muted-foreground">{text}</p>
}

/** The failing test laid out side by side, or the compiler's complaint. */
function Details({ submission }: { submission: Submission }) {
  if (submission.verdict === "compile-error") {
    return (
      <Column label="Compiler output">
        <TestIoBox className="border-destructive/30 bg-destructive/5 text-xs leading-5">
          {submission.log}
        </TestIoBox>
      </Column>
    )
  }
  if (!("failed" in submission)) return null

  const { failed } = submission
  const input = <InputPreview input={failed.input} lines={failed.inputLines} />
  return (
    <div className="grid gap-3 @lg:auto-cols-fr @lg:grid-flow-col">
      <Column label="Input">{input}</Column>
      {submission.verdict === "wrong-answer" && (
        <WrongAnswer
          expected={submission.failed.expected}
          output={submission.failed.output}
        />
      )}
      {(submission.verdict === "time-limit" ||
        submission.verdict === "runtime-error") && (
        <Column label="Your output">
          <Output text={submission.failed.output} />
        </Column>
      )}
      {submission.verdict === "runtime-error" && (
        <Column label="Error output">
          <TestIoBox className="border-destructive/30 bg-destructive/5 break-words whitespace-pre-wrap text-destructive">
            {submission.failed.stderr}
          </TestIoBox>
        </Column>
      )}
    </div>
  )
}

function WrongAnswer({
  expected,
  output,
}: {
  expected: string
  output: string
}) {
  const diff = diffOutputs(expected, output)
  return (
    <>
      <Column label="Expected">
        <TestIoBox>
          <DiffLines lines={diff.expected} />
        </TestIoBox>
      </Column>
      <Column label="Your output">
        <TestIoBox>
          <DiffLines lines={diff.actual} />
        </TestIoBox>
      </Column>
    </>
  )
}

function Column({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <TestIoLabel>{label}</TestIoLabel>
      {children}
    </div>
  )
}

function InputPreview({ input, lines }: { input: string; lines?: number }) {
  const shown = input.split("\n").slice(0, INPUT_PREVIEW_LINES)
  const hidden = (lines ?? shown.length) - shown.length
  return (
    <TestIoBox>
      {shown.join("\n")}
      {hidden > 0 && (
        <span className="mt-1 block font-sans text-xs text-muted-foreground">
          … {hidden.toLocaleString()} more lines
        </span>
      )}
    </TestIoBox>
  )
}

function Output({ text }: { text: string }) {
  return text ? (
    <TestIoBox>{text}</TestIoBox>
  ) : (
    <TestIoBox className="font-sans text-muted-foreground">No output</TestIoBox>
  )
}

function DiffLines({ lines }: { lines: DiffToken[][] }) {
  return lines.map((line, row) => (
    <div key={row}>
      {line.map((token, index) => (
        <span key={index}>
          {index > 0 && " "}
          {token.differs ? (
            <mark className="rounded-sm bg-warning/40 px-0.5 text-foreground">
              {token.text}
            </mark>
          ) : (
            token.text
          )}
        </span>
      ))}
      {/* Keeps an empty line's height. */}
      {line.length === 0 && " "}
    </div>
  ))
}

/** Shown before anything has been submitted. */
export function NoSubmission() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
      <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-4.5">
        <SquareTerminal />
      </span>
      <p className="text-sm font-medium">No submissions yet</p>
      <p className="text-sm text-muted-foreground">
        Submit your code to run it against every test.
      </p>
    </div>
  )
}
