// "use client";

// import { useState, useEffect } from "react"; // Add useEffect import
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { 
//   Building, User, Phone, FileText, Calendar, Paperclip, Download, 
//   AlertTriangle, Info, Trash2, CheckSquare, ClipboardList, Loader2, ArrowUp, Bug
// } from "lucide-react";
// import { useFileDownload } from "@/hooks/useFileDownload";
// import { useComplaintDownload } from "@/hooks/useComplaintDownload";
// import type { ITask } from "@/models/Task";
// import type { IOnlineComplaint } from "@/models/OnlineComplaint";
// import type { TaskOrComplaint } from "@/hooks/useTaskDev";

// interface SoftwareInformation {
//   softwareType: string;
//   version: string;
//   lastUpdated: string;
//   _id: string;
// }

// interface DevDialogsProps {
//   selectedTask: TaskOrComplaint | null;
//   isViewDialogOpen: boolean;
//   isDoneDialogOpen: boolean;
//   developerRemarks: string;
//   developerAttachments: File[];
//   developerRejectionSolveAttachments: File[];
//   developerStatusRejection: string;
//   developerRejectionRemarks: string;
//   isSubmitting: boolean;
//   onCloseViewDialog: () => void;
//   onCloseDoneDialog: () => void;
//   onDeveloperRemarksChange: (value: string) => void;
//   onDeveloperAttachmentsChange: (files: File[]) => void;
//   onDeveloperRejectionSolveAttachmentsChange: (files: File[]) => void;
//   onDeveloperStatusRejectionChange: (value: string) => void;
//   onDeveloperRejectionRemarksChange: (value: string) => void;
//   onHandleDoneTask: () => void;
//   isComplaint: (item: TaskOrComplaint | null) => boolean;
// }

// export function DevDialogs({
//   selectedTask,
//   isViewDialogOpen,
//   isDoneDialogOpen,
//   developerRemarks,
//   developerAttachments,
//   developerRejectionSolveAttachments,
//   developerStatusRejection,
//   developerRejectionRemarks,
//   isSubmitting,
//   onCloseViewDialog,
//   onCloseDoneDialog,
//   onDeveloperRemarksChange,
//   onDeveloperAttachmentsChange,
//   onDeveloperRejectionSolveAttachmentsChange,
//   onDeveloperStatusRejectionChange,
//   onDeveloperRejectionRemarksChange,
//   onHandleDoneTask,
//   isComplaint
// }: DevDialogsProps) {
  
//   // Use the download hooks with separate states
//   const { 
//     isDownloading: isTaskDownloading, 
//     isDownloadingAssignment: isTaskAssignmentDownloading,
//     isDownloadingRejection, // Add this
//     downloadAllAttachments: downloadTaskAttachments 
//   } = useFileDownload();
  
//   const { 
//     isDownloading: isComplaintDownloading, 
//     isDownloadingAssignment: isComplaintAssignmentDownloading,
//     downloadComplaintAttachments,
//     downloadAssignmentAttachments,
//     downloadSingleFile: downloadComplaintFile,
//     getFileLists
//   } = useComplaintDownload();

//   const [fileLists, setFileLists] = useState<{
//     complaintFiles: any[];
//     assignmentFiles: any[];
//   }>({
//     complaintFiles: [],
//     assignmentFiles: []
//   });

//   // Load files when complaint dialog opens
//   useEffect(() => {
//     if (isViewDialogOpen && selectedTask && isComplaint(selectedTask)) {
//       const loadComplaintFiles = async () => {
//         if (!selectedTask._id) return;
        
//         try {
//           const lists = await getFileLists(selectedTask._id);
//           setFileLists({
//             complaintFiles: lists.complaintFiles,
//             assignmentFiles: lists.assignmentFiles
//           });
//         } catch (error) {
//           console.error("Error loading file lists:", error);
//         }
//       };
      
//       loadComplaintFiles();
//     }
//   }, [isViewDialogOpen, selectedTask, isComplaint, getFileLists]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (files: File[]) => void) => {
//     const files = e.target.files;
//     if (!files) return;
    
//     const newFiles = Array.from(files);
//     setter(newFiles);
//   };

//   const removeFile = (index: number, files: File[], setter: (files: File[]) => void) => {
//     setter(files.filter((_, i) => i !== index));
//   };

//   const handleDownloadTaskAttachments = (taskId: string, attachments: any[], type: string) => {
//     // Convert attachment objects to file paths/IDs for the hook
//     const attachmentPaths = attachments.map(att => {
//       if (typeof att === 'string') return att;
//       if (att.fileId) return att.fileId;
//       if (att.path) return att.path;
//       return att;
//     }).filter(Boolean);

//     downloadTaskAttachments(taskId, attachmentPaths.length > 0 ? attachmentPaths : undefined, type);
//   };

//   const handleDownloadComplaintAttachments = (complaintId: string, complaintNumber?: string) => {
//     downloadComplaintAttachments(complaintId, complaintNumber);
//   };

//   const handleDownloadAssignmentAttachments = (complaintId: string, complaintNumber?: string) => {
//     downloadAssignmentAttachments(complaintId, complaintNumber);
//   };

//   const handleDownloadSingleFile = (fileId: string, fileName: string) => {
//     downloadComplaintFile(fileId, fileName);
//   };

//   if (!selectedTask) return null;

//   const complaint = isComplaint(selectedTask);
//   const task = complaint ? null : selectedTask as ITask;
//   const onlineComplaint = complaint ? selectedTask as IOnlineComplaint : null;

//   // Get attachments based on type
//   const getAssignmentAttachments = () => {
//     if (complaint) {
//       // For complaint, use assignmentAttachments (plural)
//       return onlineComplaint?.assignmentAttachments || [];
//     } else {
//       // For task, use assignmentAttachment (singular)
//       return task?.assignmentAttachment || [];
//     }
//   };

//   const assignmentAttachments = getAssignmentAttachments();

//   return (
//     <>
//       {/* View Dialog */}
//       <Dialog open={isViewDialogOpen} onOpenChange={onCloseViewDialog}>
//         <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <div className="flex items-center gap-2">
//               {complaint && <Bug className="h-4 w-4 text-red-500" />}
//               <DialogTitle className="text-base sm:text-lg">
//                 {complaint ? "Complaint Details" : "Task Details"}
//               </DialogTitle>
//             </div>
//             <DialogDescription className="text-xs sm:text-sm">
//               Details for {complaint ? "complaint" : "task"} {complaint ? onlineComplaint?.complaintNumber : task?.code}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="overflow-x-auto">
//             <table className="w-full text-xs sm:text-sm border rounded-lg bg-muted/50">
//               <thead className="bg-muted">
//                 <tr>
//                   <th colSpan={2} className="p-2 sm:p-3 text-left font-semibold text-foreground/80 text-xs sm:text-sm">
//                     <div className="flex items-center gap-2">
//                       <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
//                       {complaint ? "Complaint Details" : "Task Details"}
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-border">
//                 {/* Code/Number */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Complaint #" : "Task Code"}
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     <Badge variant="outline" className="border-primary/40 text-primary">
//                       {complaint ? onlineComplaint?.complaintNumber : task?.code}
//                     </Badge>
//                   </td>
//                 </tr>

//                 {/* Company Information */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Building className="h-3 w-3 text-muted-foreground" /> Company
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {complaint ? onlineComplaint?.company.companyName : task?.company?.name}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Building className="h-3 w-3 text-muted-foreground" /> City
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {complaint ? onlineComplaint?.company.city : task?.company?.city}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Building className="h-3 w-3 text-muted-foreground" /> Address
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {complaint ? onlineComplaint?.company.address : task?.company?.address}
//                   </td>
//                 </tr>

//                 {/* Contact Information */}
//                 {!complaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <User className="h-3 w-3 text-muted-foreground" /> Contact Name
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">{task?.contact?.name}</td>
//                   </tr>
//                 )}
//                 {!complaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Phone className="h-3 w-3 text-muted-foreground" /> Contact Phone
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">{task?.contact?.phone}</td>
//                   </tr>
//                 )}

//                 {/* Complaint Specific Fields */}
//                 {complaint && (
//                   <>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <User className="h-3 w-3 text-muted-foreground" /> Contact Person
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">{onlineComplaint?.contactPerson}</td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Phone className="h-3 w-3 text-muted-foreground" /> Contact Phone
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">{onlineComplaint?.contactPhone}</td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <User className="h-3 w-3 text-muted-foreground" /> Company Representative
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">{onlineComplaint?.company.companyRepresentative}</td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Phone className="h-3 w-3 text-muted-foreground" /> Company Phone
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">{onlineComplaint?.company.phoneNumber}</td>
//                     </tr>
//                   </>
//                 )}

//                 {/* Assigned To */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <User className="h-3 w-3 text-muted-foreground" /> Assigned To
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {selectedTask.assignedTo?.name} ({selectedTask.assignedTo?.username}, {selectedTask.assignedTo?.role?.name})
//                   </td>
//                 </tr>

//                 {/* Work/Software Type */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Software Type" : "Work"}
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {complaint ? onlineComplaint?.softwareType : task?.working}
//                   </td>
//                 </tr>

//                 {/* Priority */}
//                 {!complaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <AlertTriangle className="h-3 w-3 text-muted-foreground" /> Priority
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       <Badge variant="outline" className={
//                         task?.priority === "Urgent" ? "bg-red-100 text-red-800 border-red-300" :
//                         task?.priority === "High" ? "bg-orange-100 text-orange-800 border-orange-300" :
//                         "bg-accent/30 text-secondary border-primary/40"
//                       }>
//                         {task?.priority === "Urgent" ? (
//                           <>
//                             <AlertTriangle className="h-3 w-3 mr-1" />
//                             Urgent
//                           </>
//                         ) : task?.priority === "High" ? (
//                           <>
//                             <ArrowUp className="h-3 w-3 mr-1" />
//                             High
//                           </>
//                         ) : (
//                           <>
//                             <Info className="h-3 w-3 mr-1" />
//                             Normal
//                           </>
//                         )}
//                       </Badge>
//                     </td>
//                   </tr>
//                 )}

//                 {/* Software Information for Tasks */}
//                 {!complaint && task?.company?.id && typeof task.company.id === 'object' && 
//                  'softwareInformation' in task.company.id && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <FileText className="h-3 w-3 text-gray-50" /> Software Info
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {(task.company.id as any).softwareInformation?.map((software: SoftwareInformation, index: number) => (
//                         <div key={index} className="mb-2 last:mb-0">
//                           <div className="font-medium">{software.softwareType}</div>
//                           <div>Version: {software.version}</div>
//                           <div>Last Updated: {new Date(software.lastUpdated).toLocaleDateString()}</div>
//                         </div>
//                       )) || "N/A"}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Dates */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Calendar className="h-3 w-3 text-muted-foreground" /> Created At
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {selectedTask.createdAt
//                       ? new Date(selectedTask.createdAt).toLocaleString()
//                       : "N/A"}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Calendar className="h-3 w-3 text-muted-foreground" /> Assigned Date
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {selectedTask.assignedDate
//                       ? new Date(selectedTask.assignedDate).toLocaleString()
//                       : "N/A"}
//                   </td>
//                 </tr>

//                 {/* Remarks */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Complaint Remarks" : "Task Remarks"}
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {complaint ? onlineComplaint?.complaintRemarks : task?.TaskRemarks || "None"}
//                   </td>
//                 </tr>

//                 {/* Assignment Remarks */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> Assignment Remarks
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">{selectedTask.assignmentRemarks || "None"}</td>
//                 </tr>

//                 {/* Attachments - Complaint */}
//                 {complaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Paperclip className="h-3 w-3 text-muted-foreground" /> Complaint Attachments
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {onlineComplaint?.attachments && Array.isArray(onlineComplaint.attachments) && onlineComplaint.attachments.length > 0 ? (
//                         <div className="space-y-2">
//                           {/* Download All Button */}
//                           <Button 
//                             type="button" 
//                             variant="outline" 
//                             size="sm" 
//                             className="text-xs"
//                             onClick={() => handleDownloadComplaintAttachments(onlineComplaint._id, onlineComplaint.complaintNumber)}
//                             disabled={isComplaintDownloading}
//                           >
//                             {isComplaintDownloading ? (
//                               <>
//                                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                 Downloading...
//                               </>
//                             ) : (
//                               <>
//                                 <Download className="h-3 w-3 mr-1" />
//                                 Download All ({onlineComplaint.attachments.length})
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                       ) : "None"}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Task Attachments */}
//                 {!complaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Paperclip className="h-3 w-3 text-muted-foreground" /> Task Attachments
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {task?.TasksAttachment && Array.isArray(task.TasksAttachment) && task.TasksAttachment.length > 0 ? (
//                         <div className="space-y-2">
//                           <Button 
//                             type="button" 
//                             variant="outline" 
//                             size="sm" 
//                             className="text-xs"
//                             onClick={() => handleDownloadTaskAttachments(task._id, task.TasksAttachment || [], 'task')}
//                             disabled={isTaskDownloading}
//                           >
//                             {isTaskDownloading ? (
//                               <>
//                                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                 Downloading...
//                               </>
//                             ) : (
//                               <>
//                                 <Download className="h-3 w-3 mr-1" />
//                                 Download All ({task.TasksAttachment.length})
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                       ) : "None"}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Assignment Attachments */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Paperclip className="h-3 w-3 text-muted-foreground" /> Assignment Attachments
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {assignmentAttachments && Array.isArray(assignmentAttachments) && assignmentAttachments.length > 0 ? (
//                       <div className="space-y-2">
//                         {/* For Complaints */}
//                         {complaint ? (
//                           <>
//                             <Button 
//                               type="button" 
//                               variant="outline" 
//                               size="sm" 
//                               className="text-xs"
//                               onClick={() => handleDownloadAssignmentAttachments(selectedTask._id, onlineComplaint?.complaintNumber)}
//                               disabled={isComplaintAssignmentDownloading}
//                             >
//                               {isComplaintAssignmentDownloading ? (
//                                 <>
//                                   <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                   Downloading...
//                                 </>
//                               ) : (
//                                 <>
//                                   <Download className="h-3 w-3 mr-1" />
//                                   Download All ({assignmentAttachments.length})
//                                 </>
//                               )}
//                             </Button>
//                           </>
//                         ) : (
//                           /* For Tasks */
//                           <Button 
//                             type="button" 
//                             variant="outline" 
//                             size="sm" 
//                             className="text-xs"
//                             onClick={() => handleDownloadTaskAttachments(selectedTask._id, assignmentAttachments, 'assignment')}
//                             disabled={isTaskAssignmentDownloading}
//                           >
//                             {isTaskAssignmentDownloading ? (
//                               <>
//                                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                 Downloading...
//                               </>
//                             ) : (
//                               <>
//                                 <Download className="h-3 w-3 mr-1" />
//                                 Download All ({assignmentAttachments.length})
//                               </>
//                             )}
//                           </Button>
//                         )}
//                       </div>
//                     ) : "None"}
//                   </td>
//                 </tr>

//                 {/* Rejection Section - For Tasks Only */}
//                 {!complaint && task?.finalStatus === "rejected" && (
//                   <>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <AlertTriangle className="h-3 w-3 text-red-500" /> Solve Rejection Remarks
//                       </td>
//                       <td className="p-2 sm:p-3 break-words text-red-600">
//                         {task.rejectionRemarks || "None"}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-red-500" /> Rejection Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {task.rejectionAttachment && Array.isArray(task.rejectionAttachment) && task.rejectionAttachment.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button 
//                               type="button" 
//                               variant="outline" 
//                               size="sm" 
//                               className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
//                               onClick={() => handleDownloadTaskAttachments(task._id, task.rejectionAttachment || [], 'rejection')}
//                               disabled={isDownloadingRejection}
//                             >
//                               {isDownloadingRejection  ? (
//                                 <>
//                                   <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                   Downloading...
//                                 </>
//                               ) : (
//                                 <>
//                                   <Download className="h-3 w-3 mr-1" />
//                                   Download All ({task.rejectionAttachment.length})
//                                 </>
//                               )}
//                             </Button>
//                           </div>
//                         ) : "None"}
//                       </td>
//                     </tr>
//                     {task.developer_status_rejection && (
//                       <tr>
//                         <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                           <Info className="h-3 w-3 text-primary" /> Developer Rejection Status
//                         </td>
//                         <td className="p-2 sm:p-3 break-words">
//                           <Badge variant="outline" className={
//                             task.developer_status_rejection === "fixed" ? "bg-green-100 text-green-800 border-green-300" :
//                             "bg-yellow-100 text-yellow-800 border-yellow-300"
//                           }>
//                             {task.developer_status_rejection}
//                           </Badge>
//                         </td>
//                       </tr>
//                     )}
//                     {task.developer_rejection_remarks && (
//                       <tr>
//                         <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                           <FileText className="h-3 w-3 text-primary" /> Developer Solve Rejection Remarks
//                         </td>
//                         <td className="p-2 sm:p-3 break-words">{task.developer_rejection_remarks}</td>
//                       </tr>
//                     )}
//                     {task.developer_rejection_solve_attachment && Array.isArray(task.developer_rejection_solve_attachment) && task.developer_rejection_solve_attachment.length > 0 && (
//                       <tr>
//                         <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                           <Paperclip className="h-3 w-3 text-primary" /> Developer Rejection Solve Attachments
//                         </td>
//                         <td className="p-2 sm:p-3 break-words">
//                           <div className="space-y-2">
//                             <Button 
//                               type="button" 
//                               variant="outline" 
//                               size="sm" 
//                               className="text-xs"
//                               onClick={() => handleDownloadTaskAttachments(task._id, task.developer_rejection_solve_attachment || [], 'developer-rejection-solve')}
//                               disabled={isTaskDownloading}
//                             >
//                               {isTaskDownloading ? (
//                                 <>
//                                   <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                   Downloading...
//                                 </>
//                               ) : (
//                                 <>
//                                   <Download className="h-3 w-3 mr-1" />
//                                   Download All ({task.developer_rejection_solve_attachment.length})
//                                 </>
//                               )}
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </>
//                 )}

//                 {/* Developer Attachments */}
//                 {!complaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Paperclip className="h-3 w-3 text-muted-foreground" /> Developer Attachments
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {task?.developer_attachment && Array.isArray(task.developer_attachment) && task.developer_attachment.length > 0 ? (
//                         <div className="space-y-2">
//                           <Button 
//                             type="button" 
//                             variant="outline" 
//                             size="sm" 
//                             className="text-xs"
//                             onClick={() => handleDownloadTaskAttachments(task._id, task.developer_attachment || [], 'developer')}
//                             disabled={isTaskDownloading}
//                           >
//                             {isTaskDownloading ? (
//                               <>
//                                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                 Downloading...
//                               </>
//                             ) : (
//                               <>
//                                 <Download className="h-3 w-3 mr-1" />
//                                 Download All ({task.developer_attachment.length})
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                       ) : "None"}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Status Fields */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                     Status
//                   </td>
//                   <td className="p-2 sm:p-3">
//                     <Badge variant="outline" className={
//                       selectedTask.status === "assigned" || selectedTask.status === "in-progress" ? "bg-accent/30 text-secondary" :
//                       selectedTask.status === "completed" || selectedTask.status === "resolved" ? "bg-green-100 text-green-800" :
//                       selectedTask.status === "pending" || selectedTask.status === "registered" ? "bg-yellow-100 text-yellow-800" :
//                       "bg-muted text-foreground"
//                     }>
//                       {selectedTask.status}
//                     </Badge>
//                   </td>
//                 </tr>

//                 {/* Developer Status */}
//                 {!complaint && task?.developer_status && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                       Developer Status
//                     </td>
//                     <td className="p-2 sm:p-3">
//                       <Badge variant="outline" className={
//                         task.developer_status === "done" ? "bg-green-100 text-green-800" :
//                         task.developer_status === "not-done" ? "bg-accent/30 text-secondary" :
//                         task.developer_status === "pending" ? "bg-yellow-100 text-yellow-800" :
//                         "bg-muted text-foreground"
//                       }>
//                         {task.developer_status}
//                       </Badge>
//                     </td>
//                   </tr>
//                 )}

//                 {/* Final Status */}
//                 {!complaint && task?.finalStatus && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                       Final Status
//                     </td>
//                     <td className="p-2 sm:p-3">
//                       <Badge variant="outline" className={
//                         task.finalStatus === "done" ? "bg-green-100 text-green-800" :
//                         task.finalStatus === "in-progress" ? "bg-accent/30 text-secondary" :
//                         task.finalStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
//                         task.finalStatus === "rejected" ? "bg-red-100 text-red-800" :
//                         "bg-muted text-foreground"
//                       }>
//                         {task.finalStatus}
//                       </Badge>
//                     </td>
//                   </tr>
//                 )}

//                 {/* Developer Done Date */}
//                 {!complaint && task?.developer_done_date && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Calendar className="h-3 w-3 text-muted-foreground" /> Developer Completed At
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {new Date(task.developer_done_date).toLocaleString()}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Type Badge */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                     Type
//                   </td>
//                   <td className="p-2 sm:p-3">
//                     <Badge variant="outline" className={
//                       complaint 
//                         ? "bg-purple-100 text-purple-800 border-purple-300" 
//                         : "bg-accent/30 text-secondary border-primary/40"
//                     }>
//                       {complaint ? "Complaint" : "Task"}
//                     </Badge>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Done Dialog */}
//       <Dialog open={isDoneDialogOpen} onOpenChange={onCloseDoneDialog}>
//         <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <div className="flex items-center gap-2">
//               {complaint && <Bug className="h-4 w-4 text-red-500" />}
//               <DialogTitle className="text-base sm:text-lg">
//                 {complaint ? "Resolve Complaint" : "Mark Task as Done"}
//               </DialogTitle>
//             </div>
//             <DialogDescription className="text-xs sm:text-sm">
//               Provide details for {complaint ? "complaint" : "task"} {complaint ? onlineComplaint?.complaintNumber : task?.code}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-3">
//             <div className="overflow-x-auto">
//               <table className="w-full text-xs border rounded-lg bg-muted/50">
//                 <tbody className="divide-y divide-border">
//                   <tr>
//                     <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs">
//                       <Building className="h-3 w-3 text-muted-foreground" /> Company
//                     </td>
//                     <td className="p-2 break-words">
//                       {complaint ? onlineComplaint?.company.companyName : task?.company?.name}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs">
//                       <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Software Type" : "Work"}
//                     </td>
//                     <td className="p-2 break-words">
//                       {complaint ? onlineComplaint?.softwareType : task?.working}
//                     </td>
//                   </tr>
//                   {!complaint && task?.finalStatus === "rejected" && (
//                     <>
//                       <tr>
//                         <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs text-red-600">
//                           <AlertTriangle className="h-3 w-3 text-red-500" /> Solve Rejection Remarks
//                         </td>
//                         <td className="p-2 break-words text-red-600">
//                           {task.rejectionRemarks || "None"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs text-red-600">
//                           <Paperclip className="h-3 w-3 text-red-500" /> Rejection Attachments
//                         </td>
//                         <td className="p-2 break-words">
//                           {task.rejectionAttachment && Array.isArray(task.rejectionAttachment) && task.rejectionAttachment.length > 0 ? (
//                             <div className="space-y-1">
//                               <Button 
//                                 type="button" 
//                                 variant="outline" 
//                                 size="sm" 
//                                 className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
//                                 onClick={() => handleDownloadTaskAttachments(task._id, task.rejectionAttachment || [], 'rejection')}
//                                 disabled={isTaskDownloading}
//                               >
//                                 {isTaskDownloading ? (
//                                   <>
//                                     <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                     Downloading...
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Download className="h-3 w-3 mr-1" />
//                                     Download All ({task.rejectionAttachment.length})
//                                   </>
//                                 )}
//                               </Button>
//                             </div>
//                           ) : "None"}
//                         </td>
//                       </tr>
//                     </>
//                   )}
//                 </tbody>
//               </table>
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="developerRemarks" className="text-xs font-medium">
//                 {complaint ? "Resolution Remarks *" : "Developer Remarks *"}
//               </Label>
//               <Textarea
//                 id="developerRemarks"
//                 value={developerRemarks}
//                 onChange={(e) => onDeveloperRemarksChange(e.target.value)}
//                 placeholder={complaint ? "Enter resolution remarks" : "Enter remarks about task completion"}
//                 rows={3}
//                 className="w-full text-xs min-h-[60px] max-h-[80px]"
//               />
//             </div>

//             {!complaint && task?.finalStatus === "rejected" && (
//               <>
//                 <div className="space-y-2">
//                   <Label htmlFor="developerStatusRejection" className="text-xs font-medium">Rejection Status *</Label>
//                   <Select value={developerStatusRejection} onValueChange={onDeveloperStatusRejectionChange}>
//                     <SelectTrigger className="w-full text-xs h-8">
//                       <SelectValue placeholder="Select rejection status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="fixed">Fixed</SelectItem>
//                       <SelectItem value="pending">Pending</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="developerRejectionRemarks" className="text-xs font-medium">Solve Rejection Remarks *</Label>
//                   <Textarea
//                     id="developerRejectionRemarks"
//                     value={developerRejectionRemarks}
//                     onChange={(e) => onDeveloperRejectionRemarksChange(e.target.value)}
//                     placeholder="Enter remarks about how you fixed the rejection"
//                     rows={3}
//                     className="w-full text-xs min-h-[60px] max-h-[80px]"
//                   />
//                 </div>
//               </>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="files" className="text-xs font-medium">Attach Files (Optional)</Label>
//               <div className="border rounded-md p-2 space-y-2">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Paperclip className="h-3 w-3" />
//                     <span className="text-xs font-medium">
//                       {complaint ? "Resolution Files" : "Developer Files"}
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <Input
//                       id="files"
//                       type="file"
//                       multiple
//                       accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt"
//                       onChange={(e) => handleFileChange(e, onDeveloperAttachmentsChange)}
//                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                     />
//                     <Button type="button" variant="outline" size="sm" className="text-xs h-7">
//                       <Paperclip className="h-3 w-3 mr-1" />
//                       Add Files
//                     </Button>
//                   </div>
//                 </div>
                
//                 {developerAttachments.length > 0 && (
//                   <div className="space-y-1">
//                     <div className="text-xs text-muted-foreground">Selected files:</div>
//                     <div className="grid gap-1 max-h-20 overflow-y-auto">
//                       {developerAttachments.map((file, index) => (
//                         <div key={index} className="flex items-center justify-between p-1 bg-muted/50 rounded-md">
//                           <div className="flex items-center gap-2 truncate">
//                             <FileText className="h-3 w-3 flex-shrink-0" />
//                             <span className="text-xs truncate max-w-[200px]">{file.name}</span>
//                             <span className="text-xs text-muted-foreground flex-shrink-0">
//                               ({(file.size / 1024).toFixed(1)} KB)
//                             </span>
//                           </div>
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => removeFile(index, developerAttachments, onDeveloperAttachmentsChange)}
//                             className="h-5 w-5 p-0"
//                           >
//                             <Trash2 className="h-3 w-3 text-red-500" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {!complaint && task?.finalStatus === "rejected" && (
//               <div className="space-y-2">
//                 <Label htmlFor="rejectionSolveFiles" className="text-xs font-medium">Rejection Solve Attachments (Optional)</Label>
//                 <div className="border rounded-md p-2 space-y-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <Paperclip className="h-3 w-3" />
//                       <span className="text-xs font-medium">Rejection Solve Files</span>
//                     </div>
//                     <div className="relative">
//                       <Input
//                         id="rejectionSolveFiles"
//                         type="file"
//                         multiple
//                         accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt"
//                         onChange={(e) => handleFileChange(e, onDeveloperRejectionSolveAttachmentsChange)}
//                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                       />
//                       <Button type="button" variant="outline" size="sm" className="text-xs h-7">
//                         <Paperclip className="h-3 w-3 mr-1" />
//                         Add Files
//                       </Button>
//                     </div>
//                   </div>
                  
//                   {developerRejectionSolveAttachments.length > 0 && (
//                     <div className="space-y-1">
//                       <div className="text-xs text-muted-foreground">Selected files:</div>
//                       <div className="grid gap-1 max-h-20 overflow-y-auto">
//                         {developerRejectionSolveAttachments.map((file, index) => (
//                           <div key={index} className="flex items-center justify-between p-1 bg-muted/50 rounded-md">
//                             <div className="flex items-center gap-2 truncate">
//                               <FileText className="h-3 w-3 flex-shrink-0" />
//                               <span className="text-xs truncate max-w-[200px]">{file.name}</span>
//                               <span className="text-xs text-muted-foreground flex-shrink-0">
//                                 ({(file.size / 1024).toFixed(1)} KB)
//                               </span>
//                             </div>
//                             <Button
//                               type="button"
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => removeFile(index, developerRejectionSolveAttachments, onDeveloperRejectionSolveAttachmentsChange)}
//                               className="h-5 w-5 p-0"
//                             >
//                               <Trash2 className="h-3 w-3 text-red-500" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-2 pt-3">
//               <Button
//                 onClick={onHandleDoneTask}
//                 className="flex-1 bg-green-600 hover:bg-green-700 text-xs py-1.5"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <div className="flex items-center gap-2">
//                     <Loader2 className="h-3 w-3 animate-spin" />
//                     Submitting...
//                   </div>
//                 ) : (
//                   complaint ? "Mark as Resolved" : 
//                   (task?.finalStatus === "rejected" ? "Fix & Complete" : "Mark as Done")
//                 )}
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={onCloseDoneDialog}
//                 className="text-xs py-1.5"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
"use client";

import { useState, useEffect } from "react"; // Add useEffect import
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Building, User, Phone, FileText, Calendar, Paperclip, Download, 
  AlertTriangle, Info, Trash2, CheckSquare, ClipboardList, Loader2, ArrowUp, Bug
} from "lucide-react";
import { useFileDownload } from "@/hooks/useFileDownload";
import { useComplaintDownload } from "@/hooks/useComplaintDownload";
import type { ITask } from "@/models/Task";
import type { IOnlineComplaint } from "@/models/OnlineComplaint";
import type { TaskOrComplaint } from "@/hooks/useTaskDev";

interface SoftwareInformation {
  softwareType: string;
  version: string;
  lastUpdated: string;
  _id: string;
}

interface DevDialogsProps {
  selectedTask: TaskOrComplaint | null;
  isViewDialogOpen: boolean;
  isDoneDialogOpen: boolean;
  developerRemarks: string;
  developerAttachments: File[];
  developerRejectionSolveAttachments: File[];
  developerStatusRejection: string;
  developerRejectionRemarks: string;
  isSubmitting: boolean;
  onCloseViewDialog: () => void;
  onCloseDoneDialog: () => void;
  onDeveloperRemarksChange: (value: string) => void;
  onDeveloperAttachmentsChange: (files: File[]) => void;
  onDeveloperRejectionSolveAttachmentsChange: (files: File[]) => void;
  onDeveloperStatusRejectionChange: (value: string) => void;
  onDeveloperRejectionRemarksChange: (value: string) => void;
  onHandleDoneTask: () => void;
  isComplaint: (item: TaskOrComplaint | null) => boolean;
}

export function DevDialogs({
  selectedTask,
  isViewDialogOpen,
  isDoneDialogOpen,
  developerRemarks,
  developerAttachments,
  developerRejectionSolveAttachments,
  developerStatusRejection,
  developerRejectionRemarks,
  isSubmitting,
  onCloseViewDialog,
  onCloseDoneDialog,
  onDeveloperRemarksChange,
  onDeveloperAttachmentsChange,
  onDeveloperRejectionSolveAttachmentsChange,
  onDeveloperStatusRejectionChange,
  onDeveloperRejectionRemarksChange,
  onHandleDoneTask,
  isComplaint
}: DevDialogsProps) {
  
  // Use the download hooks with separate states
  const { 
    isDownloading: isTaskDownloading, 
    isDownloadingAssignment: isTaskAssignmentDownloading,
    isDownloadingRejection, // Add this
    downloadAllAttachments: downloadTaskAttachments 
  } = useFileDownload();
  
  const { 
    isDownloading: isComplaintDownloading, 
    isDownloadingAssignment: isComplaintAssignmentDownloading,
    downloadComplaintAttachments,
    downloadAssignmentAttachments,
    downloadSingleFile: downloadComplaintFile,
    getFileLists
  } = useComplaintDownload();

  const [fileLists, setFileLists] = useState<{
    complaintFiles: any[];
    assignmentFiles: any[];
  }>({
    complaintFiles: [],
    assignmentFiles: []
  });

  // Load files when complaint dialog opens
  useEffect(() => {
    if (isViewDialogOpen && selectedTask && isComplaint(selectedTask)) {
      const loadComplaintFiles = async () => {
        if (!selectedTask._id) return;
        
        try {
          const lists = await getFileLists(selectedTask._id);
          setFileLists({
            complaintFiles: lists.complaintFiles,
            assignmentFiles: lists.assignmentFiles
          });
        } catch (error) {
          console.error("Error loading file lists:", error);
        }
      };
      
      loadComplaintFiles();
    }
  }, [isViewDialogOpen, selectedTask, isComplaint, getFileLists]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (files: File[]) => void) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setter(newFiles);
  };

  const removeFile = (index: number, files: File[], setter: (files: File[]) => void) => {
    setter(files.filter((_, i) => i !== index));
  };

  const handleDownloadTaskAttachments = (taskId: string, attachments: any[], type: string) => {
    // Convert attachment objects to file paths/IDs for the hook
    const attachmentPaths = attachments.map(att => {
      if (typeof att === 'string') return att;
      if (att.fileId) return att.fileId;
      if (att.path) return att.path;
      return att;
    }).filter(Boolean);

    downloadTaskAttachments(taskId, attachmentPaths.length > 0 ? attachmentPaths : undefined, type);
  };

  const handleDownloadComplaintAttachments = (complaintId: string, complaintNumber?: string) => {
    downloadComplaintAttachments(complaintId, complaintNumber);
  };

  const handleDownloadAssignmentAttachments = (complaintId: string, complaintNumber?: string) => {
    downloadAssignmentAttachments(complaintId, complaintNumber);
  };

  const handleDownloadSingleFile = (fileId: string, fileName: string) => {
    downloadComplaintFile(fileId, fileName);
  };

  if (!selectedTask) return null;

  const complaint = isComplaint(selectedTask);
  const task = complaint ? null : selectedTask as ITask;
  const onlineComplaint = complaint ? selectedTask as IOnlineComplaint : null;

  // FIX: `ITask` does not declare a `priority` field in the model type,
  // so TypeScript rejects `task?.priority` even though it's a task at runtime.
  // Read it safely here once instead of accessing `task?.priority` inline below.
  const taskPriority = task
    ? (task as ITask & { priority?: string }).priority
    : undefined;

  // Get attachments based on type
  const getAssignmentAttachments = () => {
    if (complaint) {
      // For complaint, use assignmentAttachments (plural)
      return onlineComplaint?.assignmentAttachments || [];
    } else {
      // For task, use assignmentAttachment (singular)
      return task?.assignmentAttachment || [];
    }
  };

  const assignmentAttachments = getAssignmentAttachments();

  return (
    <>
      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={onCloseViewDialog}>
        <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {complaint && <Bug className="h-4 w-4 text-red-500" />}
              <DialogTitle className="text-base sm:text-lg">
                {complaint ? "Complaint Details" : "Task Details"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              Details for {complaint ? "complaint" : "task"} {complaint ? onlineComplaint?.complaintNumber : task?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border rounded-lg bg-muted/50">
              <thead className="bg-muted">
                <tr>
                  <th colSpan={2} className="p-2 sm:p-3 text-left font-semibold text-foreground/80 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
                      {complaint ? "Complaint Details" : "Task Details"}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Code/Number */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Complaint #" : "Task Code"}
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      {complaint ? onlineComplaint?.complaintNumber : task?.code}
                    </Badge>
                  </td>
                </tr>

                {/* Company Information */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" /> Company
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {complaint ? onlineComplaint?.company.companyName : task?.company?.name}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" /> City
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {complaint ? onlineComplaint?.company.city : task?.company?.city}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" /> Address
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {complaint ? onlineComplaint?.company.address : task?.company?.address}
                  </td>
                </tr>

                {/* Contact Information */}
                {!complaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <User className="h-3 w-3 text-muted-foreground" /> Contact Name
                    </td>
                    <td className="p-2 sm:p-3 break-words">{task?.contact?.name}</td>
                  </tr>
                )}
                {!complaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" /> Contact Phone
                    </td>
                    <td className="p-2 sm:p-3 break-words">{task?.contact?.phone}</td>
                  </tr>
                )}

                {/* Complaint Specific Fields */}
                {complaint && (
                  <>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <User className="h-3 w-3 text-muted-foreground" /> Contact Person
                      </td>
                      <td className="p-2 sm:p-3 break-words">{onlineComplaint?.contactPerson}</td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" /> Contact Phone
                      </td>
                      <td className="p-2 sm:p-3 break-words">{onlineComplaint?.contactPhone}</td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <User className="h-3 w-3 text-muted-foreground" /> Company Representative
                      </td>
                      <td className="p-2 sm:p-3 break-words">{onlineComplaint?.company.companyRepresentative}</td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" /> Company Phone
                      </td>
                      <td className="p-2 sm:p-3 break-words">{onlineComplaint?.company.phoneNumber}</td>
                    </tr>
                  </>
                )}

                {/* Assigned To */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <User className="h-3 w-3 text-muted-foreground" /> Assigned To
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {selectedTask.assignedTo?.name} ({selectedTask.assignedTo?.username}, {selectedTask.assignedTo?.role?.name})
                  </td>
                </tr>

                {/* Work/Software Type */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Software Type" : "Work"}
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {complaint ? onlineComplaint?.softwareType : task?.working}
                  </td>
                </tr>

                {/* Priority */}
                {!complaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <AlertTriangle className="h-3 w-3 text-muted-foreground" /> Priority
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      <Badge variant="outline" className={
                        taskPriority === "Urgent" ? "bg-red-100 text-red-800 border-red-300" :
                        taskPriority === "High" ? "bg-orange-100 text-orange-800 border-orange-300" :
                        "bg-accent/30 text-secondary border-primary/40"
                      }>
                        {taskPriority === "Urgent" ? (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </>
                        ) : taskPriority === "High" ? (
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
                  </tr>
                )}

                {/* Software Information for Tasks */}
                {!complaint && task?.company?.id && typeof task.company.id === 'object' && 
                 'softwareInformation' in task.company.id && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <FileText className="h-3 w-3 text-gray-50" /> Software Info
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {(task.company.id as any).softwareInformation?.map((software: SoftwareInformation, index: number) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <div className="font-medium">{software.softwareType}</div>
                          <div>Version: {software.version}</div>
                          <div>Last Updated: {new Date(software.lastUpdated).toLocaleDateString()}</div>
                        </div>
                      )) || "N/A"}
                    </td>
                  </tr>
                )}

                {/* Dates */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Created At
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {selectedTask.createdAt
                      ? new Date(selectedTask.createdAt).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Assigned Date
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {selectedTask.assignedDate
                      ? new Date(selectedTask.assignedDate).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>

                {/* Remarks */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Complaint Remarks" : "Task Remarks"}
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {complaint ? onlineComplaint?.complaintRemarks : task?.TaskRemarks || "None"}
                  </td>
                </tr>

                {/* Assignment Remarks */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> Assignment Remarks
                  </td>
                  <td className="p-2 sm:p-3 break-words">{selectedTask.assignmentRemarks || "None"}</td>
                </tr>

                {/* Attachments - Complaint */}
                {complaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Paperclip className="h-3 w-3 text-muted-foreground" /> Complaint Attachments
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {onlineComplaint?.attachments && Array.isArray(onlineComplaint.attachments) && onlineComplaint.attachments.length > 0 ? (
                        <div className="space-y-2">
                          {/* Download All Button */}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleDownloadComplaintAttachments(onlineComplaint._id, onlineComplaint.complaintNumber)}
                            disabled={isComplaintDownloading}
                          >
                            {isComplaintDownloading ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 mr-1" />
                                Download All ({onlineComplaint.attachments.length})
                              </>
                            )}
                          </Button>
                        </div>
                      ) : "None"}
                    </td>
                  </tr>
                )}

                {/* Task Attachments */}
                {!complaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Paperclip className="h-3 w-3 text-muted-foreground" /> Task Attachments
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {task?.TasksAttachment && Array.isArray(task.TasksAttachment) && task.TasksAttachment.length > 0 ? (
                        <div className="space-y-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleDownloadTaskAttachments(task._id, task.TasksAttachment || [], 'task')}
                            disabled={isTaskDownloading}
                          >
                            {isTaskDownloading ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 mr-1" />
                                Download All ({task.TasksAttachment.length})
                              </>
                            )}
                          </Button>
                        </div>
                      ) : "None"}
                    </td>
                  </tr>
                )}

                {/* Assignment Attachments */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Paperclip className="h-3 w-3 text-muted-foreground" /> Assignment Attachments
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {assignmentAttachments && Array.isArray(assignmentAttachments) && assignmentAttachments.length > 0 ? (
                      <div className="space-y-2">
                        {/* For Complaints */}
                        {complaint ? (
                          <>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleDownloadAssignmentAttachments(selectedTask._id, onlineComplaint?.complaintNumber)}
                              disabled={isComplaintAssignmentDownloading}
                            >
                              {isComplaintAssignmentDownloading ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-3 w-3 mr-1" />
                                  Download All ({assignmentAttachments.length})
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          /* For Tasks */
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleDownloadTaskAttachments(selectedTask._id, assignmentAttachments, 'assignment')}
                            disabled={isTaskAssignmentDownloading}
                          >
                            {isTaskAssignmentDownloading ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 mr-1" />
                                Download All ({assignmentAttachments.length})
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ) : "None"}
                  </td>
                </tr>

                {/* Rejection Section - For Tasks Only */}
                {!complaint && task?.finalStatus === "rejected" && (
                  <>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <AlertTriangle className="h-3 w-3 text-red-500" /> Solve Rejection Remarks
                      </td>
                      <td className="p-2 sm:p-3 break-words text-red-600">
                        {task.rejectionRemarks || "None"}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-red-500" /> Rejection Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {task.rejectionAttachment && Array.isArray(task.rejectionAttachment) && task.rejectionAttachment.length > 0 ? (
                          <div className="space-y-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              onClick={() => handleDownloadTaskAttachments(task._id, task.rejectionAttachment || [], 'rejection')}
                              disabled={isDownloadingRejection}
                            >
                              {isDownloadingRejection  ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-3 w-3 mr-1" />
                                  Download All ({task.rejectionAttachment.length})
                                </>
                              )}
                            </Button>
                          </div>
                        ) : "None"}
                      </td>
                    </tr>
                    {task.developer_status_rejection && (
                      <tr>
                        <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                          <Info className="h-3 w-3 text-primary" /> Developer Rejection Status
                        </td>
                        <td className="p-2 sm:p-3 break-words">
                          <Badge variant="outline" className={
                            task.developer_status_rejection === "fixed" ? "bg-green-100 text-green-800 border-green-300" :
                            "bg-yellow-100 text-yellow-800 border-yellow-300"
                          }>
                            {task.developer_status_rejection}
                          </Badge>
                        </td>
                      </tr>
                    )}
                    {task.developer_rejection_remarks && (
                      <tr>
                        <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                          <FileText className="h-3 w-3 text-primary" /> Developer Solve Rejection Remarks
                        </td>
                        <td className="p-2 sm:p-3 break-words">{task.developer_rejection_remarks}</td>
                      </tr>
                    )}
                    {task.developer_rejection_solve_attachment && Array.isArray(task.developer_rejection_solve_attachment) && task.developer_rejection_solve_attachment.length > 0 && (
                      <tr>
                        <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                          <Paperclip className="h-3 w-3 text-primary" /> Developer Rejection Solve Attachments
                        </td>
                        <td className="p-2 sm:p-3 break-words">
                          <div className="space-y-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleDownloadTaskAttachments(task._id, task.developer_rejection_solve_attachment || [], 'developer-rejection-solve')}
                              disabled={isTaskDownloading}
                            >
                              {isTaskDownloading ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-3 w-3 mr-1" />
                                  Download All ({task.developer_rejection_solve_attachment.length})
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}

                {/* Developer Attachments */}
                {!complaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Paperclip className="h-3 w-3 text-muted-foreground" /> Developer Attachments
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {task?.developer_attachment && Array.isArray(task.developer_attachment) && task.developer_attachment.length > 0 ? (
                        <div className="space-y-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleDownloadTaskAttachments(task._id, task.developer_attachment || [], 'developer')}
                            disabled={isTaskDownloading}
                          >
                            {isTaskDownloading ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 mr-1" />
                                Download All ({task.developer_attachment.length})
                              </>
                            )}
                          </Button>
                        </div>
                      ) : "None"}
                    </td>
                  </tr>
                )}

                {/* Status Fields */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                    Status
                  </td>
                  <td className="p-2 sm:p-3">
                    <Badge variant="outline" className={
                      selectedTask.status === "assigned" || selectedTask.status === "in-progress" ? "bg-accent/30 text-secondary" :
                      selectedTask.status === "completed" || selectedTask.status === "resolved" ? "bg-green-100 text-green-800" :
                      selectedTask.status === "pending" || selectedTask.status === "registered" ? "bg-yellow-100 text-yellow-800" :
                      "bg-muted text-foreground"
                    }>
                      {selectedTask.status}
                    </Badge>
                  </td>
                </tr>

                {/* Developer Status */}
                {!complaint && task?.developer_status && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                      Developer Status
                    </td>
                    <td className="p-2 sm:p-3">
                      <Badge variant="outline" className={
                        task.developer_status === "done" ? "bg-green-100 text-green-800" :
                        task.developer_status === "not-done" ? "bg-accent/30 text-secondary" :
                        task.developer_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-muted text-foreground"
                      }>
                        {task.developer_status}
                      </Badge>
                    </td>
                  </tr>
                )}

                {/* Final Status */}
                {!complaint && task?.finalStatus && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                      Final Status
                    </td>
                    <td className="p-2 sm:p-3">
                      <Badge variant="outline" className={
                        task.finalStatus === "done" ? "bg-green-100 text-green-800" :
                        task.finalStatus === "in-progress" ? "bg-accent/30 text-secondary" :
                        task.finalStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                        task.finalStatus === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-muted text-foreground"
                      }>
                        {task.finalStatus}
                      </Badge>
                    </td>
                  </tr>
                )}

                {/* Developer Done Date */}
                {!complaint && task?.developer_done_date && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" /> Developer Completed At
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {new Date(task.developer_done_date).toLocaleString()}
                    </td>
                  </tr>
                )}

                {/* Type Badge */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                    Type
                  </td>
                  <td className="p-2 sm:p-3">
                    <Badge variant="outline" className={
                      complaint 
                        ? "bg-purple-100 text-purple-800 border-purple-300" 
                        : "bg-accent/30 text-secondary border-primary/40"
                    }>
                      {complaint ? "Complaint" : "Task"}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Done Dialog */}
      <Dialog open={isDoneDialogOpen} onOpenChange={onCloseDoneDialog}>
        <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {complaint && <Bug className="h-4 w-4 text-red-500" />}
              <DialogTitle className="text-base sm:text-lg">
                {complaint ? "Resolve Complaint" : "Mark Task as Done"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              Provide details for {complaint ? "complaint" : "task"} {complaint ? onlineComplaint?.complaintNumber : task?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border rounded-lg bg-muted/50">
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs">
                      <Building className="h-3 w-3 text-muted-foreground" /> Company
                    </td>
                    <td className="p-2 break-words">
                      {complaint ? onlineComplaint?.company.companyName : task?.company?.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs">
                      <FileText className="h-3 w-3 text-muted-foreground" /> {complaint ? "Software Type" : "Work"}
                    </td>
                    <td className="p-2 break-words">
                      {complaint ? onlineComplaint?.softwareType : task?.working}
                    </td>
                  </tr>
                  {!complaint && task?.finalStatus === "rejected" && (
                    <>
                      <tr>
                        <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3 text-red-500" /> Solve Rejection Remarks
                        </td>
                        <td className="p-2 break-words text-red-600">
                          {task.rejectionRemarks || "None"}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium w-[80px] sm:w-[100px] shrink-0 flex items-center gap-1 text-xs text-red-600">
                          <Paperclip className="h-3 w-3 text-red-500" /> Rejection Attachments
                        </td>
                        <td className="p-2 break-words">
                          {task.rejectionAttachment && Array.isArray(task.rejectionAttachment) && task.rejectionAttachment.length > 0 ? (
                            <div className="space-y-1">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                onClick={() => handleDownloadTaskAttachments(task._id, task.rejectionAttachment || [], 'rejection')}
                                disabled={isTaskDownloading}
                              >
                                {isTaskDownloading ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3 w-3 mr-1" />
                                    Download All ({task.rejectionAttachment.length})
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : "None"}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="developerRemarks" className="text-xs font-medium">
                {complaint ? "Resolution Remarks *" : "Developer Remarks *"}
              </Label>
              <Textarea
                id="developerRemarks"
                value={developerRemarks}
                onChange={(e) => onDeveloperRemarksChange(e.target.value)}
                placeholder={complaint ? "Enter resolution remarks" : "Enter remarks about task completion"}
                rows={3}
                className="w-full text-xs min-h-[60px] max-h-[80px]"
              />
            </div>

            {!complaint && task?.finalStatus === "rejected" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="developerStatusRejection" className="text-xs font-medium">Rejection Status *</Label>
                  <Select value={developerStatusRejection} onValueChange={onDeveloperStatusRejectionChange}>
                    <SelectTrigger className="w-full text-xs h-8">
                      <SelectValue placeholder="Select rejection status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="developerRejectionRemarks" className="text-xs font-medium">Solve Rejection Remarks *</Label>
                  <Textarea
                    id="developerRejectionRemarks"
                    value={developerRejectionRemarks}
                    onChange={(e) => onDeveloperRejectionRemarksChange(e.target.value)}
                    placeholder="Enter remarks about how you fixed the rejection"
                    rows={3}
                    className="w-full text-xs min-h-[60px] max-h-[80px]"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="files" className="text-xs font-medium">Attach Files (Optional)</Label>
              <div className="border rounded-md p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {complaint ? "Resolution Files" : "Developer Files"}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt"
                      onChange={(e) => handleFileChange(e, onDeveloperAttachmentsChange)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline" size="sm" className="text-xs h-7">
                      <Paperclip className="h-3 w-3 mr-1" />
                      Add Files
                    </Button>
                  </div>
                </div>
                
                {developerAttachments.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Selected files:</div>
                    <div className="grid gap-1 max-h-20 overflow-y-auto">
                      {developerAttachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-1 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index, developerAttachments, onDeveloperAttachmentsChange)}
                            className="h-5 w-5 p-0"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!complaint && task?.finalStatus === "rejected" && (
              <div className="space-y-2">
                <Label htmlFor="rejectionSolveFiles" className="text-xs font-medium">Rejection Solve Attachments (Optional)</Label>
                <div className="border rounded-md p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs font-medium">Rejection Solve Files</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="rejectionSolveFiles"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt"
                        onChange={(e) => handleFileChange(e, onDeveloperRejectionSolveAttachmentsChange)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button type="button" variant="outline" size="sm" className="text-xs h-7">
                        <Paperclip className="h-3 w-3 mr-1" />
                        Add Files
                      </Button>
                    </div>
                  </div>
                  
                  {developerRejectionSolveAttachments.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Selected files:</div>
                      <div className="grid gap-1 max-h-20 overflow-y-auto">
                        {developerRejectionSolveAttachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-1 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index, developerRejectionSolveAttachments, onDeveloperRejectionSolveAttachmentsChange)}
                              className="h-5 w-5 p-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <Button
                onClick={onHandleDoneTask}
                className="flex-1 bg-green-600 hover:bg-green-700 text-xs py-1.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  complaint ? "Mark as Resolved" : 
                  (task?.finalStatus === "rejected" ? "Fix & Complete" : "Mark as Done")
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onCloseDoneDialog}
                className="text-xs py-1.5"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}