// models/Notification.ts
// Centralized notification model used across every module of the application.
// Additive only — does not alter any existing model or collection.
import mongoose, { Schema, type Document } from "mongoose";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export type NotificationType =
  | "user_created"
  | "task_created"
  | "task_assigned"
  | "task_status_changed"
  | "task_unposted"
  | "complaint_created"
  | "complaint_assigned"
  | "complaint_resolved"
  | "complaint_rejected" // <--- Ensure this is added here
  | "registration_submitted"
  | "registration_approved"
  | "registration_rejected"
  | "profile_updated"
  | "document_uploaded"
  | "company_created"
  | "project_created"
  | "announcement"
  | "comment"
  | "reminder";

export interface INotification extends Document {
  title: string;
  message: string;
  module: string;
  type: NotificationType;
  priority: NotificationPriority;
  referenceId?: string;
  actionUrl?: string;
  sender?: {
    id?: string;
    name?: string;
    username?: string;
  };
  recipientId: string;
  recipientRole?: string;
  isRead: boolean;
  readAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    module: { type: String, required: true, index: true },
    type: { type: String, required: true, default: "generic", index: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    referenceId: { type: String, default: null },
    actionUrl: { type: String, default: null },
    sender: {
      id: { type: String, default: null },
      name: { type: String, default: null },
      username: { type: String, default: null },
    },
    // recipientId is always a concrete user id — role/permission based
    // "broadcast" targeting is resolved to individual recipient documents
    // at creation time so unread counts and mark-as-read stay consistent
    // and duplication-free per user.
    recipientId: { type: String, required: true, index: true },
    recipientRole: { type: String, default: null, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// Common compound indexes for fast, paginated, filterable queries.
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, module: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, priority: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
