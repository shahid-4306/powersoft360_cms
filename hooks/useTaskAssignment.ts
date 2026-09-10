// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext";

// interface UserSession {
//   id: string;
//   username: string;
//   role: {
//     id: string;
//     name: string;
//     permissions: string[];
//   };
// }

// interface AssignmentData {
//   userId: string;
//   assignedDate: string;
//   expectedCompletionAt: string;
// }

// interface OnlineComplaint {
//   _id: string;
//   complaintNumber: string;
//   company: any;
//   softwareType: string;
//   complaintType?: string;
//   contactPerson: string;
//   contactPhone: string;
//   complaintRemarks: string;
//   status: string;
//   createdAt: string;
// }

// export function useTaskAssignment() {
//   const [pendingTasks, setPendingTasks] = useState<any[]>([]);
//   const [onlineComplaints, setOnlineComplaints] = useState<OnlineComplaint[]>(
//     [],
//   );
//   const [approvedTasks, setApprovedTasks] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState<UserSession | null>(null);
//   const { toast } = useToast();
//   const router = useRouter();

//   // Authentication and permission check — sourced from the real
//   // cookie-backed session (AuthContext / /api/auth/me) instead of
//   // localStorage, which the login flow never populates.
//   const { user: authUser, isLoading: authLoading } = useAuth();
//   const hasNotifiedRef = useRef(false);

//   useEffect(() => {
//     if (authLoading) return;

//     if (!authUser) {
//       if (!hasNotifiedRef.current) {
//         hasNotifiedRef.current = true;
//         toast({
//           title: "Session Expired",
//           description: "Please log in to continue.",
//           variant: "destructive",
//         });
//         router.push("/login");
//       }
//       return;
//     }

//     if (!authUser.role?.permissions?.includes("tasks.assign")) {
//       if (!hasNotifiedRef.current) {
//         hasNotifiedRef.current = true;
//         toast({
//           title: "Access Denied",
//           description: "You do not have permission to assign tasks.",
//           variant: "destructive",
//         });
//         router.push("/dashboard");
//       }
//       return;
//     }

//     hasNotifiedRef.current = false;
//     setUser(authUser as UserSession);
//   }, [authLoading, authUser, router, toast]);

//   // SSE for real-time updates (for tasks)
//   useEffect(() => {
//     if (!user) return;

//     const eventSource = new EventSource("/api/tasks/stream");

//     eventSource.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log("SSE Data received:", data);

//         // Ensure data is an array before filtering
//         if (Array.isArray(data)) {
//           const pending = data.filter(
//             (task: any) =>
//               task.status === "pending" ||
//               task.status === "Pending" ||
//               !task.approved,
//           );
//           const approved = data.filter(
//             (task: any) =>
//               task.status === "assigned" ||
//               task.status === "Assigned" ||
//               task.approved,
//           );

//           console.log("Pending tasks after SSE:", pending);
//           console.log("Approved tasks after SSE:", approved);

//           setPendingTasks(pending);
//           setApprovedTasks(approved);
//         }
//       } catch (error) {
//         console.error("Error parsing SSE data:", error);
//       }
//     };

//     eventSource.onerror = (error) => {
//       console.error("SSE connection error:", error);
//       eventSource.close();
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, [user]);

//   // Fetch online complaints
//   const fetchOnlineComplaints = useCallback(async () => {
//     try {
//       console.log("Fetching online complaints...");
//       const response = await fetch("/api/online-complaints");

//       if (!response.ok) {
//         console.error("Failed to fetch online complaints:", response.status);
//         return;
//       }

//       const result = await response.json();
//       console.log("Online complaints API response:", result);

//       // Based on your API response structure
//       let complaintsArray: OnlineComplaint[] = [];

//       if (Array.isArray(result)) {
//         // Direct array response
//         complaintsArray = result;
//       } else if (result && typeof result === "object") {
//         // Object with complaints array
//         if (Array.isArray(result.complaints)) {
//           complaintsArray = result.complaints;
//         } else if (result.success && Array.isArray(result.data)) {
//           complaintsArray = result.data;
//         }
//       }

//       console.log("Extracted complaints array:", complaintsArray);

