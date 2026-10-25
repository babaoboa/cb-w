import { Slash } from "@keyline-icons/react"

import { AppSidebar } from "@/components/app-sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Workspace } from "@/components/workspace"

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
          {/* The toggle lives in the sidebar on wider screens. Phones still
              need this one to open the drawer. */}
          <header className="flex h-12 shrink-0 items-center gap-2 px-3 md:h-10 md:px-0">
            <SidebarTrigger className="md:hidden" />
            <Separator
              orientation="vertical"
              className="mr-1 md:hidden data-vertical:h-4 data-vertical:self-center"
            />
            {/* Set in the switcher's weight, so the two read as one size. */}
            {/* The class code leads as a chip, so it needs no separator after
                it. Long lesson titles truncate rather than wrap the bar. */}
            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap gap-2 font-medium md:text-sidebar-foreground/60">
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <Badge
                    variant="outline"
                    render={<BreadcrumbLink href="#" />}
                    className="rounded-sm bg-muted px-1.5 font-mono tracking-wide text-muted-foreground hover:text-foreground md:border-sidebar-border md:bg-sidebar-accent md:text-sidebar-foreground/80 md:hover:text-sidebar-foreground"
                  >
                    ICS3U
                  </Badge>
                </BreadcrumbItem>
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink
                    href="#"
                    className="whitespace-nowrap md:hover:text-sidebar-foreground"
                  >
                    Unit 3 · Graphs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline-flex md:text-sidebar-foreground/30">
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate font-medium md:text-sidebar-foreground">
                    Lesson 4: Breadth-first search
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <SidebarInset className="min-h-0 bg-transparent">
            <Workspace />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
