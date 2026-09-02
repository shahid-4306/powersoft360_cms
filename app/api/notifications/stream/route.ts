// app/api/notifications/stream/route.ts
//
// Real-time notification delivery for the bell icon. Mirrors the polling
// SSE convention already used by app/api/tasks/stream and
// app/api/company_information/stream, scoped per-user, plus an instant
// push path through the existing sseManager for near-zero latency.
import { NextRequest } from "next/server"
import dbConnect from "@/lib/db"
import Notification from "@/models/Notification"
import { verifySessionCookie } from "@/lib/auth"
import { sseManager } from "@/lib/sse"
import { streamIdFor } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  let userId: string
  try {
    const decoded = await verifySessionCookie(req)
    userId = decoded.sub
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  await dbConnect()

  let isConnected = true
  let heartbeatInterval: NodeJS.Timeout | null = null
  let pollingInterval: NodeJS.Timeout | null = null
  let writer: WritableStreamDefaultWriter<Uint8Array> | null = null
  const channel = streamIdFor(userId)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendUnreadSnapshot = async () => {
        try {
          const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false })
          const data = `data: ${JSON.stringify({ type: "unread_count", unreadCount })}\n\n`
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          console.error("Error fetching unread notification count:", error)
        }
      }

      // Bridge sseManager pushes (from notify()) directly into this stream.
      const bridge = new WritableStream<Uint8Array>({
        write(chunk) {
          if (isConnected) controller.enqueue(chunk)
        },
      })
      writer = bridge.getWriter()
      sseManager.addClient(channel, writer)

      await sendUnreadSnapshot()

      // Polling fallback keeps the count accurate even if a push is missed.
      pollingInterval = setInterval(async () => {
        if (isConnected) await sendUnreadSnapshot()
      }, 10000)

      heartbeatInterval = setInterval(() => {
        if (isConnected) controller.enqueue(encoder.encode(": heartbeat\n\n"))
      }, 15000)
    },
    cancel() {
      isConnected = false
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      if (pollingInterval) clearInterval(pollingInterval)
      if (writer) sseManager.removeClient(channel, writer)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
