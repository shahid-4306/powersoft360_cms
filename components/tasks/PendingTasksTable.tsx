


// "use client"

// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Building, User, Phone, FileText, Calendar, UserCheck, Clock, AlertCircle, Zap, AlertTriangle, MapPin, Users } from "lucide-react"
// import { useMemo } from "react"

// interface PendingTasksTableProps {
//   tasks: any[]
//   onlineComplaints: any[]
//   onAssignTask: (task: any, isComplaint?: boolean) => void
// }

// export function PendingTasksTable({ tasks, onlineComplaints, onAssignTask }: PendingTasksTableProps) {
//   const getPriorityBadge = (priority: string) => {
//     const prio = priority || "Normal";
//     switch (prio) {
//       case "Urgent":
//         return <Badge variant="destructive" className="text-xs flex items-center gap-1"><Zap className="h-3 w-3" /> Urgent</Badge>
//       case "High":
//         return <Badge className="bg-orange-500 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> High</Badge>
//       default:
//         return <Badge variant="secondary" className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Normal</Badge>
//     }
//   }

//   const getStatusBadge = (item: any, isComplaint: boolean = false) => {
//     const status = item.status || 'pending'
    
//     if (isComplaint) {
//       switch (status.toLowerCase()) {
//         case 'registered':
//           return <Badge className="bg-purple-600 text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Registered</Badge>
//         case 'in-progress':
//         case 'inprogress':
//           return <Badge className="bg-primary text-xs">In Progress</Badge>
//         case 'resolved':
//           return <Badge className="bg-green-600 text-xs">Resolved</Badge>
//         case 'closed':
//           return <Badge variant="outline" className="text-xs">Closed</Badge>
//         default:
//           return <Badge variant="outline" className="text-xs">{status}</Badge>
//       }
//     } else {
//       switch (status.toLowerCase()) {
//         case 'pending':
//           return <Badge className="bg-yellow-600 text-xs">Pending Approval</Badge>
//         case 'assigned':
//           return <Badge className="bg-green-600 text-xs">✅ Assigned</Badge>
//         case 'in progress':
//           return <Badge className="bg-primary text-xs">In Progress</Badge>
//         case 'completed':
//           return <Badge className="bg-green-600 text-xs">Completed</Badge>
//         case 'cancelled':
//           return <Badge variant="destructive" className="text-xs">Cancelled</Badge>
//         default:
//           return <Badge variant="outline" className="text-xs">{status}</Badge>
//       }
//     }
//   }

//   const getTypeBadge = (isComplaint: boolean) => {
//     return isComplaint ? 
//       <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">Complaint</Badge> :
//       <Badge variant="outline" className="bg-accent/30 text-secondary border-primary/40 text-xs">Task</Badge>
//   }

//   // Helper function to get company data consistently
//   const getCompanyData = (item: any) => {
//     const company = item.company || {};
//     return {
//       name: company.name || company.companyName || 'N/A',
//       representative: company.companyRepresentative || company.representative || 'N/A',
//       city: company.city || company.location || 'N/A',
//       phone: company.phone || company.contactPhone || 'N/A'
//     };
//   };

//   // Helper function to get contact data
//   const getContactData = (item: any, isComplaint: boolean) => {
//     if (isComplaint) {
//       return {
//         name: item.contactPerson || item.contact?.name || 'N/A',
//         phone: item.contactPhone || item.contact?.phone || 'N/A'
//       };
//     } else {
//       return {
//         name: item.contact?.name || item.contactPerson || 'N/A',
//         phone: item.contact?.phone || item.contactPhone || 'N/A'
//       };
//     }
//   };

//   // Generate a unique ID for each item
//   const generateUniqueId = (item: any, isComplaint: boolean) => {
//     if (item._id) return `${isComplaint ? 'complaint' : 'task'}-${item._id}`
//     if (isComplaint && item.complaintNumber) return `complaint-${item.complaintNumber}`
//     if (!isComplaint && item.code) return `task-${item.code}`
//     return `${isComplaint ? 'complaint' : 'task'}-${Date.now()}-${Math.random()}`
//   }

//   // Combine and sort all pending items
//   const allPendingItems = useMemo(() => {
//     const combined = [
//       ...tasks.map(task => ({ 
//         ...task, 
//         isComplaint: false,
//         uniqueId: generateUniqueId(task, false)
//       })),
//       ...onlineComplaints.map(complaint => ({ 
//         ...complaint, 
//         isComplaint: true,
//         uniqueId: generateUniqueId(complaint, true)
//       }))
//     ]
    
