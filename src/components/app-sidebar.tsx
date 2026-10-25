import {
  Bell,
  BookOpen,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CodeXml,
  Folder,
  Home,
  Inbox,
  LogOut,
  Puzzle,
  Search,
  Settings,
  Users,
} from "@keyline-icons/react"
import { cn } from "cn"
import { useCallback, useEffect, useRef, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Placeholder content until the classroom API exists.
const data = {
  organizations: [
    { id: "colonel-by", name: "Colonel By", color: "bg-sidebar-primary" },
    { id: "personal", name: "Personal", color: "bg-violet-500" },
  ],
  users: [
    {
      id: "maya",
      name: "Maya Chen",
      initials: "MC",
      color: "bg-blue-300 text-blue-950",
    },
    {
      id: "sam",
      name: "Sam Rivera",
      initials: "SR",
      color: "bg-emerald-300 text-emerald-950",
    },
  ],
  nav: [
    { title: "Home", url: "#", icon: Home },
    { title: "Inbox", url: "#", icon: Inbox, unread: 2 },
    { title: "Assignments", url: "#", icon: ClipboardCheck, count: 3 },
    { title: "Practice", url: "#", icon: CodeXml },
    { title: "Projects", url: "#", icon: Folder },
  ],
  classes: [
    {
      title: "ICS3U · Period 2",
      code: "3U",
      isOpen: true,
      items: [
        { title: "Lessons", url: "#", icon: BookOpen, isActive: true },
        { title: "Problem sets", url: "#", icon: Puzzle },
        { title: "Classmates", url: "#", icon: Users },
        { title: "Grades", url: "#", icon: ChartColumn },
      ],
    },
    {
      title: "CCC Prep Club",
      code: "CC",
      isOpen: false,
      items: [
        { title: "Lessons", url: "#", icon: BookOpen },
        { title: "Problem sets", url: "#", icon: Puzzle },
        { title: "Members", url: "#", icon: Users },
      ],
    },
  ],
  pinned: [
    { title: "Lesson 4: BFS", url: "#", progress: { done: 3, total: 9 } },
    { title: "Fewest transfers", url: "#", icon: Puzzle },
    { title: "Weather app", url: "#", icon: Folder, live: true },
  ],
}

// True while the sidebar is minimized to its icon rail. The mobile sidebar is
// a sheet that is always shown at full width.
function useIconOnly() {
  const { state, isMobile } = useSidebar()
  return state === "collapsed" && !isMobile
}

// False while the sidebar is still resizing to its current state, which takes
// as long as its width transition (250ms, set in ui/sidebar.tsx).
function useSidebarSettled() {
  const { state } = useSidebar()
  const [settledState, setSettledState] = useState(state)

  useEffect(() => {
    const timeout = setTimeout(() => setSettledState(state), 250)
    return () => clearTimeout(timeout)
  }, [state])

  return settledState === state
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const radius = 5.5
  const circumference = 2 * Math.PI * radius

  return (
    <svg viewBox="0 0 16 16" fill="none" strokeWidth={2.5} aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r={radius}
        className="stroke-sidebar-foreground/15"
      />
      <circle
        cx="8"
        cy="8"
        r={radius}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - done / total)}
        transform="rotate(-90 8 8)"
        className="stroke-sidebar-primary"
      />
    </svg>
  )
}

function UnreadDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1 right-1 size-2 rounded-full bg-sidebar-primary ring-2 ring-sidebar",
        className
      )}
    />
  )
}

function OrganizationLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg",
        className
      )}
    >
      <span className="size-[43%] rounded-[25%] bg-neutral-950" />
    </span>
  )
}

