// components/notifications/NotificationBell.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  CheckCheck,
  Loader2,
  ExternalLink,
  Inbox,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications, type AppNotification } from "@/hooks/useNotifications"
import { cn } from "@/lib/utils"

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-slate-400",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  critical: "bg-red-500",
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications({ limit: 8 })

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) fetchNotifications({ page: 1, limit: 8 })
  }

  const handleClick = async (notification: AppNotification) => {
    if (!notification.isRead) await markAsRead(notification._id)
    setOpen(false)
    if (notification.actionUrl) router.push(notification.actionUrl)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hidden sm:flex gap-2 hover:bg-accent/50 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="hidden md:inline">Notifications</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-[10px] leading-none"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 animate-scale-in">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-4">
              <Inbox className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, idx) => (
                <div key={notification._id}>
                  <button
                    type="button"
                    onClick={() => handleClick(notification)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 flex gap-2.5 hover:bg-accent/50 transition-colors",
                      !notification.isRead && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        PRIORITY_DOT[notification.priority] || "bg-slate-400",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-snug", !notification.isRead && "font-semibold")}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                          {notification.module}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </button>
                  {idx < notifications.length - 1 && <Separator className="opacity-60" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            router.push("/dashboard/notifications")
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-primary hover:bg-accent/50 transition-colors"
        >
          View all notifications
          <ExternalLink className="h-3 w-3" />
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
