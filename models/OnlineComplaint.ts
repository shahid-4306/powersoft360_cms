// import mongoose, { Schema, type Document, Types } from "mongoose";

// // Define interfaces for nested objects
// export interface ICompany {
//   id: Types.ObjectId;
//   name: string;
//   city: string;
//   address: string;
//   companyRepresentative: string;
//   support: string;
// }

// export interface IContact {
//   name: string;
//   phone: string;
// }

// export interface IAssignedTo {
//   id: string;
//   username: string;
//   name: string;
//   role: { name: string };
// }

// // Main Task interface
// export interface ITask {
//   _id: string;
//   code: string;
//   company: {
//     id: string;
//     name: string;
//     city: string;
//     address: string;
//     companyRepresentative: string;
//     support: string;
//   };
//   contact: {
//     name: string;
//     phone: string;
//   };
//   working: string;
//   dateTime: string;
//   softwareType: string; // Added softwareType
//   status:
//     | "pending"
//     | "assigned"
//     | "approved"
//     | "completed"
//     | "on-hold"
//     | "unposted"
//     | "in-progress"
//     | "rejected";
//   completionApproved?: boolean;
//   completionApprovedAt?: string;
//   finalStatus?:
//     | "done"
//     | "pending"
//     | "on-hold"
//     | "not-done"
//     | "unposted"
//     | "in-progress"
//     | "rejected";
//   completionRemarks?: string;
//   completionAttachment?: string[];
//   rejectionRemarks?: string;
//   rejectionAttachment?: string[];
//   timeTaken?: number;
//   unposted?: boolean;
//   unpostedAt?: string;
//   createdAt: string;
//   createdBy: string;
//   assigned?: boolean;
//   assignedTo?: IAssignedTo | null;
//   assignedDate?: string;
//   expectedCompletionAt?: string;
//   TaskRemarks?: string;
//   TasksAttachment?: string[];
//   assignmentRemarks?: string;
//   assignmentAttachment?: string[];
//   approved: boolean;
//   approvedAt?: string;
//   UnpostStatus?: string;
//   developer_status?: "pending" | "done" | "not-done" | "on-hold";
//   developer_remarks?: string;
//   developer_attachment?: string[];
//   updatedAt?: string;
//   developer_status_rejection?: "pending" | "fixed";
//   developer_done_date?: string;
//   developer_rejection_solve_attachment: string[];
//   developer_rejection_remarks: string;
// }

// // Document interface for MongoDB
// export interface ITaskDocument extends Document {
//   code: string;
//   company: ICompany;
//   contact: IContact;
//   working: string;
//   dateTime: Date;
//   softwareType: string; // Added softwareType
//   status:
//     | "pending"
//     | "assigned"
//     | "approved"
//     | "completed"
//     | "on-hold"
//     | "unposted"
//     | "in-progress"
//     | "rejected";
//   createdAt: Date;
//   createdBy: string;
//   assigned: boolean;
//   assignedTo?: IAssignedTo;
//   assignedDate?: Date;
//   expectedCompletionAt?: Date;
//   TaskRemarks?: string;
//   TasksAttachment?: string[];
//   assignmentRemarks?: string;
//   assignmentAttachment?: string[];
//   approved: boolean;
//   approvedAt?: Date;
//   completionApproved?: boolean;
//   completionApprovedAt?: Date;
//   finalStatus?:
//     | "done"
//     | "pending"
//     | "on-hold"
//     | "not-done"
//     | "unposted"
//     | "in-progress"
//     | "rejected";
//   rejectionRemarks?: string;
//   rejectionAttachment?: string[];
//   timeTaken?: number;
//   completionRemarks?: string;
//   completionAttachment?: string[];
//   unposted?: boolean;
//   UnpostStatus?: string;
//   unpostedAt?: Date;
//   developer_status?: "pending" | "done" | "not-done" | "on-hold";
//   developer_remarks?: string;
//   developer_attachment?: string[];
//   updatedAt?: Date;
//   developer_status_rejection: string;
//   developer_done_date?: Date;
//   developer_rejection_solve_attachment: string[];
//   developer_rejection_remarks?: string;
// }

