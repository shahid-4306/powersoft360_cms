// "use client"

// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import {
//   Building,
//   User,
//   Phone,
//   FileText,
//   Calendar,
//   ClipboardList,
//   Paperclip,
//   Download,
//   Loader2,
//   Zap,
//   AlertTriangle,
//   MapPin,
//   Users,
//   UserCheck,
//   XCircle,
// } from "lucide-react"
// import { useFileDownload } from "@/hooks/useFileDownload"
// import { useComplaintDownload } from "@/hooks/useComplaintDownload"

// interface ViewDetailsDialogProps {
//   isOpen: boolean
//   onClose: () => void
//   item: any
//   isComplaint?: boolean
// }

// // Read-only counterpart to AssignmentDialog: shows the complete
// // task/complaint details (company, contact, description, priority,
// // attachments, assignment/rejection info, status, timestamps) without
// // the assignment form, for the Eye/View action in the Pending Items
// // table.
// export function ViewDetailsDialog({ isOpen, onClose, item, isComplaint = false }: ViewDetailsDialogProps) {
//   const { isDownloading: isTaskDownloading, downloadAllAttachments: downloadTaskAttachments } = useFileDownload()
//   const { isDownloading: isComplaintDownloading, downloadAllAttachments: downloadComplaintAttachments } =
//     useComplaintDownload()

//   if (!item) {
//     return (
//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-base sm:text-lg">Loading...</DialogTitle>
//           </DialogHeader>
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         </DialogContent>
//       </Dialog>
//     )
//   }

//   const company = item.company || {}
//   const companyData = {
//     name: company.name || company.companyName || "N/A",
//     representative: company.companyRepresentative || company.representative || company.contactPerson || "N/A",
//     city: company.city || company.location || "N/A",
//     phone: company.phone || company.contactPhone || company.phoneNumber || "N/A",
//     address: company.address || company.fullAddress || "N/A",
//   }

//   const contactData = isComplaint
//     ? {
//         name: item.contactPerson || item.contact?.name || "N/A",
//         phone: item.contactPhone || item.contact?.phone || "N/A",
//       }
//     : {
//         name: item.contact?.name || item.contactPerson || "N/A",
//         phone: item.contact?.phone || item.contactPhone || "N/A",
//       }

//   const attachments: any[] = isComplaint
//     ? item.attachments || item.complaintAttachments || []
//     : item.TasksAttachment || item.attachments || item.Attachments || []

//   const getPriorityBadge = (priority?: string) => {
//     const prio = priority || "Normal"
//     switch (prio) {
//       case "Urgent":
//         return (
//           <Badge variant="destructive" className="text-xs flex items-center gap-1 w-fit">
//             <Zap className="h-3 w-3" /> Urgent
//           </Badge>
//         )
//       case "High":
//         return <Badge className="bg-orange-500 text-xs w-fit">High</Badge>
//       default:
//         return (
//           <Badge variant="secondary" className="text-xs w-fit">
//             Normal
//           </Badge>
//         )
//     }
//   }

//   const getStatusBadge = () => {
//     const status = (item.status || "pending").toLowerCase()

//     if (isComplaint) {
//       switch (status) {
//         case "registered":
//           return (
//             <Badge className="bg-purple-600 text-xs flex items-center gap-1 w-fit">
//               <AlertTriangle className="h-3 w-3" /> Registered
//             </Badge>
//           )
//         case "in-progress":
//         case "inprogress":
//           return <Badge className="bg-primary text-xs w-fit">In Progress</Badge>
//         case "resolved":
//           return <Badge className="bg-green-600 text-xs w-fit">Resolved</Badge>
//         case "closed":
//           return (
//             <Badge variant="outline" className="text-xs w-fit">
//               Closed
//             </Badge>
//           )
//         case "rejected":
//           return (
//             <Badge variant="destructive" className="text-xs w-fit">
//               Rejected
//             </Badge>
//           )
//         default:
//           return (
//             <Badge variant="outline" className="text-xs w-fit">
//               {item.status}
//             </Badge>
//           )
//       }
//     }

