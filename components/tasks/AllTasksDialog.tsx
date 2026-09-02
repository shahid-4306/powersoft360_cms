// "use client"

// import { useState } from "react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   CheckSquare,
//   Clock,
//   XCircle,
//   Building,
//   User,
//   FileText,
//   Calendar,
//   ClipboardList,
//   Phone,
//   AlertTriangle,
//   ArrowUp,
//   Info,
//   Paperclip,
//   Download,
//   Trash2,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
// } from "lucide-react"
// import type { ITask } from "@/models/Task"
// import type { IOnlineComplaint } from "@/models/OnlineComplaint"

// type CombinedItem = (ITask & { type: 'task' }) | (IOnlineComplaint & { type: 'complaint' })

// interface AllTasksDialogProps {
//   item: CombinedItem | null
//   isOpen: boolean
//   onClose: () => void
//   taskStatus: string
//   completionRemarks: string
//   completionAttachments: File[]
//   isApproving: boolean
//   onTaskStatusChange: (status: string) => void
//   onCompletionRemarksChange: (remarks: string) => void
//   onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
//   onRemoveFile: (index: number) => void
//   onApproveTask: () => void
//   onDownloadFiles: (item: CombinedItem, attachments: string[], type: string) => void
//   getDownloadUrl: (attachment: string) => string
//   formatTimeTaken: (milliseconds: number) => string
//   getDeveloperStatusColor: (status: string) => string
// }

// export function AllTasksDialog({
//   item,
//   isOpen,
//   onClose,
//   taskStatus,
//   completionRemarks,
//   completionAttachments,
//   isApproving,
//   onTaskStatusChange,
//   onCompletionRemarksChange,
//   onFileChange,
//   onRemoveFile,
//   onApproveTask,
//   onDownloadFiles,
//   getDownloadUrl,
//   formatTimeTaken,
//   getDeveloperStatusColor,
// }: AllTasksDialogProps) {
//   if (!item) return null

//   const isTask = item.type === 'task'
//   const isComplaint = item.type === 'complaint'

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-base sm:text-lg">
//             Approve {isTask ? 'Task' : 'Complaint'} Completion
//           </DialogTitle>
//           <DialogDescription className="text-xs sm:text-sm">
//             Approve completion for {isTask ? 'task' : 'complaint'} {isTask ? item.code || "" : item.complaintNumber || ""}
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="space-y-4 max-h-[70vh] overflow-y-auto">
//           <div className="overflow-x-auto">
//             <table className="w-full text-xs sm:text-sm border rounded-lg bg-muted/50">
//               <thead className="bg-muted">
//                 <tr>
//                   <th colSpan={2} className="p-2 sm:p-3 text-left font-semibold text-foreground/80 text-xs sm:text-sm">
//                     <div className="flex items-center gap-2">
//                       <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
//                       {isTask ? 'Task' : 'Complaint'} Details
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-border">
//                 {/* Type Badge */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     Type
//                   </td>
//                   <td className="p-2 sm:p-3">
//                     <Badge className={
//                       isTask 
//                         ? "bg-primary text-white text-xs"
//                         : "bg-purple-600 text-white text-xs"
//                     }>
//                       {isTask ? (
//                         <>
//                           <CheckSquare className="h-3 w-3 mr-1" />
//                           Task
//                         </>
//                       ) : (
//                         <>
//                           <AlertCircle className="h-3 w-3 mr-1" />
//                           Complaint
//                         </>
//                       )}
//                     </Badge>
//                   </td>
//                 </tr>

//                 {/* Code/Number */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> {isTask ? 'Code' : 'Complaint No.'}
//                   </td>
//                   <td className="p-2 sm:p-3 break-words font-mono">
//                     {isTask ? item.code : item.complaintNumber}
//                   </td>
//                 </tr>

//                 {/* Company Details */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Building className="h-3 w-3 text-muted-foreground" /> Company
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask ? item.company?.name : item.company.companyName}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Building className="h-3 w-3 text-muted-foreground" /> City
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask ? item.company?.city : item.company.city}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Building className="h-3 w-3 text-muted-foreground" /> Address
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask ? item.company?.address : item.company.address}
//                   </td>
//                 </tr>

//                 {/* Contact Details */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <User className="h-3 w-3 text-muted-foreground" /> Contact Name
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask ? item.contact?.name : item.contactPerson}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Phone className="h-3 w-3 text-muted-foreground" /> Contact Phone
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask ? item.contact?.phone : item.contactPhone}
//                   </td>
//                 </tr>

