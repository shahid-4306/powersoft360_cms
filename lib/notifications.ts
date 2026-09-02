// lib/notifications.ts
//
// Centralized notification engine. This is the single entry point every
// module in the application uses to raise a notification. It is purely
// additive infrastructure — it does not read from or mutate any existing
// business collection other than performing read-only lookups on User to
// resolve recipients by role/permission.
//
// Design goals:
//  - Modular & reusable: one `notify()` call per business event.
//  - Role-based delivery: recipients are resolved via explicit user ids,
//    role names, or permission strings (matching the existing
//    `role.permissions` convention already used throughout the app).
//  - No duplication: recipients are de-duplicated before insertion and,
//    for events that reference a specific record, a fingerprint guards
//    against the same event being recorded twice for the same user.
//  - Real-time: every created notification is pushed over the existing
//    SSE manager (`lib/sse.ts`) on a per-user channel so the bell icon can
//    update instantly without polling.
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Notification, {
  type NotificationPriority,
  type NotificationType,
} from "@/models/Notification"
import { sseManager } from "@/lib/sse"

export interface NotifyRecipients {
  /** Explicit recipient user ids (Mongo _id as string) */
  userIds?: string[]
  /** Deliver to every user whose role name matches (case-insensitive) */
  roles?: string[]
  /** Deliver to every user whose role.permissions includes ANY of these */
  permissions?: string[]
  /** Deliver to literally everyone (use sparingly, e.g. announcements) */
  allUsers?: boolean
  /** User id(s) to always exclude (typically the actor who triggered the event) */
  excludeUserIds?: string[]
}

export interface NotifyInput {
  title: string
  message: string
  module: string
  type: NotificationType
  priority?: NotificationPriority
  referenceId?: string
  actionUrl?: string
  sender?: { id?: string; name?: string; username?: string }
  recipients: NotifyRecipients
  metadata?: Record<string, unknown>
  /**
   * Optional dedup key. If provided, a notification with the same
   * (dedupeKey, recipientId) pair will not be created twice.
   */
  dedupeKey?: string
}

function streamIdFor(userId: string) {
  return `notif:${userId}`
}

/** Resolve a set of unique recipient user ids from role/permission/explicit lists. */
async function resolveRecipientIds(recipients: NotifyRecipients): Promise<string[]> {
  const ids = new Set<string>()

  if (recipients.allUsers) {
    const users = await User.find({}).select("_id").lean()
    users.forEach((u: any) => ids.add(String(u._id)))
  }

  if (recipients.userIds?.length) {
    recipients.userIds.filter(Boolean).forEach((id) => ids.add(String(id)))
  }

  if (recipients.roles?.length) {
    const roleNames = recipients.roles.map((r) => r.toLowerCase())
    const users = await User.find({}).select("_id role.name").lean()
    users.forEach((u: any) => {
      const roleName = (u?.role?.name || "").toLowerCase()
      if (roleName && roleNames.includes(roleName)) ids.add(String(u._id))
    })
  }

  if (recipients.permissions?.length) {
    const users = await User.find({
      "role.permissions": { $in: recipients.permissions },
    })
      .select("_id")
      .lean()
    users.forEach((u: any) => ids.add(String(u._id)))
  }

  if (recipients.excludeUserIds?.length) {
    recipients.excludeUserIds.filter(Boolean).forEach((id) => ids.delete(String(id)))
  }

  return Array.from(ids)
}

/**
 * Create and deliver a notification to every resolved recipient.
 * Safe to call from any route — failures are caught internally so that a
 * notification issue never breaks the underlying business operation.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await dbConnect()

    const recipientIds = await resolveRecipientIds(input.recipients)
    if (recipientIds.length === 0) return

    // Fetch recipient roles for tagging + de-dup lookups in one query.
    const recipientUsers = await User.find({ _id: { $in: recipientIds } })
      .select("_id role.name")
      .lean()
    const roleByUserId = new Map<string, string>(
      recipientUsers.map((u: any) => [String(u._id), u?.role?.name || ""]),
    )

    let candidateIds = recipientIds

    if (input.dedupeKey) {
      const existing = await Notification.find({
        recipientId: { $in: recipientIds },
        "metadata.dedupeKey": input.dedupeKey,
      })
        .select("recipientId")
        .lean()
      const already = new Set(existing.map((e: any) => String(e.recipientId)))
      candidateIds = recipientIds.filter((id) => !already.has(id))
    }

    if (candidateIds.length === 0) return

    const docs = candidateIds.map((recipientId) => ({
      title: input.title,
      message: input.message,
      module: input.module,
      type: input.type,
      priority: input.priority || "medium",
      referenceId: input.referenceId,
      actionUrl: input.actionUrl,
      sender: input.sender,
      recipientId,
      recipientRole: roleByUserId.get(recipientId) || null,
      metadata: input.dedupeKey ? { ...input.metadata, dedupeKey: input.dedupeKey } : input.metadata || {},
    }))

    const created = await Notification.insertMany(docs)

    // Real-time push, per recipient, over the existing SSE infrastructure.
    for (const doc of created) {
      const payload = {
        _id: String(doc._id),
        title: doc.title,
        message: doc.message,
        module: doc.module,
        type: doc.type,
        priority: doc.priority,
        referenceId: doc.referenceId,
        actionUrl: doc.actionUrl,
        sender: doc.sender,
        isRead: doc.isRead,
        createdAt: doc.createdAt,
      }
      sseManager.broadcast(streamIdFor(String(doc.recipientId)), payload)
    }
  } catch (error) {
    // Notifications must never break the calling module's business logic.
    console.error("[notifications] Failed to create notification:", error)
  }
}

export { streamIdFor }
