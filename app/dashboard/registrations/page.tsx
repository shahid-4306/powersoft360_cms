// "use client"

// import { useCallback, useEffect, useState } from "react"
// import { useAuth } from "@/contexts/AuthContext"
// import { useRouter } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import {
//   UserPlus,
//   Loader2,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Mail,
//   Phone,
//   Building2,
//   Code2,
//   Eye,
// } from "lucide-react"

// interface Registration {
//   _id: string
//   fullName: string
//   phoneNumber: string
//   email: string
//   companyName: string
//   softwareType: string
//   description?: string
//   profileImage?: string | null
//   status: "pending" | "approved" | "rejected"
//   rejectionReason?: string | null
//   approvedAt?: string | null
//   rejectedAt?: string | null
//   createdAt: string
//   updatedAt: string
// }

// interface Counts {
//   total: number
//   pending: number
//   approved: number
//   rejected: number
// }

// const STATUS_FILTERS = [
//   { key: "all", label: "All" },
//   { key: "pending", label: "Pending" },
//   { key: "approved", label: "Approved" },
//   { key: "rejected", label: "Rejected" },
// ] as const

// type StatusFilter = (typeof STATUS_FILTERS)[number]["key"]

// function StatusBadge({ status }: { status: Registration["status"] }) {
//   if (status === "approved") {
//     return (
//       <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
//         <CheckCircle2 className="h-3 w-3" /> Approved
//       </Badge>
//     )
//   }
//   if (status === "rejected") {
//     return (
//       <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
//         <XCircle className="h-3 w-3" /> Rejected
//       </Badge>
//     )
//   }
//   return (
//     <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
//       <Clock className="h-3 w-3" /> Pending
//     </Badge>
//   )
// }

// export default function RegistrationsPage() {
//   const { user, isLoading: sessionLoading } = useAuth()
//   const router = useRouter()
//   const { toast } = useToast()

//   const [registrations, setRegistrations] = useState<Registration[]>([])
//   const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, approved: 0, rejected: 0 })
//   const [isLoading, setIsLoading] = useState(true)
//   const [loadError, setLoadError] = useState<string | null>(null)
//   const [filter, setFilter] = useState<StatusFilter>("pending")

//   const [viewTarget, setViewTarget] = useState<Registration | null>(null)
//   const [rejectTarget, setRejectTarget] = useState<Registration | null>(null)
//   const [rejectReason, setRejectReason] = useState("")
//   const [actioningId, setActioningId] = useState<string | null>(null)

//   // Gate the page for admins who can manage users/registrations (mirrors
//   // the permission granted in components/app-sidebar.tsx).
//   useEffect(() => {
//     if (sessionLoading) return
//     if (!user) return // dashboard/layout.tsx already redirects unauthenticated users
//     const canManage =
//       user.role?.permissions?.includes("registrations.manage") ||
//       user.role?.permissions?.includes("users.manage")
//     if (!canManage) {
//       toast({
//         title: "Access Denied",
//         description: "You do not have permission to access this page.",
//         variant: "destructive",
//       })
//       router.push("/dashboard")
//     }
//   }, [user, sessionLoading, router, toast])

//   const fetchRegistrations = useCallback(async () => {
//     setIsLoading(true)
//     setLoadError(null)
//     try {
//       const response = await fetch("/api/admin/registrations", {
//         credentials: "include",
//         cache: "no-store",
//       })
//       const data = await response.json().catch(() => ({}))

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to load registrations")
//       }

//       setRegistrations(data.registrations || [])
//       setCounts(
//         data.counts || {
//           total: (data.registrations || []).length,
//           pending: 0,
//           approved: 0,
//           rejected: 0,
//         },
//       )
//     } catch (error: any) {
//       console.error("Failed to fetch registrations:", error)
//       setLoadError(error.message || "Failed to load registrations")
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     if (sessionLoading || !user) return
//     fetchRegistrations()
//   }, [sessionLoading, user, fetchRegistrations])

//   const handleApprove = async (registration: Registration) => {
//     setActioningId(registration._id)
//     try {
//       const response = await fetch(`/api/admin/registrations/${registration._id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ action: "approve" }),
//       })
//       const data = await response.json().catch(() => ({}))

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to approve registration")
//       }

