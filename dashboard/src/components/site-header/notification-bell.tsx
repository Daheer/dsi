"use client"

import { useState, useEffect } from "react"
import { Bell, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import { notificationsApi } from "@/lib/api"
import type { Notification as AppNotification, NotificationType } from "@/types"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// Icon mapping helper
const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0" }

    switch (type) {
        case "info":
            return <Info {...iconProps} className={cn(iconProps.className, "text-blue-500")} />
        case "warning":
            return <AlertTriangle {...iconProps} className={cn(iconProps.className, "text-yellow-500")} />
        case "error":
            return <XCircle {...iconProps} className={cn(iconProps.className, "text-red-500")} />
        case "success":
            return <CheckCircle {...iconProps} className={cn(iconProps.className, "text-green-500")} />
        default:
            return <Info {...iconProps} className={cn(iconProps.className, "text-gray-500")} />
    }
}

// Background color helper
const getNotificationBg = (type: NotificationType) => {
    switch (type) {
        case "info":
            return "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30"
        case "warning":
            return "bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30"
        case "error":
            return "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
        case "success":
            return "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30"
        default:
            return "bg-gray-50 dark:bg-gray-950/20 hover:bg-gray-100 dark:hover:bg-gray-950/30"
    }
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [readingId, setReadingId] = useState<string | null>(null)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const data = await notificationsApi.list({ unread_only: true, limit: 10 })
            setNotifications(data)
            setUnreadCount(data.filter((n: AppNotification) => !n.is_read).length)
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()

        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000)

        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            setReadingId(notificationId)
            await notificationsApi.markAsRead(notificationId)

            // Update local state - remove from list
            setNotifications(notifications.filter(n => n.id !== notificationId))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        } finally {
            setReadingId(null)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllRead()
            setNotifications([])
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs"
                            variant="destructive"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">No new notifications</p>
                        <p className="text-xs text-muted-foreground">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-3 p-4 cursor-pointer transition-opacity",
                                    getNotificationBg(notification.type),
                                    readingId === notification.id && "opacity-50"
                                )}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                {/* Icon */}
                                <div className="mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-1 min-w-0">
                                    <p className="text-sm font-semibold leading-tight">
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Unread indicator */}
                                {!notification.is_read && (
                                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
