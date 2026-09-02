// app/dashboard/notifications/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCheck, Loader2, Search, Trash2, Inbox } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNotifications, type AppNotification } from "@/hooks/useNotifications"
import { cn } from "@/lib/utils"

const MODULES = [
  { value: "all", label: "All Modules" },
  { value: "tasks", label: "Tasks" },
  { value: "complaints", label: "Complaints" },
  { value: "users", label: "Users" },
  { value: "registrations", label: "Registrations" },
  { value: "company_information", label: "Company Information" },
  { value: "projects", label: "Projects" },
  { value: "announcements", label: "Announcements" },
]

const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-slate-100 text-foreground/80 border-slate-200",
  medium: "bg-accent/30 text-primary border-primary/25",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  critical: "bg-red-100 text-red-700 border-red-200",
}

export default function NotificationsPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")
  const {
    notifications,
    unreadCount,
    isLoading,
    pagination,
    filters,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications({ limit: 20, status: "all", module: "all", priority: "all" })

  const applyFilter = (patch: Partial<typeof filters>) => {
    fetchNotifications({ ...patch, page: 1 })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilter({ search: searchInput })
  }

  const handleOpen = async (notification: AppNotification) => {
    if (!notification.isRead) await markAsRead(notification._id)
    if (notification.actionUrl) router.push(notification.actionUrl)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllAsRead()}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Filter by module, status, priority, or search history</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <Select value={filters.module || "all"} onValueChange={(v) => applyFilter({ module: v })}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(v) => applyFilter({ status: v as any })}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority || "all"} onValueChange={(v) => applyFilter({ priority: v })}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications match your filters</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, idx) => (
                <div key={notification._id}>
                  <div
                    className={cn(
                      "flex items-start gap-3 px-4 py-3.5 hover:bg-accent/40 transition-colors",
                      !notification.isRead && "bg-primary/5",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpen(notification)}
                      className="flex-1 min-w-0 text-left flex items-start gap-3"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          !notification.isRead ? "bg-primary" : "bg-transparent",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={cn("text-sm", !notification.isRead && "font-semibold")}>
                            {notification.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0 h-4 capitalize border", PRIORITY_BADGE[notification.priority])}
                          >
                            {notification.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                            {notification.module}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          {notification.sender?.name && (
                            <span className="text-xs text-muted-foreground">
                              from {notification.sender.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeNotification(notification._id)}
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {idx < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchNotifications({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchNotifications({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
