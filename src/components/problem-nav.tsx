import { ChevronLeft, ChevronRight } from "@keyline-icons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface LessonProblem {
  id: string
  number: number
  title: string
  url: string
  solved: boolean
}

/** Steps through a lesson's problems. Each one is a bar, filled once it's
    solved and outlined while it's open, with the count solved beside them.
    Short of room the bars narrow, then give way, and on a phone the count
    goes too, leaving just the arrows. The header is the container they
    measure. */
export function ProblemNav({
  problems,
  currentId,
  className,
}: {
  problems: LessonProblem[]
  currentId: string
  className?: string
}) {
  const index = problems.findIndex((problem) => problem.id === currentId)
  const solved = problems.filter((problem) => problem.solved).length

  return (
    // Filling the space it's given, rather than sizing to its bars, is what
    // lets them narrow. It keeps to the end of that space.
    <nav
      aria-label="Problems in this lesson"
      className={cn("flex items-center justify-end gap-1", className)}
    >
      <StepLink label="Previous problem" problem={problems[index - 1]}>
        <ChevronLeft />
      </StepLink>
      <ol className="mx-1 hidden min-w-0 items-center @min-[54rem]:flex">
        {problems.map((problem) => (
          <li key={problem.id} className="w-7 min-w-4">
            <ProblemBar problem={problem} current={problem.id === currentId} />
          </li>
        ))}
      </ol>
      <StepLink label="Next problem" problem={problems[index + 1]}>
        <ChevronRight />
      </StepLink>
      <span className="ml-1 hidden text-sm whitespace-nowrap text-muted-foreground tabular-nums md:text-sidebar-foreground/60 @lg:inline">
        {solved} of {problems.length} solved
      </span>
    </nav>
  )
}

const stepClassName =
  "text-muted-foreground md:text-sidebar-foreground/60 md:hover:bg-sidebar-accent md:hover:text-sidebar-foreground"

/** A link to the problem before or after this one, named in its tooltip. At
    either end of the lesson there's nowhere to go, so it's disabled. */
function StepLink({
  label,
  problem,
  children,
}: {
  label: string
  problem?: LessonProblem
  children: React.ReactNode
}) {
  if (!problem) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        disabled
        className={stepClassName}
      >
        {children}
      </Button>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<a href={problem.url} />}
            aria-label={`${label}: ${problem.title}`}
            className={stepClassName}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {problem.number}. {problem.title}
      </TooltipContent>
    </Tooltip>
  )
}

/** One problem's bar. Bars only show on a wide header, which always sits on
    the sidebar's dark frame, so they take its colours. The link reaches past
    the bar so the targets meet, leaving no gaps to miss between them. */
function ProblemBar({
  problem,
  current,
}: {
  problem: LessonProblem
  current: boolean
}) {
  const status = problem.solved ? "Solved" : "Not solved"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={problem.url}
            aria-current={current ? "page" : undefined}
            aria-label={`Problem ${problem.number}: ${problem.title}, ${status.toLowerCase()}`}
            className="group block px-0.5 py-2 outline-none"
          />
        }
      >
        <span
          className={cn(
            "block h-2 w-full rounded-full transition-colors group-focus-visible:outline-3 group-focus-visible:outline-ring/50",
            problem.solved
              ? "bg-primary group-hover:bg-primary/80"
              : "bg-sidebar-accent group-hover:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_10%)]",
            current && "ring-[1.5px] ring-sidebar-foreground ring-inset",
            current && !problem.solved && "bg-transparent"
          )}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {problem.number}. {problem.title}
        <span className="text-background/60">{status}</span>
      </TooltipContent>
    </Tooltip>
  )
}