//                 {/* Assignment Details */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <User className="h-3 w-3 text-muted-foreground" /> Assigned To
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask 
//                       ? `${item.assignedTo?.name || 'Unassigned'} (${item.assignedTo?.username || ''}, ${item.assignedTo?.role?.name || ''})`
//                       : `${item.assignedTo?.name || 'Unassigned'} (${item.assignedTo?.username || ''}, ${item.assignedTo?.role?.name || ''})`
//                     }
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> {isTask ? 'Work' : 'Software Type'}
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask ? item.working : item.softwareType}
//                   </td>
//                 </tr>

//                 {/* Priority (only for tasks) */}
//                 {isTask && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <AlertTriangle className="h-3 w-3 text-muted-foreground" /> Priority
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       <Badge
//                         variant="outline"
//                         className={
//                           item.priority === "Urgent"
//                             ? "bg-red-100 text-red-800 border-red-300"
//                             : item.priority === "High"
//                             ? "bg-orange-100 text-orange-800 border-orange-300"
//                             : "bg-accent/30 text-secondary border-primary/40"
//                         }
//                       >
//                         {item.priority === "Urgent" ? (
//                           <>
//                             <AlertTriangle className="h-3 w-3 mr-1" />
//                             Urgent
//                           </>
//                         ) : item.priority === "High" ? (
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

//                 {/* Timestamps */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Calendar className="h-3 w-3 text-muted-foreground" /> Created At
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Calendar className="h-3 w-3 text-muted-foreground" /> Assigned Date
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask 
//                       ? (item.assignedDate ? new Date(item.assignedDate).toLocaleString() : "N/A")
//                       : (item.assignedDate ? new Date(item.assignedDate).toLocaleString() : "N/A")
//                     }
//                   </td>
//                 </tr>
                
//                 {/* Task-specific fields */}
//                 {isTask && item.completionApprovedAt && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Calendar className="h-3 w-3 text-muted-foreground" /> Completion Date
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {new Date(item.completionApprovedAt).toLocaleString()}
//                     </td>
//                   </tr>
//                 )}
                
