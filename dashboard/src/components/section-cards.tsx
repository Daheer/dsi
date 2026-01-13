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
import { roomsApi, bookingsApi, paymentsApi } from "@/lib/api"
import type { Room, Booking, Payment } from "@/types"

export function SectionCards() {
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, bookingsData, paymentsData] = await Promise.all([
          roomsApi.list(),
          bookingsApi.list({ limit: 100 }), // Get more bookings for stats
          paymentsApi.list(),
        ])
        setRooms(roomsData)
        // bookingsApi.list() now returns paginated response
        setBookings(bookingsData.items)
        setPayments(paymentsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate metrics
  const totalRooms = rooms.length
  const checkedInBookings = bookings.filter((b) => b.status === "checked_in").length
  const availableRooms = rooms.filter((r) => r.status === "available").length
  const occupancyRate = totalRooms > 0 ? Math.round((checkedInBookings / totalRooms) * 100) : 0

  const today = new Date().toISOString().split("T")[0]
  const todaysCheckins = bookings.filter(
    (b) => b.check_in_date === today && b.status === "reserved"
  ).length
  const todaysCheckouts = bookings.filter(
    (b) => b.check_out_date === today && b.status === "checked_in"
  ).length

  const todaysRevenue = payments
    .filter((p) => p.status === "completed" && p.processed_at.startsWith(today))
    .reduce((sum, p) => sum + Number(p.amount), 0)

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
              {checkedInBookings}/{totalRooms} Rooms
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {availableRooms} rooms available
          </div>
          <div className="text-muted-foreground">
            {checkedInBookings} guests checked in
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
            ₦{todaysRevenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              +{payments.filter((p) => p.processed_at.startsWith(today)).length} txns
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Payments received today
          </div>
          <div className="text-muted-foreground">
            All payment methods
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