// // Software types are now managed dynamically by Administrators from
// // Dashboard → Software Types (see models/SoftwareType.ts and
// // lib/softwareTypes.ts) instead of this hardcoded list. Validation of
// // `softwareType` happens at the API layer (app/api/tasks) against the
// // active SoftwareType collection.

// const TaskSchema: Schema = new Schema(
//   {
//     code: { type: String, required: true, unique: true },
//     company: {
//       id: {
//         type: Schema.Types.ObjectId,
//         ref: "CompanyInformation",
//         required: true,
//       },
//       name: { type: String, required: true },
//       city: { type: String, required: true },
//       address: { type: String, required: true },
//       companyRepresentative: { type: String, default: "" },
//       support: { type: String, default: "" },
//     },
//     contact: {
//       name: { type: String, required: true },
//       phone: { type: String, required: true },
//     },
//     working: { type: String, required: true },
//     dateTime: { type: Date, required: true },
//     softwareType: {
//       type: String,
//       required: true,
//       trim: true,
//       default: "Finance Manager",
//     },
//     // Priority field REMOVED completely
//     status: {
//       type: String,
//       enum: [
//         "pending",
//         "assigned",
//         "approved",
//         "completed",
//         "on-hold",
//         "unposted",
//         "in-progress",
//         "rejected",
//       ],
//       default: "pending",
//     },
//     createdAt: { type: Date, default: Date.now },
//     createdBy: { type: String, required: true },
//     assigned: { type: Boolean, default: false },
//     assignedTo: {
//       id: String,
//       username: String,
//       name: String,
//       role: { name: String },
//     },
//     assignedDate: { type: Date },
//     // Expected Completion Time / Response Time set by the Administrator
//     // when assigning this task (same shared dialog used for complaints —
//     // see components/tasks/AssignmentDialog.tsx).
//     expectedCompletionAt: { type: Date },
//     TaskRemarks: { type: String, default: "" },
//     TasksAttachment: [{ type: String }],
//     assignmentRemarks: { type: String, default: "" },
//     assignmentAttachment: [{ type: String }],
//     approved: { type: Boolean, default: false },
//     approvedAt: { type: Date },
//     completionApproved: { type: Boolean, default: false },
//     completionApprovedAt: { type: Date },
//     finalStatus: {
//       type: String,
//       enum: [
//         "done",
//         "pending",
//         "on-hold",
//         "not-done",
//         "unposted",
//         "in-progress",
//         "rejected",
//       ],
//     },
//     completionRemarks: { type: String, default: "" },
//     completionAttachment: [{ type: String }],
//     rejectionRemarks: { type: String, default: "" },
//     rejectionAttachment: [{ type: String }],
//     timeTaken: { type: Number, default: 0 },
//     unposted: { type: Boolean, default: false },
//     UnpostStatus: { type: String, default: "" },
//     unpostedAt: { type: Date },
//     developer_status: {
//       type: String,
//       enum: ["pending", "done", "not-done", "on-hold"],
//       default: "pending",
//     },
//     developer_remarks: { type: String, default: "" },
//     developer_attachment: [{ type: String }],
//     updatedAt: { type: Date },
//     developer_status_rejection: {
//       type: String,
//       enum: ["pending", "fixed"],
//       default: "pending",
//     },
//     developer_done_date: { type: Date },
//     developer_rejection_solve_attachment: [
//       {
//         type: String,
//         default: [],
//       },
//     ],
//     developer_rejection_remarks: { type: String, default: "" },
//   },
//   {
//     strict: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// // Add a pre-save hook to handle updates properly
// TaskSchema.pre("save", async function () {
//   this.updatedAt = new Date();
// });

// // Add index for softwareType for better query performance
// TaskSchema.index({ softwareType: 1 });
// TaskSchema.index({ softwareType: 1, status: 1 });

// const Task =
//   mongoose.models.Task || mongoose.model<ITaskDocument>("Task", TaskSchema);

// export default Task;

import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
  purpose: {
    type: String,
    enum: ["complaint", "assignment", "resolution"],
    default: "complaint",
  },
});

const ResolutionAttachmentSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
});

const AssignedUserSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: String,
  name: { type: String, required: true },
  role: {
    name: String,
  },
});

