// import { useState, useEffect, useCallback } from "react";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext";
// import type { ITask } from "@/models/Task";

// interface UserSession {
//   id: string;
//   username: string;
// }

// interface Developer {
//   _id: string;
//   username: string;
//   name: string;
//   role: {
//     name: string;
//     permissions: string[];
//   };
// }

// interface OnlineComplaint {
//   _id: string;
//   complaintNumber: string;
//   company: {
//     city: string;
//     address: string;
//     companyRepresentative: string;
//     support: string;
//   };
//   softwareType: string;
//   contactPerson: string;
//   contactPhone: string;
//   complaintRemarks: string;
//   status: string;
//   assignedDate?: string;
//   assignedTo?: {
//     id: string;
//     username: string;
//     name: string;
//     role: {
//       name: string;
//     };
//   };
//   assignmentRemarks?: string;
//   developer_status?: string;
//   resolutionRemarks?: string;
//   resolvedDate?: string;
//   completionApproved?: boolean;
//   completionRemarks?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // Separate types for task and complaint items
// interface TaskItem {
//   type: 'task';
//   _id: string;
//   code: string;
//   company: {
//     name?: string;
//     city: string;
//     address: string;
//     companyRepresentative?: string;
//     support?: string;
//   };
//   contact?: {
//     name?: string;
//     phone?: string;
//   };
//   working?: string;
//   status: string;
//   assignedTo?: {
//     id: string;
//     username: string;
//     name: string;
//     role: { name: string };
//   };
//   createdAt: string;
//   assignedDate?: string;
//   // Additional task-specific properties for the dialog
//   dateTime?: string;
//   priority?: string;
//   approved?: boolean;
//   completionApproved?: boolean;
//   TaskRemarks?: string;
//   assignmentRemarks?: string;
//   completionRemarks?: string;
//   developer_remarks?: string;
//   developer_status?: string;
// }

// interface ComplaintItem {
//   type: 'complaint';
//   _id: string;
//   complaintNumber: string;
//   company: {
//     city: string;
//     address: string;
//     companyRepresentative?: string;
//     support?: string;
//   };
//   softwareType?: string;
//   contactPerson?: string;
//   contactPhone?: string;
//   status: string;
//   assignedTo?: {
//     id: string;
//     username: string;
//     name: string;
//     role: { name: string };
//   };
//   createdAt: string;
//   assignedDate?: string;
//   resolvedDate?: string;
// }

// type CombinedItem = TaskItem | ComplaintItem;

// export const useUnpostTask = () => {
//   const [items, setItems] = useState<CombinedItem[]>([]);
//   const [developers, setDevelopers] = useState<Developer[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null); // Only for tasks
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState<CombinedItem | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [user, setUser] = useState<UserSession | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const { toast } = useToast();

//   const fetchDevelopers = useCallback(async () => {
//     try {
//       const response = await fetch("/api/users");
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();

//       const allUsers = data.filter((user: any) =>
//         user._id && user.username && user.name && user.role
//       );
//       setDevelopers(allUsers);
//     } catch (error) {
//       console.error("Failed to fetch developers:", error);
//       toast({
//         title: "Error fetching users",
//         description: "Could not load user list.",
//         variant: "destructive",
//       });
//     }
//   }, [toast]);

//   const fetchTasks = useCallback(async (): Promise<TaskItem[]> => {
//     try {
//       const response = await fetch("/api/tasks?status=completed");
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data: ITask[] = await response.json();

//       return data.map((task: ITask): TaskItem => ({
//         type: 'task',
//         _id: task._id,
//         code: task.code || "",
//         company: {
//           name: task.company?.name || "N/A",
//           city: task.company?.city || "N/A",
//           address: task.company?.address || "N/A",
//           companyRepresentative: task.company?.companyRepresentative || "",
//           support: task.company?.support || ""
//         },
//         contact: task.contact ? {
//           name: task.contact.name || "N/A",
//           phone: task.contact.phone || "N/A"
//         } : undefined,
//         working: task.working || "N/A",
//         status: task.status || "N/A",
//         assignedTo: task.assignedTo || undefined,
//         createdAt: task.createdAt || new Date().toISOString(),
//         assignedDate: task.assignedDate,
//         // Additional properties for task dialog
//         dateTime: task.dateTime,
//         priority: task.priority,
//         approved: task.approved,
//         completionApproved: task.completionApproved,
//         TaskRemarks: task.TaskRemarks,
//         assignmentRemarks: task.assignmentRemarks,
//         completionRemarks: task.completionRemarks,
//         developer_remarks: task.developer_remarks,
//         developer_status: task.developer_status,
//       }));
//     } catch (error) {
//       console.error("Failed to fetch tasks:", error);
//       toast({
//         title: "Error fetching tasks",
//         description: "Could not load tasks. Please try again.",
//         variant: "destructive",
//       });
//       return [];
//     }
//   }, [toast]);

