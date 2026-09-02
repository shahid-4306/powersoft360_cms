// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext";
// import type { ITask } from "@/models/Task";
// import type { IOnlineComplaint } from "@/models/OnlineComplaint";

// export type TaskOrComplaint = ITask | IOnlineComplaint;

// // Helper function to check if item is complaint
// export const isComplaint = (item: TaskOrComplaint): item is IOnlineComplaint => {
//   return 'complaintNumber' in item;
// };

// // Helper function to check if item is complaint or null
// export const isComplaintOrNull = (item: TaskOrComplaint | null): item is IOnlineComplaint => {
//   if (!item) return false;
//   return 'complaintNumber' in item;
// };

// export const useTaskDev = () => {
//   const [tasks, setTasks] = useState<TaskOrComplaint[]>([]);
//   const [selectedTask, setSelectedTask] = useState<TaskOrComplaint | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState<any>(null);
//   const { toast } = useToast();

//   // Use refs to track previous values and prevent infinite loops
//   const isFetchingRef = useRef(false);

//   // Sourced from the real cookie-backed session (AuthContext /
//   // /api/auth/me) instead of localStorage, which the login flow never
//   // populates — that mismatch was why this hook's `user` (and therefore
//   // isAdminOrManager / fetchTasks) never resolved for a real session.
//   const { user: authUser } = useAuth();

//   const isAdminOrManager = user?.role?.permissions?.includes("tasks.view.all") ||
//                          user?.role?.name?.toLowerCase().includes("admin") ||
//                          user?.role?.name?.toLowerCase().includes("manager");

//   // Helper functions with proper type handling
//   const getDisplayCode = (item: TaskOrComplaint) => {
//     if (isComplaint(item)) {
//       return item.complaintNumber || "";
//     }
//     return (item as ITask).code || "";
//   };

//   const getCompanyName = (item: TaskOrComplaint) => {
//     if (isComplaint(item)) {
//       return item.company?.companyName || "";
//     }
//     return (item as ITask).company?.name || "";
//   };

//   const getWork = (item: TaskOrComplaint) => {
//     if (isComplaint(item)) {
//       return item.softwareType || "";
//     }
//     return (item as ITask).working || "";
//   };

//   const getPriority = (item: TaskOrComplaint) => {
//     if (isComplaint(item)) {
//       return "Normal"; // Complaints don't have priority in your model
//     }
//     return (item as ITask).priority || "Normal";
//   };

//   const getStatus = (item: TaskOrComplaint) => {
//     // Both ITask and IOnlineComplaint have status property
//     return (item as any).status || "";
//   };

//   const getDeveloperStatus = (item: TaskOrComplaint) => {
//     if (isComplaint(item)) {
//       const status = item.status;
//       switch (status) {
//         case 'in-progress': return 'in-progress';
//         case 'resolved': return 'done';
//         case 'closed': return 'done';
//         case 'registered': return 'pending';
//         default: return status || 'pending';
//       }
//     }
//     const task = item as ITask;
//     return task.developer_status || 'pending';
//   };

//   const getAssignedTo = (item: TaskOrComplaint) => {
//     return (item as any).assignedTo;
//   };

//   const getCreatedAt = (item: TaskOrComplaint) => {
//     return (item as any).createdAt || "";
//   };

//   const getAssignedDate = (item: TaskOrComplaint) => {
//     if (isComplaint(item)) {
//       return item.assignedDate || "";
//     }
//     const task = item as ITask;
//     return task.assignedDate || "";
//   };

//   const getCanMarkDone = (item: TaskOrComplaint) => {
//     if (isComplaint(item)) {
//       return item.status === 'in-progress';
//     }
//     const task = item as ITask;
//     return task.status === 'assigned' || task.finalStatus === 'rejected';
//   };

//   // Memoize fetchTasks with dependencies
// const fetchTasks = useCallback(async () => {
//   if (isFetchingRef.current || !user) return;

//   isFetchingRef.current = true;
//   setIsLoading(true);

//   try {
//     // Fetch tasks and complaints in parallel
//     const tasksPromise = fetch(
//       isAdminOrManager
//         ? '/api/tasks'
//         : `/api/tasks/developer_working?username=${user.username}`
//     );

