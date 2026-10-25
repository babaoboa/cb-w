import { cn } from "cn"
import {
  type Layout,
  useDefaultLayout,
  useGroupRef,
} from "react-resizable-panels"

import { CodeEditor } from "@/components/code-editor"
import { ProblemPane } from "@/components/problem-pane"
import { TestsPane } from "@/components/tests-pane"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useIsMobile } from "@/hooks/use-mobile"
import { hallwayShortcuts as problem } from "@/problems/hallway-shortcuts"

// The panel's className lands on its scrolling element, so each pane is a
// panel styled as a white card.
const paneClassName = "bg-background md:rounded-xl md:shadow-sm"

// How close, as a percentage of the group, a resize must land to a pane's
// starting size to snap onto it. Keyboard resizing moves in steps of 5%, so
// this stays below that or arrow keys couldn't move a pane off its snap.
const SNAP_DISTANCE = 2

// The top pane of the stack's share of its height, on every screen.
const TOP_SIZE = 55

/** A tall pane beside a stacked pair, each one resizable. Phones stack all three. */
export function Workspace() {
  const isMobile = useIsMobile()
  const orientation = isMobile ? "vertical" : "horizontal"
  const primarySize = isMobile ? 34 : 44
  // Layouts are saved per orientation, so resizing the stack on a phone
  // leaves the columns on a wider screen alone.
  const outer = useSplit(
    `workspace-${orientation}`,
    ["primary", "stack"],
    primarySize
  )
  const inner = useSplit(
    `workspace-${orientation}-stack`,
    ["top", "bottom"],
    TOP_SIZE
  )

  return (
    // A saved layout only applies on mount, so remount on orientation change.
    <ResizablePanelGroup key={orientation} orientation={orientation} {...outer}>
      <ResizablePanel
        id="primary"
        defaultSize={`${primarySize}%`}
        minSize={isMobile ? 96 : 280}
        className={paneClassName}
      >
        <ProblemPane problem={problem} />
      </ResizablePanel>
      <WorkspaceHandle />
      {/* Holds both stacked panes, so its minimum covers theirs. */}
      <ResizablePanel id="stack" minSize={isMobile ? 200 : 320}>
        <ResizablePanelGroup orientation="vertical" {...inner}>
          <ResizablePanel
            id="top"
            defaultSize={`${TOP_SIZE}%`}
            minSize={96}
            className={paneClassName}
          >
            <CodeEditor problemId={problem.id} teacher="Ms. Patel" />
          </ResizablePanel>
          <WorkspaceHandle />
          <ResizablePanel id="bottom" minSize={96} className={paneClassName}>
            <TestsPane problem={problem} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

/** Props for a group of two panels that saves its layout under `id` and snaps
    the first panel to `size`, its starting percentage, when a resize lands
    near it. */
function useSplit(id: string, [first, second]: [string, string], size: number) {
  const groupRef = useGroupRef()
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id })

  // Runs on every step of a drag, before the browser paints it, so a pane
  // stays put on its snap until the pointer moves far enough to pull it off.
  function onLayoutChange(layout: Layout) {
    const distance = Math.abs(layout[first] - size)
    if (distance > 0 && distance < SNAP_DISTANCE) {
      groupRef.current?.setLayout({ [first]: size, [second]: 100 - size })
    }
  }

  return { groupRef, defaultLayout, onLayoutChange, onLayoutChanged }
}

/** On phones a hairline with a grip. On wider screens the gap between two
    cards, where the grip shows on hover or while dragging. */
function WorkspaceHandle() {
  return (
    <ResizableHandle
      withHandle
      className={cn(
        "md:w-2 md:bg-transparent md:aria-[orientation=horizontal]:h-2",
        "md:[&>div]:bg-sidebar-foreground/40 md:[&>div]:opacity-0 md:[&>div]:transition-opacity md:hover:[&>div]:opacity-100 md:focus-visible:[&>div]:opacity-100 md:data-[separator=active]:[&>div]:opacity-100"
      )}
    />
  )
}