//   const fetchComplaints = useCallback(async (): Promise<ComplaintItem[]> => {
//     try {
//       const response = await fetch("/api/online-complaints");
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data: OnlineComplaint[] = await response.json();

//       // REMOVED FILTER - Show ALL complaints regardless of status
//       // const closedComplaints = data.filter(complaint => complaint.status === 'closed');
//       // return closedComplaints.map((complaint: OnlineComplaint): ComplaintItem => ({

//       return data.map((complaint: OnlineComplaint): ComplaintItem => ({
//         type: 'complaint',
//         _id: complaint._id,
//         complaintNumber: complaint.complaintNumber,
//         company: {
//           city: complaint.company?.city || "N/A",
//           address: complaint.company?.address || "N/A",
//           companyRepresentative: complaint.company?.companyRepresentative || "",
//           support: complaint.company?.support || ""
//         },
//         softwareType: complaint.softwareType || "N/A",
//         contactPerson: complaint.contactPerson || "N/A",
//         contactPhone: complaint.contactPhone || "N/A",
//         status: complaint.status || "N/A",
//         assignedTo: complaint.assignedTo || undefined,
//         createdAt: complaint.createdAt,
//         assignedDate: complaint.assignedDate,
//         resolvedDate: complaint.resolvedDate,
//       }));
//     } catch (error) {
//       console.error("Failed to fetch complaints:", error);
//       toast({
//         title: "Error fetching complaints",
//         description: "Could not load complaints. Please try again.",
//         variant: "destructive",
//       });
//       return [];
//     }
//   }, [toast]);

//   const fetchAllItems = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const [tasks, complaints] = await Promise.all([
//         fetchTasks(),
//         fetchComplaints()
//       ]);

//       // Combine and sort by creation date (newest first)
//       const allItems: CombinedItem[] = [...tasks, ...complaints].sort(
//         (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       );

//       setItems(allItems);
//     } catch (error) {
//       console.error("Failed to fetch items:", error);
//       toast({
//         title: "Error fetching items",
//         description: "Could not load items. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchTasks, fetchComplaints, toast]);

// const handleDeleteItem = useCallback(async () => {
//   if (!itemToDelete) return;

//   setIsDeleting(true);
//   try {
//     let endpoint: string;
//     let successMessage: string;

//     if (itemToDelete.type === 'task') {
//       endpoint = `/api/tasks/${itemToDelete._id}`;
//       successMessage = `Task ${itemToDelete.code} has been deleted successfully.`;
//     } else {
//       // For complaints, use the complaint ID
//       endpoint = `/api/online-complaints/${itemToDelete._id}`;
//       successMessage = `Complaint ${itemToDelete.complaintNumber} has been deleted successfully.`;
//     }

//     console.log("Deleting item from endpoint:", endpoint);

//     const response = await fetch(endpoint, {
//       method: "DELETE",
//     });

//     console.log("Delete response status:", response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Delete error response:", errorText);
//       throw new Error(`Failed to delete item: ${response.status} ${errorText}`);
//     }

//     const result = await response.json();
//     console.log("Delete successful:", result);

//     setItems(items.filter(item => item._id !== itemToDelete._id));
//     setDeleteDialogOpen(false);
//     toast({
//       title: "Item Deleted",
//       description: successMessage,
//     });
//   } catch (error) {
//     console.error("Error deleting item:", error);
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to delete item. Please try again.",
//       variant: "destructive",
//     });
//   } finally {
//     setIsDeleting(false);
//   }
// }, [itemToDelete, items, toast]);

//   // Sourced from the real cookie-backed session (AuthContext /
//   // /api/auth/me) instead of localStorage, which the login flow never
//   // populates — that mismatch was why `user` never resolved here and
//   // the item-fetching effect below never ran.
//   const { user: authUser } = useAuth();

//   useEffect(() => {
//     if (authUser?.id && authUser?.username) {
//       setUser({ id: authUser.id, username: authUser.username });
//     } else {
//       setUser(null);
//     }
//   }, [authUser]);

