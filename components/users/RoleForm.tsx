"use client"

import { useState, useEffect } from "react" // Added useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface RoleFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (roleData: { name: string; permissions: string[] }) => Promise<void>
  isLoading: boolean
  availablePermissions: string[]
  initialData?: {
    id: string
    name: string
    permissions: string[]
  }
  mode: "create" | "edit"
}

export function RoleForm({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isLoading, 
  availablePermissions, 
  initialData,
  mode 
}: RoleFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  })

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          permissions: initialData.permissions || [],
        })
      } else {
        // Reset form for create mode
        setFormData({
          name: "",
          permissions: [],
        })
      }
    }
  }, [isOpen, initialData, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || formData.permissions.length === 0) {
      alert("Please provide role name and select at least one permission")
      return
    }

    await onSubmit(formData)
    
    // Only reset form after successful creation
    if (mode === "create") {
      setFormData({ name: "", permissions: [] })
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
  }

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Role" : "Edit Role"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Define a new role with specific permissions" : "Update the role's name and permissions"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name *</Label>
            <Input
              id="roleName"
              placeholder="Enter role name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Permissions *</Label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="rounded"
                  />
                  <label htmlFor={permission} className="text-sm">
                    {permission}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading || formData.permissions.length === 0}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </div>
              ) : (
                mode === "create" ? "Create Role" : "Update Role"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}