//     switch (status) {
//       case "pending":
//         return (
//           <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs w-fit">
//             Pending Approval
//           </Badge>
//         )
//       case "assigned":
//         return <Badge className="bg-green-600 text-xs w-fit">✅ Assigned</Badge>
//       default:
//         return (
//           <Badge variant="outline" className="text-xs w-fit">
//             {item.status}
//           </Badge>
//         )
//     }
//   }

//   const formatDateTime = (value?: string | null) => {
//     if (!value) return "N/A"
//     return new Date(value).toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-base sm:text-lg">
//             {isComplaint ? "Complaint Details" : "Task Details"}
//           </DialogTitle>
//           <DialogDescription className="text-xs sm:text-sm">
//             {isComplaint
//               ? `Complete details for complaint ${item.complaintNumber || ""}`
//               : `Complete details for task ${item.code || ""}`}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="overflow-x-auto">
//           <table className="w-full text-xs sm:text-sm border rounded-lg bg-muted/50">
//             <thead className="bg-muted">
//               <tr>
//                 <th colSpan={2} className="p-2 sm:p-3 text-left font-semibold text-foreground/80 text-xs sm:text-sm">
//                   <div className="flex items-center gap-2">
//                     <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
//                     {isComplaint ? `Complaint ${item.complaintNumber || ""}` : `Task ${item.code || ""}`}
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-border">
//               <tr>
//                 <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                   <Building className="h-3 w-3 text-muted-foreground" /> Company
//                 </td>
//                 <td className="p-2 sm:p-3 break-words">
//                   <div className="font-medium">{companyData.name}</div>
//                   {companyData.representative !== "N/A" && (
//                     <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
//                       <Users className="h-3 w-3" />
//                       Representative: {companyData.representative}
//                     </div>
//                   )}
//                   {companyData.city !== "N/A" && (
//                     <div className="text-xs text-muted-foreground flex items-center gap-1">
//                       <MapPin className="h-3 w-3" />
//                       Location: {companyData.city}
//                     </div>
//                   )}
//                   {companyData.address !== "N/A" && (
//                     <div className="text-xs text-muted-foreground flex items-center gap-1">
//                       Address: {companyData.address}
//                     </div>
//                   )}
//                   {companyData.phone !== "N/A" && (
//                     <div className="text-xs text-muted-foreground flex items-center gap-1">
//                       <Phone className="h-3 w-3" />
//                       Company Phone: {companyData.phone}
//                     </div>
//                   )}
//                 </td>
//               </tr>

//               <tr>
//                 <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                   <User className="h-3 w-3 text-muted-foreground" /> Contact Person
//                 </td>
//                 <td className="p-2 sm:p-3 break-words">
//                   <div>{contactData.name}</div>
//                   {contactData.phone !== "N/A" && (
//                     <div className="text-xs text-muted-foreground mt-1">Direct Phone: {contactData.phone}</div>
//                   )}
//                 </td>
//               </tr>

//               {isComplaint && (
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> Software
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">{item.softwareType || "N/A"}</td>
//                 </tr>
//               )}

//               <tr>
//                 <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                   <FileText className="h-3 w-3 text-muted-foreground" />
//                   {isComplaint ? "Complaint Remarks" : "Work Description"}
//                 </td>
//                 <td className="p-2 sm:p-3 break-words whitespace-pre-wrap">
//                   {isComplaint ? item.complaintRemarks || "No remarks provided" : item.working || "No description provided"}
//                 </td>
//               </tr>

//               {!isComplaint && item.TaskRemarks && (
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <FileText className="h-3 w-3 text-muted-foreground" /> Task Remarks
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">{item.TaskRemarks}</td>
//                 </tr>
//               )}

