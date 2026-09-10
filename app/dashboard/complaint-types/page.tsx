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
  ClipboardList,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react"

// ======================================================
// Administrator page: Dashboard → Complaint Types
// Lets an Administrator create, edit, activate/deactivate, and delete
// the Complaint Type categories that customers pick from on the
// "Register Online Complaint" form. Mirrors the existing Software
// Types admin page 1:1 in structure and styling so it behaves exactly
// like a page already familiar to the team.
// ======================================================

interface ComplaintType {
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

export default function ComplaintTypesPage() {
  const { user, isLoading: sessionLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([])
  const [counts, setCounts] = useState<Counts>({ total: 0, active: 0, inactive: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>("all")

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [formTarget, setFormTarget] = useState<ComplaintType | null>(null)
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<ComplaintType | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Gate the page for admins who can manage users/complaint types (mirrors
  // the permission granted in components/app-sidebar.tsx).
  useEffect(() => {
    if (sessionLoading) return
    if (!user) return // dashboard/layout.tsx already redirects unauthenticated users
    const canManage =
      user.role?.permissions?.includes("complaint-types.manage") ||
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

  const fetchComplaintTypes = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await fetch("/api/admin/complaint-types", {
        credentials: "include",
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to load complaint types")
      }

      setComplaintTypes(data.complaintTypes || [])
      setCounts(
        data.counts || {
          total: (data.complaintTypes || []).length,
          active: 0,
          inactive: 0,
        },
      )
    } catch (error: any) {
      console.error("Failed to fetch complaint types:", error)
      setLoadError(error.message || "Failed to load complaint types")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionLoading || !user) return
    fetchComplaintTypes()
  }, [sessionLoading, user, fetchComplaintTypes])

  const openCreateForm = () => {
    setFormMode("create")
    setFormTarget(null)
    setFormName("")
    setFormDescription("")
    setFormOpen(true)
  }

  const openEditForm = (complaintType: ComplaintType) => {
    setFormMode("edit")
    setFormTarget(complaintType)
    setFormName(complaintType.name)
    setFormDescription(complaintType.description || "")
    setFormOpen(true)
  }

  const handleFormSubmit = async () => {
    const name = formName.trim()
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a complaint type name.",
        variant: "destructive",
      })
      return
    }

    setFormSubmitting(true)
    try {
      const isEdit = formMode === "edit" && formTarget
      const url = isEdit
        ? `/api/admin/complaint-types/${formTarget!._id}`
        : "/api/admin/complaint-types"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: formDescription.trim() }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to save complaint type")
      }

      toast({
        title: isEdit ? "Complaint type updated" : "Complaint type created",
        description: `"${name}" has been saved successfully.`,
      })
      setFormOpen(false)
      fetchComplaintTypes()
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

  const handleToggleActive = async (complaintType: ComplaintType) => {
    setTogglingId(complaintType._id)
    try {
      const response = await fetch(`/api/admin/complaint-types/${complaintType._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !complaintType.isActive }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status")
      }

      toast({
        title: complaintType.isActive ? "Deactivated" : "Activated",
        description: `"${complaintType.name}" is now ${complaintType.isActive ? "hidden from" : "available in"} all dropdowns.`,
      })
      fetchComplaintTypes()
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
      const response = await fetch(`/api/admin/complaint-types/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete complaint type")
      }

      toast({
        title: "Complaint type deleted",
        description: `"${deleteTarget.name}" has been removed.`,
      })
      setDeleteTarget(null)
      fetchComplaintTypes()
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

  const filteredTypes = complaintTypes.filter((t) => {
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
            <ClipboardList className="h-6 w-6" style={{ color: '#11519B' }} />
            Complaint Types
          </h1>
          <p className="mt-1 text-[#000000]" style={{ opacity: 0.6 }}>
            Manage the complaint category catalog used by the Register Online Complaint form.
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
          <Plus className="h-4 w-4" /> Add Complaint Type
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
              <CardTitle className="text-[#000000]">All Complaint Types</CardTitle>
              <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>
                Only Active types appear in the Complaint Type dropdown on the Register Online Complaint form.
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
              No complaint types found for this filter.
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
                  {filteredTypes.map((complaintType) => (
                    <tr 
                      key={complaintType._id} 
                      className="border-b last:border-0 transition-colors"
                      style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(240, 247, 255, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <td className="py-3 pr-3 font-medium text-[#000000]">{complaintType.name}</td>
                      <td className="py-3 pr-3 hidden md:table-cell max-w-xs truncate text-[#000000]" style={{ opacity: 0.6 }}>
                        {complaintType.description || "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge isActive={complaintType.isActive} />
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(complaintType)}
                            disabled={togglingId === complaintType._id}
                            style={{ 
                              borderColor: 'rgba(17, 81, 155, 0.3)',
                              color: '#11519B'
                            }}
                          >
                            {togglingId === complaintType._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : complaintType.isActive ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditForm(complaintType)}
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
                            onClick={() => setDeleteTarget(complaintType)}
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
              {formMode === "create" ? "Add Complaint Type" : "Edit Complaint Type"}
            </DialogTitle>
            <DialogDescription className="text-[#000000]" style={{ opacity: 0.6 }}>
              {formMode === "create"
                ? "New complaint types are Active by default and will immediately appear in the Complaint Type dropdown."
                : "Changes apply everywhere this complaint type is used."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ctp-name" className="text-[#000000]">Name *</Label>
              <Input
                id="ctp-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Software Issue"
                maxLength={100}
                disabled={formSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctp-description" className="text-[#000000]">Description (optional)</Label>
              <Textarea
                id="ctp-description"
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
              This permanently removes the complaint type. If it's still referenced by any
              existing complaint, deletion will be blocked — deactivate it instead to hide it
              from the dropdown while preserving historical records.
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