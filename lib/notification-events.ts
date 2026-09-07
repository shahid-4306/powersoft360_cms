// // // lib/notification-events.ts
// // //
// // // Thin, typed convenience wrappers around `notify()` (lib/notifications.ts),
// // // one per business event described in the notification requirements
// // // (user creation, task assignment, complaints, requests, approvals,
// // // rejections, profile updates, announcements, status changes, document
// // // uploads, comments, reminders...).
// // //
// // // Every existing route only needs to add ONE line calling the matching
// // // helper below right after its existing success path — no existing logic,
// // // validation, or response shape is changed.
// // //
// // // Recipient targeting is centralized here (by permission/role) so it can be
// // // tuned in one place as roles evolve, without touching any route file again.
// // import { notify } from "@/lib/notifications"

// // type Sender = { id?: string; name?: string; username?: string }

// // /** New user account created by an admin. */
// // export async function notifyUserCreated(params: {
// //   createdUserId: string
// //   createdUserName: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "New User Created",
// //     message: `A new user account "${params.createdUserName}" has been created.`,
// //     module: "users",
// //     type: "user_created",
// //     priority: "low",
// //     referenceId: params.createdUserId,
// //     actionUrl: `/dashboard/users`,
// //     sender: params.actor,
// //     recipients: { permissions: ["users.manage"], excludeUserIds: params.actor?.id ? [params.actor.id] : [] },
// //   })
// // }

// // /** A task was created and is awaiting assignment. */
// // export async function notifyTaskCreated(params: {
// //   taskId: string
// //   taskCode: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "New Task Created",
// //     message: `Task "${params.taskCode}" was created and is awaiting assignment.`,
// //     module: "tasks",
// //     type: "task_created",
// //     priority: "medium",
// //     referenceId: params.taskId,
// //     actionUrl: `/dashboard/tasks/all`,
// //     sender: params.actor,
// //     recipients: {
// //       permissions: ["tasks.assign", "tasks.manage"],
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A task was assigned to a specific user. */
// // export async function notifyTaskAssigned(params: {
// //   taskId: string
// //   taskCode: string
// //   assignedToUserId: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "Task Assigned To You",
// //     message: `You have been assigned task "${params.taskCode}".`,
// //     module: "tasks",
// //     type: "task_assigned",
// //     priority: "high",
// //     referenceId: params.taskId,
// //     actionUrl: `/dashboard/tasks/all`,
// //     sender: params.actor,
// //     recipients: { userIds: [params.assignedToUserId] },
// //   })
// // }

// // /** A task's status changed (assigned/approved/completed/rejected/etc). */
// // export async function notifyTaskStatusChanged(params: {
// //   taskId: string
// //   taskCode: string
// //   status: string
// //   notifyUserIds: string[]
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "Task Status Updated",
// //     message: `Task "${params.taskCode}" status changed to "${params.status}".`,
// //     module: "tasks",
// //     type: "task_status_changed",
// //     priority: "medium",
// //     referenceId: params.taskId,
// //     actionUrl: `/dashboard/tasks/all`,
// //     sender: params.actor,
// //     recipients: {
// //       userIds: params.notifyUserIds,
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A task was unposted/withdrawn. */
// // export async function notifyTaskUnposted(params: {
// //   taskId: string
// //   taskCode: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "Task Unposted",
// //     message: `Task "${params.taskCode}" has been unposted.`,
// //     module: "tasks",
// //     type: "task_unposted",
// //     priority: "medium",
// //     referenceId: params.taskId,
// //     actionUrl: `/dashboard/tasks/unpost`,
// //     sender: params.actor,
// //     recipients: {
// //       permissions: ["tasks.manage", "tasks.assign"],
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A new online complaint was registered. */
// // export async function notifyComplaintCreated(params: {
// //   complaintId: string
// //   complaintNumber: string
// //   companyName?: string
// //   submitterEmail?: string
// //   submittedAt?: string | Date
// // }) {
// //   await notify({
// //     title: "New Complaint Registered",
// //     message: `Complaint ${params.complaintNumber}${
// //       params.companyName ? ` from ${params.companyName}` : ""
// //     }${params.submitterEmail ? ` (${params.submitterEmail})` : ""} has been registered.`,
// //     module: "complaints",
// //     type: "complaint_created",
// //     priority: "high",
// //     referenceId: params.complaintId,
// //     actionUrl: `/dashboard/reports`,
// //     recipients: { permissions: ["tasks.assign", "tasks.manage", "users.manage"] },
// //     metadata: {
// //       complaintNumber: params.complaintNumber,
// //       submitterEmail: params.submitterEmail,
// //       submittedAt: params.submittedAt,
// //     },
// //   })
// // }