//     // For complaints, filter by status 'in-progress' for both admins and non-admins
//     const complaintsUrl = isAdminOrManager
//       ? '/api/online-complaints?status=in-progress'
//       : `/api/online-complaints?assignedTo=${user.username}&status=in-progress`;

//     const complaintsPromise = fetch(complaintsUrl);

//     const [tasksRes, complaintsRes] = await Promise.all([
//       tasksPromise,
//       complaintsPromise
//     ]);

//     let tasksData: ITask[] = [];
//     let complaintsData: IOnlineComplaint[] = [];

//     if (tasksRes.ok) {
//       tasksData = await tasksRes.json();
//     } else {
//       console.error('Failed to fetch tasks:', tasksRes.status);
//     }

//     if (complaintsRes.ok) {
//       complaintsData = await complaintsRes.json();
//     } else {
//       console.error('Failed to fetch complaints:', complaintsRes.status);
//       // Don't throw, just use empty array
//     }

//     // Add type discriminator
//     const typedTasks = tasksData.map(task => ({
//       ...task,
//       type: 'task' as const
//     }));

//     const typedComplaints = complaintsData.map(complaint => ({
//       ...complaint,
//       type: 'complaint' as const
//     }));

//     // Combine and filter based on user role and status
//     const allItems: TaskOrComplaint[] = [...typedTasks, ...typedComplaints];

//     // Since API already filters complaints by 'in-progress', we just need to filter tasks
//     const filteredItems = allItems.filter((item) => {
//       if (isComplaint(item)) {
//         // Complaints are already filtered by API to 'in-progress'
//         // Just check assignment for non-admins
//         if (isAdminOrManager) {
//           return true; // Admin sees all 'in-progress' complaints
//         } else {
//           return item.assignedTo?.username === user.username;
//         }
//       } else {
//         const task = item as ITask;
//         // For tasks: same logic as before
//         if (isAdminOrManager) {
//           return (
//             (task.status === "assigned" && task.developer_status !== "done") ||
//             task.finalStatus === "rejected"
//           );
//         } else {
//           return (
//             ((task.status === "assigned" &&
//               task.developer_status !== "done" &&
//               task.assignedTo?.username === user.username) ||
//             (task.finalStatus === "rejected" &&
//               task.assignedTo?.username === user.username))
//           );
//         }
//       }
//     });

//     setTasks(filteredItems);

//     if (filteredItems.length === 0) {
//       toast({
//         title: isAdminOrManager ? "No Tasks/Complaints" : "No Assigned Items",
//         description: isAdminOrManager
//           ? "No in-progress tasks or complaints found in the system."
//           : "No tasks or in-progress complaints assigned to you found.",
//         variant: "default",
//       });
//     }
//   } catch (error) {
//     console.error("Failed to fetch data:", error);
//     toast({
//       title: "Error fetching data",
//       description: "Could not load tasks/complaints. Please try again.",
//       variant: "destructive",
//     });
//   } finally {
//     setIsLoading(false);
//     isFetchingRef.current = false;
//   }
// }, [user, isAdminOrManager, toast]);

//   useEffect(() => {
//     setUser(authUser);
//   }, [authUser]);

//   // Fetch tasks when user changes
//   useEffect(() => {
//     if (user && !isFetchingRef.current) {
//       fetchTasks();
//     }
//   }, [user, fetchTasks]);

//   const handleResolveComplaint = async (complaint: IOnlineComplaint, remarks: string, attachments: File[]) => {
//   if (!remarks.trim()) {
//     toast({
//       title: "Resolution remarks required",
//       description: "Please provide resolution remarks for the complaint.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   try {
//     const formData = new FormData();
//     formData.append('complaintId', complaint._id);
//     formData.append('resolutionRemarks', remarks);

//     attachments.forEach((file) => {
//       formData.append('resolutionAttachments', file);
//     });

//     const response = await fetch('/api/online-complaints/resolve', {
//       method: 'PUT',
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to resolve complaint');
//     }

//     return true;
//   } catch (error) {
//     console.error('Error resolving complaint:', error);
//     toast({
//       title: "Failed to resolve complaint",
//       description: error instanceof Error ? error.message : 'An error occurred',
//       variant: "destructive",
//     });
//     return false;
//   }
// };