//   useEffect(() => {
//     if (user) {
//       fetchAllItems();
//       fetchDevelopers();
//     }
//   }, [user, fetchAllItems, fetchDevelopers]);

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(items.length / itemsPerPage);

//   return {
//     // State
//     items,
//     developers,
//     isLoading,
//     isSubmitting,
//     selectedTask,
//     deleteDialogOpen,
//     itemToDelete,
//     isDeleting,
//     user,
//     currentPage,
//     itemsPerPage,
//     currentItems,
//     totalPages,

//     // Actions
//     setSelectedTask,
//     setDeleteDialogOpen,
//     setItemToDelete,
//     setCurrentPage,
//     setItemsPerPage,

//     // Functions
//     fetchAllItems,
//     handleDeleteItem,
//   };
// };

// // Export types for use in other components
// export type { TaskItem, ComplaintItem, CombinedItem, OnlineComplaint, Developer };
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { ITask } from "@/models/Task";

interface UserSession {
  id: string;
  username: string;
}

interface Developer {
  _id: string;
  username: string;
  name: string;
  role: {
    name: string;
    permissions: string[];
  };
}

interface OnlineComplaint {
  _id: string;
  complaintNumber: string;
  company: {
    city: string;
    address: string;
    companyRepresentative: string;
    support: string;
  };
  softwareType: string;
  contactPerson: string;
  contactPhone: string;
  complaintRemarks: string;
  status: string;
  assignedDate?: string;
  assignedTo?: {
    id: string;
    username: string;
    name: string;
    role: {
      name: string;
    };
  };
  assignmentRemarks?: string;
  developer_status?: string;
  resolutionRemarks?: string;
  resolvedDate?: string;
  completionApproved?: boolean;
  completionRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

// Separate types for task and complaint items
interface TaskItem {
  type: "task";
  _id: string;
  code: string;
  company: {
    name?: string;
    city: string;
    address: string;
    companyRepresentative?: string;
    support?: string;
  };
  contact?: {
    name?: string;
    phone?: string;
  };
  working?: string;
  status: string;
  assignedTo?: {
    id: string;
    username: string;
    name: string;
    role: { name: string };
  };
  createdAt: string;
  assignedDate?: string;
  // Additional task-specific properties for the dialog
  dateTime?: string;
  priority?: string;
  approved?: boolean;
  completionApproved?: boolean;
  TaskRemarks?: string;
  assignmentRemarks?: string;
  completionRemarks?: string;
  developer_remarks?: string;
  developer_status?: string;
}

interface ComplaintItem {
  type: "complaint";
  _id: string;
  complaintNumber: string;
  company: {
    city: string;
    address: string;
    companyRepresentative?: string;
    support?: string;
  };
  softwareType?: string;
  contactPerson?: string;
  contactPhone?: string;
  status: string;
  assignedTo?: {
    id: string;
    username: string;
    name: string;
    role: { name: string };
  };
  createdAt: string;
  assignedDate?: string;
  resolvedDate?: string;
}

type CombinedItem = TaskItem | ComplaintItem;

export const useUnpostTask = () => {
  const [items, setItems] = useState<CombinedItem[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null); // Only for tasks
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CombinedItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  const fetchDevelopers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const allUsers = data.filter(
        (user: any) => user._id && user.username && user.name && user.role,
      );
      setDevelopers(allUsers);
    } catch (error) {
      console.error("Failed to fetch developers:", error);
      toast({
        title: "Error fetching users",
        description: "Could not load user list.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchTasks = useCallback(async (): Promise<TaskItem[]> => {
    try {
      const response = await fetch("/api/tasks?status=completed");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ITask[] = await response.json();

      return data.map(
        (task: ITask): TaskItem => ({
          type: "task",
          _id: task._id,
          code: task.code || "",
          company: {
            name: task.company?.name || "N/A",
            city: task.company?.city || "N/A",
            address: task.company?.address || "N/A",
            companyRepresentative: task.company?.companyRepresentative || "",
            support: task.company?.support || "",
          },
          contact: task.contact
            ? {
                name: task.contact.name || "N/A",
                phone: task.contact.phone || "N/A",
              }
            : undefined,
          working: task.working || "N/A",
          status: task.status || "N/A",
          assignedTo: task.assignedTo || undefined,
          createdAt: task.createdAt || new Date().toISOString(),
          assignedDate: task.assignedDate,
          // Additional properties for task dialog
          dateTime: task.dateTime,
          // FIX: `ITask` does not declare a `priority` field in the model
          // type, so TypeScript rejects `task.priority` even though tasks
          // carry it at runtime. Widen the cast locally to include it.
          priority: (task as ITask & { priority?: string }).priority,
          approved: task.approved,
          completionApproved: task.completionApproved,
          TaskRemarks: task.TaskRemarks,
          assignmentRemarks: task.assignmentRemarks,
          completionRemarks: task.completionRemarks,
          developer_remarks: task.developer_remarks,
          developer_status: task.developer_status,
        }),
      );
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast({
        title: "Error fetching tasks",
        description: "Could not load tasks. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const fetchComplaints = useCallback(async (): Promise<ComplaintItem[]> => {
    try {
      const response = await fetch("/api/online-complaints");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: OnlineComplaint[] = await response.json();

      // REMOVED FILTER - Show ALL complaints regardless of status
      // const closedComplaints = data.filter(complaint => complaint.status === 'closed');
      // return closedComplaints.map((complaint: OnlineComplaint): ComplaintItem => ({

      return data.map(
        (complaint: OnlineComplaint): ComplaintItem => ({
          type: "complaint",
          _id: complaint._id,
          complaintNumber: complaint.complaintNumber,
          company: {
            city: complaint.company?.city || "N/A",
            address: complaint.company?.address || "N/A",
            companyRepresentative:
              complaint.company?.companyRepresentative || "",
            support: complaint.company?.support || "",
          },
          softwareType: complaint.softwareType || "N/A",
          contactPerson: complaint.contactPerson || "N/A",
          contactPhone: complaint.contactPhone || "N/A",
          status: complaint.status || "N/A",
          assignedTo: complaint.assignedTo || undefined,
          createdAt: complaint.createdAt,
          assignedDate: complaint.assignedDate,
          resolvedDate: complaint.resolvedDate,
        }),
      );
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      toast({
        title: "Error fetching complaints",
        description: "Could not load complaints. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const fetchAllItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasks, complaints] = await Promise.all([
        fetchTasks(),
        fetchComplaints(),
      ]);

      // Combine and sort by creation date (newest first)
      const allItems: CombinedItem[] = [...tasks, ...complaints].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setItems(allItems);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast({
        title: "Error fetching items",
        description: "Could not load items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks, fetchComplaints, toast]);

  const handleDeleteItem = useCallback(async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      let endpoint: string;
      let successMessage: string;

      if (itemToDelete.type === "task") {
        endpoint = `/api/tasks/${itemToDelete._id}`;
        successMessage = `Task ${itemToDelete.code} has been deleted successfully.`;
      } else {
        // For complaints, use the complaint ID
        endpoint = `/api/online-complaints/${itemToDelete._id}`;
        successMessage = `Complaint ${itemToDelete.complaintNumber} has been deleted successfully.`;
      }

      console.log("Deleting item from endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Delete error response:", errorText);
        throw new Error(
          `Failed to delete item: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("Delete successful:", result);

      setItems(items.filter((item) => item._id !== itemToDelete._id));
      setDeleteDialogOpen(false);
      toast({
        title: "Item Deleted",
        description: successMessage,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, items, toast]);

  // Sourced from the real cookie-backed session (AuthContext /
  // /api/auth/me) instead of localStorage, which the login flow never
  // populates — that mismatch was why `user` never resolved here and
  // the item-fetching effect below never ran.
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser?.id && authUser?.username) {
      setUser({ id: authUser.id, username: authUser.username });
    } else {
      setUser(null);
    }
  }, [authUser]);

  useEffect(() => {
    if (user) {
      fetchAllItems();
      fetchDevelopers();
    }
  }, [user, fetchAllItems, fetchDevelopers]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return {
    // State
    items,
    developers,
    isLoading,
    isSubmitting,
    selectedTask,
    deleteDialogOpen,
    itemToDelete,
    isDeleting,
    user,
    currentPage,
    itemsPerPage,
    currentItems,
    totalPages,

    // Actions
    setSelectedTask,
    setDeleteDialogOpen,
    setItemToDelete,
    setCurrentPage,
    setItemsPerPage,

    // Functions
    fetchAllItems,
    handleDeleteItem,
  };
};

// Export types for use in other components
export type {
  TaskItem,
  ComplaintItem,
  CombinedItem,
  OnlineComplaint,
  Developer,
};
