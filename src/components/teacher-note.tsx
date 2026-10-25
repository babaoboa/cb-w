import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/** A teacher's tip at the top of a problem. Its text is highlighted, so it
    reads like a line marked up on a printed sheet. */
export function TeacherNote({
  from,
  initials,
  children,
}: {
  from: string
  initials: string
  children: React.ReactNode
}) {
  return (
    <aside className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Avatar className="size-5">
          <AvatarFallback className="bg-violet-300 text-[9px] font-semibold text-violet-950">
            {initials}
          </AvatarFallback>
        </Avatar>
        Note from {from}
      </div>
      {children}
    </aside>
  )
}

/** The marker over a note's text. Wraps line by line, like a real one. */
export function TeacherNoteHighlight({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <mark className="rounded-sm bg-warning/30 box-decoration-clone px-1 py-0.5 text-foreground dark:bg-warning/25">
      {children}
    </mark>
  )
}
