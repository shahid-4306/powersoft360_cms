// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext";
// import { useTaskDev, type TaskOrComplaint } from "@/hooks/useTaskDev";
// import { DevTaskTable } from "@/components/tasks/DevTaskTable";
// import { DevDialogs } from "@/components/tasks/DevDialogs";
// import type { ITask } from "@/models/Task";
// import type { IOnlineComplaint } from "@/models/OnlineComplaint";
// import { useDevStream } from "@/hooks/useDevStream";

// export default function DeveloperWorkingPage() {
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
//   const [isDoneDialogOpen, setIsDoneDialogOpen] = useState(false);
//   const [developerRemarks, setDeveloperRemarks] = useState("");
//   const [developerAttachments, setDeveloperAttachments] = useState<File[]>([]);
//   const [developerRejectionSolveAttachments, setDeveloperRejectionSolveAttachments] = useState<File[]>([]);
//   const [developerStatusRejection, setDeveloperStatusRejection] = useState("fixed");
//   const [developerRejectionRemarks, setDeveloperRejectionRemarks] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { toast } = useToast();
//   const router = useRouter();

//   const {
//     tasks,
//     setTasks,
//     selectedTask,
//     setSelectedTask,
//     isLoading,
//     user,
//     isAdminOrManager,
//     fetchTasks,
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
//     getAssignedDate
//   } = useTaskDev();

   
//   // Initialize SSE for real-time updates
//   useDevStream({
//     user,
//     isAdminOrManager: !!isAdminOrManager,
//     setTasks,
//     isComplaint,
//   });

//   const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
//   // Update current time every second for elapsed time calculation
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Sourced from the real cookie-backed session (AuthContext /
//   // /api/auth/me) instead of localStorage, which the login flow never
//   // populates — that mismatch was why an authenticated Administrator was
//   // always treated as logged-out here.
//   const { user: sessionUser, isLoading: authLoading } = useAuth();
//   const hasNotifiedRef = useRef(false);

//   useEffect(() => {
//     if (authLoading) return;

//     if (!sessionUser) {
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

//     hasNotifiedRef.current = false;
//   }, [authLoading, sessionUser, router, toast]);

//   const handleViewTask = (task: TaskOrComplaint) => {
//     setSelectedTask(task);
//     setIsViewDialogOpen(true);
//   };

//   const handleMarkDone = (task: TaskOrComplaint) => {
//     setSelectedTask(task);
//     setIsDoneDialogOpen(true);
//   };

//   const handleCloseViewDialog = () => {
//     setIsViewDialogOpen(false);
//     setSelectedTask(null);
//   };

//   const handleCloseDoneDialog = () => {
//     setIsDoneDialogOpen(false);
//     setSelectedTask(null);
//     setDeveloperRemarks("");
//     setDeveloperAttachments([]);
//     setDeveloperRejectionSolveAttachments([]);
//     setDeveloperStatusRejection("fixed");
//     setDeveloperRejectionRemarks("");
//   };

//   const handleDoneTask = async () => {
//     if (!selectedTask) return;

//     if (isComplaint(selectedTask)) {
//       await handleComplaintDone(selectedTask as IOnlineComplaint);
//     } else {
//       await handleTaskDone(selectedTask as ITask);
//     }
//   };

//   const handleTaskDone = async (task: ITask) => {
//     if (!developerRemarks) {
//       toast({
//         title: "Remarks Required",
//         description: "Please provide developer remarks for the task.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (task.finalStatus === "rejected" && !developerRejectionRemarks) {
//       toast({
//         title: "Solve Rejection Remarks Required",
//         description: "Please provide solve rejection remarks for the task.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const formData = new FormData();
//       formData.append("taskId", task._id);
//       formData.append("developer_status", "done");
//       formData.append("developer_remarks", developerRemarks);
//       formData.append("developer_done_date", new Date().toISOString());
      
//       if (task.finalStatus === "rejected") {
//         formData.append("developer_status_rejection", developerStatusRejection);
//         formData.append("developer_rejection_remarks", developerRejectionRemarks);
//       }
      
//       developerAttachments.forEach((file) => {
//         formData.append("developer_attachments", file);
//       });

//       if (task.finalStatus === "rejected") {
//         developerRejectionSolveAttachments.forEach((file) => {
//           formData.append("developer_rejection_solve_attachments", file);
//         });
//       }

//       const response = await fetch(`/api/tasks/developer_working`, {
//         method: "PUT",
//         body: formData,
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}, message: ${responseData.message || "Unknown error"}`);
//       }

//       setTasks((prev) => prev.filter((taskItem) => taskItem._id !== task._id));
//       toast({
//         title: "Task Marked as Done",
//         description: `Task ${task.code} has been marked as done.`,
//         duration: 5000,
//       });

//       handleCloseDoneDialog();
//     } catch (error) {
//       console.error("Failed to update task:", error);
//       toast({
//         title: "Error",
//         description: `Failed to mark task as done: ${error instanceof Error ? error.message : String(error)}`,
//         variant: "destructive",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

// const handleComplaintDone = async (complaint: IOnlineComplaint) => {
//   if (!developerRemarks) {
//     toast({
//       title: "Resolution Remarks Required",
//       description: "Please provide resolution remarks for the complaint.",
//       variant: "destructive",
//     });
//     return;
//   }

//   setIsSubmitting(true);
//   try {
//     const formData = new FormData();
//     formData.append("complaintId", complaint._id);
//     formData.append("resolutionRemarks", developerRemarks);
    
//     // Add developer information for authorization check
//     if (user) {
//       formData.append("developerUsername", user.username || "");
//       formData.append("developerName", user.name || "");
//       formData.append("developerRole", user.role?.name || "");
//     }
    
//     developerAttachments.forEach((file) => {
//       formData.append("resolutionAttachments", file);
//     });

//     const response = await fetch(`/api/online-complaints/resolve`, {
//       method: "PUT",
//       body: formData,
//     });

//     const responseData = await response.json();

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}, message: ${responseData.message || responseData.error || "Unknown error"}`);
//     }

