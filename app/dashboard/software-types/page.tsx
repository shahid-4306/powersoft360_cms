// "use client"

// import { useCallback, useEffect, useState } from "react"
// import { useAuth } from "@/contexts/AuthContext"
// import { useRouter } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import {
//   Package,
//   Loader2,
//   Plus,
//   Pencil,
//   Trash2,
//   CheckCircle2,
//   XCircle,
//   Layers,
// } from "lucide-react"

// interface SoftwareType {
//   _id: string
//   name: string
//   description?: string
//   isActive: boolean
//   sortOrder: number
//   createdAt: string
//   updatedAt: string
// }

// interface Counts {
//   total: number
//   active: number
//   inactive: number
// }

// type FilterKey = "all" | "active" | "inactive"

// const FILTERS: { key: FilterKey; label: string }[] = [
//   { key: "all", label: "All" },
//   { key: "active", label: "Active" },
//   { key: "inactive", label: "Inactive" },
// ]

// function StatusBadge({ isActive }: { isActive: boolean }) {
//   return isActive ? (
//     <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
//       <CheckCircle2 className="h-3 w-3" /> Active
//     </Badge>
//   ) : (
//     <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">
//       <XCircle className="h-3 w-3" /> Inactive
//     </Badge>
//   )
// }

// export default function SoftwareTypesPage() {
//   const { user, isLoading: sessionLoading } = useAuth()
//   const router = useRouter()
//   const { toast } = useToast()

//   const [softwareTypes, setSoftwareTypes] = useState<SoftwareType[]>([])
//   const [counts, setCounts] = useState<Counts>({ total: 0, active: 0, inactive: 0 })
//   const [isLoading, setIsLoading] = useState(true)
//   const [loadError, setLoadError] = useState<string | null>(null)
//   const [filter, setFilter] = useState<FilterKey>("all")

//   const [formOpen, setFormOpen] = useState(false)
//   const [formMode, setFormMode] = useState<"create" | "edit">("create")
//   const [formTarget, setFormTarget] = useState<SoftwareType | null>(null)
//   const [formName, setFormName] = useState("")
//   const [formDescription, setFormDescription] = useState("")
//   const [formSubmitting, setFormSubmitting] = useState(false)

//   const [deleteTarget, setDeleteTarget] = useState<SoftwareType | null>(null)
//   const [deleting, setDeleting] = useState(false)
//   const [togglingId, setTogglingId] = useState<string | null>(null)

//   // Gate the page for admins who can manage users/software types (mirrors
//   // the permission granted in components/app-sidebar.tsx).
//   useEffect(() => {
//     if (sessionLoading) return
//     if (!user) return // dashboard/layout.tsx already redirects unauthenticated users
//     const canManage =
//       user.role?.permissions?.includes("software-types.manage") ||
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

//   const fetchSoftwareTypes = useCallback(async () => {
//     setIsLoading(true)
//     setLoadError(null)
//     try {
//       const response = await fetch("/api/admin/software-types", {
//         credentials: "include",
//         cache: "no-store",
//       })
//       const data = await response.json().catch(() => ({}))

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to load software types")
//       }

//       setSoftwareTypes(data.softwareTypes || [])
//       setCounts(
//         data.counts || {
//           total: (data.softwareTypes || []).length,
//           active: 0,
//           inactive: 0,
//         },
//       )
//     } catch (error: any) {
//       console.error("Failed to fetch software types:", error)
//       setLoadError(error.message || "Failed to load software types")
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     if (sessionLoading || !user) return
//     fetchSoftwareTypes()
//   }, [sessionLoading, user, fetchSoftwareTypes])

//   const openCreateForm = () => {
//     setFormMode("create")
//     setFormTarget(null)
//     setFormName("")
//     setFormDescription("")
//     setFormOpen(true)
//   }

//   const openEditForm = (softwareType: SoftwareType) => {
//     setFormMode("edit")
//     setFormTarget(softwareType)
//     setFormName(softwareType.name)
//     setFormDescription(softwareType.description || "")
//     setFormOpen(true)
//   }

//   const handleFormSubmit = async () => {
//     const name = formName.trim()
//     if (!name) {
//       toast({
//         title: "Name required",
//         description: "Please enter a software type name.",
//         variant: "destructive",
//       })
//       return
//     }