//                 {isTask && item.assignedDate && item.completionApprovedAt && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Clock className="h-3 w-3 text-muted-foreground" /> Time Taken
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {formatTimeTaken(
//                         new Date(item.completionApprovedAt).getTime() -
//                           new Date(item.assignedDate).getTime()
//                       )}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Complaint-specific fields */}
//                 {isComplaint && item.resolvedDate && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Calendar className="h-3 w-3 text-muted-foreground" /> Resolved Date
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {new Date(item.resolvedDate).toLocaleString()}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Attachments - Task */}
//                 {isTask && (
//                   <>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-muted-foreground" /> Task Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.TasksAttachment && Array.isArray(item.TasksAttachment) && item.TasksAttachment.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                               onClick={() =>
//                                 onDownloadFiles(item, item.TasksAttachment || [], "task")
//                               }
//                             >
//                               <Download className="h-3 w-3 mr-1" />
//                               Download All ({item.TasksAttachment.length})
//                             </Button>
//                           </div>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                     </tr>

//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-muted-foreground" /> Assignment Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.assignmentAttachment &&
//                         Array.isArray(item.assignmentAttachment) &&
//                         item.assignmentAttachment.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                               onClick={() =>
//                                 onDownloadFiles(item, item.assignmentAttachment || [], "assignment")
//                               }
//                             >
//                               <Download className="h-3 w-3 mr-1" />
//                               Download All ({item.assignmentAttachment.length})
//                             </Button>
//                           </div>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                     </tr>
//                   </>
//                 )}

//                 {/* Attachments - Complaint */}
//                 {isComplaint && (
//                   <>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-muted-foreground" /> Complaint Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                               onClick={() =>
//                                 onDownloadFiles(item, item.attachments.map(a => a.fileId) || [], "complaint")
//                               }
//                             >
//                               <Download className="h-3 w-3 mr-1" />
//                               Download All ({item.attachments.length})
//                             </Button>
//                           </div>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                     </tr>

//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-muted-foreground" /> Assignment Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.assignmentAttachments &&
//                         Array.isArray(item.assignmentAttachments) &&
//                         item.assignmentAttachments.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                               onClick={() =>
//                                 onDownloadFiles(item, item.assignmentAttachments?.map(a => a.fileId) || [], "assignment")
//                               }
//                             >
//                               <Download className="h-3 w-3 mr-1" />
//                               Download All ({item.assignmentAttachments.length})
//                             </Button>
//                           </div>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                     </tr>

//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-muted-foreground" /> Resolution Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.resolutionAttachments &&
//                         Array.isArray(item.resolutionAttachments) &&
//                         item.resolutionAttachments.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                               onClick={() =>
//                                 onDownloadFiles(item, item.resolutionAttachments?.map(a => a.fileId) || [], "resolution")
//                               }
//                             >
//                               <Download className="h-3 w-3 mr-1" />
//                               Download All ({item.resolutionAttachments.length})
//                             </Button>
//                           </div>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                     </tr>
//                   </>
//                 )}

//                 {/* Remarks */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> {isTask ? 'Task' : 'Complaint'} Remarks
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     {isTask ? item.TaskRemarks || "None" : item.complaintRemarks || "None"}
//                   </td>
//                 </tr>
                
//                 {isTask && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <FileText className="h-3 w-3 text-muted-foreground" /> Assignment Remarks
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">{item.assignmentRemarks || "None"}</td>
//                   </tr>
//                 )}
                
//                 {isComplaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <FileText className="h-3 w-3 text-muted-foreground" /> Assignment Remarks
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">{item.assignmentRemarks || "None"}</td>
//                   </tr>
//                 )}
                
//                 {isComplaint && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <FileText className="h-3 w-3 text-muted-foreground" /> Resolution Remarks
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">{item.resolutionRemarks || "None"}</td>
//                   </tr>
//                 )}

//                 {/* Developer Remarks - Task */}
//                 {isTask && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <FileText className="h-3 w-3 text-muted-foreground" /> Developer Remarks
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">{item.developer_remarks || "None"}</td>
//                   </tr>
//                 )}

//                 {/* Developer Attachments - Task */}
//                 {isTask && item.developer_attachment && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                       <Paperclip className="h-3 w-3 text-muted-foreground" /> Developer Attachments
//                     </td>
//                     <td className="p-2 sm:p-3 break-words">
//                       {Array.isArray(item.developer_attachment) &&
//                       item.developer_attachment.length > 0 ? (
//                         <div className="space-y-2">
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             className="text-xs"
//                             onClick={() =>
//                               onDownloadFiles(
//                                 item,
//                                 item.developer_attachment || [],
//                                 "developer"
//                               )
//                             }
//                           >
//                             <Download className="h-3 w-3 mr-1" />
//                             Download All ({item.developer_attachment.length})
//                           </Button>
//                         </div>
//                       ) : (
//                         "None"
//                       )}
//                     </td>
//                   </tr>
//                 )}

//                 {/* Rejection Details - Task */}
//                 {isTask && item.finalStatus === "in-progress" && (
//                   <>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <FileText className="h-3 w-3 text-muted-foreground" /> Rejection Remarks
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">{item.rejectionRemarks || "None"}</td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-muted-foreground" /> Rejection Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.rejectionAttachment &&
//                         Array.isArray(item.rejectionAttachment) &&
//                         item.rejectionAttachment.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                               onClick={() =>
//                                 onDownloadFiles(
//                                   item,
//                                   item.rejectionAttachment || [],
//                                   "rejection"
//                                 )
//                               }
//                             >
//                               <Download className="h-3 w-3 mr-1" />
//                               Download All ({item.rejectionAttachment.length})
//                             </Button>
//                           </div>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <FileText className="h-3 w-3 text-muted-foreground" /> Developer Rejection Remarks
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.developer_rejection_remarks || "None"}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                         <Paperclip className="h-3 w-3 text-muted-foreground" /> Developer Rejection Solve Attachments
//                       </td>
//                       <td className="p-2 sm:p-3 break-words">
//                         {item.developer_rejection_solve_attachment &&
//                         Array.isArray(item.developer_rejection_solve_attachment) &&
//                         item.developer_rejection_solve_attachment.length > 0 ? (
//                           <div className="space-y-2">
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                               onClick={() =>
//                                 onDownloadFiles(
//                                   item,
//                                   item.developer_rejection_solve_attachment || [],
//                                   "developer-rejection-solve"
//                                 )
//                               }
//                             >
//                               <Download className="h-3 w-3 mr-1" />
//                               Download All ({item.developer_rejection_solve_attachment.length})
//                             </Button>
//                           </div>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                         Developer Status Rejection
//                       </td>
//                       <td className="p-2 sm:p-3">
//                         <Badge
//                           variant="outline"
//                           className={`text-xs ${getDeveloperStatusColor(
//                             item.developer_status_rejection || ""
//                           )}`}
//                         >
//                           {item.developer_status_rejection || "N/A"}
//                         </Badge>
//                       </td>
//                     </tr>
//                   </>
//                 )}

//                 {/* Status Badges */}
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                     Status
//                   </td>
//                   <td className="p-2 sm:p-3">
//                     <Badge
//                       variant="outline"
//                       className={
//                         isTask
//                           ? item.status === "assigned"
//                             ? "bg-accent/30 text-secondary"
//                             : item.status === "completed"
//                             ? "bg-green-100 text-green-800"
//                             : item.status === "pending"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-muted text-foreground"
//                           : item.status === "registered"
//                             ? "bg-accent/30 text-secondary"
//                             : item.status === "in-progress"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : item.status === "resolved"
//                             ? "bg-green-100 text-green-800"
//                             : item.status === "closed"
//                             ? "bg-muted text-foreground"
//                             : "bg-muted text-foreground"
//                       }
//                     >
//                       {item.status}
//                     </Badge>
//                   </td>
//                 </tr>
                
//                 {isTask && item.developer_status && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                       Developer Status
//                     </td>
//                     <td className="p-2 sm:p-3">
//                       <Badge
//                         variant="outline"
//                         className={
//                           item.developer_status === "done"
//                             ? "bg-green-100 text-green-800"
//                             : item.developer_status === "not-done"
//                             ? "bg-red-100 text-red-800"
//                             : item.developer_status === "on-hold"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-muted text-foreground"
//                         }
//                       >
//                         {item.developer_status}
//                       </Badge>
//                     </td>
//                   </tr>
//                 )}
                
//                 {isComplaint && item.developerStatus && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                       Developer Status
//                     </td>
//                     <td className="p-2 sm:p-3">
//                       <Badge
//                         variant="outline"
//                         className={
//                           item.developerStatus === "done"
//                             ? "bg-green-100 text-green-800"
//                             : item.developerStatus === "not-started"
//                             ? "bg-red-100 text-red-800"
//                             : item.developerStatus === "in-progress"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : item.developerStatus === "pending"
//                             ? "bg-accent/30 text-secondary"
//                             : "bg-muted text-foreground"
//                         }
//                       >
//                         {item.developerStatus}
//                       </Badge>
//                     </td>
//                   </tr>
//                 )}
                
//                 {isTask && item.finalStatus && (
//                   <tr>
//                     <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
//                       Final Status
//                     </td>
//                     <td className="p-2 sm:p-3">
//                       <Badge
//                         variant="outline"
//                         className={
//                           item.finalStatus === "done"
//                             ? "bg-green-100 text-green-800"
//                             : item.finalStatus === "not-done"
//                             ? "bg-red-100 text-red-800"
//                             : item.finalStatus === "on-hold"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : item.finalStatus === "in-progress"
//                             ? "bg-accent/30 text-secondary"
//                             : "bg-muted text-foreground"
//                         }
//                       >
//                         {item.finalStatus}
//                       </Badge>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Completion Form */}
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="taskStatus" className="text-xs sm:text-sm font-medium">
//                 {isTask ? 'Task' : 'Complaint'} Completion Status *
//               </Label>
//               <Select value={taskStatus} onValueChange={onTaskStatusChange}>
//                 <SelectTrigger className="w-full text-xs sm:text-sm">
//                   <SelectValue placeholder="Select completion status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="done">
//                     <div className="flex items-center gap-2">
//                       <CheckSquare className="h-4 w-4 text-green-600" />
//                       {isTask ? 'Done - Task Completed Successfully' : 'Closed - Complaint Resolved'}
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="not-done">
//                     <div className="flex items-center gap-2">
//                       <XCircle className="h-4 w-4 text-red-600" />
//                       Not Done - {isTask ? 'Task' : 'Complaint'} Not Completed
//                     </div>
//                   </SelectItem>
//                   {isTask && (
//                     <SelectItem value="on-hold">
//                       <div className="flex items-center gap-2">
//                         <Clock className="h-4 w-4 text-yellow-600" />
//                         On Hold - Task Paused
//                       </div>
//                     </SelectItem>
//                   )}
//                   <SelectItem value="rejected">
//                     <div className="flex items-center gap-2">
//                       <XCircle className="h-4 w-4 text-red-600" />
//                       Rejected - {isTask ? 'Task' : 'Complaint'} Rejected
//                     </div>
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="completionRemarks" className="text-xs sm:text-sm font-medium">
//                 {taskStatus === "rejected" ? "Rejection Remarks" : "Completion Remarks"}
//               </Label>
//               <Textarea
//                 id="completionRemarks"
//                 value={completionRemarks}
//                 onChange={(e) => onCompletionRemarksChange(e.target.value)}
//                 placeholder={
//                   taskStatus === "rejected" ? "Enter rejection remarks" : "Enter completion remarks"
//                 }
//                 rows={3}
//                 className="w-full text-xs sm:text-sm"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="completionAttachment" className="text-xs sm:text-sm font-medium">
//                 {taskStatus === "rejected" ? "Rejection Attachments" : "Completion Attachments"} (Optional)
//               </Label>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Paperclip className="h-4 w-4" />
//                   <span className="text-sm font-medium">
//                     {taskStatus === "rejected" ? "Rejection Files" : "Completion Files"}
//                   </span>
//                 </div>
//                 <div className="relative">
//                   <Input
//                     id="files"
//                     type="file"
//                     multiple
//                     accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt"
//                     onChange={onFileChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   />
//                   <Button type="button" variant="outline" size="sm" className="text-xs">
//                     <Paperclip className="h-3 w-3 mr-1" />
//                     Add Files
//                   </Button>
//                 </div>
//               </div>

//               {completionAttachments.length > 0 && (
//                 <div className="space-y-2">
//                   <div className="text-xs text-muted-foreground">Selected files:</div>
//                   <div className="grid gap-2 max-h-32 overflow-y-auto">
//                     {completionAttachments.map((file, index) => (
//                       <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
//                         <div className="flex items-center gap-2 truncate">
//                           <FileText className="h-3 w-3 flex-shrink-0" />
//                           <span className="text-xs truncate max-w-xs">{file.name}</span>
//                           <span className="text-xs text-muted-foreground flex-shrink-0">
//                             ({(file.size / 1024).toFixed(1)} KB)
//                           </span>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => onRemoveFile(index)}
//                           className="h-6 w-6 p-0"
//                         >
//                           <Trash2 className="h-4 w-4 text-red-500" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="flex flex-col sm:flex-row gap-2 pt-4">
//               <Button
//                 onClick={onApproveTask}
//                 className="flex-1 bg-gradient-to-r from-purple-600 to-secondary hover:from-purple-700 hover:to-secondary text-xs sm:text-sm py-2"
//                 disabled={isApproving}
//               >
//                 {isApproving ? (
//                   <div className="flex items-center gap-2">
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     {taskStatus === "rejected" ? "Rejecting..." : "Approving..."}
//                   </div>
//                 ) : (
//                   taskStatus === "rejected" 
//                     ? `Reject ${isTask ? 'Task' : 'Complaint'}`
//                     : `Approve ${isTask ? 'Task' : 'Complaint'} Completion`
//                 )}
//               </Button>
//               <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm py-2">
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckSquare,
  Clock,
  XCircle,
  Building,
  User,
  FileText,
  Calendar,
  ClipboardList,
  Phone,
  AlertTriangle,
  ArrowUp,
  Info,
  Paperclip,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import type { ITask } from "@/models/Task"
import type { IOnlineComplaint } from "@/models/OnlineComplaint"

type CombinedItem = (ITask & { type: 'task' }) | (IOnlineComplaint & { type: 'complaint' })

interface AllTasksDialogProps {
  item: CombinedItem | null
  isOpen: boolean
  onClose: () => void
  taskStatus: string
  completionRemarks: string
  completionAttachments: File[]
  isApproving: boolean
  onTaskStatusChange: (status: string) => void
  onCompletionRemarksChange: (remarks: string) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onApproveTask: () => void
  onDownloadFiles: (item: CombinedItem, attachments: string[], type: string) => void
  getDownloadUrl: (attachment: string) => string
  formatTimeTaken: (milliseconds: number) => string
  getDeveloperStatusColor: (status: string) => string
}

export function AllTasksDialog({
  item,
  isOpen,
  onClose,
  taskStatus,
  completionRemarks,
  completionAttachments,
  isApproving,
  onTaskStatusChange,
  onCompletionRemarksChange,
  onFileChange,
  onRemoveFile,
  onApproveTask,
  onDownloadFiles,
  getDownloadUrl,
  formatTimeTaken,
  getDeveloperStatusColor,
}: AllTasksDialogProps) {
  if (!item) return null

  const isTask = item.type === 'task'
  const isComplaint = item.type === 'complaint'

  // FIX: `ITask` does not declare a `priority` field in the model type,
  // so TypeScript rejects `item.priority` even though it's a task.
  // Read it safely here once instead of accessing `item.priority` inline.
  const taskPriority = isTask
    ? (item as ITask & { priority?: string }).priority
    : undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Approve {isTask ? 'Task' : 'Complaint'} Completion
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Approve completion for {isTask ? 'task' : 'complaint'} {isTask ? item.code || "" : item.complaintNumber || ""}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border rounded-lg bg-muted/50">
              <thead className="bg-muted">
                <tr>
                  <th colSpan={2} className="p-2 sm:p-3 text-left font-semibold text-foreground/80 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
                      {isTask ? 'Task' : 'Complaint'} Details
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Type Badge */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    Type
                  </td>
                  <td className="p-2 sm:p-3">
                    <Badge className={
                      isTask 
                        ? "bg-primary text-white text-xs"
                        : "bg-purple-600 text-white text-xs"
                    }>
                      {isTask ? (
                        <>
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Task
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Complaint
                        </>
                      )}
                    </Badge>
                  </td>
                </tr>

                {/* Code/Number */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> {isTask ? 'Code' : 'Complaint No.'}
                  </td>
                  <td className="p-2 sm:p-3 break-words font-mono">
                    {isTask ? item.code : item.complaintNumber}
                  </td>
                </tr>

                {/* Company Details */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" /> Company
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask ? item.company?.name : item.company.companyName}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" /> City
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask ? item.company?.city : item.company.city}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" /> Address
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask ? item.company?.address : item.company.address}
                  </td>
                </tr>

                {/* Contact Details */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <User className="h-3 w-3 text-muted-foreground" /> Contact Name
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask ? item.contact?.name : item.contactPerson}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" /> Contact Phone
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask ? item.contact?.phone : item.contactPhone}
                  </td>
                </tr>

                {/* Assignment Details */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <User className="h-3 w-3 text-muted-foreground" /> Assigned To
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask 
                      ? `${item.assignedTo?.name || 'Unassigned'} (${item.assignedTo?.username || ''}, ${item.assignedTo?.role?.name || ''})`
                      : `${item.assignedTo?.name || 'Unassigned'} (${item.assignedTo?.username || ''}, ${item.assignedTo?.role?.name || ''})`
                    }
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> {isTask ? 'Work' : 'Software Type'}
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask ? item.working : item.softwareType}
                  </td>
                </tr>

                {/* Priority (only for tasks) */}
                {isTask && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <AlertTriangle className="h-3 w-3 text-muted-foreground" /> Priority
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      <Badge
                        variant="outline"
                        className={
                          taskPriority === "Urgent"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : taskPriority === "High"
                            ? "bg-orange-100 text-orange-800 border-orange-300"
                            : "bg-accent/30 text-secondary border-primary/40"
                        }
                      >
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

                {/* Timestamps */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Created At
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Assigned Date
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask 
                      ? (item.assignedDate ? new Date(item.assignedDate).toLocaleString() : "N/A")
                      : (item.assignedDate ? new Date(item.assignedDate).toLocaleString() : "N/A")
                    }
                  </td>
                </tr>
                
                {/* Task-specific fields */}
                {isTask && item.completionApprovedAt && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" /> Completion Date
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {new Date(item.completionApprovedAt).toLocaleString()}
                    </td>
                  </tr>
                )}
                
                {isTask && item.assignedDate && item.completionApprovedAt && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" /> Time Taken
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {formatTimeTaken(
                        new Date(item.completionApprovedAt).getTime() -
                          new Date(item.assignedDate).getTime()
                      )}
                    </td>
                  </tr>
                )}

                {/* Complaint-specific fields */}
                {isComplaint && item.resolvedDate && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" /> Resolved Date
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {new Date(item.resolvedDate).toLocaleString()}
                    </td>
                  </tr>
                )}

                {/* Attachments - Task */}
                {isTask && (
                  <>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-muted-foreground" /> Task Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.TasksAttachment && Array.isArray(item.TasksAttachment) && item.TasksAttachment.length > 0 ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                onDownloadFiles(item, item.TasksAttachment || [], "task")
                              }
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All ({item.TasksAttachment.length})
                            </Button>
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-muted-foreground" /> Assignment Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.assignmentAttachment &&
                        Array.isArray(item.assignmentAttachment) &&
                        item.assignmentAttachment.length > 0 ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                onDownloadFiles(item, item.assignmentAttachment || [], "assignment")
                              }
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All ({item.assignmentAttachment.length})
                            </Button>
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>
                  </>
                )}

                {/* Attachments - Complaint */}
                {isComplaint && (
                  <>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-muted-foreground" /> Complaint Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0 ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                onDownloadFiles(item, item.attachments.map(a => a.fileId) || [], "complaint")
                              }
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All ({item.attachments.length})
                            </Button>
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-muted-foreground" /> Assignment Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.assignmentAttachments &&
                        Array.isArray(item.assignmentAttachments) &&
                        item.assignmentAttachments.length > 0 ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                onDownloadFiles(item, item.assignmentAttachments?.map(a => a.fileId) || [], "assignment")
                              }
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All ({item.assignmentAttachments.length})
                            </Button>
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-muted-foreground" /> Resolution Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.resolutionAttachments &&
                        Array.isArray(item.resolutionAttachments) &&
                        item.resolutionAttachments.length > 0 ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                onDownloadFiles(item, item.resolutionAttachments?.map(a => a.fileId) || [], "resolution")
                              }
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All ({item.resolutionAttachments.length})
                            </Button>
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>
                  </>
                )}

                {/* Remarks */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> {isTask ? 'Task' : 'Complaint'} Remarks
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isTask ? item.TaskRemarks || "None" : item.complaintRemarks || "None"}
                  </td>
                </tr>
                
                {isTask && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <FileText className="h-3 w-3 text-muted-foreground" /> Assignment Remarks
                    </td>
                    <td className="p-2 sm:p-3 break-words">{item.assignmentRemarks || "None"}</td>
                  </tr>
                )}
                
                {isComplaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <FileText className="h-3 w-3 text-muted-foreground" /> Assignment Remarks
                    </td>
                    <td className="p-2 sm:p-3 break-words">{item.assignmentRemarks || "None"}</td>
                  </tr>
                )}
                
                {isComplaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <FileText className="h-3 w-3 text-muted-foreground" /> Resolution Remarks
                    </td>
                    <td className="p-2 sm:p-3 break-words">{item.resolutionRemarks || "None"}</td>
                  </tr>
                )}

                {/* Developer Remarks - Task */}
                {isTask && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <FileText className="h-3 w-3 text-muted-foreground" /> Developer Remarks
                    </td>
                    <td className="p-2 sm:p-3 break-words">{item.developer_remarks || "None"}</td>
                  </tr>
                )}

                {/* Developer Attachments - Task */}
                {isTask && item.developer_attachment && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Paperclip className="h-3 w-3 text-muted-foreground" /> Developer Attachments
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {Array.isArray(item.developer_attachment) &&
                      item.developer_attachment.length > 0 ? (
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              onDownloadFiles(
                                item,
                                item.developer_attachment || [],
                                "developer"
                              )
                            }
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download All ({item.developer_attachment.length})
                          </Button>
                        </div>
                      ) : (
                        "None"
                      )}
                    </td>
                  </tr>
                )}

                {/* Rejection Details - Task */}
                {isTask && item.finalStatus === "in-progress" && (
                  <>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <FileText className="h-3 w-3 text-muted-foreground" /> Rejection Remarks
                      </td>
                      <td className="p-2 sm:p-3 break-words">{item.rejectionRemarks || "None"}</td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-muted-foreground" /> Rejection Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.rejectionAttachment &&
                        Array.isArray(item.rejectionAttachment) &&
                        item.rejectionAttachment.length > 0 ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                onDownloadFiles(
                                  item,
                                  item.rejectionAttachment || [],
                                  "rejection"
                                )
                              }
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All ({item.rejectionAttachment.length})
                            </Button>
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <FileText className="h-3 w-3 text-muted-foreground" /> Developer Rejection Remarks
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.developer_rejection_remarks || "None"}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                        <Paperclip className="h-3 w-3 text-muted-foreground" /> Developer Rejection Solve Attachments
                      </td>
                      <td className="p-2 sm:p-3 break-words">
                        {item.developer_rejection_solve_attachment &&
                        Array.isArray(item.developer_rejection_solve_attachment) &&
                        item.developer_rejection_solve_attachment.length > 0 ? (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                onDownloadFiles(
                                  item,
                                  item.developer_rejection_solve_attachment || [],
                                  "developer-rejection-solve"
                                )
                              }
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All ({item.developer_rejection_solve_attachment.length})
                            </Button>
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                        Developer Status Rejection
                      </td>
                      <td className="p-2 sm:p-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDeveloperStatusColor(
                            item.developer_status_rejection || ""
                          )}`}
                        >
                          {item.developer_status_rejection || "N/A"}
                        </Badge>
                      </td>
                    </tr>
                  </>
                )}

                {/* Status Badges */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                    Status
                  </td>
                  <td className="p-2 sm:p-3">
                    <Badge
                      variant="outline"
                      className={
                        isTask
                          ? item.status === "assigned"
                            ? "bg-accent/30 text-secondary"
                            : item.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-muted text-foreground"
                          : item.status === "registered"
                            ? "bg-accent/30 text-secondary"
                            : item.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "closed"
                            ? "bg-muted text-foreground"
                            : "bg-muted text-foreground"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                </tr>
                
                {isTask && item.developer_status && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                      Developer Status
                    </td>
                    <td className="p-2 sm:p-3">
                      <Badge
                        variant="outline"
                        className={
                          item.developer_status === "done"
                            ? "bg-green-100 text-green-800"
                            : item.developer_status === "not-done"
                            ? "bg-red-100 text-red-800"
                            : item.developer_status === "on-hold"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-muted text-foreground"
                        }
                      >
                        {item.developer_status}
                      </Badge>
                    </td>
                  </tr>
                )}
                
                {isComplaint && item.developerStatus && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                      Developer Status
                    </td>
                    <td className="p-2 sm:p-3">
                      <Badge
                        variant="outline"
                        className={
                          item.developerStatus === "done"
                            ? "bg-green-100 text-green-800"
                            : item.developerStatus === "not-started"
                            ? "bg-red-100 text-red-800"
                            : item.developerStatus === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.developerStatus === "pending"
                            ? "bg-accent/30 text-secondary"
                            : "bg-muted text-foreground"
                        }
                      >
                        {item.developerStatus}
                      </Badge>
                    </td>
                  </tr>
                )}
                
                {isTask && item.finalStatus && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                      Final Status
                    </td>
                    <td className="p-2 sm:p-3">
                      <Badge
                        variant="outline"
                        className={
                          item.finalStatus === "done"
                            ? "bg-green-100 text-green-800"
                            : item.finalStatus === "not-done"
                            ? "bg-red-100 text-red-800"
                            : item.finalStatus === "on-hold"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.finalStatus === "in-progress"
                            ? "bg-accent/30 text-secondary"
                            : "bg-muted text-foreground"
                        }
                      >
                        {item.finalStatus}
                      </Badge>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Completion Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskStatus" className="text-xs sm:text-sm font-medium">
                {isTask ? 'Task' : 'Complaint'} Completion Status *
              </Label>
              <Select value={taskStatus} onValueChange={onTaskStatusChange}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select completion status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="done">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      {isTask ? 'Done - Task Completed Successfully' : 'Closed - Complaint Resolved'}
                    </div>
                  </SelectItem>
                  <SelectItem value="not-done">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Not Done - {isTask ? 'Task' : 'Complaint'} Not Completed
                    </div>
                  </SelectItem>
                  {isTask && (
                    <SelectItem value="on-hold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        On Hold - Task Paused
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Rejected - {isTask ? 'Task' : 'Complaint'} Rejected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionRemarks" className="text-xs sm:text-sm font-medium">
                {taskStatus === "rejected" ? "Rejection Remarks" : "Completion Remarks"}
              </Label>
              <Textarea
                id="completionRemarks"
                value={completionRemarks}
                onChange={(e) => onCompletionRemarksChange(e.target.value)}
                placeholder={
                  taskStatus === "rejected" ? "Enter rejection remarks" : "Enter completion remarks"
                }
                rows={3}
                className="w-full text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionAttachment" className="text-xs sm:text-sm font-medium">
                {taskStatus === "rejected" ? "Rejection Attachments" : "Completion Attachments"} (Optional)
              </Label>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {taskStatus === "rejected" ? "Rejection Files" : "Completion Files"}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="outline" size="sm" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Add Files
                  </Button>
                </div>
              </div>

              {completionAttachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Selected files:</div>
                  <div className="grid gap-2 max-h-32 overflow-y-auto">
                    {completionAttachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="text-xs truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={onApproveTask}
                className="flex-1 bg-gradient-to-r from-purple-600 to-secondary hover:from-purple-700 hover:to-secondary text-xs sm:text-sm py-2"
                disabled={isApproving}
              >
                {isApproving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {taskStatus === "rejected" ? "Rejecting..." : "Approving..."}
                  </div>
                ) : (
                  taskStatus === "rejected" 
                    ? `Reject ${isTask ? 'Task' : 'Complaint'}`
                    : `Approve ${isTask ? 'Task' : 'Complaint'} Completion`
                )}
              </Button>
              <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm py-2">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}