// // /** A complaint was assigned to a staff member. */
// // export async function notifyComplaintAssigned(params: {
// //   complaintId: string
// //   complaintNumber: string
// //   assignedToUserId: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "Complaint Assigned To You",
// //     message: `Complaint ${params.complaintNumber} has been assigned to you.`,
// //     module: "complaints",
// //     type: "complaint_assigned",
// //     priority: "high",
// //     referenceId: params.complaintId,
// //     actionUrl: `/dashboard/reports`,
// //     sender: params.actor,
// //     recipients: { userIds: [params.assignedToUserId] },
// //   })
// // }

// // /** A complaint was resolved. */
// // export async function notifyComplaintResolved(params: {
// //   complaintId: string
// //   complaintNumber: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "Complaint Resolved",
// //     message: `Complaint ${params.complaintNumber} has been marked as resolved.`,
// //     module: "complaints",
// //     type: "complaint_resolved",
// //     priority: "medium",
// //     referenceId: params.complaintId,
// //     actionUrl: `/dashboard/reports`,
// //     sender: params.actor,
// //     recipients: {
// //       permissions: ["tasks.manage", "users.manage"],
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A new public registration request was submitted. */
// // export async function notifyRegistrationSubmitted(params: {
// //   registrationId: string
// //   applicantName: string
// //   applicantEmail?: string
// //   registeredAt?: string | Date
// // }) {
// //   await notify({
// //     title: "New Registration Request",
// //     message: `${params.applicantName}${
// //       params.applicantEmail ? ` (${params.applicantEmail})` : ""
// //     } submitted a new registration request awaiting review.`,
// //     module: "registrations",
// //     type: "registration_submitted",
// //     priority: "high",
// //     referenceId: params.registrationId,
// //     actionUrl: `/dashboard/registrations`,
// //     recipients: { permissions: ["registrations.manage"] },
// //     dedupeKey: `registration_submitted:${params.registrationId}`,
// //     metadata: {
// //       applicantName: params.applicantName,
// //       applicantEmail: params.applicantEmail,
// //       registeredAt: params.registeredAt,
// //     },
// //   })
// // }

// // /** A registration request was approved or rejected. */
// // export async function notifyRegistrationDecision(params: {
// //   registrationId: string
// //   applicantName: string
// //   decision: "approved" | "rejected"
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: params.decision === "approved" ? "Registration Approved" : "Registration Rejected",
// //     message: `Registration request from ${params.applicantName} was ${params.decision}.`,
// //     module: "registrations",
// //     type: params.decision === "approved" ? "registration_approved" : "registration_rejected",
// //     priority: "medium",
// //     referenceId: params.registrationId,
// //     actionUrl: `/dashboard/registrations`,
// //     sender: params.actor,
// //     recipients: {
// //       permissions: ["registrations.manage"],
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A user's profile was updated. */
// // export async function notifyProfileUpdated(params: {
// //   userId: string
// //   userName: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "Profile Updated",
// //     message: `Profile for "${params.userName}" was updated.`,
// //     module: "users",
// //     type: "profile_updated",
// //     priority: "low",
// //     referenceId: params.userId,
// //     actionUrl: `/dashboard/users`,
// //     sender: params.actor,
// //     recipients: { userIds: [params.userId] },
// //   })
// // }