//     setFormSubmitting(true)
//     try {
//       const isEdit = formMode === "edit" && formTarget
//       const url = isEdit
//         ? `/api/admin/software-types/${formTarget!._id}`
//         : "/api/admin/software-types"
//       const method = isEdit ? "PUT" : "POST"

//       const response = await fetch(url, {
//         method,
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, description: formDescription.trim() }),
//       })
//       const data = await response.json().catch(() => ({}))

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to save software type")
//       }

//       toast({
//         title: isEdit ? "Software type updated" : "Software type created",
//         description: `"${name}" has been saved successfully.`,
//       })
//       setFormOpen(false)
//       fetchSoftwareTypes()
//     } catch (error: any) {
//       toast({
//         title: "Save failed",
//         description: error.message || "Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setFormSubmitting(false)
//     }
//   }

//   const handleToggleActive = async (softwareType: SoftwareType) => {
//     setTogglingId(softwareType._id)
//     try {
//       const response = await fetch(`/api/admin/software-types/${softwareType._id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isActive: !softwareType.isActive }),
//       })
//       const data = await response.json().catch(() => ({}))

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to update status")
//       }

//       toast({
//         title: softwareType.isActive ? "Deactivated" : "Activated",
//         description: `"${softwareType.name}" is now ${softwareType.isActive ? "hidden from" : "available in"} all dropdowns.`,
//       })
//       fetchSoftwareTypes()
//     } catch (error: any) {
//       toast({
//         title: "Update failed",
//         description: error.message || "Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setTogglingId(null)
//     }
//   }

//   const handleDelete = async () => {
//     if (!deleteTarget) return
//     setDeleting(true)
//     try {
//       const response = await fetch(`/api/admin/software-types/${deleteTarget._id}`, {
//         method: "DELETE",
//         credentials: "include",
//       })
//       const data = await response.json().catch(() => ({}))

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to delete software type")
//       }

//       toast({
//         title: "Software type deleted",
//         description: `"${deleteTarget.name}" has been removed.`,
//       })
//       setDeleteTarget(null)
//       fetchSoftwareTypes()
//     } catch (error: any) {
//       toast({
//         title: "Cannot delete",
//         description: error.message || "Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setDeleting(false)
//     }
//   }

//   const filteredTypes = softwareTypes.filter((t) => {
//     if (filter === "active") return t.isActive
//     if (filter === "inactive") return !t.isActive
//     return true
//   })

//   if (sessionLoading || !user) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 p-4 sm:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
//             <Package className="h-6 w-6 text-fuchsia-600" />
//             Software Types
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Manage the software product catalog used across registration, complaints, companies, and tasks.
//           </p>
//         </div>
//         <Button onClick={openCreateForm} className="gap-2">
//           <Plus className="h-4 w-4" /> Add Software Type
//         </Button>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">Total</p>
//               <p className="text-2xl font-bold text-foreground">{counts.total}</p>
//             </div>
//             <Layers className="h-8 w-8 text-muted-foreground/50" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">Active</p>
//               <p className="text-2xl font-bold text-emerald-600">{counts.active}</p>
//             </div>
//             <CheckCircle2 className="h-8 w-8 text-emerald-200" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">Inactive</p>
//               <p className="text-2xl font-bold text-muted-foreground">{counts.inactive}</p>
//             </div>
//             <XCircle className="h-8 w-8 text-gray-200" />
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex flex-wrap items-center justify-between gap-3">
//             <div>
//               <CardTitle>All Software Types</CardTitle>
//               <CardDescription>
//                 Only Active types appear in registration, complaint, and company dropdowns.
//               </CardDescription>
//             </div>
//             <div className="flex gap-2">
//               {FILTERS.map((f) => (
//                 <Button
//                   key={f.key}
//                   size="sm"
//                   variant={filter === f.key ? "default" : "outline"}
//                   onClick={() => setFilter(f.key)}
//                 >
//                   {f.label}
//                 </Button>
//               ))}
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="flex items-center justify-center py-16">
//               <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//           ) : loadError ? (
//             <div className="text-center py-16 text-red-600">{loadError}</div>
//           ) : filteredTypes.length === 0 ? (
//             <div className="text-center py-16 text-muted-foreground">
//               No software types found for this filter.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-muted-foreground border-b">
//                     <th className="py-2 pr-3 font-medium">Name</th>
//                     <th className="py-2 pr-3 font-medium hidden md:table-cell">Description</th>
//                     <th className="py-2 pr-3 font-medium">Status</th>
//                     <th className="py-2 pr-3 font-medium text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredTypes.map((softwareType) => (
//                     <tr key={softwareType._id} className="border-b last:border-0 hover:bg-muted/50">
//                       <td className="py-3 pr-3 font-medium text-foreground">{softwareType.name}</td>
//                       <td className="py-3 pr-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">
//                         {softwareType.description || "—"}
//                       </td>
//                       <td className="py-3 pr-3">
//                         <StatusBadge isActive={softwareType.isActive} />
//                       </td>
//                       <td className="py-3 pr-3">
//                         <div className="flex items-center justify-end gap-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => handleToggleActive(softwareType)}
//                             disabled={togglingId === softwareType._id}
//                           >
//                             {togglingId === softwareType._id ? (
//                               <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                             ) : softwareType.isActive ? (
//                               "Deactivate"
//                             ) : (
//                               "Activate"
//                             )}
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => openEditForm(softwareType)}
//                           >
//                             <Pencil className="h-3.5 w-3.5" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="text-red-600 hover:bg-red-50 hover:text-red-700"
//                             onClick={() => setDeleteTarget(softwareType)}
//                           >
//                             <Trash2 className="h-3.5 w-3.5" />
//                           </Button>
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