//     // Sort by creation date, newest first
//     return combined.sort((a, b) => {
//       const dateA = new Date(a.createdAt || 0).getTime()
//       const dateB = new Date(b.createdAt || 0).getTime()
//       return dateB - dateA
//     })
//   }, [tasks, onlineComplaints])

//   if (allPendingItems.length === 0) {
//     return (
//       <Card>
//         <CardHeader className="py-4">
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <UserCheck className="h-4 w-4" />
//             Pending Items for Assignment ({allPendingItems.length})
//           </CardTitle>
//           <CardDescription className="text-sm">
//             Tasks and complaints waiting for assignment & approval
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8 text-muted-foreground">
//             <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
//             <p className="text-base font-medium">No pending items</p>
//             <p className="text-xs">All tasks and complaints have been processed</p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader className="py-4">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <UserCheck className="h-4 w-4" />
//           Pending Items for Assignment ({allPendingItems.length})
//         </CardTitle>
//         <CardDescription className="text-sm">
//           Tasks and complaints waiting for assignment & approval
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="overflow-x-auto max-h-80">
//           <table className="w-full text-sm">
//             <thead className="bg-yellow-50 border-b sticky top-0">
//               <tr>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Type</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Code</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Company Details</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Contact</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase hidden md:table-cell">
//                   Description
//                 </th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase hidden xl:table-cell">
//                   Created At
//                 </th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Status</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Action</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {allPendingItems.map((item) => {
//                 const companyData = getCompanyData(item);
//                 const contactData = getContactData(item, item.isComplaint);
//                 const isComplaint = item.isComplaint;
                
//                 return (
//                   <tr
//                     key={item.uniqueId}
//                     className="hover:bg-yellow-50 transition-colors"
//                   >
//                     <td className="px-3 py-2">
//                       {getTypeBadge(isComplaint)}
//                     </td>
//                     <td className="px-3 py-2">
//                       <Badge variant="outline" className="text-xs font-mono border-yellow-300">
//                         {isComplaint ? 
//                           item.complaintNumber?.split("-")[1] || item.complaintNumber : 
//                           item.code?.split("-")[1] || item.code
//                         }
//                       </Badge>
//                     </td>
//                     <td className="px-3 py-2">
//                       <div className="space-y-1">
//                         <div className="flex items-start gap-1">
//                           <Building className="h-3 w-3 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
//                           <span
//                             className="font-medium text-foreground text-xs truncate max-w-[100px] md:max-w-[150px] lg:max-w-[200px]"
//                             title={companyData.name}
//                           >
//                             {companyData.name}
//                           </span>
//                         </div>
                        
//                         {companyData.representative && companyData.representative !== 'N/A' && (
//                           <div className="flex items-center gap-1">
//                             <Users className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
//                             <span className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[150px]" 
//                                   title={`Rep: ${companyData.representative}`}>
//                               {companyData.representative}
//                             </span>
//                           </div>
//                         )}
                        
//                         {companyData.city && companyData.city !== 'N/A' && (
//                           <div className="flex items-center gap-1">
//                             <MapPin className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
//                             <span className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[150px]" 
//                                   title={`City: ${companyData.city}`}>
//                               {companyData.city}
//                             </span>
//                           </div>
//                         )}
                        
//                         {companyData.phone && companyData.phone !== 'N/A' && (
//                           <div className="flex items-center gap-1">
//                             <Phone className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
//                             <span className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[150px]" 
//                                   title={`Phone: ${companyData.phone}`}>
//                               {companyData.phone}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-3 py-2">
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-1">
//                           <User className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
//                           <span className="text-foreground truncate max-w-[80px] md:max-w-[100px] text-xs" 
//                                 title={contactData.name}>
//                             {contactData.name}
//                           </span>
//                         </div>
                        
//                         {contactData.phone && contactData.phone !== 'N/A' && (
//                           <div className="flex items-center gap-1">
//                             <Phone className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
//                             <span className="text-xs text-muted-foreground truncate max-w-[80px] md:max-w-[100px]" 
//                                   title={`Phone: ${contactData.phone}`}>
//                               {contactData.phone}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-3 py-2 hidden md:table-cell">
//                       <div className="space-y-1">
//                         <span className="text-foreground truncate max-w-[120px] lg:max-w-[150px] block text-xs" 
//                               title={isComplaint ? item.complaintRemarks : item.working}>
//                           {isComplaint ? 
//                             `${item.softwareType ? `${item.softwareType}: ` : ''}${item.complaintRemarks || 'No remarks'}` : 
//                             item.working || 'N/A'
//                           }
//                         </span>
                        
