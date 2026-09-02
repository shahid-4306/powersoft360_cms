import { useMemo } from "react";
import type { Task, Complaint, DashboardStats } from "@/hooks/use-dashboard";

export interface AnalyticsRow {
  id: string;
  code: string; // task code / complaint number
  companyId: string;
  companyName: string;
  title: string; // "working" for tasks, complaintRemarks for complaints
  category: string; // software type
  assignedStaff: string;
  status: string;
  priority: string;
  createdAt: string;
  completionDate: string;
}

export interface MetricConfig {
  key: keyof DashboardStats;
  label: string;
  description: string;
  dataset: "tasks" | "complaints";
}

// Every card rendered by StatsCards.tsx maps to one of these metrics.
// Keeping this list in sync with StatsCards.tsx is what makes every
// dashboard card clickable and lets the analytics page know which
// rows to show and how to label them.
export const METRICS: Record<string, MetricConfig> = {
  totalTasks: { key: "totalTasks", label: "Total Tasks", description: "All tasks created", dataset: "tasks" },
  completedTasks: { key: "completedTasks", label: "Completed Tasks", description: "Tasks finished", dataset: "tasks" },
  approvedTasks: { key: "approvedTasks", label: "Approved Tasks", description: "Ready for work", dataset: "tasks" },
  pendingTasks: { key: "pendingTasks", label: "Pending Tasks", description: "Awaiting action", dataset: "tasks" },
  userTotalTasks: { key: "userTotalTasks", label: "My Tasks", description: "Tasks assigned to me / created by me", dataset: "tasks" },
  userCompletedTasks: { key: "userCompletedTasks", label: "My Completed Tasks", description: "My completed tasks", dataset: "tasks" },
  userPendingTasks: { key: "userPendingTasks", label: "My Pending Tasks", description: "My pending tasks", dataset: "tasks" },
  totalComplaints: { key: "totalComplaints", label: "Total Complaints", description: "All complaints registered", dataset: "complaints" },
  inProgressComplaints: { key: "inProgressComplaints", label: "In Progress Complaints", description: "Complaints in progress", dataset: "complaints" },
  resolvedComplaints: { key: "resolvedComplaints", label: "Resolved Complaints", description: "Successfully resolved", dataset: "complaints" },
  closedComplaints: { key: "closedComplaints", label: "Closed Complaints", description: "Confirmed complete and closed", dataset: "complaints" },
  userTotalComplaints: { key: "userTotalComplaints", label: "My Total Complaints", description: "All my assigned complaints", dataset: "complaints" },
  userInProgressComplaints: { key: "userInProgressComplaints", label: "My In-Progress Complaints", description: "My in-progress complaints", dataset: "complaints" },
  userResolvedComplaints: { key: "userResolvedComplaints", label: "My Resolved Complaints", description: "My resolved complaints", dataset: "complaints" },
  userClosedComplaints: { key: "userClosedComplaints", label: "My Closed Complaints", description: "My closed complaints", dataset: "complaints" },
};

function taskRow(t: Task): AnalyticsRow {
  const anyT = t as any;
  return {
    id: t._id,
    code: t.code || t._id,
    companyId: anyT.company?.id || "",
    companyName: t.company?.name || "N/A",
    title: t.working || "",
    category: anyT.softwareType || "N/A",
    assignedStaff: t.assignedTo?.name || t.assignedTo?.username || "Unassigned",
    status: t.finalStatus || t.status || "pending",
    priority: anyT.priority || "N/A",
    createdAt: t.createdAt,
    completionDate: anyT.completionApprovedAt || (t.status === "completed" ? t.createdAt : ""),
  };
}

function complaintRow(c: Complaint): AnalyticsRow {
  const anyC = c as any;
  return {
    id: c._id,
    code: c.complaintNumber,
    companyId: c.company?.companyId || "",
    companyName: c.company?.companyName || "N/A",
    title: c.complaintRemarks || "",
    category: c.softwareType || "N/A",
    assignedStaff: c.assignedTo?.name || c.assignedTo?.username || "Unassigned",
    status: c.status || "registered",
    priority: anyC.priority || "N/A",
    createdAt: c.createdAt,
    completionDate: c.resolvedDate || "",
  };
}

function filterByMetric(
  key: string,
  tasks: Task[],
  complaints: Complaint[],
  userTasks: Task[],
  userComplaints: Complaint[],
): AnalyticsRow[] {
  const isDone = (t: Task) => t.status === "completed" || t.finalStatus === "done";

  switch (key) {
    case "totalTasks":
      return tasks.map(taskRow);
    case "completedTasks":
      return tasks.filter(isDone).map(taskRow);
    case "approvedTasks":
      return tasks.filter((t) => t.approved).map(taskRow);
    case "pendingTasks":
      return tasks.filter((t) => t.status === "pending").map(taskRow);
    case "userTotalTasks":
      return userTasks.map(taskRow);
    case "userCompletedTasks":
      return userTasks.filter(isDone).map(taskRow);
    case "userPendingTasks":
      return userTasks.filter((t) => t.status === "pending").map(taskRow);
    case "totalComplaints":
      return complaints.map(complaintRow);
    case "inProgressComplaints":
      return complaints.filter((c) => c.status === "in-progress").map(complaintRow);
    case "resolvedComplaints":
      return complaints.filter((c) => c.status === "resolved").map(complaintRow);
    case "closedComplaints":
      return complaints.filter((c) => c.status === "closed").map(complaintRow);
    case "userTotalComplaints":
      return userComplaints.map(complaintRow);
    case "userInProgressComplaints":
      return userComplaints.filter((c) => c.status === "in-progress").map(complaintRow);
    case "userResolvedComplaints":
      return userComplaints.filter((c) => c.status === "resolved").map(complaintRow);
    case "userClosedComplaints":
      return userComplaints.filter((c) => c.status === "closed").map(complaintRow);
    default:
      return [];
  }
}

export function useDashboardAnalytics(
  metricKey: string | null,
  tasks: Task[],
  complaints: Complaint[],
  userTasks: Task[],
  userComplaints: Complaint[],
) {
  const metric = metricKey ? METRICS[metricKey] : undefined;

  const rows = useMemo(() => {
    if (!metricKey) return [];
    return filterByMetric(metricKey, tasks, complaints, userTasks, userComplaints);
  }, [metricKey, tasks, complaints, userTasks, userComplaints]);

  return { metric, rows };
}