//     // Update local state
//     setTasks((prev) => prev.filter((item) => item._id !== complaint._id));
    
//     toast({
//       title: "Complaint Resolved",
//       description: `Complaint ${complaint.complaintNumber} has been marked as resolved.`,
//       duration: 5000,
//     });

//     handleCloseDoneDialog();
//   } catch (error) {
//     console.error("Failed to resolve complaint:", error);
//     toast({
//       title: "Error",
//       description: `Failed to resolve complaint: ${error instanceof Error ? error.message : String(error)}`,
//       variant: "destructive",
//     });
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   if (!user || isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
//           <p className="text-muted-foreground">Loading tasks and complaints...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div className="text-center space-y-2">
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
//           {isAdminOrManager ? "All Tasks & Complaints" : "My Assigned Tasks & Complaints"}
//         </h1>
//         <p className="text-muted-foreground">
//           {isAdminOrManager ? "View all tasks and complaints in the system" : "View and manage your assigned tasks and complaints"}
//         </p>
//       </div>

//       <Card>
//         <CardHeader className="py-4">
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <svg
//               className="h-4 w-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//               />
//             </svg>
//             {isAdminOrManager ? "All Items" : "Assigned Items"} ({tasks.length})
//           </CardTitle>
//           <CardDescription className="text-sm">
//             {isAdminOrManager ? "All tasks and complaints in the system" : `Items assigned to ${user.username}`}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="p-0">
//           <DevTaskTable
//             tasks={tasks}
//             user={user}
//             isAdminOrManager={!!isAdminOrManager}
//             currentTime={currentTime}
//             onViewTask={handleViewTask}
//             onMarkDone={handleMarkDone}
//             isComplaint={isComplaint}
//             getDisplayCode={getDisplayCode}
//             getCompanyName={getCompanyName}
//             getWork={getWork}
//             getPriority={getPriority}
//             getStatus={getStatus}
//             getDeveloperStatus={getDeveloperStatus}
//             getAssignedTo={getAssignedTo}
//             getCreatedAt={getCreatedAt}
//             getAssignedDate={getAssignedDate}
//           />
//         </CardContent>
//       </Card>

//       <DevDialogs
//         selectedTask={selectedTask}
//         isViewDialogOpen={isViewDialogOpen}
//         isDoneDialogOpen={isDoneDialogOpen}
//         developerRemarks={developerRemarks}
//         developerAttachments={developerAttachments}
//         developerRejectionSolveAttachments={developerRejectionSolveAttachments}
//         developerStatusRejection={developerStatusRejection}
//         developerRejectionRemarks={developerRejectionRemarks}
//         isSubmitting={isSubmitting}
//         onCloseViewDialog={handleCloseViewDialog}
//         onCloseDoneDialog={handleCloseDoneDialog}
//         onDeveloperRemarksChange={setDeveloperRemarks}
//         onDeveloperAttachmentsChange={setDeveloperAttachments}
//         onDeveloperRejectionSolveAttachmentsChange={setDeveloperRejectionSolveAttachments}
//         onDeveloperStatusRejectionChange={setDeveloperStatusRejection}
//         onDeveloperRejectionRemarksChange={setDeveloperRejectionRemarks}
//         onHandleDoneTask={handleDoneTask}
//         isComplaint={isComplaintOrNull}
//       />
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskDev, type TaskOrComplaint } from "@/hooks/useTaskDev";
import { DevTaskTable } from "@/components/tasks/DevTaskTable";
import { DevDialogs } from "@/components/tasks/DevDialogs";
import type { ITask } from "@/models/Task";
import type { IOnlineComplaint } from "@/models/OnlineComplaint";
import { useDevStream } from "@/hooks/useDevStream";

