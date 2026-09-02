// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/db"
import Notification from "@/models/Notification"
import { verifySessionCookie } from "@/lib/auth"

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  let userId: string
  try {
    const decoded = await verifySessionCookie(req)
    userId = decoded.sub
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid notification id" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const isRead = body?.isRead !== false // default: mark as read

    await dbConnect()

    // Scope strictly to the recipient — a user may only mutate their own
    // notifications, preserving strict access control.
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { $set: { isRead, readAt: isRead ? new Date() : null } },
      { new: true },
    ).lean()

    if (!updated) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ notification: updated })
  } catch (error: any) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ message: "Failed to update notification", error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  let userId: string
  try {
    const decoded = await verifySessionCookie(req)
    userId = decoded.sub
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid notification id" }, { status: 400 })
    }

    await dbConnect()
    const deleted = await Notification.findOneAndDelete({ _id: id, recipientId: userId }).lean()

    if (!deleted) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notification deleted" })
  } catch (error: any) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ message: "Failed to delete notification", error: error.message }, { status: 500 })
  }
}