// // /** A document/attachment was uploaded against a record. */
// // export async function notifyDocumentUploaded(params: {
// //   module: string
// //   referenceId: string
// //   fileName: string
// //   actionUrl: string
// //   recipients: { userIds?: string[]; permissions?: string[] }
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "Document Uploaded",
// //     message: `A new document "${params.fileName}" was uploaded.`,
// //     module: params.module,
// //     type: "document_uploaded",
// //     priority: "low",
// //     referenceId: params.referenceId,
// //     actionUrl: params.actionUrl,
// //     sender: params.actor,
// //     recipients: {
// //       ...params.recipients,
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A new company record was created. */
// // export async function notifyCompanyCreated(params: {
// //   companyId: string
// //   companyName: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "New Company Added",
// //     message: `Company "${params.companyName}" has been added.`,
// //     module: "company_information",
// //     type: "company_created",
// //     priority: "low",
// //     referenceId: params.companyId,
// //     actionUrl: `/dashboard/company_information`,
// //     sender: params.actor,
// //     recipients: {
// //       permissions: ["company_information.manage"],
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A new project was created. */
// // export async function notifyProjectCreated(params: {
// //   projectId: string
// //   projectName: string
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "New Project Created",
// //     message: `Project "${params.projectName}" has been created.`,
// //     module: "projects",
// //     type: "project_created",
// //     priority: "low",
// //     referenceId: params.projectId,
// //     actionUrl: `/dashboard/projects`,
// //     sender: params.actor,
// //     recipients: {
// //       permissions: ["projects.view", "tasks.manage"],
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A general announcement broadcast to everyone or a target role. */
// // export async function notifyAnnouncement(params: {
// //   title: string
// //   message: string
// //   actionUrl?: string
// //   targetRoles?: string[]
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: params.title,
// //     message: params.message,
// //     module: "announcements",
// //     type: "announcement",
// //     priority: "medium",
// //     actionUrl: params.actionUrl,
// //     sender: params.actor,
// //     recipients: params.targetRoles?.length ? { roles: params.targetRoles } : { allUsers: true },
// //   })
// // }

// // /** A comment was added to a record. */
// // export async function notifyComment(params: {
// //   module: string
// //   referenceId: string
// //   actionUrl: string
// //   commenterName: string
// //   recipients: { userIds?: string[]; permissions?: string[] }
// //   actor?: Sender
// // }) {
// //   await notify({
// //     title: "New Comment",
// //     message: `${params.commenterName} added a comment.`,
// //     module: params.module,
// //     type: "comment",
// //     priority: "low",
// //     referenceId: params.referenceId,
// //     actionUrl: params.actionUrl,
// //     sender: params.actor,
// //     recipients: {
// //       ...params.recipients,
// //       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
// //     },
// //   })
// // }

// // /** A reminder for an upcoming/overdue item. */
// // export async function notifyReminder(params: {
// //   module: string
// //   referenceId: string
// //   actionUrl: string
// //   title: string
// //   message: string
// //   recipients: { userIds?: string[]; permissions?: string[] }
// // }) {
// //   await notify({
// //     title: params.title,
// //     message: params.message,
// //     module: params.module,
// //     type: "reminder",
// //     priority: "high",
// //     referenceId: params.referenceId,
// //     actionUrl: params.actionUrl,
// //     recipients: params.recipients,
// //   })
// // }

// import { notify } from "@/lib/notifications";

// type Sender = { id?: string; name?: string; username?: string };

// /** New user account created by an admin. */
// export async function notifyUserCreated(params: {
//   createdUserId: string;
//   createdUserName: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "New User Created",
//     message: `A new user account "${params.createdUserName}" has been created.`,
//     module: "users",
//     type: "user_created",
//     priority: "low",
//     referenceId: params.createdUserId,
//     actionUrl: `/dashboard/users`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["users.manage"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A task was created and is awaiting assignment. */
// export async function notifyTaskCreated(params: {
//   taskId: string;
//   taskCode: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "New Task Created",
//     message: `Task "${params.taskCode}" was created and is awaiting assignment.`,
//     module: "tasks",
//     type: "task_created",
//     priority: "medium",
//     referenceId: params.taskId,
//     actionUrl: `/dashboard/tasks/all`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["tasks.assign", "tasks.manage"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A task was assigned to a specific user. */
// export async function notifyTaskAssigned(params: {
//   taskId: string;
//   taskCode: string;
//   assignedToUserId: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Task Assigned To You",
//     message: `You have been assigned task "${params.taskCode}".`,
//     module: "tasks",
//     type: "task_assigned",
//     priority: "high",
//     referenceId: params.taskId,
//     actionUrl: `/dashboard/tasks/all`,
//     sender: params.actor,
//     recipients: { userIds: [params.assignedToUserId] },
//   });
// }