// --------------------------------------------------------------------
// History log — records every meaningful event in the complaint
// lifecycle (created, assigned, resolved, closed by user, re-opened by
// user, closed/rejected by admin, etc). Additive only: nothing reads
// this array to drive existing logic, so it is safe to keep appending
// to it from every route without touching current behaviour. Used by
// Requirement 1 (customer-facing full history table) and by future
// admin/reporting views.
// --------------------------------------------------------------------
const HistoryEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "created",
        "assigned",
        "resolved",
        "closed_by_user",
        "reopened_by_user",
        "admin_closed",
        "admin_rejected",
        "note",
      ],
    },
    status: String, // resulting complaint status after this action
    by: String, // display name / email / username of the actor
    byRole: String, // "customer" | "admin" | "manager" | "developer" | "system"
    remarks: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const OnlineComplaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
    },

    company: {
      companyName: String,
      companyId: String,
      city: String,
      address: String,
      companyRepresentative: String,
      phoneNumber: String,
      support: String,
    },

    // Software types are now managed dynamically by Administrators from
    // Dashboard → Software Types (see models/SoftwareType.ts and
    // lib/softwareTypes.ts) instead of a hardcoded enum. Validation of
    // `softwareType` happens at the API layer (app/api/online-complaints)
    // against the active SoftwareType collection.
    softwareType: {
      type: String,
      required: true,
      trim: true,
    },

    // Complaint types are managed dynamically by Administrators from
    // Dashboard → Complaint Types (see models/ComplaintType.ts and
    // lib/complaintTypes.ts), following the exact same pattern as
    // `softwareType` above. Validation happens at the API layer
    // (app/api/online-complaints) against the active ComplaintType
    // collection so only Administrator-approved categories are ever saved.
    complaintType: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: { type: String, required: true },
    contactPhone: { type: String, required: true },
    complaintRemarks: { type: String, required: true },

    attachments: [AttachmentSchema],

    assignedTo: AssignedUserSchema,
    assignedDate: Date,
    assignmentRemarks: String,
    assignmentAttachments: [AttachmentSchema],

    // Expected Completion Time / Response Time — set by the Administrator
    // in the Task & Complaint Assignment dialog alongside assignedTo /
    // assignedDate. Stored as an absolute deadline (Date) so both the
    // assigned user and the customer-facing Complaint Status page can
    // compute and display an accurate remaining-time countdown.
    expectedCompletionAt: Date,

    status: {
      type: String,
      default: "registered",
      enum: ["registered", "in-progress", "resolved", "closed", "rejected"],
    },

    // Rejection fields — set when an Administrator rejects an
    // incomplete/invalid complaint from the Task & Complaint Assignment
    // screen (counterpart to assignedTo/assignedDate/assignmentRemarks
    // above). Mandatory remarks are required at the API layer.
    adminRejectionRemarks: String,
    rejectedBy: {
      id: String,
      username: String,
      name: String,
    },
    rejectedDate: Date,

    // Developer resolution fields
    resolvedDate: Date,
    resolutionRemarks: String,
    resolutionAttachments: [ResolutionAttachmentSchema],

    developerStatus: {
      type: String,
      enum: ["not-started", "in-progress", "done", "pending"],
      default: "not-started",
    },

    createdBy: { type: String },
    // No longer required: the email-verification gate in front of the
    // complaint form was removed, so submissions may come from a visitor
    // with no account/session at all.
    submittedByUserId: { type: String },
    submitterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    updatedBy: { type: String },

    // Completion fields - ADD THESE NEW FIELDS
    completionApproved: { type: Boolean, default: false },
    completionApprovedAt: Date,
    completionRemarks: String,
    completionAttachment: [AttachmentSchema],

    // Rejection fields for completion - ADD THESE NEW FIELDS
    completionRejectionRemarks: String,
    completionRejectionAttachment: [AttachmentSchema],

    // --------------------------------------------------------------
    // Requirement 1 — Complete Complaint Resolution Workflow
    // --------------------------------------------------------------
    // Set when the customer clicks "Done" on a resolved complaint.
    // Distinguishes a customer-confirmed closure from an admin closure
    // (completionApproved above) without changing either field's
    // existing meaning/usage.
    closedByUser: { type: Boolean, default: false },
    closedByUserAt: Date,

    // Set/incremented when the customer clicks "Re-open" on a resolved
    // complaint. The mandatory remarks the customer provides are also
    // appended to `history` below, but kept here too for quick access.
    reopenCount: { type: Number, default: 0 },
    lastReopenedAt: Date,
    lastReopenRemarks: String,

    // Full chronological history of the complaint lifecycle — created,
    // assigned, resolved, closed/reopened by the customer, closed or
    // rejected by an admin, etc. Purely additive/append-only.
    history: [HistoryEntrySchema],

    // Common fields for compatibility with Task interface
    code: String,
    working: String,
    priority: String,
    developer_status: String,
    finalStatus: String,
    TasksAttachment: [AttachmentSchema],
    TaskRemarks: String,
    // developer_attachment: [AttachmentSchema],
    // developer_remarks: String,
    developer_done_date: Date,
    rejectionAttachment: [AttachmentSchema],
    rejectionRemarks: String,
    developer_status_rejection: String,
    developer_rejection_remarks: String,
    developer_rejection_solve_attachment: [AttachmentSchema],
  },
  { timestamps: true },
);

