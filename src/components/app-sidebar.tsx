import {
  BookOpen,
  Box,
  Bell,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  CircleQuestion,
  CodeXml,
  FileText,
  Home,
  Inbox,
  List,
  LogOut,
  Moon,
  Search,
  SlidersHorizontal,
  SquareCheck,
  Sun,
  Users,
} from "@keyline-icons/react"
import { cn } from "cn"
import { useCallback, useEffect, useRef, useState } from "react"

import { useTheme } from "@/components/theme-provider"
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
      detail: "Grade 11 · ICS3U",
      color: "bg-blue-300 text-blue-950",
    },
    {
      id: "sam",
      name: "Sam Rivera",
      initials: "SR",
      detail: "Grade 12 · ICS4U",
      color: "bg-emerald-300 text-emerald-950",
    },
  ],
  nav: [
    { title: "Home", url: "#", icon: Home },
    { title: "Inbox", url: "#", icon: Inbox, unread: 2 },
    { title: "Assignments", url: "#", icon: SquareCheck, count: 3 },
    { title: "Practice", url: "#", icon: CodeXml },
    { title: "Projects", url: "#", icon: Box },
  ],
  classes: [
    {
      title: "ICS3U · Period 2",
      code: "3U",
      color: "bg-blue-600",
      isOpen: true,
      items: [
        { title: "Lessons", url: "#", icon: BookOpen, isActive: true },
        { title: "Problem sets", url: "#", icon: List },
        { title: "Classmates", url: "#", icon: Users },
        { title: "Grades", url: "#", icon: ChartColumn },
      ],
    },
    {
      title: "CCC Prep Club",
      code: "CC",
      color: "bg-amber-700",
      isOpen: false,
      items: [
        { title: "Lessons", url: "#", icon: BookOpen },
        { title: "Problem sets", url: "#", icon: List },
        { title: "Members", url: "#", icon: Users },
      ],
    },
  ],
  pinned: [
    { title: "Lesson 4: BFS", url: "#", progress: { done: 3, total: 9 } },
    { title: "Fewest transfers", url: "#", icon: FileText },
    { title: "Weather app", url: "#", icon: Box, live: true },
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

function OrganizationSwitcher() {
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
        <span className="truncate font-semibold">{active.name}</span>
        <ChevronDown className="text-sidebar-foreground/60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={iconOnly ? "right" : "bottom"}
        className="w-60"
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

function UserSummary({
  user,
  size,
  avatarClassName,
}: {
  user: (typeof data.users)[number]
  size?: "default" | "sm"
  avatarClassName?: string
}) {
  return (
    <>
      <Avatar size={size} className={avatarClassName}>
        <AvatarFallback className={cn("text-xs font-semibold", user.color)}>
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <span className="grid flex-1 text-left leading-tight">
        <span className="truncate text-sm font-medium">{user.name}</span>
        <span className="truncate text-xs opacity-60">{user.detail}</span>
      </span>
    </>
  )
}

function UserSwitcher({ onSignOut }: { onSignOut: () => void }) {
  const iconOnly = useIconOnly()
  const [activeId, setActiveId] = useState(data.users[0].id)
  const active =
    data.users.find((user) => user.id === activeId) ?? data.users[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<SidebarMenuButton size="lg" className="h-10" />}
      >
        <UserSummary
          user={active}
          avatarClassName="size-7 group-data-[collapsible=icon]:ml-0.5"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={iconOnly ? "right" : "top"}
        align={iconOnly ? "end" : "start"}
        className="w-60"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Accounts</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={activeId} onValueChange={setActiveId}>
            {data.users.map((user) => (
              <DropdownMenuRadioItem key={user.id} value={user.id} closeOnClick>
                <UserSummary user={user} size="sm" />
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

function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <SidebarMenuButton
      tooltip="Toggle theme"
      aria-label="Toggle theme"
      className="size-8"
      onClick={() =>
        setTheme(
          document.documentElement.classList.contains("dark") ? "light" : "dark"
        )
      }
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </SidebarMenuButton>
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
      <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-sidebar-foreground/60 transition-colors duration-250 ease-in-out group-data-[collapsible=icon]:text-sidebar-foreground group-data-[collapsible=icon]:group-hover/search:text-sidebar-accent-foreground" />
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

function ClassBadge({ code, color }: { code: string; color: string }) {
  return (
    <span
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[5px] text-[9px] font-bold text-white group-data-[collapsible=icon]:size-5",
        color
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

  if (iconOnly) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                isActive={item.items.some((page) => page.isActive)}
                className="group-data-[collapsible=icon]:p-1.5!"
              />
            }
          >
            <ClassBadge code={item.code} color={item.color} />
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
        <ClassBadge code={item.code} color={item.color} />
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
          data-settled={settled || undefined}
          className="group/org h-12 justify-center"
        >
          {/* One toggle, pinned to the end of the bar, so it rides the
              shrinking edge and lands on the logo as the sidebar collapses.
              The icon rail has no room for it beside the logo, so there it
              hides on top of it and hovering the bar swaps the logo for it.
              It stays clickable while invisible, but the pointer can only
              reach it by hovering the bar, which reveals it. */}
          <SidebarMenuItem className="flex items-center pr-9 transition-[padding] duration-250 ease-in-out group-data-[collapsible=icon]:pr-0">
            <OrganizationSwitcher />
            <SidebarToggle className="absolute inset-y-0 right-0 my-auto size-8 text-sidebar-foreground/60 transition-[opacity,color,background-color] duration-150 ease-out group-data-settled/org:transition-[opacity,scale,color,background-color] group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-data-settled/org:scale-75 group-data-[collapsible=icon]:group-data-settled/org:bg-sidebar-accent group-data-[collapsible=icon]:group-data-settled/org:text-sidebar-accent-foreground group-data-[collapsible=icon]:group-data-settled/org:group-hover/org:scale-100 group-data-[collapsible=icon]:group-data-settled/org:group-hover/org:opacity-100 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:focus-visible:scale-100 group-data-[collapsible=icon]:focus-visible:opacity-100 active:scale-[0.97]! motion-reduce:transition-none! dark:hover:bg-sidebar-accent" />
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
            <SidebarMenuButton
              tooltip="Help and shortcuts"
              render={<a href="#" />}
            >
              <CircleQuestion />
              <span>Help and shortcuts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" render={<a href="#" />}>
              <SlidersHorizontal />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0 transition-[margin] duration-250 ease-in-out group-data-[collapsible=icon]:mx-2" />
        {/* A row in the full sidebar, a column in the icon rail. The theme
            and notification buttons are pinned to the bar's corner so they
            can slide between the two: in the row they sit after the
            account, and in the column they stack above it, each a button
            plus the menu gap (2.125rem) higher than the last. */}
        <SidebarMenu className="pr-18transition-[height,padding] relative h-10 justify-end duration-250 ease-in-out group-data-[collapsible=icon]:h-25 group-data-[collapsible=icon]:pr-0">
          <SidebarMenuItem>
            <UserSwitcher onSignOut={onSignOut} />
          </SidebarMenuItem>
          <SidebarMenuItem className="absolute right-9 bottom-1 transition-[right,bottom] duration-250 ease-in-out group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:bottom-8.5">
            <ThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem className="absolute right-0 bottom-1 transition-[bottom] duration-250 ease-in-out group-data-[collapsible=icon]:bottom-17">
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
