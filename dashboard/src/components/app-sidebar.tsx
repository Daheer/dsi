"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import {
  IconBuildingCommunity,
  IconCalendarEvent,
  IconChartBar,
  IconClipboardList,
  IconCreditCard,
  IconDashboard,
  IconSettings,
  IconToolsKitchen2,
  IconUsers,
  IconUserCircle,
  IconFileText,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/auth-store"
import type { UserRole } from "@/types"

// Navigation items by role
const navItemsByRole: Record<UserRole, Array<{ title: string; url: string; icon: React.ComponentType<{ className?: string }> }>> = {
  admin: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Bookings", url: "/dashboard/bookings", icon: IconCalendarEvent },
    { title: "Rooms", url: "/dashboard/rooms", icon: IconBuildingCommunity },
    { title: "Guests", url: "/dashboard/guests", icon: IconUserCircle },
    { title: "Staff", url: "/dashboard/staff", icon: IconUsers },
    { title: "Payments", url: "/dashboard/payments", icon: IconCreditCard },
    { title: "Housekeeping", url: "/dashboard/housekeeping", icon: IconClipboardList },
    { title: "Kitchen", url: "/dashboard/kitchen", icon: IconToolsKitchen2 },
    { title: "Reports", url: "/dashboard/reports", icon: IconChartBar },
    { title: "Audit Logs", url: "/dashboard/audit", icon: IconFileText },
  ],
  manager: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Bookings", url: "/dashboard/bookings", icon: IconCalendarEvent },
    { title: "Rooms", url: "/dashboard/rooms", icon: IconBuildingCommunity },
    { title: "Staff", url: "/dashboard/staff", icon: IconUsers },
    { title: "Payments", url: "/dashboard/payments", icon: IconCreditCard },
    { title: "Reports", url: "/dashboard/reports", icon: IconChartBar },
  ],
  receptionist: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Bookings", url: "/dashboard/bookings", icon: IconCalendarEvent },
    { title: "Guests", url: "/dashboard/guests", icon: IconUserCircle },
    { title: "Rooms", url: "/dashboard/rooms", icon: IconBuildingCommunity },
    { title: "Payments", url: "/dashboard/payments", icon: IconCreditCard },
  ],
  housekeeping: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "My Tasks", url: "/dashboard/housekeeping", icon: IconClipboardList },
  ],
  kitchen: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Orders", url: "/dashboard/kitchen", icon: IconToolsKitchen2 },
  ],
  auditor: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Audit Logs", url: "/dashboard/audit", icon: IconFileText },
    { title: "Reports", url: "/dashboard/reports", icon: IconChartBar },
  ],
}

const navSecondary = [
  { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuthStore()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = user?.role ? navItemsByRole[user.role] : navItemsByRole.receptionist

  // Determine the current theme
  const currentTheme = theme === "system" ? systemTheme : theme
  const logoSrc = currentTheme === "dark"
    ? "/images/Dark Mode Transparent.svg"
    : "/images/Light Mode Transparent.svg"

  const userData = {
    name: user?.full_name || "User",
    email: user?.username ? `@${user.username}` : "",
    avatar: "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <a href="/dashboard" className="flex items-center gap-2">
                {mounted && (
                  <Image
                    src={logoSrc}
                    alt="De Signature International"
                    width={120}
                    height={32}
                    className="h-8 w-auto"
                    priority
                  />
                )}
                <span className="text-base font-semibold">De Signature</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