//               <tr>
//                 <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                   <Zap className="h-3 w-3 text-muted-foreground" /> Priority
//                 </td>
//                 <td className="p-2 sm:p-3 break-words">{getPriorityBadge(item.priority)}</td>
//               </tr>

//               {/* Assignment info, when already assigned */}
//               {item.assignedTo?.name && (
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <UserCheck className="h-3 w-3 text-muted-foreground" /> Assigned To
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     <div>
//                       {item.assignedTo.name}
//                       {item.assignedTo.role?.name ? ` (${item.assignedTo.role.name})` : ""}
//                     </div>
//                     {item.assignedDate && (
//                       <div className="text-xs text-muted-foreground mt-1">
//                         Assigned on {formatDateTime(item.assignedDate)}
//                       </div>
//                     )}
//                     {item.assignmentRemarks && (
//                       <div className="text-xs text-muted-foreground mt-1">Note: {item.assignmentRemarks}</div>
//                     )}
//                   </td>
//                 </tr>
//               )}

//               {/* Rejection info, when rejected */}
//               {isComplaint && item.adminRejectionRemarks && (
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <XCircle className="h-3 w-3 text-destructive" /> Rejection Reason
//                   </td>
//                   <td className="p-2 sm:p-3 break-words text-destructive">{item.adminRejectionRemarks}</td>
//                 </tr>
//               )}

//               {attachments.length > 0 && (
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Paperclip className="h-3 w-3 text-muted-foreground" /> Attachments
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       size="sm"
//                       className="text-xs"
//                       onClick={() => {
//                         if (isComplaint) {
//                           downloadComplaintAttachments(item._id, item.complaintNumber)
//                         } else {
//                           downloadTaskAttachments(item._id)
//                         }
//                       }}
//                       disabled={isComplaint ? isComplaintDownloading : isTaskDownloading}
//                     >
//                       {(isComplaint ? isComplaintDownloading : isTaskDownloading) ? (
//                         <>
//                           <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                           Downloading...
//                         </>
//                       ) : (
//                         <>
//                           <Download className="h-3 w-3 mr-1" />
//                           Download All ({attachments.length})
//                         </>
//                       )}
//                     </Button>
//                   </td>
//                 </tr>
//               )}

//               <tr>
//                 <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                   <Calendar className="h-3 w-3 text-muted-foreground" /> Created At
//                 </td>
//                 <td className="p-2 sm:p-3 break-words">{formatDateTime(item.createdAt)}</td>
//               </tr>

//               {!isComplaint && item.dateTime && (
//                 <tr>
//                   <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
//                     <Calendar className="h-3 w-3 text-muted-foreground" /> Scheduled Date
//                   </td>
//                   <td className="p-2 sm:p-3 break-words">{formatDateTime(item.dateTime)}</td>
//                 </tr>
//               )}

//               <tr>
//                 <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 text-xs sm:text-sm">Status</td>
//                 <td className="p-2 sm:p-3">{getStatusBadge()}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <div className="flex justify-end pt-2">
//           <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm">
//             Close
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building,
  User,
  Phone,
  FileText,
  Calendar,
  ClipboardList,
  Paperclip,
  Download,
  Loader2,
  Zap,
  AlertTriangle,
  MapPin,
  Users,
  UserCheck,
  XCircle,
} from "lucide-react"
import { useFileDownload } from "@/hooks/useFileDownload"
import { useComplaintDownload } from "@/hooks/useComplaintDownload"

interface ViewDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  item: any
  isComplaint?: boolean
}

