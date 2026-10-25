import { cn } from "cn"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"

/** Tabs along the top of a workspace pane. They sit on the pane without a
    track, so the current one is a muted pill with no raised shadow. */
export function PaneTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn("gap-1 bg-transparent p-0", className)}
      {...props}
    />
  )
}

export function PaneTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "flex-none px-2 data-active:bg-muted group-data-[variant=default]/tabs-list:data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-muted",
        className
      )}
      {...props}
    />
  )
}