//       {/* Create / Edit Dialog */}
//       <Dialog open={formOpen} onOpenChange={setFormOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {formMode === "create" ? "Add Software Type" : "Edit Software Type"}
//             </DialogTitle>
//             <DialogDescription>
//               {formMode === "create"
//                 ? "New software types are Active by default and will immediately appear in every dropdown."
//                 : "Changes apply everywhere this software type is used."}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-2">
//             <div className="space-y-1.5">
//               <Label htmlFor="swt-name">Name *</Label>
//               <Input
//                 id="swt-name"
//                 value={formName}
//                 onChange={(e) => setFormName(e.target.value)}
//                 placeholder="e.g., Power Accounting"
//                 maxLength={100}
//                 disabled={formSubmitting}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <Label htmlFor="swt-description">Description (optional)</Label>
//               <Textarea
//                 id="swt-description"
//                 value={formDescription}
//                 onChange={(e) => setFormDescription(e.target.value)}
//                 placeholder="Brief description shown to admins only"
//                 maxLength={500}
//                 disabled={formSubmitting}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setFormOpen(false)} disabled={formSubmitting}>
//               Cancel
//             </Button>
//             <Button onClick={handleFormSubmit} disabled={formSubmitting}>
//               {formSubmitting ? (
//                 <span className="flex items-center gap-2">
//                   <Loader2 className="h-4 w-4 animate-spin" /> Saving...
//                 </span>
//               ) : formMode === "create" ? (
//                 "Create"
//               ) : (
//                 "Save Changes"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This permanently removes the software type. If it's still referenced by any
//               company, task, complaint, or registration, deletion will be blocked — deactivate
//               it instead to hide it from dropdowns while preserving historical records.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               disabled={deleting}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {deleting ? (
//                 <span className="flex items-center gap-2">
//                   <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
//                 </span>
//               ) : (
//                 "Delete"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Package,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react"

interface SoftwareType {
  _id: string
  name: string
  description?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface Counts {
  total: number
  active: number
  inactive: number
}

type FilterKey = "all" | "active" | "inactive"

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
]

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
      <CheckCircle2 className="h-3 w-3" /> Active
    </Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">
      <XCircle className="h-3 w-3" /> Inactive
    </Badge>
  )
}

