"use client"

import * as React from "react"
import {
  IconBuildingCommunity,
  IconCalendarEvent,
  IconChartBar,
  IconClipboardList,
  IconCreditCard,
  IconDashboard,
  IconHelp,
  IconLogout,
  IconSearch,
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
  { title: "Settings", url: "#", icon: IconSettings },
  { title: "Get Help", url: "#", icon: IconHelp },
  { title: "Search", url: "#", icon: IconSearch },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuthStore()

  const navItems = user?.role ? navItemsByRole[user.role] : navItemsByRole.receptionist

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
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                  DS
                </div>
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