//       toast({
//         title: "Registration Approved",
//         description: `${registration.fullName}'s account is now active${data.emailSent ? " and a confirmation email has been sent." : ", but the confirmation email could not be sent."}`,
//       })

//       await fetchRegistrations()
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to approve registration.",
//         variant: "destructive",
//       })
//     } finally {
//       setActioningId(null)
//     }
//   }

//   const openRejectDialog = (registration: Registration) => {
//     setRejectTarget(registration)
//     setRejectReason("")
//   }

//   const handleReject = async () => {
//     if (!rejectTarget) return
//     setActioningId(rejectTarget._id)
//     try {
//       const response = await fetch(`/api/admin/registrations/${rejectTarget._id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ action: "reject", reason: rejectReason.trim() }),
//       })
//       const data = await response.json().catch(() => ({}))

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to reject registration")
//       }

//       toast({
//         title: "Registration Rejected",
//         description: `${rejectTarget.fullName} has been notified by email.`,
//       })

//       setRejectTarget(null)
//       await fetchRegistrations()
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to reject registration.",
//         variant: "destructive",
//       })
//     } finally {
//       setActioningId(null)
//     }
//   }

//   const filteredRegistrations =
//     filter === "all" ? registrations : registrations.filter((r) => r.status === filter)

//   if (sessionLoading || (isLoading && registrations.length === 0 && !loadError)) {
//     return (
//       <div className="flex items-center justify-center py-24">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
//           <UserPlus className="h-7 w-7 text-primary" />
//           User Registrations
//         </h1>
//         <p className="text-muted-foreground">
//           Review new signups and approve or reject access to the complaint system
//         </p>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           { label: "Total", value: counts.total, color: "text-foreground/80" },
//           { label: "Pending", value: counts.pending, color: "text-amber-600" },
//           { label: "Approved", value: counts.approved, color: "text-emerald-600" },
//           { label: "Rejected", value: counts.rejected, color: "text-red-600" },
//         ].map((stat) => (
//           <Card key={stat.label}>
//             <CardContent className="p-4">
//               <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
//               <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-2">
//         {STATUS_FILTERS.map((f) => (
//           <Button
//             key={f.key}
//             size="sm"
//             variant={filter === f.key ? "default" : "outline"}
//             onClick={() => setFilter(f.key)}
//           >
//             {f.label}
//             {f.key !== "all" && (
//               <span className="ml-1 opacity-70">
//                 ({counts[f.key as keyof Omit<Counts, "total">]})
//               </span>
//             )}
//           </Button>
//         ))}
//       </div>