// /** A task's status changed (assigned/approved/completed/rejected/etc). */
// export async function notifyTaskStatusChanged(params: {
//   taskId: string;
//   taskCode: string;
//   status: string;
//   notifyUserIds: string[];
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Task Status Updated",
//     message: `Task "${params.taskCode}" status changed to "${params.status}".`,
//     module: "tasks",
//     type: "task_status_changed",
//     priority: "medium",
//     referenceId: params.taskId,
//     actionUrl: `/dashboard/tasks/all`,
//     sender: params.actor,
//     recipients: {
//       userIds: params.notifyUserIds,
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A task was unposted/withdrawn. */
// export async function notifyTaskUnposted(params: {
//   taskId: string;
//   taskCode: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Task Unposted",
//     message: `Task "${params.taskCode}" has been unposted.`,
//     module: "tasks",
//     type: "task_unposted",
//     priority: "medium",
//     referenceId: params.taskId,
//     actionUrl: `/dashboard/tasks/unpost`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["tasks.manage", "tasks.assign"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A new online complaint was registered. */
// export async function notifyComplaintCreated(params: {
//   complaintId: string;
//   complaintNumber: string;
//   companyName?: string;
//   submitterEmail?: string;
//   submittedAt?: string | Date;
// }) {
//   await notify({
//     title: "New Complaint Registered",
//     message: `Complaint ${params.complaintNumber}${
//       params.companyName ? ` from ${params.companyName}` : ""
//     }${params.submitterEmail ? ` (${params.submitterEmail})` : ""} has been registered.`,
//     module: "complaints",
//     type: "complaint_created",
//     priority: "high",
//     referenceId: params.complaintId,
//     actionUrl: `/dashboard/reports`,
//     recipients: {
//       permissions: ["tasks.assign", "tasks.manage", "users.manage"],
//     },
//     metadata: {
//       complaintNumber: params.complaintNumber,
//       submitterEmail: params.submitterEmail,
//       submittedAt: params.submittedAt,
//     },
//   });
// }

// /** A complaint was assigned to a staff member. */
// export async function notifyComplaintAssigned(params: {
//   complaintId: string;
//   complaintNumber: string;
//   assignedToUserId: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Complaint Assigned To You",
//     message: `Complaint ${params.complaintNumber} has been assigned to you.`,
//     module: "complaints",
//     type: "complaint_assigned",
//     priority: "high",
//     referenceId: params.complaintId,
//     actionUrl: `/dashboard/reports`,
//     sender: params.actor,
//     recipients: { userIds: [params.assignedToUserId] },
//   });
// }