//       // Filter only complaints with status 'registered'
//       const registeredComplaints = complaintsArray
//         .filter(
//           (complaint: OnlineComplaint) => complaint.status === "registered",
//         )
//         .map((complaint) => ({
//           ...complaint,
//           // Ensure _id exists, generate if not
//           _id:
//             complaint._id ||
//             complaint.complaintNumber ||
//             `complaint-${Date.now()}-${Math.random()}`,
//         }));

//       console.log("Filtered registered complaints:", registeredComplaints);
//       setOnlineComplaints(registeredComplaints);
//     } catch (error) {
//       console.error("Error fetching online complaints:", error);
//       setOnlineComplaints([]);
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     if (!user) return;

//     setIsLoading(true);
//     try {
//       // Fetch tasks and users in parallel
//       const tasksPromises = [
//         fetch("/api/tasks/pending").then((res) => {
//           if (!res.ok) throw new Error(`Tasks pending: ${res.status}`);
//           return res.json();
//         }),
//         fetch("/api/tasks/approved").then((res) => {
//           if (!res.ok) throw new Error(`Tasks approved: ${res.status}`);
//           return res.json();
//         }),
//       ];

//       const [pendingData, approvedData] = await Promise.all(tasksPromises);

//       // Ensure we have arrays and ensure IDs exist
//       const pendingTasksArray = (
//         Array.isArray(pendingData) ? pendingData : []
//       ).map((task) => ({
//         ...task,
//         _id: task._id || task.code || `task-${Date.now()}-${Math.random()}`,
//       }));

//       const approvedTasksArray = (
//         Array.isArray(approvedData) ? approvedData : []
//       ).map((task) => ({
//         ...task,
//         _id: task._id || task.code || `task-${Date.now()}-${Math.random()}`,
//       }));

//       console.log("Fetched pending tasks:", pendingTasksArray);
//       console.log("Fetched approved tasks:", approvedTasksArray);

//       setPendingTasks(pendingTasksArray);
//       setApprovedTasks(approvedTasksArray);

//       // Fetch users
//       try {
//         const usersResponse = await fetch("/api/users");
//         if (usersResponse.ok) {
//           const usersData = await usersResponse.json();
//           const usersArray = Array.isArray(usersData) ? usersData : [];
//           setUsers(usersArray);
//         } else {
//           console.error("Failed to fetch users:", usersResponse.status);
//           setUsers([]);
//         }
//       } catch (usersError) {
//         console.error("Error fetching users:", usersError);
//         setUsers([]);
//       }

//       // Fetch online complaints
//       await fetchOnlineComplaints();
//     } catch (error) {
//       console.error("Failed to fetch data:", error);
//       toast({
//         title: "Error fetching data",
//         description: "Could not load tasks and users. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user, toast, fetchOnlineComplaints]);

//   useEffect(() => {
//     if (user) {
//       fetchData();
//     }
//   }, [user, fetchData]);

//   const assignTask = async (
//     taskId: string,
//     assignmentData: AssignmentData,
//     remarks: string,
//     files: File[],
//   ) => {
//     const selectedUser = users.find((u) => u._id === assignmentData.userId);
//     if (!selectedUser) {
//       throw new Error("Selected user not found");
//     }

//     const formData = new FormData();
//     formData.append("taskId", taskId);
//     formData.append("userId", selectedUser._id);
//     formData.append("username", selectedUser.username);
//     formData.append("name", selectedUser.name);
//     formData.append("roleName", selectedUser.role?.name || "No Role");
//     formData.append("assignedDate", assignmentData.assignedDate);
//     formData.append(
//       "expectedCompletionAt",
//       assignmentData.expectedCompletionAt,
//     );
//     formData.append("remarks", remarks);

//     files.forEach((file) => {
//       formData.append("files", file);
//     });