// The switchers' menus hang from their whole bar rather than the button, so
// they line up with the rows below on both sides. The icon rail's bar is only
// as wide as a button, so there they keep a width of their own.
function OrganizationSwitcher({
  anchor,
}: {
  anchor: React.RefObject<HTMLElement | null>
}) {
  const iconOnly = useIconOnly()
  const [activeId, setActiveId] = useState(data.organizations[0].id)
  const active =
    data.organizations.find((organization) => organization.id === activeId) ??
    data.organizations[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<SidebarMenuButton size="lg" className="h-10" />}
      >
        <OrganizationLogo
          className={cn(
            "size-7 transition-[opacity,scale] duration-150 ease-out group-data-[collapsible=icon]:ml-0.5 group-data-[collapsible=icon]:group-has-[[data-sidebar=trigger]:focus-visible]/org:scale-75 group-data-[collapsible=icon]:group-has-[[data-sidebar=trigger]:focus-visible]/org:opacity-0 group-data-[collapsible=icon]:group-data-settled/org:group-hover/org:scale-75 group-data-[collapsible=icon]:group-data-settled/org:group-hover/org:opacity-0 motion-reduce:transition-none",
            active.color
          )}
        />
        <span className="truncate font-medium">{active.name}</span>
        <ChevronDown className="text-sidebar-foreground/60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        anchor={anchor}
        side={iconOnly ? "right" : "bottom"}
        className={cn(iconOnly && "w-56")}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={activeId} onValueChange={setActiveId}>
            {data.organizations.map((organization) => (
              <DropdownMenuRadioItem
                key={organization.id}
                value={organization.id}
                closeOnClick
              >
                <OrganizationLogo
                  className={cn("size-5 rounded-md", organization.color)}
                />
                {organization.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarToggle({ className }: { className: string }) {
  const { isMobile, open, openMobile } = useSidebar()
  const expanded = isMobile ? openMobile : open

  return (
    <Tooltip>
      <TooltipTrigger render={<SidebarTrigger className={className} />} />
      <TooltipContent side="right">
        {expanded ? "Collapse sidebar" : "Expand sidebar"} <Kbd>⌘B</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}

function UserAvatar({
  user,
  className,
  initialsClassName,
}: {
  user: (typeof data.users)[number]
  className?: string
  initialsClassName?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarFallback
        className={cn("text-xs font-semibold", user.color, initialsClassName)}
      >
        {user.initials}
      </AvatarFallback>
    </Avatar>
  )
}

// Laid out like the organization switcher, so the two bars and their menus
// match.
function UserSwitcher({
  anchor,
  onSignOut,
}: {
  anchor: React.RefObject<HTMLElement | null>
  onSignOut: () => void
}) {
  const iconOnly = useIconOnly()
  const [activeId, setActiveId] = useState(data.users[0].id)
  const active =
    data.users.find((user) => user.id === activeId) ?? data.users[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<SidebarMenuButton size="lg" className="h-10" />}
      >
        <UserAvatar
          user={active}
          className="size-7 group-data-[collapsible=icon]:ml-0.5"
        />
        <span className="truncate font-medium">{active.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        anchor={anchor}
        side={iconOnly ? "right" : "top"}
        align={iconOnly ? "end" : "start"}
        className={cn(iconOnly && "w-56")}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Accounts</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={activeId} onValueChange={setActiveId}>
            {data.users.map((user) => (
              <DropdownMenuRadioItem key={user.id} value={user.id} closeOnClick>
                <UserAvatar
                  user={user}
                  className="size-5"
                  initialsClassName="text-[9px]"
                />
                {user.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ⌘K (Ctrl+K off a Mac) jumps to the search field. The icon rail has no room
// to type, so there the field narrows to its icon, under a button that
// expands the sidebar first.
function SidebarSearch() {
  const { isMobile, setOpen, setOpenMobile } = useSidebar()
  const iconOnly = useIconOnly()
  const inputRef = useRef<HTMLInputElement>(null)

  const focusSearch = useCallback(() => {
    if (isMobile) {
      setOpenMobile(true)
    } else {
      setOpen(true)
    }
    // The field stays inert until the sidebar has re-rendered expanded.
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [isMobile, setOpen, setOpenMobile])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        focusSearch()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [focusSearch])

  // The field's own icon sits exactly where a rail button's icon would, so
  // collapsing only shrinks the box around it and fades its outline away.
  return (
    <form
      role="search"
      className="group/search relative"
      onSubmit={(event) => event.preventDefault()}
    >
      <SidebarMenuButton
        tooltip="Search"
        onClick={focusSearch}
        className="absolute inset-0 hidden group-data-[collapsible=icon]:flex"
      >
        <span className="sr-only">Search</span>
      </SidebarMenuButton>
      <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-sidebar-foreground/60" />
      {/* In the rail the side padding leaves no room for text, so the
          placeholder is clipped away as the field narrows. */}
      <SidebarInput
        ref={inputRef}
        type="search"
        aria-label="Search"
        placeholder="Search"
        inert={iconOnly}
        className="border-sidebar-border bg-sidebar-accent/50 pr-11 pl-8 text-sidebar-foreground transition-[color,background-color,border-color,padding] duration-250 ease-in-out group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:pr-0 group-data-[collapsible=icon]:pl-[calc(--spacing(8)-2px)] placeholder:text-sidebar-foreground/60 focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring/50 dark:bg-sidebar-accent/50 dark:group-data-[collapsible=icon]:bg-transparent [&::-webkit-search-cancel-button]:appearance-none"
      />
      <Kbd className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 bg-sidebar-accent text-sidebar-foreground/60 transition-opacity duration-150 ease-out group-data-[collapsible=icon]:opacity-0">
        ⌘K
      </Kbd>
    </form>
  )
}

// A titled group that can be folded away. The icon rail has no titles to
// click, so it always shows the group's items.
function SidebarSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const iconOnly = useIconOnly()
  const [open, setOpen] = useState(true)

  return (
    <Collapsible
      open={open || iconOnly}
      onOpenChange={setOpen}
      className="group/section group-data-[collapsible=icon]:pt-0"
      render={<SidebarGroup />}
    >
      <SidebarSeparator className="mb-2 hidden group-data-[collapsible=icon]:block" />
      <SidebarGroupLabel
        render={<CollapsibleTrigger />}
        className="gap-1 transition-[margin,opacity,scale] group-data-[collapsible=icon]:pointer-events-none hover:text-sidebar-foreground active:scale-[0.97]"
      >
        {title}
        <ChevronDown className="size-3.5! transition-transform duration-200 ease-out group-data-closed/section:-rotate-90" />
      </SidebarGroupLabel>
      <CollapsibleContent>
        <SidebarGroupContent>
          <SidebarMenu>{children}</SidebarMenu>
        </SidebarGroupContent>
      </CollapsibleContent>
    </Collapsible>
  )
}

// Black on white, and gray like the icons unless the current page is in it.
function ClassBadge({ code, current }: { code: string; current: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[5px] bg-sidebar-foreground/60 text-[9px] font-bold text-sidebar group-data-[collapsible=icon]:size-5",
        current && "bg-sidebar-foreground"
      )}
    >
      {code}
    </span>
  )
}

// Expands in place in the full sidebar. In the icon rail there is no room for
// the pages, so they open in a menu beside it instead.
function ClassMenuItem({ item }: { item: (typeof data.classes)[number] }) {
  const iconOnly = useIconOnly()
  const current = item.items.some((page) => page.isActive)

  if (iconOnly) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                isActive={current}
                className="group-data-[collapsible=icon]:p-1.5!"
              />
            }
          >
            <ClassBadge code={item.code} current={current} />
            <span>{item.title}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
              {item.items.map((page) => (
                <DropdownMenuItem
                  key={page.title}
                  render={<a href={page.url} />}
                >
                  <page.icon />
                  {page.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      defaultOpen={item.isOpen}
      className="group/class"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger render={<SidebarMenuButton />}>
        <ClassBadge code={item.code} current={current} />
        <span className="truncate">{item.title}</span>
        <ChevronRight className="ml-auto text-sidebar-foreground/60 transition-transform duration-200 ease-out group-data-open/class:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="mx-0 translate-x-0 gap-0.5 border-none px-0 py-0.5">
          {item.items.map((page) => (
            <SidebarMenuSubItem key={page.title}>
              <SidebarMenuSubButton
                href={page.url}
                isActive={page.isActive}
                className="h-8 translate-x-0 pl-8 data-active:font-medium data-active:inset-ring data-active:inset-ring-sidebar-border"
              >
                <page.icon />
                <span>{page.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function AppSidebar({
  onSignOut,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onSignOut: () => void
}) {
  const settled = useSidebarSettled()
  const organizationBarRef = useRef<HTMLUListElement>(null)
  const accountBarRef = useRef<HTMLUListElement>(null)

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      {/* No top padding, so the switcher lines up with the page's header bar. */}
      <SidebarHeader className="pt-0">
        {/* While the sidebar collapses, its shrinking edge passes under a
            pointer left anywhere on the bar, so the bar only counts as
            hovered once the sidebar has settled. Nothing on the bar scales
            while it resizes either: the toggle only fades as it slides, so
            the only scaling left is the hover swap and the press. */}
        <SidebarMenu
          ref={organizationBarRef}
          data-settled={settled || undefined}
          className="group/org h-10 justify-center"
        >
          {/* One toggle, pinned to the end of the bar, so it rides the
              shrinking edge and lands on the logo as the sidebar collapses.
              The icon rail has no room for it beside the logo, so there it
              hides on top of it and hovering the bar swaps the logo for it.
              It stays clickable while invisible, but the pointer can only
              reach it by hovering the bar, which reveals it. */}
          <SidebarMenuItem className="flex items-center pr-9 transition-[padding] duration-250 ease-in-out group-data-[collapsible=icon]:pr-0">
            <OrganizationSwitcher anchor={organizationBarRef} />
            <SidebarToggle className="absolute inset-y-0 right-0 my-auto size-8 text-sidebar-foreground/60 transition-[opacity,background-color] duration-150 ease-out group-data-settled/org:transition-[opacity,scale,background-color] group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-data-settled/org:scale-75 group-data-[collapsible=icon]:group-data-settled/org:bg-sidebar-accent group-data-[collapsible=icon]:group-data-settled/org:group-hover/org:scale-100 group-data-[collapsible=icon]:group-data-settled/org:group-hover/org:opacity-100 hover:bg-sidebar-accent hover:text-sidebar-foreground/60 group-data-[collapsible=icon]:focus-visible:scale-100 group-data-[collapsible=icon]:focus-visible:opacity-100 active:scale-[0.97]! motion-reduce:transition-none! dark:hover:bg-sidebar-accent" />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSearch />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* Badges sit inside their buttons so they press in with them. */}
            {data.nav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  render={<a href={item.url} />}
                  className="relative"
                >
                  <item.icon />
                  <span className="truncate">{item.title}</span>
                  {item.unread ? (
                    <>
                      <SidebarMenuBadge className="top-1.5 bg-sidebar-primary text-sidebar-primary-foreground">
                        {item.unread}
                      </SidebarMenuBadge>
                      <UnreadDot className="hidden group-data-[collapsible=icon]:block" />
                    </>
                  ) : null}
                  {item.count ? (
                    <SidebarMenuBadge className="top-1.5 bg-sidebar-foreground/10 text-sidebar-foreground/70">
                      {item.count}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSection title="Classes">
          {data.classes.map((item) => (
            <ClassMenuItem key={item.title} item={item} />
          ))}
        </SidebarSection>
        <SidebarSection title="Pinned">
          {data.pinned.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={<a href={item.url} />}
                className="relative"
              >
                {item.progress ? (
                  <ProgressRing {...item.progress} />
                ) : (
                  item.icon && <item.icon />
                )}
                <span className="truncate">{item.title}</span>
                {item.progress && (
                  <SidebarMenuBadge className="top-1.5 bg-sidebar-foreground/10 text-sidebar-foreground/70">
                    {item.progress.done}/{item.progress.total}
                  </SidebarMenuBadge>
                )}
                {item.live && (
                  <SidebarMenuBadge className="top-1.5 gap-1.5 text-sidebar-foreground/70">
                    <span className="size-2 rounded-full bg-green-500" />
                    Live
                  </SidebarMenuBadge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarSection>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" render={<a href="#" />}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0 transition-[margin] duration-250 ease-in-out group-data-[collapsible=icon]:mx-2" />
        {/* A row in the full sidebar, a column in the icon rail. The
            notifications button is pinned to the bar's corner so it can
            slide between the two: in the row it sits after the account, and
            in the column it stacks above it, a button plus the menu gap
            (2.125rem) higher. */}
        <SidebarMenu
          ref={accountBarRef}
          className="relative h-10 justify-end pr-9 transition-[height,padding] duration-250 ease-in-out group-data-[collapsible=icon]:h-16.5 group-data-[collapsible=icon]:pr-0"
        >
          <SidebarMenuItem>
            <UserSwitcher anchor={accountBarRef} onSignOut={onSignOut} />
          </SidebarMenuItem>
          <SidebarMenuItem className="absolute right-0 bottom-1 transition-[bottom] duration-250 ease-in-out group-data-[collapsible=icon]:bottom-8.5">
            <SidebarMenuButton
              tooltip="Notifications"
              aria-label="Notifications"
              className="relative size-8"
            >
              <Bell />
              <UnreadDot className="top-1.5 right-1.5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
