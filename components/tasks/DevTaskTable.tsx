// components/tasks/DevTaskTable.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, CheckSquare, Building, AlertTriangle, ArrowUp, Info, Loader2, Bug } from "lucide-react";
import type { TaskOrComplaint } from "@/hooks/useTaskDev";

interface DevTaskTableProps {
  tasks: TaskOrComplaint[];
  user: any;
  isAdminOrManager: boolean;
  currentTime: Date;
  onViewTask: (task: TaskOrComplaint) => void;
  onMarkDone: (task: TaskOrComplaint) => void;
  isComplaint: (item: TaskOrComplaint) => boolean;
  getDisplayCode: (item: TaskOrComplaint) => string;
  getCompanyName: (item: TaskOrComplaint) => string;
  getWork: (item: TaskOrComplaint) => string;
  getPriority: (item: TaskOrComplaint) => string;
  getStatus: (item: TaskOrComplaint) => string;
  getDeveloperStatus: (item: TaskOrComplaint) => string;
  getAssignedTo: (item: TaskOrComplaint) => any;
  getCreatedAt: (item: TaskOrComplaint) => string;
  getAssignedDate: (item: TaskOrComplaint) => string;
}

const calculateElapsedTime = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return "N/A";
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Handle invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "N/A";
  }
  
  const elapsedMs = end.getTime() - start.getTime();
  
  // Handle negative time
  if (elapsedMs < 0) return "N/A";
  
  const days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((elapsedMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${days}d ${hours}h ${minutes}m`;
};

export function DevTaskTable({
  tasks,
  user,
  isAdminOrManager,
  currentTime,
  onViewTask,
  onMarkDone,
  isComplaint,
  getDisplayCode,
  getCompanyName,
  getWork,
  getPriority,
  getStatus,
  getDeveloperStatus,
  getAssignedTo,
  getCreatedAt,
  getAssignedDate
}: DevTaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-base font-medium">
          {isAdminOrManager ? "No tasks/complaints found" : "No assigned tasks/complaints"}
        </p>
        <p className="text-xs">
          {isAdminOrManager ? "Tasks/complaints will appear here once created" : "Tasks/complaints assigned to you will appear here"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-96">
      <table className="w-full text-sm">
        <thead className="bg-accent/15 border-b sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Code/Number</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Company</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase hidden sm:table-cell">Work/Software</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Priority</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Dev Status</th>
            {isAdminOrManager && (
              <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Assigned To</th>
            )}
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Elapsed Time</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
            {tasks.map((item, index) => {
    const complaint = isComplaint(item);
    const displayCode = getDisplayCode(item);
    const companyName = getCompanyName(item);
    const work = getWork(item);
    const priority = getPriority(item);
    const status = getStatus(item);
    const developerStatus = getDeveloperStatus(item);
    const assignedTo = getAssignedTo(item);
    const createdAt = getCreatedAt(item);
    const assignedDate = getAssignedDate(item);
    const isAssignedToUser = assignedTo?.username === user?.username;
            
            return (
              <tr
                key={item._id}
                className={index % 2 === 0 ? "bg-white" : "bg-accent/15/30 hover:bg-accent/30 transition-colors"}
              >
                <td className="px-3 py-2">
                  <Badge variant="outline" className={
                    complaint 
                      ? "bg-purple-100 text-purple-800 border-purple-300" 
                      : "bg-accent/30 text-secondary border-primary/40"
                  }>
                    {complaint ? "Complaint" : "Task"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {complaint && (
                      <span title="Complaint">
                    <Bug className="h-3 w-3 text-red-500" />
                  </span>
                    )}
                    <Badge variant="outline" className="text-xs font-mono border-primary/40">
                      {displayCode?.split("-")[1] || displayCode}
                    </Badge>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <Building className="h-3 w-3 text-muted-foreground/70 mr-1" />
                    <span className="font-medium text-foreground truncate max-w-[80px] sm:max-w-24" title={companyName}>
                      {companyName}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 hidden sm:table-cell">
                  <span className="text-foreground truncate max-w-[100px] block text-xs" title={work}>
                    {work}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className={
                    priority === "Urgent" ? "bg-red-100 text-red-800 border-red-300" :
                    priority === "High" ? "bg-orange-100 text-orange-800 border-orange-300" :
                    "bg-accent/30 text-secondary border-primary/40"
                  }>
                    {priority === "Urgent" ? (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Urgent
                      </>
                    ) : priority === "High" ? (
                      <>
                        <ArrowUp className="h-3 w-3 mr-1" />
                        High
                      </>
                    ) : (
                      <>
                        <Info className="h-3 w-3 mr-1" />
                        Normal
                      </>
                    )}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge className={
                    status === "assigned" || status === "in-progress" ? "bg-primary" :
                    status === "completed" || status === "resolved" ? "bg-green-600" :
                    status === "pending" || status === "registered" ? "bg-yellow-600" :
                    "bg-muted-foreground"
                  }>
                    <span className="ml-1 capitalize">{status}</span>
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge className={
                    developerStatus === "done" ? "bg-green-600" :
                    developerStatus === "not-done" ? "bg-primary" :
                    developerStatus === "pending" ? "bg-yellow-600" :
                    "bg-muted-foreground"
                  }>
                    <span className="ml-1 capitalize">{developerStatus || "not started"}</span>
                  </Badge>
                </td>
                {isAdminOrManager && (
                  <td className="px-3 py-2">
                    <span className="text-foreground text-xs">
                      {assignedTo?.name || "Unassigned"}
                    </span>
                  </td>
                )}
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {createdAt && assignedDate 
                    ? calculateElapsedTime(createdAt, assignedDate)
                    : "N/A"}
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <Button
                    onClick={() => onViewTask(item)}
                    size="sm"
                    variant="outline"
                    className="text-xs px-3 py-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  {isAssignedToUser && 
                    (status === "assigned" || status === "in-progress" || (status === "rejected" && !complaint)) && (
                    <Button
                      onClick={() => onMarkDone(item)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
                    >
                      <CheckSquare className="h-3 w-3 mr-1" />
                      {complaint ? "Resolve" : (status === "rejected" ? "Fix & Complete" : "Done")}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}