//   return {
//     tasks,
//     setTasks,
//     selectedTask,
//     setSelectedTask,
//     isLoading,
//     user,
//     isAdminOrManager,
//     fetchTasks,
//     // Helper functions
//     isComplaint,
//     isComplaintOrNull,
//     getDisplayCode,
//     getCompanyName,
//     getWork,
//     getPriority,
//     getStatus,
//     getDeveloperStatus,
//     getAssignedTo,
//     getCreatedAt,
//     getAssignedDate,
//     getCanMarkDone,
//     handleResolveComplaint
//   };
// };
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { ITask } from "@/models/Task";
import type { IOnlineComplaint } from "@/models/OnlineComplaint";

export type TaskOrComplaint = ITask | IOnlineComplaint;

// Helper function to check if item is complaint
export const isComplaint = (
  item: TaskOrComplaint,
): item is IOnlineComplaint => {
  return "complaintNumber" in item;
};

// Helper function to check if item is complaint or null
export const isComplaintOrNull = (
  item: TaskOrComplaint | null,
): item is IOnlineComplaint => {
  if (!item) return false;
  return "complaintNumber" in item;
};

export const useTaskDev = () => {
  const [tasks, setTasks] = useState<TaskOrComplaint[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskOrComplaint | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Use refs to track previous values and prevent infinite loops
  const isFetchingRef = useRef(false);

  // Sourced from the real cookie-backed session (AuthContext /
  // /api/auth/me) instead of localStorage, which the login flow never
  // populates — that mismatch was why this hook's `user` (and therefore
  // isAdminOrManager / fetchTasks) never resolved for a real session.
  const { user: authUser } = useAuth();

  const isAdminOrManager =
    user?.role?.permissions?.includes("tasks.view.all") ||
    user?.role?.name?.toLowerCase().includes("admin") ||
    user?.role?.name?.toLowerCase().includes("manager");

  // Helper functions with proper type handling
  const getDisplayCode = (item: TaskOrComplaint) => {
    if (isComplaint(item)) {
      return item.complaintNumber || "";
    }
    return (item as ITask).code || "";
  };

  const getCompanyName = (item: TaskOrComplaint) => {
    if (isComplaint(item)) {
      return item.company?.companyName || "";
    }
    return (item as ITask).company?.name || "";
  };

  const getWork = (item: TaskOrComplaint) => {
    if (isComplaint(item)) {
      return item.softwareType || "";
    }
    return (item as ITask).working || "";
  };

  const getPriority = (item: TaskOrComplaint) => {
    if (isComplaint(item)) {
      return "Normal"; // Complaints don't have priority in your model
    }
    // FIX: `ITask` does not declare a `priority` field in the model type,
    // so TypeScript rejects `(item as ITask).priority` even though tasks
    // carry it at runtime. Widen the cast locally to include it.
    return (item as ITask & { priority?: string }).priority || "Normal";
  };

  const getStatus = (item: TaskOrComplaint) => {
    // Both ITask and IOnlineComplaint have status property
    return (item as any).status || "";
  };

  const getDeveloperStatus = (item: TaskOrComplaint) => {
    if (isComplaint(item)) {
      const status = item.status;
      switch (status) {
        case "in-progress":
          return "in-progress";
        case "resolved":
          return "done";
        case "closed":
          return "done";
        case "registered":
          return "pending";
        default:
          return status || "pending";
      }
    }
    const task = item as ITask;
    return task.developer_status || "pending";
  };

  const getAssignedTo = (item: TaskOrComplaint) => {
    return (item as any).assignedTo;
  };

  const getCreatedAt = (item: TaskOrComplaint) => {
    return (item as any).createdAt || "";
  };

  const getAssignedDate = (item: TaskOrComplaint) => {
    if (isComplaint(item)) {
      return item.assignedDate || "";
    }
    const task = item as ITask;
    return task.assignedDate || "";
  };

  const getCanMarkDone = (item: TaskOrComplaint) => {
    if (isComplaint(item)) {
      return item.status === "in-progress";
    }
    const task = item as ITask;
    return task.status === "assigned" || task.finalStatus === "rejected";
  };

  // Memoize fetchTasks with dependencies
  const fetchTasks = useCallback(async () => {
    if (isFetchingRef.current || !user) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      // Fetch tasks and complaints in parallel
      const tasksPromise = fetch(
        isAdminOrManager
          ? "/api/tasks"
          : `/api/tasks/developer_working?username=${user.username}`,
      );

      // For complaints, filter by status 'in-progress' for both admins and non-admins
      const complaintsUrl = isAdminOrManager
        ? "/api/online-complaints?status=in-progress"
        : `/api/online-complaints?assignedTo=${user.username}&status=in-progress`;

      const complaintsPromise = fetch(complaintsUrl);

      const [tasksRes, complaintsRes] = await Promise.all([
        tasksPromise,
        complaintsPromise,
      ]);

      let tasksData: ITask[] = [];
      let complaintsData: IOnlineComplaint[] = [];

      if (tasksRes.ok) {
        tasksData = await tasksRes.json();
      } else {
        console.error("Failed to fetch tasks:", tasksRes.status);
      }

      if (complaintsRes.ok) {
        complaintsData = await complaintsRes.json();
      } else {
        console.error("Failed to fetch complaints:", complaintsRes.status);
        // Don't throw, just use empty array
      }

      // Add type discriminator
      const typedTasks = tasksData.map((task) => ({
        ...task,
        type: "task" as const,
      }));

      const typedComplaints = complaintsData.map((complaint) => ({
        ...complaint,
        type: "complaint" as const,
      }));

      // Combine and filter based on user role and status
      const allItems: TaskOrComplaint[] = [...typedTasks, ...typedComplaints];

      // Since API already filters complaints by 'in-progress', we just need to filter tasks
      const filteredItems = allItems.filter((item) => {
        if (isComplaint(item)) {
          // Complaints are already filtered by API to 'in-progress'
          // Just check assignment for non-admins
          if (isAdminOrManager) {
            return true; // Admin sees all 'in-progress' complaints
          } else {
            return item.assignedTo?.username === user.username;
          }
        } else {
          const task = item as ITask;
          // For tasks: same logic as before
          if (isAdminOrManager) {
            return (
              (task.status === "assigned" &&
                task.developer_status !== "done") ||
              task.finalStatus === "rejected"
            );
          } else {
            return (
              (task.status === "assigned" &&
                task.developer_status !== "done" &&
                task.assignedTo?.username === user.username) ||
              (task.finalStatus === "rejected" &&
                task.assignedTo?.username === user.username)
            );
          }
        }
      });

      setTasks(filteredItems);

      if (filteredItems.length === 0) {
        toast({
          title: isAdminOrManager ? "No Tasks/Complaints" : "No Assigned Items",
          description: isAdminOrManager
            ? "No in-progress tasks or complaints found in the system."
            : "No tasks or in-progress complaints assigned to you found.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load tasks/complaints. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user, isAdminOrManager, toast]);

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  // Fetch tasks when user changes
  useEffect(() => {
    if (user && !isFetchingRef.current) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const handleResolveComplaint = async (
    complaint: IOnlineComplaint,
    remarks: string,
    attachments: File[],
  ) => {
    if (!remarks.trim()) {
      toast({
        title: "Resolution remarks required",
        description: "Please provide resolution remarks for the complaint.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("complaintId", complaint._id);
      formData.append("resolutionRemarks", remarks);

      attachments.forEach((file) => {
        formData.append("resolutionAttachments", file);
      });

      const response = await fetch("/api/online-complaints/resolve", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resolve complaint");
      }

      return true;
    } catch (error) {
      console.error("Error resolving complaint:", error);
      toast({
        title: "Failed to resolve complaint",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    tasks,
    setTasks,
    selectedTask,
    setSelectedTask,
    isLoading,
    user,
    isAdminOrManager,
    fetchTasks,
    // Helper functions
    isComplaint,
    isComplaintOrNull,
    getDisplayCode,
    getCompanyName,
    getWork,
    getPriority,
    getStatus,
    getDeveloperStatus,
    getAssignedTo,
    getCreatedAt,
    getAssignedDate,
    getCanMarkDone,
    handleResolveComplaint,
  };
};
