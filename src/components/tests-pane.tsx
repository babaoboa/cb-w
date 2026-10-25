import { ChevronDown, ListChecks, SquareTerminal } from "@keyline-icons/react"
import { useState } from "react"

import { PaneTabsList, PaneTabsTrigger } from "@/components/pane-tabs"
import { NoSubmission, SubmissionResult } from "@/components/submission-result"
import { TestCases } from "@/components/test-cases"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { Problem } from "@/lib/problem"
import type { Verdict } from "@/lib/submission"
import { MOCK_SUBMISSIONS } from "@/problems/hallway-shortcuts/submissions"

type Preview = Verdict | "none"

const PREVIEWS: { value: Preview; label: string }[] = [
  { value: "accepted", label: "Accepted" },
  { value: "wrong-answer", label: "Wrong answer" },
  { value: "time-limit", label: "Time limit exceeded" },
  { value: "memory-limit", label: "Memory limit exceeded" },
  { value: "runtime-error", label: "Runtime error" },
  { value: "compile-error", label: "Compilation error" },
  { value: "running", label: "Running" },
  { value: "none", label: "No submission" },
]

const submittedFormat = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

/** The workspace's bottom pane: tests to try, and the last submission's
    result. */
export function TestsPane({ problem }: { problem: Problem }) {
  // Until a judge runs code, the result is a placeholder for each verdict.
  const [preview, setPreview] = useState<Preview>("wrong-answer")
  const submission = preview === "none" ? undefined : MOCK_SUBMISSIONS[preview]

  return (
    <Tabs defaultValue="result" className="h-full gap-0">
      <div className="flex items-center gap-2 border-b pr-3">
        <PaneTabsList className="m-2">
          <PaneTabsTrigger value="tests">
            <ListChecks data-icon="inline-start" />
            Tests
          </PaneTabsTrigger>
          <PaneTabsTrigger value="result">
            <SquareTerminal data-icon="inline-start" />
            Result
          </PaneTabsTrigger>
        </PaneTabsList>
        <div className="ml-auto flex min-w-0 items-center gap-3">
          {import.meta.env.DEV && (
            <PreviewPicker value={preview} onChange={setPreview} />
          )}
          {submission && (
            <span className="truncate text-xs text-muted-foreground">
              Last submission {submittedFormat.format(submission.submittedAt)}
            </span>
          )}
        </div>
      </div>
      {/* Kept mounted so edited and added tests survive a look at the
          result. */}
      <TabsContent
        value="tests"
        keepMounted
        className="min-h-0 overflow-y-auto p-3"
      >
        <TestCases samples={problem.samples} />
      </TabsContent>
      <TabsContent value="result" className="min-h-0 overflow-y-auto p-4">
        {submission ? (
          <SubmissionResult
            submission={submission}
            limits={{ time: problem.time, memory: problem.memory }}
          />
        ) : (
          <NoSubmission />
        )}
      </TabsContent>
    </Tabs>
  )
}

/** In development, picks which placeholder result to show. */
function PreviewPicker({
  value,
  onChange,
}: {
  value: Preview
  onChange: (value: Preview) => void
}) {
  const label = PREVIEWS.find((preview) => preview.value === value)?.label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="xs"
            className="border-dashed text-muted-foreground"
          />
        }
      >
        {label} (dev)
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as Preview)}
        >
          {PREVIEWS.map((preview) => (
            <DropdownMenuRadioItem
              key={preview.value}
              value={preview.value}
              closeOnClick
            >
              {preview.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