OnlineComplaintSchema.index({ complaintNumber: 1 });
OnlineComplaintSchema.index({ status: 1 });
OnlineComplaintSchema.index({ "assignedTo.id": 1 });
OnlineComplaintSchema.index({ createdAt: -1 });

export default mongoose.models.OnlineComplaint ||
  mongoose.model("OnlineComplaint", OnlineComplaintSchema);

// TypeScript interface
export interface IOnlineComplaint {
  _id: string;
  complaintNumber: string;
  company: {
    companyName: string;
    companyId: string;
    city: string;
    address: string;
    companyRepresentative: string;
    phoneNumber: string;
    support: string;
  };
  softwareType: string;
  complaintType: string;
  contactPerson: string;
  contactPhone: string;
  complaintRemarks: string;
  attachments: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;
  assignedTo?: {
    id: string;
    username: string;
    name: string;
    role: {
      name: string;
    };
    _id?: string;
  };
  assignedDate?: string;
  assignmentRemarks?: string;
  expectedCompletionAt?: string;
  assignmentAttachments?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;
  status: "registered" | "in-progress" | "resolved" | "closed" | "rejected";

  // Rejection fields
  adminRejectionRemarks?: string;
  rejectedBy?: {
    id: string;
    username: string;
    name: string;
  };
  rejectedDate?: string;

  // Developer resolution fields
  resolvedDate?: string;
  resolutionRemarks?: string;
  resolutionAttachments?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    _id: string;
  }>;
  developerStatus?: "not-started" | "in-progress" | "done" | "pending";

  // Completion fields - ADD THESE
  completionApproved?: boolean;
  completionApprovedAt?: string;
  completionRemarks?: string;
  completionAttachment?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;

  // Rejection fields for completion - ADD THESE
  completionRejectionRemarks?: string;
  completionRejectionAttachment?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;

  createdBy?: string;
  submittedByUserId?: string;
  submitterEmail: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;

  // Requirement 1 — customer-facing resolution lifecycle
  closedByUser?: boolean;
  closedByUserAt?: string;
  reopenCount?: number;
  lastReopenedAt?: string;
  lastReopenRemarks?: string;
  history?: Array<{
    action:
      | "created"
      | "assigned"
      | "resolved"
      | "closed_by_user"
      | "reopened_by_user"
      | "admin_closed"
      | "admin_rejected"
      | "note";
    status?: string;
    by?: string;
    byRole?: string;
    remarks?: string;
    at: string;
  }>;

  // Common fields to match ITask interface
  code?: string;
  working?: string;
  priority?: string;
  developer_status?: string;
  finalStatus?: string;
  TasksAttachment?: any[];
  TaskRemarks?: string;
  // developer_attachment?: any[];
  // developer_remarks?: string;
  developer_done_date?: string;
  rejectionAttachment?: any[];
  rejectionRemarks?: string;
  developer_status_rejection?: string;
  developer_rejection_remarks?: string;
  developer_rejection_solve_attachment?: any[];
  type?: "task" | "complaint";
}