// /** A complaint was resolved. */
// export async function notifyComplaintResolved(params: {
//   complaintId: string;
//   complaintNumber: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Complaint Resolved",
//     message: `Complaint ${params.complaintNumber} has been marked as resolved.`,
//     module: "complaints",
//     type: "complaint_resolved",
//     priority: "medium",
//     referenceId: params.complaintId,
//     actionUrl: `/dashboard/reports`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["tasks.manage", "users.manage"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A complaint was rejected. */
// export async function notifyComplaintRejected(params: {
//   complaintId: string;
//   complaintNumber: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Complaint Rejected",
//     message: `Complaint ${params.complaintNumber} has been rejected.`,
//     module: "complaints",
//     type: "complaint_rejected",
//     priority: "medium",
//     referenceId: params.complaintId,
//     actionUrl: `/dashboard/reports`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["tasks.manage", "users.manage"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A new public registration request was submitted. */
// export async function notifyRegistrationSubmitted(params: {
//   registrationId: string;
//   applicantName: string;
//   applicantEmail?: string;
//   registeredAt?: string | Date;
// }) {
//   await notify({
//     title: "New Registration Request",
//     message: `${params.applicantName}${
//       params.applicantEmail ? ` (${params.applicantEmail})` : ""
//     } submitted a new registration request awaiting review.`,
//     module: "registrations",
//     type: "registration_submitted",
//     priority: "high",
//     referenceId: params.registrationId,
//     actionUrl: `/dashboard/registrations`,
//     recipients: { permissions: ["registrations.manage"] },
//     dedupeKey: `registration_submitted:${params.registrationId}`,
//     metadata: {
//       applicantName: params.applicantName,
//       applicantEmail: params.applicantEmail,
//       registeredAt: params.registeredAt,
//     },
//   });
// }

// /** A registration request was approved or rejected. */
// export async function notifyRegistrationDecision(params: {
//   registrationId: string;
//   applicantName: string;
//   decision: "approved" | "rejected";
//   actor?: Sender;
// }) {
//   await notify({
//     title:
//       params.decision === "approved"
//         ? "Registration Approved"
//         : "Registration Rejected",
//     message: `Registration request from ${params.applicantName} was ${params.decision}.`,
//     module: "registrations",
//     type:
//       params.decision === "approved"
//         ? "registration_approved"
//         : "registration_rejected",
//     priority: "medium",
//     referenceId: params.registrationId,
//     actionUrl: `/dashboard/registrations`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["registrations.manage"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A user's profile was updated. */
// export async function notifyProfileUpdated(params: {
//   userId: string;
//   userName: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Profile Updated",
//     message: `Profile for "${params.userName}" was updated.`,
//     module: "users",
//     type: "profile_updated",
//     priority: "low",
//     referenceId: params.userId,
//     actionUrl: `/dashboard/users`,
//     sender: params.actor,
//     recipients: { userIds: [params.userId] },
//   });
// }

// /** A document/attachment was uploaded against a record. */
// export async function notifyDocumentUploaded(params: {
//   module: string;
//   referenceId: string;
//   fileName: string;
//   actionUrl: string;
//   recipients: { userIds?: string[]; permissions?: string[] };
//   actor?: Sender;
// }) {
//   await notify({
//     title: "Document Uploaded",
//     message: `A new document "${params.fileName}" was uploaded.`,
//     module: params.module,
//     type: "document_uploaded",
//     priority: "low",
//     referenceId: params.referenceId,
//     actionUrl: params.actionUrl,
//     sender: params.actor,
//     recipients: {
//       ...params.recipients,
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A new company record was created. */
// export async function notifyCompanyCreated(params: {
//   companyId: string;
//   companyName: string;
//   actor?: Sender;
// }) {
//   await notify({
//     title: "New Company Added",
//     message: `Company "${params.companyName}" has been added.`,
//     module: "company_information",
//     type: "company_created",
//     priority: "low",
//     referenceId: params.companyId,
//     actionUrl: `/dashboard/company_information`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["company_information.manage"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A new project was created. */
// export async function notifyProjectCreated(params: {
//   projectId: string;
//   projectName: string;
//   actor?: Sender;
// }) {
//   awaitnotify({
//     title: "New Project Created",
//     message: `Project "${params.projectName}" has been created.`,
//     module: "projects",
//     type: "project_created",
//     priority: "low",
//     referenceId: params.projectId,
//     actionUrl: `/dashboard/projects`,
//     sender: params.actor,
//     recipients: {
//       permissions: ["projects.view", "tasks.manage"],
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A general announcement broadcast to everyone or a target role. */
// export async function notifyAnnouncement(params: {
//   title: string;
//   message: string;
//   actionUrl?: string;
//   targetRoles?: string[];
//   actor?: Sender;
// }) {
//   await notify({
//     title: params.title,
//     message: params.message,
//     module: "announcements",
//     type: "announcement",
//     priority: "medium",
//     actionUrl: params.actionUrl,
//     sender: params.actor,
//     recipients: params.targetRoles?.length
//       ? { roles: params.targetRoles }
//       : { allUsers: true },
//   });
// }

