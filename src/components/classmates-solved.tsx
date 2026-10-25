import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"

export interface Classmate {
  id: string
  name: string
  initials: string
  /** Background and text classes for the avatar. */
  color: string
}

/** How many classmates have solved a problem, led by a few of their faces. */
export function ClassmatesSolved({
  classmates,
  total,
}: {
  /** The classmates to show, usually the most recent few. */
  classmates: Classmate[]
  total: number
}) {
  return (
    <div className="flex items-center gap-2">
      <AvatarGroup>
        {classmates.map((classmate) => (
          <Avatar key={classmate.id} size="sm" title={classmate.name}>
            <AvatarFallback
              className={cn("text-[10px] font-semibold", classmate.color)}
            >
              {classmate.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "classmate has" : "classmates have"} solved this
      </p>
    </div>
  )
}
