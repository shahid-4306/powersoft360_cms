// hooks/useNotifications.ts
"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface AppNotification {
  _id: string
  title: string
  message: string
  module: string
  type: string
  priority: "low" | "medium" | "high" | "critical"
  referenceId?: string
  actionUrl?: string
  sender?: { id?: string; name?: string; username?: string }
  isRead: boolean
  readAt?: string | null
  createdAt: string
}

export interface NotificationFilters {
  module?: string
  status?: "read" | "unread" | "all"
  priority?: string
  from?: string
  to?: string
  search?: string
  page?: number
  limit?: number
}

export function useNotifications(initialFilters: NotificationFilters = {}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters)
  const eventSourceRef = useRef<EventSource | null>(null)

  const buildQuery = useCallback((f: NotificationFilters) => {
    const params = new URLSearchParams()
    if (f.module && f.module !== "all") params.set("module", f.module)
    if (f.status && f.status !== "all") params.set("status", f.status)
    if (f.priority && f.priority !== "all") params.set("priority", f.priority)
    if (f.from) params.set("from", f.from)
    if (f.to) params.set("to", f.to)
    if (f.search) params.set("search", f.search)
    params.set("page", String(f.page || 1))
    params.set("limit", String(f.limit || 20))
    return params.toString()
  }, [])

  const fetchNotifications = useCallback(
    async (overrides: NotificationFilters = {}) => {
      try {
        setIsLoading(true)
        setError(null)
        const merged = { ...filters, ...overrides }
        const query = buildQuery(merged)
        const res = await fetch(`/api/notifications?${query}`, { credentials: "include" })
        if (!res.ok) throw new Error("Failed to fetch notifications")
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
        setFilters(merged)
      } catch (err: any) {
        setError(err.message || "Failed to fetch notifications")
      } finally {
        setIsLoading(false)
      }
    },
    [filters, buildQuery],
  )

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // silent — unread count is best-effort
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
      if (!res.ok) return
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch {
      // no-op — non-critical UI action
    }
  }, [])

  const markAllAsRead = useCallback(async (module?: string) => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module }),
      })
      if (!res.ok) return
      setNotifications((prev) =>
        prev.map((n) => (!module || n.module === module ? { ...n, isRead: true } : n)),
      )
      setUnreadCount(0)
    } catch {
      // no-op
    }
  }, [])

  const removeNotification = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) return
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch {
      // no-op
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Real-time updates via SSE
  useEffect(() => {
    const es = new EventSource("/api/notifications/stream")
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        if (typeof parsed?.unreadCount === "number" && !parsed?._id) {
          setUnreadCount(parsed.unreadCount)
          return
        }
        if (parsed?._id) {
          setNotifications((prev) => {
            if (prev.some((n) => n._id === parsed._id)) return prev
            return [parsed, ...prev].slice(0, 50)
          })
          setUnreadCount((prev) => prev + 1)
        }
      } catch {
        // ignore heartbeat / malformed chunks
      }
    }

    es.onerror = () => {
      // EventSource auto-reconnects; nothing else required here.
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    filters,
    setFilters,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  }
}
