"use client"

import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { roomsApi, bookingsApi, statsApi } from "@/lib/api"
import type { Room, Booking } from "@/types"
import type { DashboardStats } from "@/lib/api/endpoints"

export function SectionCards() {
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, bookingsData, statsData] = await Promise.all([
          roomsApi.list(),
          bookingsApi.list({ limit: 100 }),
          statsApi.getDashboard(),
        ])
        setRooms(roomsData)
        setBookings(bookingsData.items)
        setDashboardStats(statsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate room metrics (still client-side as they depend on room status)
  const totalRooms = rooms.length
  const availableRooms = rooms.filter((r) => r.status === "available").length

  // Use backend-calculated stats for bookings and revenue
  const activeBookings = dashboardStats?.active_bookings ?? 0
  const pendingBookings = dashboardStats?.pending_bookings ?? 0
  const revenueToday = dashboardStats?.revenue_today ?? 0
  const occupancyRate = totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0

  // Calculate today's check-ins/check-outs from bookings (for informational display)
  const today = new Date().toISOString().split("T")[0]
  const todaysCheckins = bookings.filter(
    (b) => b.check_in_date === today && (b.status === "reserved" || b.status === "confirmed")
  ).length
  const todaysCheckouts = bookings.filter(
    (b) => b.check_out_date === today && b.status === "checked_in"
  ).length

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Occupancy Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {occupancyRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {activeBookings}/{totalRooms} Rooms
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {availableRooms} rooms available
          </div>
          <div className="text-muted-foreground">
            {activeBookings} guests checked in
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today&apos;s Check-ins</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {todaysCheckins}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              Arriving
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Guests arriving today
          </div>
          <div className="text-muted-foreground">
            Ready for check-in
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today&apos;s Check-outs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {todaysCheckouts}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              Departing
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Guests departing today
          </div>
          <div className="text-muted-foreground">
            Pending checkout
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today&apos;s Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₦{revenueToday.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              +{pendingBookings} pending
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Paid bookings today
          </div>
          <div className="text-muted-foreground">
            From confirmed payments
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
