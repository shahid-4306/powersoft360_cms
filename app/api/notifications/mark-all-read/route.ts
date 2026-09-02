// app/api/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Notification from "@/models/Notification"
import { verifySessionCookie } from "@/lib/auth"

export async function PATCH(req: NextRequest) {
  let userId: string
  try {
    const decoded = await verifySessionCookie(req)
    userId = decoded.sub
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Unauthorized" }, { status: 401 })
  }

  try {
    await dbConnect()

    const body = await req.json().catch(() => ({}))
    const module = typeof body?.module === "string" ? body.module : null

    const filter: Record<string, any> = { recipientId: userId, isRead: false }
    if (module && module !== "all") filter.module = module

    const result = await Notification.updateMany(filter, { $set: { isRead: true, readAt: new Date() } })

    return NextResponse.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { message: "Failed to mark all notifications as read", error: error.message },
      { status: 500 },
    )
  }
}
