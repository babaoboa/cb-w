import { Calendar, Clock, FileText, Gauge, History } from "@keyline-icons/react"

import { ClassmatesSolved } from "@/components/classmates-solved"
import { ProblemStatement } from "@/components/problem-statement"
import { PaneTabsList, PaneTabsTrigger } from "@/components/pane-tabs"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { Difficulty, Problem } from "@/lib/problem"

// Placeholder class activity until it loads from the classroom.
const activity = {
  submissionCount: 2,
  solvedCount: 10,
  solvedBy: [
    {
      id: "jl",
      name: "Jordan Lee",
      initials: "JL",
      color: "bg-sky-300 text-sky-950",
    },
    {
      id: "ak",
      name: "Aisha Khan",
      initials: "AK",
      color: "bg-rose-300 text-rose-950",
    },
    {
      id: "do",
      name: "Daniel Okafor",
      initials: "DO",
      color: "bg-emerald-300 text-emerald-950",
    },
    {
      id: "sn",
      name: "Sofia Nguyen",
      initials: "SN",
      color: "bg-amber-300 text-amber-950",
    },
  ],
}

const difficultyVariants = {
  Easy: "secondary",
  Medium: "warning",
  Hard: "destructive",
} as const satisfies Record<Difficulty, string>

// Due dates are this week's, so the weekday and time are enough.
const dueFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

/** The workspace's tall pane: the problem statement and its submissions. */
export function ProblemPane({ problem }: { problem: Problem }) {
  return (
    <Tabs defaultValue="problem" className="h-full gap-0">
      <PaneTabsList className="m-2">
        <PaneTabsTrigger value="problem">
          <FileText data-icon="inline-start" />
          Problem
        </PaneTabsTrigger>
        <PaneTabsTrigger value="submissions">
          <History data-icon="inline-start" />
          Submissions
          {/* The current tab is muted, so its count steps up to stay visible. */}
          <Badge
            variant="secondary"
            className="px-1.5 in-data-active:bg-background"
          >
            {activity.submissionCount}
          </Badge>
        </PaneTabsTrigger>
      </PaneTabsList>
      {/* Kept mounted so opened hints stay unlocked across tabs. */}
      <TabsContent
        value="problem"
        keepMounted
        className="min-h-0 overflow-y-auto px-6 pt-4 pb-6"
      >
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {problem.number}. {problem.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant={difficultyVariants[problem.difficulty]}>
            <Gauge data-icon="inline-start" />
            {problem.difficulty}
          </Badge>
          {problem.topics.map((topic) => (
            <Badge key={topic} variant="secondary">
              {topic}
            </Badge>
          ))}
          <Badge variant="secondary">
            <Clock data-icon="inline-start" />
            {problem.time} · {problem.memory}
          </Badge>
          {problem.due && (
            <Badge className="bg-primary/10 text-primary dark:bg-primary/40 dark:text-primary-foreground">
              <Calendar data-icon="inline-start" />
              Due{" "}
              <time dateTime={problem.due.toISOString()}>
                {dueFormat.format(problem.due)}
              </time>
            </Badge>
          )}
        </div>
        <div className="mt-5">
          <ProblemStatement markdown={problem.statement} />
        </div>
        <div className="mt-8">
          <ClassmatesSolved
            classmates={activity.solvedBy}
            total={activity.solvedCount}
          />
        </div>
      </TabsContent>
      <TabsContent value="submissions" className="min-h-0 overflow-y-auto" />
    </Tabs>
  )
}
