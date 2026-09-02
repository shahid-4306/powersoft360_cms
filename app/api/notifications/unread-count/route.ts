// app/api/notifications/unread-count/route.ts
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
    const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false })
    return NextResponse.json({ unreadCount })
  } catch (error: any) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json({ message: "Failed to fetch unread count", error: error.message }, { status: 500 })
  }
}