// /** A comment was added to a record. */
// export async function notifyComment(params: {
//   module: string;
//   referenceId: string;
//   actionUrl: string;
//   commenterName: string;
//   recipients: { userIds?: string[]; permissions?: string[] };
//   actor?: Sender;
// }) {
//   await notify({
//     title: "New Comment",
//     message: `${params.commenterName} added a comment.`,
//     module: params.module,
//     type: "comment",
//     priority: "low",
//     referenceId: params.referenceId,
//     actionUrl: params.actionUrl,
//     sender: params.actor,
//     recipients: {
//       ...params.recipients,
//       excludeUserIds: params.actor?.id ? [params.actor.id] : [],
//     },
//   });
// }

// /** A reminder for an upcoming/overdue item. */
// export async function notifyReminder(params: {
//   module: string;
//   referenceId: string;
//   actionUrl: string;
//   title: string;
//   message: string;
//   recipients: { userIds?: string[]; permissions?: string[] };
// }) {
//   await notify({
//     title: params.title,
//     message: params.message,
//     module: params.module,
//     type: "reminder",
//     priority: "high",
//     referenceId: params.referenceId,
//     actionUrl: params.actionUrl,
//     recipients: params.recipients,
//   });
// }

import { notify } from "@/lib/notifications";

type Sender = { id?: string; name?: string; username?: string };