//                         {!isComplaint && item.TaskRemarks && (
//                           <span className="text-xs text-muted-foreground truncate max-w-[120px] lg:max-w-[150px] block" 
//                                 title={`Task Remarks: ${item.TaskRemarks}`}>
//                             Remarks: {item.TaskRemarks}
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-3 py-2 hidden xl:table-cell">
//                       <div className="space-y-1">
//                         <span className="text-foreground text-xs">
//                           {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
//                             day: '2-digit',
//                             month: 'short',
//                             year: 'numeric'
//                           }) : "N/A"}
//                         </span>
//                         {item.createdAt && (
//                           <span className="text-xs text-muted-foreground block">
//                             {new Date(item.createdAt).toLocaleTimeString('en-IN', {
//                               hour: '2-digit',
//                               minute: '2-digit'
//                             })}
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-3 py-2">
//                       {getStatusBadge(item, isComplaint)}
//                     </td>
//                     <td className="px-3 py-2">
//                       <Button
//                         onClick={() => onAssignTask(item, isComplaint)}
//                         size="sm"
//                         className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs px-3 py-1"
//                       >
//                         Assign
//                       </Button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, User, Phone, FileText, Calendar, UserCheck, Clock, AlertCircle, Zap, AlertTriangle, MapPin, Users } from "lucide-react"
import { useMemo } from "react"

interface PendingTasksTableProps {
  tasks: any[]
  onlineComplaints: any[]
  onAssignTask: (task: any, isComplaint?: boolean) => void
  onRejectComplaint?: (complaint: any) => void
}