//       <Card>
//         <CardHeader className="py-4">
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <UserPlus className="h-4 w-4" />
//             Registrations ({filteredRegistrations.length})
//           </CardTitle>
//           <CardDescription className="text-sm">
//             Approve to activate an account and email login instructions, or reject to notify the applicant.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="p-0">
//           {loadError ? (
//             <div className="text-center py-10 text-red-600">
//               <p className="font-medium">{loadError}</p>
//               <Button variant="outline" size="sm" className="mt-3" onClick={fetchRegistrations}>
//                 Try Again
//               </Button>
//             </div>
//           ) : filteredRegistrations.length === 0 ? (
//             <div className="text-center py-10 text-muted-foreground">
//               <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-50" />
//               <p className="text-base font-medium">No registrations found</p>
//               <p className="text-xs">New signups will appear here for review</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-muted/50 border-b">
//                   <tr>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Applicant</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Company</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Software</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {filteredRegistrations.map((reg, index) => (
//                     <tr
//                       key={reg._id}
//                       className={index % 2 === 0 ? "bg-white" : "bg-muted/50 hover:bg-accent/15 transition-colors"}
//                     >
//                       <td className="px-3 py-2">
//                         <div className="flex items-center gap-3">
//                           {reg.profileImage ? (
//                             // eslint-disable-next-line @next/next/no-img-element
//                             <img
//                               src={reg.profileImage}
//                               alt={reg.fullName}
//                               className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//                             />
//                           ) : (
//                             <div className="w-8 h-8 bg-gradient-to-r from-primary to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
//                               <span className="text-white text-xs font-semibold">
//                                 {reg.fullName?.charAt(0)?.toUpperCase() || "?"}
//                               </span>
//                             </div>
//                           )}
//                           <div className="min-w-0">
//                             <p className="font-semibold text-foreground text-sm truncate">{reg.fullName}</p>
//                             <p className="text-xs text-muted-foreground truncate">{reg.email}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-3 py-2 hidden sm:table-cell text-foreground/80">{reg.companyName}</td>
//                       <td className="px-3 py-2 hidden lg:table-cell text-foreground/80">{reg.softwareType}</td>
//                       <td className="px-3 py-2">
//                         <StatusBadge status={reg.status} />
//                       </td>
//                       <td className="px-3 py-2">
//                         <div className="flex items-center gap-1.5 flex-wrap">
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => setViewTarget(reg)}
//                             title="View details"
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           {reg.status === "pending" && (
//                             <>
//                               <Button
//                                 size="sm"
//                                 className="bg-emerald-600 hover:bg-emerald-700"
//                                 disabled={actioningId === reg._id}
//                                 onClick={() => handleApprove(reg)}
//                               >
//                                 {actioningId === reg._id ? (
//                                   <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                                 ) : (
//                                   "Approve"
//                                 )}
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 disabled={actioningId === reg._id}
//                                 onClick={() => openRejectDialog(reg)}
//                               >
//                                 Reject
//                               </Button>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* View details dialog */}
//       <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
//         <DialogContent className="max-w-lg">
//           {viewTarget && (
//             <>
//               <DialogHeader>
//                 <DialogTitle className="flex items-center gap-2">
//                   Registration Details
//                   <StatusBadge status={viewTarget.status} />
//                 </DialogTitle>
//                 <DialogDescription>Submitted {new Date(viewTarget.createdAt).toLocaleString()}</DialogDescription>
//               </DialogHeader>

//               <div className="space-y-3 text-sm">
//                 <div className="flex items-center gap-4">
//                   {viewTarget.profileImage ? (
//                     // eslint-disable-next-line @next/next/no-img-element
//                     <img
//                       src={viewTarget.profileImage}
//                       alt={viewTarget.fullName}
//                       className="w-16 h-16 rounded-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-16 h-16 bg-gradient-to-r from-primary to-cyan-500 rounded-full flex items-center justify-center">
//                       <span className="text-white text-xl font-semibold">
//                         {viewTarget.fullName?.charAt(0)?.toUpperCase() || "?"}
//                       </span>
//                     </div>
//                   )}
//                   <div>
//                     <p className="font-semibold text-foreground">{viewTarget.fullName}</p>
//                     <p className="text-muted-foreground text-xs">{viewTarget.companyName}</p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 border-t pt-3">
//                   <div className="flex items-center gap-2 text-foreground/80">
//                     <Mail className="h-4 w-4 text-muted-foreground/70" /> {viewTarget.email}
//                   </div>
//                   <div className="flex items-center gap-2 text-foreground/80">
//                     <Phone className="h-4 w-4 text-muted-foreground/70" /> {viewTarget.phoneNumber}
//                   </div>
//                   <div className="flex items-center gap-2 text-foreground/80">
//                     <Building2 className="h-4 w-4 text-muted-foreground/70" /> {viewTarget.companyName}
//                   </div>
//                   <div className="flex items-center gap-2 text-foreground/80">
//                     <Code2 className="h-4 w-4 text-muted-foreground/70" /> {viewTarget.softwareType}
//                   </div>
//                 </div>

//                 {viewTarget.description && (
//                   <div className="border-t pt-3">
//                     <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Description</p>
//                     <p className="text-foreground/80 whitespace-pre-wrap">{viewTarget.description}</p>
//                   </div>
//                 )}

//                 {viewTarget.status === "rejected" && viewTarget.rejectionReason && (
//                   <div className="border-t pt-3">
//                     <p className="text-xs font-medium text-red-500 uppercase mb-1">Rejection Reason</p>
//                     <p className="text-red-700">{viewTarget.rejectionReason}</p>
//                   </div>
//                 )}
//               </div>

//               {viewTarget.status === "pending" && (
//                 <DialogFooter>
//                   <Button
//                     variant="destructive"
//                     onClick={() => {
//                       openRejectDialog(viewTarget)
//                       setViewTarget(null)
//                     }}
//                   >
//                     Reject
//                   </Button>
//                   <Button
//                     className="bg-emerald-600 hover:bg-emerald-700"
//                     onClick={() => {
//                       handleApprove(viewTarget)
//                       setViewTarget(null)
//                     }}
//                   >
//                     Approve
//                   </Button>
//                 </DialogFooter>
//               )}
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Reject reason dialog */}
//       <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Reject Registration</DialogTitle>
//             <DialogDescription>
//               {rejectTarget && `${rejectTarget.fullName} will receive an email explaining the decision.`}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-1.5">
//             <Label htmlFor="reject-reason">Reason (optional)</Label>
//             <Textarea
//               id="reject-reason"
//               placeholder="e.g. Unable to verify company details"
//               value={rejectReason}
//               onChange={(e) => setRejectReason(e.target.value)}
//               rows={3}
//             />
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setRejectTarget(null)}>
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               disabled={actioningId === rejectTarget?._id}
//               onClick={handleReject}
//             >
//               {actioningId === rejectTarget?._id ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 "Confirm Rejection"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Code2,
  Eye,
} from "lucide-react"