/** New user account created by an admin. */
export async function notifyUserCreated(params: {
  createdUserId: string;
  createdUserName: string;
  actor?: Sender;
}) {
  await notify({
    title: "New User Created",
    message: `A new user account "${params.createdUserName}" has been created.`,
    module: "users",
    type: "user_created",
    priority: "low",
    referenceId: params.createdUserId,
    actionUrl: `/dashboard/users`,
    sender: params.actor,
    recipients: {
      permissions: ["users.manage"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A task was created and is awaiting assignment. */
export async function notifyTaskCreated(params: {
  taskId: string;
  taskCode: string;
  actor?: Sender;
}) {
  await notify({
    title: "New Task Created",
    message: `Task "${params.taskCode}" was created and is awaiting assignment.`,
    module: "tasks",
    type: "task_created",
    priority: "medium",
    referenceId: params.taskId,
    actionUrl: `/dashboard/tasks/all`,
    sender: params.actor,
    recipients: {
      permissions: ["tasks.assign", "tasks.manage"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A task was assigned to a specific user. */
export async function notifyTaskAssigned(params: {
  taskId: string;
  taskCode: string;
  assignedToUserId: string;
  actor?: Sender;
}) {
  await notify({
    title: "Task Assigned To You",
    message: `You have been assigned task "${params.taskCode}".`,
    module: "tasks",
    type: "task_assigned",
    priority: "high",
    referenceId: params.taskId,
    actionUrl: `/dashboard/tasks/all`,
    sender: params.actor,
    recipients: { userIds: [params.assignedToUserId] },
  });
}

/** A task's status changed (assigned/approved/completed/rejected/etc). */
export async function notifyTaskStatusChanged(params: {
  taskId: string;
  taskCode: string;
  status: string;
  notifyUserIds: string[];
  actor?: Sender;
}) {
  await notify({
    title: "Task Status Updated",
    message: `Task "${params.taskCode}" status changed to "${params.status}".`,
    module: "tasks",
    type: "task_status_changed",
    priority: "medium",
    referenceId: params.taskId,
    actionUrl: `/dashboard/tasks/all`,
    sender: params.actor,
    recipients: {
      userIds: params.notifyUserIds,
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A task was unposted/withdrawn. */
export async function notifyTaskUnposted(params: {
  taskId: string;
  taskCode: string;
  actor?: Sender;
}) {
  await notify({
    title: "Task Unposted",
    message: `Task "${params.taskCode}" has been unposted.`,
    module: "tasks",
    type: "task_unposted",
    priority: "medium",
    referenceId: params.taskId,
    actionUrl: `/dashboard/tasks/unpost`,
    sender: params.actor,
    recipients: {
      permissions: ["tasks.manage", "tasks.assign"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A new online complaint was registered. */
export async function notifyComplaintCreated(params: {
  complaintId: string;
  complaintNumber: string;
  companyName?: string;
  submitterEmail?: string;
  submittedAt?: string | Date;
}) {
  await notify({
    title: "New Complaint Registered",
    message: `Complaint ${params.complaintNumber}${
      params.companyName ? ` from ${params.companyName}` : ""
    }${params.submitterEmail ? ` (${params.submitterEmail})` : ""} has been registered.`,
    module: "complaints",
    type: "complaint_created",
    priority: "high",
    referenceId: params.complaintId,
    actionUrl: `/dashboard/reports`,
    recipients: {
      permissions: ["tasks.assign", "tasks.manage", "users.manage"],
    },
    metadata: {
      complaintNumber: params.complaintNumber,
      submitterEmail: params.submitterEmail,
      submittedAt: params.submittedAt,
    },
  });
}

/** A complaint was assigned to a staff member. */
export async function notifyComplaintAssigned(params: {
  complaintId: string;
  complaintNumber: string;
  assignedToUserId: string;
  actor?: Sender;
}) {
  await notify({
    title: "Complaint Assigned To You",
    message: `Complaint ${params.complaintNumber} has been assigned to you.`,
    module: "complaints",
    type: "complaint_assigned",
    priority: "high",
    referenceId: params.complaintId,
    actionUrl: `/dashboard/reports`,
    sender: params.actor,
    recipients: { userIds: [params.assignedToUserId] },
  });
}

/** A complaint was resolved. */
export async function notifyComplaintResolved(params: {
  complaintId: string;
  complaintNumber: string;
  actor?: Sender;
}) {
  await notify({
    title: "Complaint Resolved",
    message: `Complaint ${params.complaintNumber} has been marked as resolved.`,
    module: "complaints",
    type: "complaint_resolved",
    priority: "medium",
    referenceId: params.complaintId,
    actionUrl: `/dashboard/reports`,
    sender: params.actor,
    recipients: {
      permissions: ["tasks.manage", "users.manage"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A complaint was rejected. */
export async function notifyComplaintRejected(params: {
  complaintId: string;
  complaintNumber: string;
  actor?: Sender;
}) {
  await notify({
    title: "Complaint Rejected",
    message: `Complaint ${params.complaintNumber} has been rejected.`,
    module: "complaints",
    type: "complaint_rejected",
    priority: "medium",
    referenceId: params.complaintId,
    actionUrl: `/dashboard/reports`,
    sender: params.actor,
    recipients: {
      permissions: ["tasks.manage", "users.manage"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A new public registration request was submitted. */
export async function notifyRegistrationSubmitted(params: {
  registrationId: string;
  applicantName: string;
  applicantEmail?: string;
  registeredAt?: string | Date;
}) {
  await notify({
    title: "New Registration Request",
    message: `${params.applicantName}${
      params.applicantEmail ? ` (${params.applicantEmail})` : ""
    } submitted a new registration request awaiting review.`,
    module: "registrations",
    type: "registration_submitted",
    priority: "high",
    referenceId: params.registrationId,
    actionUrl: `/dashboard/registrations`,
    recipients: { permissions: ["registrations.manage"] },
    dedupeKey: `registration_submitted:${params.registrationId}`,
    metadata: {
      applicantName: params.applicantName,
      applicantEmail: params.applicantEmail,
      registeredAt: params.registeredAt,
    },
  });
}

/** A registration request was approved or rejected. */
export async function notifyRegistrationDecision(params: {
  registrationId: string;
  applicantName: string;
  decision: "approved" | "rejected";
  actor?: Sender;
}) {
  await notify({
    title:
      params.decision === "approved"
        ? "Registration Approved"
        : "Registration Rejected",
    message: `Registration request from ${params.applicantName} was ${params.decision}.`,
    module: "registrations",
    type:
      params.decision === "approved"
        ? "registration_approved"
        : "registration_rejected",
    priority: "medium",
    referenceId: params.registrationId,
    actionUrl: `/dashboard/registrations`,
    sender: params.actor,
    recipients: {
      permissions: ["registrations.manage"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A user's profile was updated. */
export async function notifyProfileUpdated(params: {
  userId: string;
  userName: string;
  actor?: Sender;
}) {
  await notify({
    title: "Profile Updated",
    message: `Profile for "${params.userName}" was updated.`,
    module: "users",
    type: "profile_updated",
    priority: "low",
    referenceId: params.userId,
    actionUrl: `/dashboard/users`,
    sender: params.actor,
    recipients: { userIds: [params.userId] },
  });
}

/** A document/attachment was uploaded against a record. */
export async function notifyDocumentUploaded(params: {
  module: string;
  referenceId: string;
  fileName: string;
  actionUrl: string;
  recipients: { userIds?: string[]; permissions?: string[] };
  actor?: Sender;
}) {
  await notify({
    title: "Document Uploaded",
    message: `A new document "${params.fileName}" was uploaded.`,
    module: params.module,
    type: "document_uploaded",
    priority: "low",
    referenceId: params.referenceId,
    actionUrl: params.actionUrl,
    sender: params.actor,
    recipients: {
      ...params.recipients,
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A new company record was created. */
export async function notifyCompanyCreated(params: {
  companyId: string;
  companyName: string;
  actor?: Sender;
}) {
  await notify({
    title: "New Company Added",
    message: `Company "${params.companyName}" has been added.`,
    module: "company_information",
    type: "company_created",
    priority: "low",
    referenceId: params.companyId,
    actionUrl: `/dashboard/company_information`,
    sender: params.actor,
    recipients: {
      permissions: ["company_information.manage"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A new project was created. */
export async function notifyProjectCreated(params: {
  projectId: string;
  projectName: string;
  actor?: Sender;
}) {
  await notify({
    title: "New Project Created",
    message: `Project "${params.projectName}" has been created.`,
    module: "projects",
    type: "project_created",
    priority: "low",
    referenceId: params.projectId,
    actionUrl: `/dashboard/projects`,
    sender: params.actor,
    recipients: {
      permissions: ["projects.view", "tasks.manage"],
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A general announcement broadcast to everyone or a target role. */
export async function notifyAnnouncement(params: {
  title: string;
  message: string;
  actionUrl?: string;
  targetRoles?: string[];
  actor?: Sender;
}) {
  await notify({
    title: params.title,
    message: params.message,
    module: "announcements",
    type: "announcement",
    priority: "medium",
    actionUrl: params.actionUrl,
    sender: params.actor,
    recipients: params.targetRoles?.length
      ? { roles: params.targetRoles }
      : { allUsers: true },
  });
}

/** A comment was added to a record. */
export async function notifyComment(params: {
  module: string;
  referenceId: string;
  actionUrl: string;
  commenterName: string;
  recipients: { userIds?: string[]; permissions?: string[] };
  actor?: Sender;
}) {
  await notify({
    title: "New Comment",
    message: `${params.commenterName} added a comment.`,
    module: params.module,
    type: "comment",
    priority: "low",
    referenceId: params.referenceId,
    actionUrl: params.actionUrl,
    sender: params.actor,
    recipients: {
      ...params.recipients,
      excludeUserIds: params.actor?.id ? [params.actor.id] : [],
    },
  });
}

/** A reminder for an upcoming/overdue item. */
export async function notifyReminder(params: {
  module: string;
  referenceId: string;
  actionUrl: string;
  title: string;
  message: string;
  recipients: { userIds?: string[]; permissions?: string[] };
}) {
  await notify({
    title: params.title,
    message: params.message,
    module: params.module,
    type: "reminder",
    priority: "high",
    referenceId: params.referenceId,
    actionUrl: params.actionUrl,
    recipients: params.recipients,
  });
}
