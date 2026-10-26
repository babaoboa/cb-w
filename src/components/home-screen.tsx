import { Bug, Play, Slash, Upload } from "@keyline-icons/react"

import { AppSidebar } from "@/components/app-sidebar"
import { type LessonProblem, ProblemNav } from "@/components/problem-nav"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Workspace } from "@/components/workspace"
import { hallwayShortcuts as problem } from "@/problems/hallway-shortcuts"

// Placeholder: the lesson's problems, until lessons load from somewhere.
// Only the open one is written so far.
const LESSON_PROBLEMS: LessonProblem[] = [
  { id: "lunch-line", number: 1, title: "Lunch line", url: "#", solved: true },
  {
    id: "locker-neighbours",
    number: 2,
    title: "Locker neighbours",
    url: "#",
    solved: true,
  },
  { id: "fire-drill", number: 3, title: "Fire drill", url: "#", solved: true },
  {
    id: problem.id,
    number: problem.number,
    title: problem.title,
    url: "#",
    solved: false,
  },
  { id: "phone-tree", number: 5, title: "Phone tree", url: "#", solved: false },
  {
    id: "library-maze",
    number: 6,
    title: "Library maze",
    url: "#",
    solved: false,
  },
  {
    id: "bus-transfers",
    number: 7,
    title: "Bus transfers",
    url: "#",
    solved: false,
  },
  {
    id: "knight-moves",
    number: 8,
    title: "Knight moves",
    url: "#",
    solved: false,
  },
  {
    id: "word-ladder",
    number: 9,
    title: "Word ladder",
    url: "#",
    solved: false,
  },
]

// On wider screens the secondary buttons sit on the sidebar's dark frame, so
// they take its accent rather than the page's.
const frameButtonClassName =
  "md:bg-sidebar-accent md:text-sidebar-foreground md:hover:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_5%)]"

export function HomeScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <TooltipProvider>
      {/* Fixed to the viewport so the workspace panes fill it. */}
      <SidebarProvider className="h-svh">
        <AppSidebar onSignOut={onSignOut} />
        {/* On wider screens the header sits on the sidebar's dark frame, above
            the workspace's cards, and lines up with the sidebar's switcher bar.
            The gap below it matches the one under that bar, so the cards' tops
            line up with the search field. The cards are nested here, out of
            reach of SidebarInset's inset-variant styles, so they set their own
            rounding and shadow. */}
        <div className="flex min-w-0 flex-1 flex-col md:gap-2 md:py-2 md:pr-2">
          {/* On wider screens the code actions sit dead centre, between two
              equal columns, whatever the breadcrumb's length. Phones can't
              spare the second column, so the actions follow the title. What
              each part shows depends on the header's width, not the
              screen's, since the sidebar takes a share of it. */}
          <header className="@container flex h-12 shrink-0 items-center gap-2 px-3 md:grid md:h-10 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4 md:px-0">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {/* The toggle lives in the sidebar on wider screens. Phones
                  still need this one to open the drawer. */}
              <SidebarTrigger className="md:hidden" />
              <Separator
                orientation="vertical"
                className="mr-1 md:hidden data-vertical:h-4 data-vertical:self-center"
              />
              <LessonBreadcrumb />
            </div>
            <CodeActions />
            {/* Inset like the text in the cards below, so the count lines up
                with theirs rather than sitting on the card's corner. */}
            <ProblemNav
              problems={LESSON_PROBLEMS}
              currentId={problem.id}
              className="md:pr-3"
            />
          </header>
          <SidebarInset className="min-h-0 bg-transparent">
            <Workspace />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function LessonBreadcrumb() {
  return (
    // Set in the switcher's weight, so the two read as one size. The class
    // code leads as a chip, so it needs no separator after it. Until the
    // header is wide enough for the whole trail, only the lesson shows, and a
    // long title truncates rather than wrap the bar.
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap gap-2 font-medium md:text-sidebar-foreground/60">
        <BreadcrumbItem className="hidden @min-[60rem]:inline-flex">
          <Badge
            variant="outline"
            render={<BreadcrumbLink href="#" />}
            className="rounded-sm bg-muted px-1.5 font-mono tracking-wide text-muted-foreground hover:text-foreground md:border-sidebar-border md:bg-sidebar-accent md:text-sidebar-foreground/80 md:hover:text-sidebar-foreground"
          >
            ICS3U
          </Badge>
        </BreadcrumbItem>
        <BreadcrumbItem className="hidden @min-[60rem]:inline-flex">
          <BreadcrumbLink
            href="#"
            className="whitespace-nowrap md:hover:text-sidebar-foreground"
          >
            Unit 3 · Graphs
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:text-sidebar-foreground/30 @min-[60rem]:inline-flex">
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate font-medium md:text-sidebar-foreground">
            Lesson 4: Breadth-first search
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/** Debug and run as icons, then submit, the one action that's graded, spelled
    out. They share one group so they read as a single control. */
function CodeActions() {
  return (
    <ButtonGroup aria-label="Code actions" className="shrink-0">
      <ActionButton label="Debug">
        <Bug />
      </ActionButton>
      {/* Both icons share a fill, so a line in the frame's colour parts them. */}
      <ButtonGroupSeparator className="md:bg-sidebar" />
      <ActionButton label="Run">
        <Play />
      </ActionButton>
      <Button>
        <Upload data-icon="inline-start" />
        Submit
      </Button>
    </ButtonGroup>
  )
}

/** An icon-only button named by its tooltip. The button itself is the trigger,
    with no wrapper, so the group can round its corners. */
function ActionButton({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="secondary"
            size="icon"
            aria-label={label}
            className={frameButtonClassName}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