//     const response = await fetch("/api/tasks/assign", {
//       method: "PUT",
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(
//         `HTTP error! status: ${response.status}, message: ${errorData.message}`,
//       );
//     }

//     return await response.json();
//   };

//   const assignComplaint = async (
//     complaintId: string,
//     assignmentData: AssignmentData,
//     remarks: string,
//     files: File[],
//   ) => {
//     const selectedUser = users.find((u) => u._id === assignmentData.userId);
//     if (!selectedUser) {
//       throw new Error("Selected user not found");
//     }

//     const formData = new FormData();
//     formData.append("complaintId", complaintId);
//     formData.append("userId", selectedUser._id);
//     formData.append("username", selectedUser.username);
//     formData.append("name", selectedUser.name);
//     formData.append("roleName", selectedUser.role?.name || "No Role");
//     formData.append("assignedDate", assignmentData.assignedDate);
//     formData.append(
//       "expectedCompletionAt",
//       assignmentData.expectedCompletionAt,
//     );
//     formData.append("remarks", remarks);

//     files.forEach((file) => {
//       formData.append("files", file);
//     });

//     const response = await fetch("/api/online-complaints/assign", {
//       method: "PUT",
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(
//         `HTTP error! status: ${response.status}, message: ${errorData.message}`,
//       );
//     }

//     return await response.json();
//   };

//   const rejectComplaint = async (complaintId: string, remarks: string) => {
//     const response = await fetch("/api/online-complaints/reject", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ complaintId, remarks }),
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//       throw new Error(
//         data?.message || `HTTP error! status: ${response.status}`,
//       );
//     }

//     return data;
//   };

//   return {
//     pendingTasks,
//     onlineComplaints,
//     approvedTasks,
//     users,
//     user,
//     isLoading,
//     fetchData,
//     assignTask,
//     assignComplaint,
//     rejectComplaint,
//     setPendingTasks,
//     setOnlineComplaints,
//     setApprovedTasks,
//   };
// }

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UserSession {
  id: string;
  username: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

interface AssignmentData {
  userId: string;
  assignedDate: string;
  expectedCompletionAt: string;
}

interface OnlineComplaint {
  _id: string;
  complaintNumber: string;
  company: any;
  softwareType: string;
  complaintType?: string;
  contactPerson: string;
  contactPhone: string;
  complaintRemarks: string;
  status: string;
  createdAt: string;
}

export function useTaskAssignment() {
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [onlineComplaints, setOnlineComplaints] = useState<OnlineComplaint[]>(
    [],
  );
  const [approvedTasks, setApprovedTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Authentication and permission check — sourced from the real
  // cookie-backed session (AuthContext / /api/auth/me) instead of
  // localStorage, which the login flow never populates.
  const { user: authUser, isLoading: authLoading } = useAuth();
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true;
        toast({
          title: "Session Expired",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        router.push("/login");
      }
      return;
    }

    if (!authUser.role?.permissions?.includes("tasks.assign")) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true;
        toast({
          title: "Access Denied",
          description: "You do not have permission to assign tasks.",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
      return;
    }

    hasNotifiedRef.current = false;
    setUser(authUser as UserSession);
  }, [authLoading, authUser, router, toast]);

  // SSE for real-time updates (for tasks)
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource("/api/tasks/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Data received:", data);

        // Ensure data is an array before filtering
        if (Array.isArray(data)) {
          const pending = data.filter(
            (task: any) =>
              task.status === "pending" ||
              task.status === "Pending" ||
              !task.approved,
          );
          const approved = data.filter(
            (task: any) =>
              task.status === "assigned" ||
              task.status === "Assigned" ||
              task.approved,
          );

          console.log("Pending tasks after SSE:", pending);
          console.log("Approved tasks after SSE:", approved);

          setPendingTasks(pending);
          setApprovedTasks(approved);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  // Fetch online complaints
  const fetchOnlineComplaints = useCallback(async () => {
    try {
      console.log("Fetching online complaints...");
      const response = await fetch("/api/online-complaints");

      if (!response.ok) {
        console.error("Failed to fetch online complaints:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Online complaints API response:", result);

      // Based on your API response structure
      let complaintsArray: OnlineComplaint[] = [];

      if (Array.isArray(result)) {
        // Direct array response
        complaintsArray = result;
      } else if (result && typeof result === "object") {
        // Object with complaints array
        if (Array.isArray(result.complaints)) {
          complaintsArray = result.complaints;
        } else if (result.success && Array.isArray(result.data)) {
          complaintsArray = result.data;
        }
      }

      console.log("Extracted complaints array:", complaintsArray);

      // Filter only complaints with status 'registered'
      const registeredComplaints = complaintsArray
        .filter(
          (complaint: OnlineComplaint) => complaint.status === "registered",
        )
        .map((complaint) => ({
          ...complaint,
          // Ensure _id exists, generate if not
          _id:
            complaint._id ||
            complaint.complaintNumber ||
            `complaint-${Date.now()}-${Math.random()}`,
        }));

      console.log("Filtered registered complaints:", registeredComplaints);
      setOnlineComplaints(registeredComplaints);
    } catch (error) {
      console.error("Error fetching online complaints:", error);
      setOnlineComplaints([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch tasks and users in parallel
      const tasksPromises = [
        fetch("/api/tasks/pending").then((res) => {
          if (!res.ok) throw new Error(`Tasks pending: ${res.status}`);
          return res.json();
        }),
        fetch("/api/tasks/approved").then((res) => {
          if (!res.ok) throw new Error(`Tasks approved: ${res.status}`);
          return res.json();
        }),
      ];

      const [pendingData, approvedData] = await Promise.all(tasksPromises);

      // Ensure we have arrays and ensure IDs exist
      const pendingTasksArray = (
        Array.isArray(pendingData) ? pendingData : []
      ).map((task) => ({
        ...task,
        _id: task._id || task.code || `task-${Date.now()}-${Math.random()}`,
      }));

      const approvedTasksArray = (
        Array.isArray(approvedData) ? approvedData : []
      ).map((task) => ({
        ...task,
        _id: task._id || task.code || `task-${Date.now()}-${Math.random()}`,
      }));

      console.log("Fetched pending tasks:", pendingTasksArray);
      console.log("Fetched approved tasks:", approvedTasksArray);

      setPendingTasks(pendingTasksArray);
      setApprovedTasks(approvedTasksArray);

      // Fetch users
      try {
        const usersResponse = await fetch("/api/users");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const usersArray = Array.isArray(usersData) ? usersData : [];
          setUsers(usersArray);
        } else {
          console.error("Failed to fetch users:", usersResponse.status);
          setUsers([]);
        }
      } catch (usersError) {
        console.error("Error fetching users:", usersError);
        setUsers([]);
      }

      // Fetch online complaints
      await fetchOnlineComplaints();
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load tasks and users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, fetchOnlineComplaints]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const assignTask = async (
    taskId: string,
    assignmentData: AssignmentData,
    remarks: string,
    files: File[],
  ) => {
    const selectedUser = users.find((u) => u._id === assignmentData.userId);
    if (!selectedUser) {
      throw new Error("Selected user not found");
    }

    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("userId", selectedUser._id);
    formData.append("username", selectedUser.username);
    formData.append("name", selectedUser.name);
    formData.append("roleName", selectedUser.role?.name || "No Role");
    formData.append("assignedDate", assignmentData.assignedDate);
    formData.append(
      "expectedCompletionAt",
      assignmentData.expectedCompletionAt,
    );
    formData.append("remarks", remarks);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/tasks/assign", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.message}`,
      );
    }

    return await response.json();
  };

  const assignComplaint = async (
    complaintId: string,
    assignmentData: AssignmentData,
    remarks: string,
    files: File[],
  ) => {
    const selectedUser = users.find((u) => u._id === assignmentData.userId);
    if (!selectedUser) {
      throw new Error("Selected user not found");
    }

    const formData = new FormData();
    formData.append("complaintId", complaintId);
    formData.append("userId", selectedUser._id);
    formData.append("username", selectedUser.username);
    formData.append("name", selectedUser.name);
    formData.append("roleName", selectedUser.role?.name || "No Role");
    formData.append("assignedDate", assignmentData.assignedDate);
    formData.append(
      "expectedCompletionAt",
      assignmentData.expectedCompletionAt,
    );
    formData.append("remarks", remarks);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/online-complaints/assign", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.message}`,
      );
    }

    return await response.json();
  };

  const rejectComplaint = async (complaintId: string, remarks: string) => {
    const response = await fetch("/api/online-complaints/reject", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId, remarks }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message || `HTTP error! status: ${response.status}`,
      );
    }

    return data;
  };

  return {
    pendingTasks,
    onlineComplaints,
    approvedTasks,
    users,
    user,
    isLoading,
    fetchData,
    assignTask,
    assignComplaint,
    rejectComplaint,
    setPendingTasks,
    setOnlineComplaints,
    setApprovedTasks,
  };
}