interface Registration {
  _id: string
  fullName: string
  phoneNumber: string
  email: string
  companyName: string
  softwareType: string
  description?: string
  profileImage?: string | null
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  createdAt: string
  updatedAt: string
}

interface Counts {
  total: number
  pending: number
  approved: number
  rejected: number
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]["key"]

function StatusBadge({ status }: { status: Registration["status"] }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </Badge>
    )
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        <XCircle className="h-3 w-3" /> Rejected
      </Badge>
    )
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
      <Clock className="h-3 w-3" /> Pending
    </Badge>
  )
}

export default function RegistrationsPage() {
  const { user, isLoading: sessionLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>("pending")

  const [viewTarget, setViewTarget] = useState<Registration | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Registration | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [actioningId, setActioningId] = useState<string | null>(null)

  // Gate the page for admins who can manage users/registrations (mirrors
  // the permission granted in components/app-sidebar.tsx).
  useEffect(() => {
    if (sessionLoading) return
    if (!user) return // dashboard/layout.tsx already redirects unauthenticated users
    const canManage =
      user.role?.permissions?.includes("registrations.manage") ||
      user.role?.permissions?.includes("users.manage")
    if (!canManage) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, sessionLoading, router, toast])

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await fetch("/api/admin/registrations", {
        credentials: "include",
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to load registrations")
      }

      setRegistrations(data.registrations || [])
      setCounts(
        data.counts || {
          total: (data.registrations || []).length,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      )
    } catch (error: any) {
      console.error("Failed to fetch registrations:", error)
      setLoadError(error.message || "Failed to load registrations")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionLoading || !user) return
    fetchRegistrations()
  }, [sessionLoading, user, fetchRegistrations])

  const handleApprove = async (registration: Registration) => {
    setActioningId(registration._id)
    try {
      const response = await fetch(`/api/admin/registrations/${registration._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve registration")
      }

      toast({
        title: "Registration Approved",
        description: `${registration.fullName}'s account is now active${data.emailSent ? " and a confirmation email has been sent." : ", but the confirmation email could not be sent."}`,
      })

      await fetchRegistrations()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve registration.",
        variant: "destructive",
      })
    } finally {
      setActioningId(null)
    }
  }

  const openRejectDialog = (registration: Registration) => {
    setRejectTarget(registration)
    setRejectReason("")
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setActioningId(rejectTarget._id)
    try {
      const response = await fetch(`/api/admin/registrations/${rejectTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reject", reason: rejectReason.trim() }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject registration")
      }

      toast({
        title: "Registration Rejected",
        description: `${rejectTarget.fullName} has been notified by email.`,
      })

      setRejectTarget(null)
      await fetchRegistrations()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject registration.",
        variant: "destructive",
      })
    } finally {
      setActioningId(null)
    }
  }

  const filteredRegistrations =
    filter === "all" ? registrations : registrations.filter((r) => r.status === filter)

  if (sessionLoading || (isLoading && registrations.length === 0 && !loadError)) {
    return (
      <div className="flex items-center justify-center py-24 bg-[#FEFFFF]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#11519B' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-[#FEFFFF]">
      <div>
        <h1 
          className="text-3xl font-bold flex items-center gap-2"
          style={{ 
            background: 'linear-gradient(135deg, #11519B, #114A9B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          <UserPlus className="h-7 w-7" style={{ color: '#11519B' }} />
          User Registrations
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>
          Review new signups and approve or reject access to the complaint system
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, color: "#11519B" },
          { label: "Pending", value: counts.pending, color: "#D97706" },
          { label: "Approved", value: counts.approved, color: "#059669" },
          { label: "Rejected", value: counts.rejected, color: "#DC2626" },
        ].map((stat) => (
          <Card 
            key={stat.label}
            className="border-0 shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
            }}
          >
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase text-[#000000]" style={{ opacity: 0.6 }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            onClick={() => setFilter(f.key)}
            style={filter === f.key ? 
              { 
                background: 'linear-gradient(135deg, #11519B, #114A9B)',
                color: '#FEFFFF'
              } : 
              { 
                borderColor: 'rgba(17, 81, 155, 0.3)',
                color: '#11519B'
              }
            }
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1 opacity-70">
                ({counts[f.key as keyof Omit<Counts, "total">]})
              </span>
            )}
          </Button>
        ))}
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
            <UserPlus className="h-4 w-4" style={{ color: '#11519B' }} />
            Registrations ({filteredRegistrations.length})
          </CardTitle>
          <CardDescription className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>
            Approve to activate an account and email login instructions, or reject to notify the applicant.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadError ? (
            <div className="text-center py-10 bg-[#FEFFFF]">
              <p className="font-medium" style={{ color: '#DC2626' }}>{loadError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={fetchRegistrations}
                style={{ 
                  borderColor: 'rgba(17, 81, 155, 0.3)',
                  color: '#11519B'
                }}
              >
                Try Again
              </Button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-10 bg-[#FEFFFF]">
              <UserPlus className="h-10 w-10 mx-auto mb-3" style={{ opacity: 0.5, color: '#11519B' }} />
              <p className="text-base font-medium text-[#000000]" style={{ opacity: 0.6 }}>No registrations found</p>
              <p className="text-xs text-[#000000]" style={{ opacity: 0.5 }}>New signups will appear here for review</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead 
                  className="border-b"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.15), rgba(17, 81, 155, 0.05))'
                  }}
                >
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>Applicant</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell text-[#000000]" style={{ opacity: 0.6 }}>Company</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell text-[#000000]" style={{ opacity: 0.6 }}>Software</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}>
                  {filteredRegistrations.map((reg, index) => (
                    <tr
                      key={reg._id}
                      className="transition-colors"
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#FEFFFF' : 'rgba(240, 247, 255, 0.5)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(240, 247, 255, 0.8)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FEFFFF' : 'rgba(240, 247, 255, 0.5)'
                      }}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          {reg.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={reg.profileImage}
                              alt={reg.fullName}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ 
                                background: 'linear-gradient(135deg, #11519B, #114A9B)'
                              }}
                            >
                              <span className="text-white text-xs font-semibold">
                                {reg.fullName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate text-[#000000]">{reg.fullName}</p>
                            <p className="text-xs truncate text-[#000000]" style={{ opacity: 0.6 }}>{reg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 hidden sm:table-cell text-[#000000]" style={{ opacity: 0.8 }}>{reg.companyName}</td>
                      <td className="px-3 py-2 hidden lg:table-cell text-[#000000]" style={{ opacity: 0.8 }}>{reg.softwareType}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewTarget(reg)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" style={{ color: '#11519B' }} />
                          </Button>
                          {reg.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                style={{ 
                                  background: 'linear-gradient(135deg, #11519B, #114A9B)',
                                  color: '#FEFFFF'
                                }}
                                disabled={actioningId === reg._id}
                                onClick={() => handleApprove(reg)}
                              >
                                {actioningId === reg._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Approve"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actioningId === reg._id}
                                onClick={() => openRejectDialog(reg)}
                                style={{
                                  backgroundColor: '#DC2626'
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View details dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="max-w-lg">
          {viewTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#000000]">
                  Registration Details
                  <StatusBadge status={viewTarget.status} />
                </DialogTitle>
                <DialogDescription className="text-[#000000]" style={{ opacity: 0.6 }}>Submitted {new Date(viewTarget.createdAt).toLocaleString()}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-4">
                  {viewTarget.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={viewTarget.profileImage}
                      alt={viewTarget.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #11519B, #114A9B)'
                      }}
                    >
                      <span className="text-white text-xl font-semibold">
                        {viewTarget.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#000000]">{viewTarget.fullName}</p>
                    <p className="text-xs text-[#000000]" style={{ opacity: 0.6 }}>{viewTarget.companyName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 border-t pt-3" style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}>
                  <div className="flex items-center gap-2 text-[#000000]" style={{ opacity: 0.8 }}>
                    <Mail className="h-4 w-4" style={{ color: '#11519B', opacity: 0.6 }} /> {viewTarget.email}
                  </div>
                  <div className="flex items-center gap-2 text-[#000000]" style={{ opacity: 0.8 }}>
                    <Phone className="h-4 w-4" style={{ color: '#11519B', opacity: 0.6 }} /> {viewTarget.phoneNumber}
                  </div>
                  <div className="flex items-center gap-2 text-[#000000]" style={{ opacity: 0.8 }}>
                    <Building2 className="h-4 w-4" style={{ color: '#11519B', opacity: 0.6 }} /> {viewTarget.companyName}
                  </div>
                  <div className="flex items-center gap-2 text-[#000000]" style={{ opacity: 0.8 }}>
                    <Code2 className="h-4 w-4" style={{ color: '#11519B', opacity: 0.6 }} /> {viewTarget.softwareType}
                  </div>
                </div>

                {viewTarget.description && (
                  <div className="border-t pt-3" style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}>
                    <p className="text-xs font-medium uppercase mb-1 text-[#000000]" style={{ opacity: 0.6 }}>Description</p>
                    <p className="whitespace-pre-wrap text-[#000000]" style={{ opacity: 0.8 }}>{viewTarget.description}</p>
                  </div>
                )}

                {viewTarget.status === "rejected" && viewTarget.rejectionReason && (
                  <div className="border-t pt-3" style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}>
                    <p className="text-xs font-medium uppercase mb-1" style={{ color: '#DC2626' }}>Rejection Reason</p>
                    <p style={{ color: '#DC2626' }}>{viewTarget.rejectionReason}</p>
                  </div>
                )}
              </div>

              {viewTarget.status === "pending" && (
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      openRejectDialog(viewTarget)
                      setViewTarget(null)
                    }}
                    style={{
                      backgroundColor: '#DC2626'
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    style={{ 
                      background: 'linear-gradient(135deg, #11519B, #114A9B)',
                      color: '#FEFFFF'
                    }}
                    onClick={() => {
                      handleApprove(viewTarget)
                      setViewTarget(null)
                    }}
                  >
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject reason dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#000000]">Reject Registration</DialogTitle>
            <DialogDescription className="text-[#000000]" style={{ opacity: 0.6 }}>
              {rejectTarget && `${rejectTarget.fullName} will receive an email explaining the decision.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason" className="text-[#000000]">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Unable to verify company details"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectTarget(null)}
              style={{ 
                borderColor: 'rgba(17, 81, 155, 0.3)',
                color: '#11519B'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actioningId === rejectTarget?._id}
              onClick={handleReject}
              style={{
                backgroundColor: '#DC2626'
              }}
            >
              {actioningId === rejectTarget?._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}