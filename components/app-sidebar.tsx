
"use client"
import { CheckSquare, Home, Users, UserCheck, BarChart3, Plus, Archive, Sparkles, Building2 , ClipboardList,FolderKanban,Search, UserPlus, Package  } from "lucide-react"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query";


// Define the UserSession interface
interface UserSession {
  id: string
  username: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

// Define props interface for AppSidebar
interface AppSidebarProps {
  user: UserSession
}

// Menu items with permissions, colors, and descriptions
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    color: "text-primary",
    bgColor: "bg-accent/30",
    description: "Overview & Analytics",
    permission: "dashboard",
  },
  {
    title: "Company Info",
    url: "/dashboard/company_information",
    icon: Building2, // Make sure to import Building2 from lucide-react
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    description: "Company Details",
    permission: "company_information.manage",
  },
  {
  title: "Projects",
  url: "/dashboard/projects",
  icon: FolderKanban,
  color: "text-rose-600",
  bgColor: "bg-rose-100",
  description: "Project Management",
  permission: "projects.manage",
  },
  {
  title: "Project Search",
  url: "/dashboard/project_Search",
  icon: Search, 
  color: "text-secondary",
  bgColor: "bg-secondary/15",
  description: "Search and filter projects",
  permission: "projects.view", 
},
  {
    title: "Create Task",
    url: "/dashboard/tasks/create",
    icon: Plus,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    description: "Add New Tasks",
    permission: "tasks.create",
  },
  {
    title: "Task Assignment",
    url: "/dashboard/tasks/assign",
    icon: UserCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Approve & Assign",
    permission: "tasks.assign",
  },
    {
    title: "Developer Tasks",
    url: "/dashboard/tasks/developer_working",
    icon: ClipboardList,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    description: "My Assigned Tasks",
    permission: "tasks.developer_working",
  },
  {
    title: "All Tasks",
    url: "/dashboard/tasks/all",
    icon: CheckSquare,
    color: "text-secondary",
    bgColor: "bg-secondary/15",
    description: "Manage Status",
    permission: "tasks.complete",
  },
  {
    title: "Unpost Tasks",
    url: "/dashboard/tasks/unpost",
    icon: Archive,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Archive & Review",
    permission: "tasks.manage", // Assuming unpost tasks require manage permission
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    description: "Team Management",
    permission: "users.manage",
  },
  {
    title: "Registrations",
    url: "/dashboard/registrations",
    icon: UserPlus,
    color: "text-lime-600",
    bgColor: "bg-lime-100",
    description: "Approve New Signups",
    permission: "registrations.manage",
  },
  {
    title: "Software Types",
    url: "/dashboard/software-types",
    icon: Package,
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-100",
    description: "Manage Product Catalog",
    permission: "software-types.manage",
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    description: "Analytics & Insights",
    permission: "reports.view",
  },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { setOpenMobile, isMobile } = useSidebar() // Get mobile state from context

  // Filter items based on user permissions.
  // "registrations.manage" and "software-types.manage" are also granted to
  // anyone who already has "users.manage" so existing admin roles see the
  // new pages immediately without requiring a role reconfiguration.
  const filteredItems = items.filter((item) => {
    if (user.role.permissions.includes(item.permission)) return true
    if (item.permission === "registrations.manage" || item.permission === "software-types.manage") {
      return user.role.permissions.includes("users.manage")
    }
    return false
  })

  // Function to handle navigation.
  // Requirement No. 3: the sidebar must only collapse/expand when the
  // user explicitly clicks the toggle icon. On desktop, navigating
  // between pages must NOT auto-close the sidebar — its expand/collapse
  // state stays exactly as the user left it (persisted via the
  // sidebar_state cookie in components/ui/sidebar.tsx). On mobile, the
  // sidebar is an overlay drawer, so it still auto-closes after a link
  // is tapped since leaving it open would block the page content.
  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false) // Close the mobile overlay drawer after navigating
    }
    // Desktop: intentionally do nothing — toggle button is the only
    // thing allowed to change the desktop sidebar's open/closed state.
  }

  return (
    // <Sidebar className="border-r border-sidebar-border bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-sm">
      <Sidebar className="border-r border-[#114A9B]/20 bg-gradient-to-b from-[#11519B] to-[#114A9B] backdrop-blur-sm">
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-md text-sidebar-foreground">
              PowerSoft360
            </h2>
            <p className="text-xs text-sidebar-foreground/70">Activity Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-1">
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/55 mb-4 px-2"> */}
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/55 mb-2 px-1">

            NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredItems.map((item) => {
                const isActive = pathname === item.url
                const isHovered = hoveredItem === item.title

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        group relative overflow-hidden rounded-xl transition-all-smooth h-auto p-0
                        ${
                          isActive
                            ? "bg-sidebar-primary border border-sidebar-primary/60 shadow-sm"
                            : "hover:bg-sidebar-accent/60 hover:shadow-sm"
                        }
                      `}
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link 
                        href={item.url} 
                        className="flex items-center gap-3 p-2.5 w-full"
                        onClick={handleNavigation} // Close sidebar on mobile
                      >
                        <div
                          className={`
                          w-9 h-9 rounded-lg flex items-center justify-center transition-all-smooth
                          ${
                            isActive
                              ? `${item.bgColor} ${item.color} shadow-sm scale-105`
                              : `${isHovered ? item.bgColor : "bg-sidebar-foreground/10"} ${isHovered ? item.color : "text-sidebar-foreground/75"}`
                          }
                        `}
                        >
                          <item.icon
                            className={`w-5 h-5 transition-all-smooth ${isActive || isHovered ? "scale-110" : ""}`}
                          />
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <span
                            className={`
                            font-medium text-sm transition-all-smooth truncate
                            ${isActive ? "text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"}
                          `}
                          >
                            {item.title}
                          </span>
                          <span
                            className={`
                            text-xs transition-all-smooth truncate
                            ${isActive ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/65 group-hover:text-sidebar-accent-foreground/80"}
                          `}
                          >
                            {item.description}
                          </span>
                        </div>

                        {isActive && <div className="w-1 h-8 bg-sidebar-primary-foreground rounded-full animate-scale-in" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}