// Read-only counterpart to AssignmentDialog: shows the complete
// task/complaint details (company, contact, description, priority,
// attachments, assignment/rejection info, status, timestamps) without
// the assignment form, for the Eye/View action in the Pending Items
// table.
export function ViewDetailsDialog({ isOpen, onClose, item, isComplaint = false }: ViewDetailsDialogProps) {
  const { isDownloading: isTaskDownloading, downloadAllAttachments: downloadTaskAttachments } = useFileDownload()
  const { isDownloading: isComplaintDownloading, downloadAllAttachments: downloadComplaintAttachments } =
    useComplaintDownload()

  if (!item) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const company = item.company || {}
  const companyData = {
    name: company.name || company.companyName || "N/A",
    representative: company.companyRepresentative || company.representative || company.contactPerson || "N/A",
    city: company.city || company.location || "N/A",
    phone: company.phone || company.contactPhone || company.phoneNumber || "N/A",
    address: company.address || company.fullAddress || "N/A",
  }

  const contactData = isComplaint
    ? {
        name: item.contactPerson || item.contact?.name || "N/A",
        phone: item.contactPhone || item.contact?.phone || "N/A",
      }
    : {
        name: item.contact?.name || item.contactPerson || "N/A",
        phone: item.contact?.phone || item.contactPhone || "N/A",
      }

  const attachments: any[] = isComplaint
    ? item.attachments || item.complaintAttachments || []
    : item.TasksAttachment || item.attachments || item.Attachments || []

  const getPriorityBadge = (priority?: string) => {
    const prio = priority || "Normal"
    switch (prio) {
      case "Urgent":
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1 w-fit">
            <Zap className="h-3 w-3" /> Urgent
          </Badge>
        )
      case "High":
        return <Badge className="bg-orange-500 text-xs w-fit">High</Badge>
      default:
        return (
          <Badge variant="secondary" className="text-xs w-fit">
            Normal
          </Badge>
        )
    }
  }

  const getStatusBadge = () => {
    const status = (item.status || "pending").toLowerCase()

    if (isComplaint) {
      switch (status) {
        case "registered":
          return (
            <Badge className="bg-purple-600 text-xs flex items-center gap-1 w-fit">
              <AlertTriangle className="h-3 w-3" /> Registered
            </Badge>
          )
        case "in-progress":
        case "inprogress":
          return <Badge className="bg-primary text-xs w-fit">In Progress</Badge>
        case "resolved":
          return <Badge className="bg-green-600 text-xs w-fit">Resolved</Badge>
        case "closed":
          return (
            <Badge variant="outline" className="text-xs w-fit">
              Closed
            </Badge>
          )
        case "rejected":
          return (
            <Badge variant="destructive" className="text-xs w-fit">
              Rejected
            </Badge>
          )
        default:
          return (
            <Badge variant="outline" className="text-xs w-fit">
              {item.status}
            </Badge>
          )
      }
    }

    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs w-fit">
            Pending Approval
          </Badge>
        )
      case "assigned":
        return <Badge className="bg-green-600 text-xs w-fit">✅ Assigned</Badge>
      default:
        return (
          <Badge variant="outline" className="text-xs w-fit">
            {item.status}
          </Badge>
        )
    }
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A"
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isComplaint ? "Complaint Details" : "Task Details"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isComplaint
              ? `Complete details for complaint ${item.complaintNumber || ""}`
              : `Complete details for task ${item.code || ""}`}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border rounded-lg bg-muted/50">
            <thead className="bg-muted">
              <tr>
                <th colSpan={2} className="p-2 sm:p-3 text-left font-semibold text-foreground/80 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
                    {isComplaint ? `Complaint ${item.complaintNumber || ""}` : `Task ${item.code || ""}`}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                  <Building className="h-3 w-3 text-muted-foreground" /> Company
                </td>
                <td className="p-2 sm:p-3 break-words">
                  <div className="font-medium">{companyData.name}</div>
                  {companyData.representative !== "N/A" && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Representative: {companyData.representative}
                    </div>
                  )}
                  {companyData.city !== "N/A" && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location: {companyData.city}
                    </div>
                  )}
                  {companyData.address !== "N/A" && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      Address: {companyData.address}
                    </div>
                  )}
                  {companyData.phone !== "N/A" && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Company Phone: {companyData.phone}
                    </div>
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                  <User className="h-3 w-3 text-muted-foreground" /> Contact Person
                </td>
                <td className="p-2 sm:p-3 break-words">
                  <div>{contactData.name}</div>
                  {contactData.phone !== "N/A" && (
                    <div className="text-xs text-muted-foreground mt-1">Direct Phone: {contactData.phone}</div>
                  )}
                </td>
              </tr>

              {isComplaint && (
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> Software
                  </td>
                  <td className="p-2 sm:p-3 break-words">{item.softwareType || "N/A"}</td>
                </tr>
              )}

              {isComplaint && (
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 text-xs sm:text-sm">Complaint Type</td>
                  <td className="p-2 sm:p-3 break-words">{item.complaintType || "N/A"}</td>
                </tr>
              )}

              <tr>
                <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  {isComplaint ? "Complaint Remarks" : "Work Description"}
                </td>
                <td className="p-2 sm:p-3 break-words whitespace-pre-wrap">
                  {isComplaint ? item.complaintRemarks || "No remarks provided" : item.working || "No description provided"}
                </td>
              </tr>

              {!isComplaint && item.TaskRemarks && (
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> Task Remarks
                  </td>
                  <td className="p-2 sm:p-3 break-words">{item.TaskRemarks}</td>
                </tr>
              )}

              <tr>
                <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                  <Zap className="h-3 w-3 text-muted-foreground" /> Priority
                </td>
                <td className="p-2 sm:p-3 break-words">{getPriorityBadge(item.priority)}</td>
              </tr>

              {/* Assignment info, when already assigned */}
              {item.assignedTo?.name && (
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <UserCheck className="h-3 w-3 text-muted-foreground" /> Assigned To
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    <div>
                      {item.assignedTo.name}
                      {item.assignedTo.role?.name ? ` (${item.assignedTo.role.name})` : ""}
                    </div>
                    {item.assignedDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Assigned on {formatDateTime(item.assignedDate)}
                      </div>
                    )}
                    {item.expectedCompletionAt && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Expected completion: {formatDateTime(item.expectedCompletionAt)}
                      </div>
                    )}
                    {item.assignmentRemarks && (
                      <div className="text-xs text-muted-foreground mt-1">Note: {item.assignmentRemarks}</div>
                    )}
                  </td>
                </tr>
              )}

              {/* Rejection info, when rejected */}
              {isComplaint && item.adminRejectionRemarks && (
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <XCircle className="h-3 w-3 text-destructive" /> Rejection Reason
                  </td>
                  <td className="p-2 sm:p-3 break-words text-destructive">{item.adminRejectionRemarks}</td>
                </tr>
              )}

              {attachments.length > 0 && (
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Paperclip className="h-3 w-3 text-muted-foreground" /> Attachments
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        if (isComplaint) {
                          downloadComplaintAttachments(item._id, item.complaintNumber)
                        } else {
                          downloadTaskAttachments(item._id)
                        }
                      }}
                      disabled={isComplaint ? isComplaintDownloading : isTaskDownloading}
                    >
                      {(isComplaint ? isComplaintDownloading : isTaskDownloading) ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Download All ({attachments.length})
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              )}

              <tr>
                <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" /> Created At
                </td>
                <td className="p-2 sm:p-3 break-words">{formatDateTime(item.createdAt)}</td>
              </tr>

              {!isComplaint && item.dateTime && (
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Scheduled Date
                  </td>
                  <td className="p-2 sm:p-3 break-words">{formatDateTime(item.dateTime)}</td>
                </tr>
              )}

              <tr>
                <td className="p-2 sm:p-3 font-medium w-[110px] sm:w-[130px] shrink-0 text-xs sm:text-sm">Status</td>
                <td className="p-2 sm:p-3">{getStatusBadge()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
