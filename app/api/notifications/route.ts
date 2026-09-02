// app/api/notifications/route.ts
//
// Read endpoint for the notification center (bell icon dropdown + full
// history page). Supports filtering by module, status (read/unread),
// priority, date range, plus free-text search over title/message, and
// pagination — entirely additive, no impact on any existing route.
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Notification from "@/models/Notification"
import { verifySessionCookie } from "@/lib/auth"

export async function GET(req: NextRequest) {
  let userId: string
  try {
    const decoded = await verifySessionCookie(req)
    userId = decoded.sub
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Unauthorized" }, { status: 401 })
  }

  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const module = searchParams.get("module")
    const status = searchParams.get("status") // "read" | "unread" | null
    const priority = searchParams.get("priority")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const search = searchParams.get("search")?.trim()
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100)

    const filter: Record<string, any> = { recipientId: userId }

    if (module && module !== "all") filter.module = module
    if (status === "read") filter.isRead = true
    if (status === "unread") filter.isRead = false
    if (priority && priority !== "all") filter.priority = priority

    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to)
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId: userId, isRead: false }),
    ])

    return NextResponse.json({
      notifications: items,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    })
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ message: "Failed to fetch notifications", error: error.message }, { status: 500 })
  }
}
