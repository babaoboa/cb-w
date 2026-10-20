import { AppSidebar } from "@/components/app-sidebar"
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
            The cards are nested here, out of reach of SidebarInset's
            inset-variant styles, so they set their own rounding and shadow. */}
        <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pr-2">
          {/* The toggle lives in the sidebar on wider screens. Phones still
              need this one to open the drawer. */}
          <header className="flex h-12 shrink-0 items-center gap-2 px-3 md:px-0">
            <SidebarTrigger className="md:hidden" />
            <Separator
              orientation="vertical"
              className="mr-1 md:hidden data-vertical:h-4 data-vertical:self-center"
            />
            <Breadcrumb>
              <BreadcrumbList className="md:text-sidebar-foreground/60">
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink
                    href="#"
                    className="md:hover:text-sidebar-foreground"
                  >
                    ICS3U · Period 2
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="md:text-sidebar-foreground">
                    Lessons
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