export default function SoftwareTypesPage() {
  const { user, isLoading: sessionLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [softwareTypes, setSoftwareTypes] = useState<SoftwareType[]>([])
  const [counts, setCounts] = useState<Counts>({ total: 0, active: 0, inactive: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>("all")

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [formTarget, setFormTarget] = useState<SoftwareType | null>(null)
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<SoftwareType | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Gate the page for admins who can manage users/software types (mirrors
  // the permission granted in components/app-sidebar.tsx).
  useEffect(() => {
    if (sessionLoading) return
    if (!user) return // dashboard/layout.tsx already redirects unauthenticated users
    const canManage =
      user.role?.permissions?.includes("software-types.manage") ||
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

  const fetchSoftwareTypes = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await fetch("/api/admin/software-types", {
        credentials: "include",
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to load software types")
      }

      setSoftwareTypes(data.softwareTypes || [])
      setCounts(
        data.counts || {
          total: (data.softwareTypes || []).length,
          active: 0,
          inactive: 0,
        },
      )
    } catch (error: any) {
      console.error("Failed to fetch software types:", error)
      setLoadError(error.message || "Failed to load software types")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionLoading || !user) return
    fetchSoftwareTypes()
  }, [sessionLoading, user, fetchSoftwareTypes])

  const openCreateForm = () => {
    setFormMode("create")
    setFormTarget(null)
    setFormName("")
    setFormDescription("")
    setFormOpen(true)
  }

  const openEditForm = (softwareType: SoftwareType) => {
    setFormMode("edit")
    setFormTarget(softwareType)
    setFormName(softwareType.name)
    setFormDescription(softwareType.description || "")
    setFormOpen(true)
  }

  const handleFormSubmit = async () => {
    const name = formName.trim()
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a software type name.",
        variant: "destructive",
      })
      return
    }

    setFormSubmitting(true)
    try {
      const isEdit = formMode === "edit" && formTarget
      const url = isEdit
        ? `/api/admin/software-types/${formTarget!._id}`
        : "/api/admin/software-types"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: formDescription.trim() }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to save software type")
      }

      toast({
        title: isEdit ? "Software type updated" : "Software type created",
        description: `"${name}" has been saved successfully.`,
      })
      setFormOpen(false)
      fetchSoftwareTypes()
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleToggleActive = async (softwareType: SoftwareType) => {
    setTogglingId(softwareType._id)
    try {
      const response = await fetch(`/api/admin/software-types/${softwareType._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !softwareType.isActive }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status")
      }

      toast({
        title: softwareType.isActive ? "Deactivated" : "Activated",
        description: `"${softwareType.name}" is now ${softwareType.isActive ? "hidden from" : "available in"} all dropdowns.`,
      })
      fetchSoftwareTypes()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/software-types/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete software type")
      }

      toast({
        title: "Software type deleted",
        description: `"${deleteTarget.name}" has been removed.`,
      })
      setDeleteTarget(null)
      fetchSoftwareTypes()
    } catch (error: any) {
      toast({
        title: "Cannot delete",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredTypes = softwareTypes.filter((t) => {
    if (filter === "active") return t.isActive
    if (filter === "inactive") return !t.isActive
    return true
  })

  if (sessionLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#FEFFFF]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#11519B' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-[#FEFFFF]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#000000]">
            <Package className="h-6 w-6" style={{ color: '#11519B' }} />
            Software Types
          </h1>
          <p className="mt-1 text-[#000000]" style={{ opacity: 0.6 }}>
            Manage the software product catalog used across registration, complaints, companies, and tasks.
          </p>
        </div>
        <Button 
          onClick={openCreateForm} 
          className="gap-2"
          style={{ 
            background: 'linear-gradient(135deg, #11519B, #114A9B)',
            color: '#FEFFFF'
          }}
        >
          <Plus className="h-4 w-4" /> Add Software Type
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="border-0 shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Total</p>
              <p className="text-2xl font-bold" style={{ color: '#11519B' }}>{counts.total}</p>
            </div>
            <Layers className="h-8 w-8" style={{ color: '#11519B', opacity: 0.3 }} />
          </CardContent>
        </Card>
        <Card 
          className="border-0 shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Active</p>
              <p className="text-2xl font-bold" style={{ color: '#059669' }}>{counts.active}</p>
            </div>
            <CheckCircle2 className="h-8 w-8" style={{ color: '#059669', opacity: 0.3 }} />
          </CardContent>
        </Card>
        <Card 
          className="border-0 shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Inactive</p>
              <p className="text-2xl font-bold text-[#000000]" style={{ opacity: 0.5 }}>{counts.inactive}</p>
            </div>
            <XCircle className="h-8 w-8" style={{ color: '#000000', opacity: 0.15 }} />
          </CardContent>
        </Card>
      </div>

      <Card 
        className="border-0 shadow-xl"
        style={{ 
          background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
        }}
      >
        <CardHeader 
          className="border-0 pb-3"
          style={{ 
            background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.2), rgba(17, 81, 155, 0.1))',
            borderBottomColor: 'rgba(158, 195, 249, 0.3)'
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <div>
              <CardTitle className="text-[#000000]">All Software Types</CardTitle>
              <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>
                Only Active types appear in registration, complaint, and company dropdowns.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
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
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#11519B' }} />
            </div>
          ) : loadError ? (
            <div className="text-center py-16" style={{ color: '#DC2626' }}>{loadError}</div>
          ) : filteredTypes.length === 0 ? (
            <div className="text-center py-16 text-[#000000]" style={{ opacity: 0.6 }}>
              No software types found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr 
                    className="text-left border-b"
                    style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}
                  >
                    <th className="py-2 pr-3 font-medium text-[#000000]" style={{ opacity: 0.6 }}>Name</th>
                    <th className="py-2 pr-3 font-medium hidden md:table-cell text-[#000000]" style={{ opacity: 0.6 }}>Description</th>
                    <th className="py-2 pr-3 font-medium text-[#000000]" style={{ opacity: 0.6 }}>Status</th>
                    <th className="py-2 pr-3 font-medium text-right text-[#000000]" style={{ opacity: 0.6 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTypes.map((softwareType) => (
                    <tr 
                      key={softwareType._id} 
                      className="border-b last:border-0 transition-colors"
                      style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(240, 247, 255, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <td className="py-3 pr-3 font-medium text-[#000000]">{softwareType.name}</td>
                      <td className="py-3 pr-3 hidden md:table-cell max-w-xs truncate text-[#000000]" style={{ opacity: 0.6 }}>
                        {softwareType.description || "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge isActive={softwareType.isActive} />
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(softwareType)}
                            disabled={togglingId === softwareType._id}
                            style={{ 
                              borderColor: 'rgba(17, 81, 155, 0.3)',
                              color: '#11519B'
                            }}
                          >
                            {togglingId === softwareType._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : softwareType.isActive ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditForm(softwareType)}
                            style={{ 
                              borderColor: 'rgba(17, 81, 155, 0.3)',
                              color: '#11519B'
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteTarget(softwareType)}
                            style={{ 
                              borderColor: 'rgba(220, 38, 38, 0.3)',
                              color: '#DC2626'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#000000]">
              {formMode === "create" ? "Add Software Type" : "Edit Software Type"}
            </DialogTitle>
            <DialogDescription className="text-[#000000]" style={{ opacity: 0.6 }}>
              {formMode === "create"
                ? "New software types are Active by default and will immediately appear in every dropdown."
                : "Changes apply everywhere this software type is used."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="swt-name" className="text-[#000000]">Name *</Label>
              <Input
                id="swt-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Power Accounting"
                maxLength={100}
                disabled={formSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="swt-description" className="text-[#000000]">Description (optional)</Label>
              <Textarea
                id="swt-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description shown to admins only"
                maxLength={500}
                disabled={formSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setFormOpen(false)} 
              disabled={formSubmitting}
              style={{ 
                borderColor: 'rgba(17, 81, 155, 0.3)',
                color: '#11519B'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFormSubmit} 
              disabled={formSubmitting}
              style={{ 
                background: 'linear-gradient(135deg, #11519B, #114A9B)',
                color: '#FEFFFF'
              }}
            >
              {formSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </span>
              ) : formMode === "create" ? (
                "Create"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#000000]">Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#000000]" style={{ opacity: 0.6 }}>
              This permanently removes the software type. If it's still referenced by any
              company, task, complaint, or registration, deletion will be blocked — deactivate
              it instead to hide it from dropdowns while preserving historical records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleting}
              style={{ 
                borderColor: 'rgba(17, 81, 155, 0.3)',
                color: '#11519B'
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              style={{
                backgroundColor: '#DC2626'
              }}
              className="hover:bg-red-700"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}