export function PendingTasksTable({ tasks, onlineComplaints, onAssignTask, onRejectComplaint }: PendingTasksTableProps) {
  const getPriorityBadge = (priority: string) => {
    const prio = priority || "Normal";
    switch (prio) {
      case "Urgent":
        return <Badge variant="destructive" className="text-xs flex items-center gap-1"><Zap className="h-3 w-3" /> Urgent</Badge>
      case "High":
        return <Badge className="bg-orange-500 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> High</Badge>
      default:
        return <Badge variant="secondary" className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Normal</Badge>
    }
  }

  const getStatusBadge = (item: any, isComplaint: boolean = false) => {
    const status = item.status || 'pending'
    
    if (isComplaint) {
      switch (status.toLowerCase()) {
        case 'registered':
          return <Badge className="bg-purple-600 text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Registered</Badge>
        case 'in-progress':
        case 'inprogress':
          return <Badge className="bg-primary text-xs">In Progress</Badge>
        case 'resolved':
          return <Badge className="bg-green-600 text-xs">Resolved</Badge>
        case 'closed':
          return <Badge variant="outline" className="text-xs">Closed</Badge>
        case 'rejected':
          return <Badge variant="destructive" className="text-xs">Rejected</Badge>
        default:
          return <Badge variant="outline" className="text-xs">{status}</Badge>
      }
    } else {
      switch (status.toLowerCase()) {
        case 'pending':
          return <Badge className="bg-yellow-600 text-xs">Pending Approval</Badge>
        case 'assigned':
          return <Badge className="bg-green-600 text-xs">✅ Assigned</Badge>
        case 'in progress':
          return <Badge className="bg-primary text-xs">In Progress</Badge>
        case 'completed':
          return <Badge className="bg-green-600 text-xs">Completed</Badge>
        case 'cancelled':
          return <Badge variant="destructive" className="text-xs">Cancelled</Badge>
        default:
          return <Badge variant="outline" className="text-xs">{status}</Badge>
      }
    }
  }

  const getTypeBadge = (isComplaint: boolean) => {
    return isComplaint ? 
      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">Complaint</Badge> :
      <Badge variant="outline" className="bg-accent/30 text-secondary border-primary/40 text-xs">Task</Badge>
  }

  // Helper function to get company data consistently
  const getCompanyData = (item: any) => {
    const company = item.company || {};
    return {
      name: company.name || company.companyName || 'N/A',
      representative: company.companyRepresentative || company.representative || 'N/A',
      city: company.city || company.location || 'N/A',
      phone: company.phone || company.contactPhone || 'N/A'
    };
  };

  // Helper function to get contact data
  const getContactData = (item: any, isComplaint: boolean) => {
    if (isComplaint) {
      return {
        name: item.contactPerson || item.contact?.name || 'N/A',
        phone: item.contactPhone || item.contact?.phone || 'N/A'
      };
    } else {
      return {
        name: item.contact?.name || item.contactPerson || 'N/A',
        phone: item.contact?.phone || item.contactPhone || 'N/A'
      };
    }
  };

  // Generate a unique ID for each item
  const generateUniqueId = (item: any, isComplaint: boolean) => {
    if (item._id) return `${isComplaint ? 'complaint' : 'task'}-${item._id}`
    if (isComplaint && item.complaintNumber) return `complaint-${item.complaintNumber}`
    if (!isComplaint && item.code) return `task-${item.code}`
    return `${isComplaint ? 'complaint' : 'task'}-${Date.now()}-${Math.random()}`
  }

  // Combine and sort all pending items
  const allPendingItems = useMemo(() => {
    const combined = [
      ...tasks.map(task => ({ 
        ...task, 
        isComplaint: false,
        uniqueId: generateUniqueId(task, false)
      })),
      ...onlineComplaints.map(complaint => ({ 
        ...complaint, 
        isComplaint: true,
        uniqueId: generateUniqueId(complaint, true)
      }))
    ]
    
    // Sort by creation date, newest first
    return combined.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })
  }, [tasks, onlineComplaints])

  if (allPendingItems.length === 0) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-4 w-4" />
            Pending Items for Assignment ({allPendingItems.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Tasks and complaints waiting for assignment & approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium">No pending items</p>
            <p className="text-xs">All tasks and complaints have been processed</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserCheck className="h-4 w-4" />
          Pending Items for Assignment ({allPendingItems.length})
        </CardTitle>
        <CardDescription className="text-sm">
          Tasks and complaints waiting for assignment & approval
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="bg-yellow-50 border-b sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Company Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Contact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase hidden md:table-cell">
                  Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase hidden xl:table-cell">
                  Created At
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {allPendingItems.map((item) => {
                const companyData = getCompanyData(item);
                const contactData = getContactData(item, item.isComplaint);
                const isComplaint = item.isComplaint;
                
                return (
                  <tr
                    key={item.uniqueId}
                    className="hover:bg-yellow-50 transition-colors"
                  >
                    <td className="px-3 py-2">
                      {getTypeBadge(isComplaint)}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-xs font-mono border-yellow-300">
                        {isComplaint ? 
                          item.complaintNumber?.split("-")[1] || item.complaintNumber : 
                          item.code?.split("-")[1] || item.code
                        }
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <div className="flex items-start gap-1">
                          <Building className="h-3 w-3 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
                          <span
                            className="font-medium text-foreground text-xs truncate max-w-[100px] md:max-w-[150px] lg:max-w-[200px]"
                            title={companyData.name}
                          >
                            {companyData.name}
                          </span>
                        </div>
                        
                        {companyData.representative && companyData.representative !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[150px]" 
                                  title={`Rep: ${companyData.representative}`}>
                              {companyData.representative}
                            </span>
                          </div>
                        )}
                        
                        {companyData.city && companyData.city !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[150px]" 
                                  title={`City: ${companyData.city}`}>
                              {companyData.city}
                            </span>
                          </div>
                        )}
                        
                        {companyData.phone && companyData.phone !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[150px]" 
                                  title={`Phone: ${companyData.phone}`}>
                              {companyData.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
                          <span className="text-foreground truncate max-w-[80px] md:max-w-[100px] text-xs" 
                                title={contactData.name}>
                            {contactData.name}
                          </span>
                        </div>
                        
                        {contactData.phone && contactData.phone !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate max-w-[80px] md:max-w-[100px]" 
                                  title={`Phone: ${contactData.phone}`}>
                              {contactData.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <div className="space-y-1">
                        <span className="text-foreground truncate max-w-[120px] lg:max-w-[150px] block text-xs" 
                              title={isComplaint ? item.complaintRemarks : item.working}>
                          {isComplaint ? 
                            `${item.softwareType ? `${item.softwareType}: ` : ''}${item.complaintRemarks || 'No remarks'}` : 
                            item.working || 'N/A'
                          }
                        </span>
                        
                        {!isComplaint && item.TaskRemarks && (
                          <span className="text-xs text-muted-foreground truncate max-w-[120px] lg:max-w-[150px] block" 
                                title={`Task Remarks: ${item.TaskRemarks}`}>
                            Remarks: {item.TaskRemarks}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 hidden xl:table-cell">
                      <div className="space-y-1">
                        <span className="text-foreground text-xs">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : "N/A"}
                        </span>
                        {item.createdAt && (
                          <span className="text-xs text-muted-foreground block">
                            {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {getStatusBadge(item, isComplaint)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => onAssignTask(item, isComplaint)}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs px-3 py-1"
                        >
                          Assign
                        </Button>
                        {isComplaint && onRejectComplaint && (
                          <Button
                            onClick={() => onRejectComplaint(item)}
                            size="sm"
                            variant="destructive"
                            className="text-xs px-3 py-1"
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}