export default function DeveloperWorkingPage() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDoneDialogOpen, setIsDoneDialogOpen] = useState(false);
  const [developerRemarks, setDeveloperRemarks] = useState("");
  const [developerAttachments, setDeveloperAttachments] = useState<File[]>([]);
  const [developerRejectionSolveAttachments, setDeveloperRejectionSolveAttachments] = useState<File[]>([]);
  const [developerStatusRejection, setDeveloperStatusRejection] = useState("fixed");
  const [developerRejectionRemarks, setDeveloperRejectionRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    tasks,
    setTasks,
    selectedTask,
    setSelectedTask,
    isLoading,
    user,
    isAdminOrManager,
    fetchTasks,
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
    getAssignedDate
  } = useTaskDev();

   
  // Initialize SSE for real-time updates
  useDevStream({
    user,
    isAdminOrManager: !!isAdminOrManager,
    setTasks,
    isComplaint,
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Update current time every second for elapsed time calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sourced from the real cookie-backed session (AuthContext /
  // /api/auth/me) instead of localStorage, which the login flow never
  // populates — that mismatch was why an authenticated Administrator was
  // always treated as logged-out here.
  const { user: sessionUser, isLoading: authLoading } = useAuth();
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    if (!sessionUser) {
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

    hasNotifiedRef.current = false;
  }, [authLoading, sessionUser, router, toast]);

  const handleViewTask = (task: TaskOrComplaint) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  const handleMarkDone = (task: TaskOrComplaint) => {
    setSelectedTask(task);
    setIsDoneDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedTask(null);
  };

  const handleCloseDoneDialog = () => {
    setIsDoneDialogOpen(false);
    setSelectedTask(null);
    setDeveloperRemarks("");
    setDeveloperAttachments([]);
    setDeveloperRejectionSolveAttachments([]);
    setDeveloperStatusRejection("fixed");
    setDeveloperRejectionRemarks("");
  };

  const handleDoneTask = async () => {
    if (!selectedTask) return;

    if (isComplaint(selectedTask)) {
      await handleComplaintDone(selectedTask as IOnlineComplaint);
    } else {
      await handleTaskDone(selectedTask as ITask);
    }
  };

  const handleTaskDone = async (task: ITask) => {
    if (!developerRemarks) {
      toast({
        title: "Remarks Required",
        description: "Please provide developer remarks for the task.",
        variant: "destructive",
      });
      return;
    }

    if (task.finalStatus === "rejected" && !developerRejectionRemarks) {
      toast({
        title: "Solve Rejection Remarks Required",
        description: "Please provide solve rejection remarks for the task.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("taskId", task._id);
      formData.append("developer_status", "done");
      formData.append("developer_remarks", developerRemarks);
      formData.append("developer_done_date", new Date().toISOString());
      
      if (task.finalStatus === "rejected") {
        formData.append("developer_status_rejection", developerStatusRejection);
        formData.append("developer_rejection_remarks", developerRejectionRemarks);
      }
      
      developerAttachments.forEach((file) => {
        formData.append("developer_attachments", file);
      });

      if (task.finalStatus === "rejected") {
        developerRejectionSolveAttachments.forEach((file) => {
          formData.append("developer_rejection_solve_attachments", file);
        });
      }

      const response = await fetch(`/api/tasks/developer_working`, {
        method: "PUT",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseData.message || "Unknown error"}`);
      }

      setTasks((prev) => prev.filter((taskItem) => taskItem._id !== task._id));
      toast({
        title: "Task Marked as Done",
        description: `Task ${task.code} has been marked as done.`,
        duration: 5000,
      });

      handleCloseDoneDialog();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: `Failed to mark task as done: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const handleComplaintDone = async (complaint: IOnlineComplaint) => {
  if (!developerRemarks) {
    toast({
      title: "Resolution Remarks Required",
      description: "Please provide resolution remarks for the complaint.",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);
  try {
    const formData = new FormData();
    formData.append("complaintId", complaint._id);
    formData.append("resolutionRemarks", developerRemarks);
    
    // Add developer information for authorization check
    if (user) {
      formData.append("developerUsername", user.username || "");
      formData.append("developerName", user.name || "");
      formData.append("developerRole", user.role?.name || "");
    }
    
    developerAttachments.forEach((file) => {
      formData.append("resolutionAttachments", file);
    });

    const response = await fetch(`/api/online-complaints/resolve`, {
      method: "PUT",
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${responseData.message || responseData.error || "Unknown error"}`);
    }

    // Update local state
    setTasks((prev) => prev.filter((item) => item._id !== complaint._id));
    
    toast({
      title: "Complaint Resolved",
      description: `Complaint ${complaint.complaintNumber} has been marked as resolved.`,
      duration: 5000,
    });

    handleCloseDoneDialog();
  } catch (error) {
    console.error("Failed to resolve complaint:", error);
    toast({
      title: "Error",
      description: `Failed to resolve complaint: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
          <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading tasks and complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#FEFFFF]">
      <div className="text-center space-y-2">
        <h1 
          className="text-3xl font-bold"
          style={{ 
            background: 'linear-gradient(135deg, #11519B, #114A9B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {isAdminOrManager ? "All Tasks & Complaints" : "My Assigned Tasks & Complaints"}
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>
          {isAdminOrManager ? "View all tasks and complaints in the system" : "View and manage your assigned tasks and complaints"}
        </p>
      </div>

      <Card 
        className="border-0 shadow-xl"
        style={{ 
          background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
        }}
      >
        <CardHeader 
          className="border-0 pt-4 pb-4"
          style={{ 
            background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.2), rgba(17, 81, 155, 0.1))',
            borderBottomColor: 'rgba(158, 195, 249, 0.3)'
          }}
        >
          <CardTitle className="flex items-center gap-2 text-lg text-[#000000]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: '#11519B' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {isAdminOrManager ? "All Items" : "Assigned Items"} ({tasks.length})
          </CardTitle>
          <CardDescription className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>
            {isAdminOrManager ? "All tasks and complaints in the system" : `Items assigned to ${user.username}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DevTaskTable
            tasks={tasks}
            user={user}
            isAdminOrManager={!!isAdminOrManager}
            currentTime={currentTime}
            onViewTask={handleViewTask}
            onMarkDone={handleMarkDone}
            isComplaint={isComplaint}
            getDisplayCode={getDisplayCode}
            getCompanyName={getCompanyName}
            getWork={getWork}
            getPriority={getPriority}
            getStatus={getStatus}
            getDeveloperStatus={getDeveloperStatus}
            getAssignedTo={getAssignedTo}
            getCreatedAt={getCreatedAt}
            getAssignedDate={getAssignedDate}
          />
        </CardContent>
      </Card>

      <DevDialogs
        selectedTask={selectedTask}
        isViewDialogOpen={isViewDialogOpen}
        isDoneDialogOpen={isDoneDialogOpen}
        developerRemarks={developerRemarks}
        developerAttachments={developerAttachments}
        developerRejectionSolveAttachments={developerRejectionSolveAttachments}
        developerStatusRejection={developerStatusRejection}
        developerRejectionRemarks={developerRejectionRemarks}
        isSubmitting={isSubmitting}
        onCloseViewDialog={handleCloseViewDialog}
        onCloseDoneDialog={handleCloseDoneDialog}
        onDeveloperRemarksChange={setDeveloperRemarks}
        onDeveloperAttachmentsChange={setDeveloperAttachments}
        onDeveloperRejectionSolveAttachmentsChange={setDeveloperRejectionSolveAttachments}
        onDeveloperStatusRejectionChange={setDeveloperStatusRejection}
        onDeveloperRejectionRemarksChange={setDeveloperRejectionRemarks}
        onHandleDoneTask={handleDoneTask}
        isComplaint={isComplaintOrNull}
      />
    </div>
  );
}