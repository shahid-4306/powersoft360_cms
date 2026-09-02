"use client"

import { useState, useEffect } from "react" // Added useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface UserFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userData: {
    username: string
    name: string
    email: string
    password?: string
    roleId: string
  }) => Promise<void>
  isLoading: boolean
  roles: any[]
  initialData?: {
    id: string
    username: string
    name: string
    email: string
    roleId: string
  }
  mode: "create" | "edit"
}

export function UserForm({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isLoading, 
  roles, 
  initialData,
  mode 
}: UserFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    roleId: "",
  })

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          username: initialData.username || "",
          name: initialData.name || "",
          email: initialData.email || "",
          password: "", // Don't prefill password in edit mode
          roleId: initialData.roleId || "",
        })
      } else {
        // Reset form for create mode
        setFormData({
          username: "",
          name: "",
          email: "",
          password: "",
          roleId: "",
        })
      }
    }
  }, [isOpen, initialData, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.username || !formData.name || !formData.email || !formData.roleId) {
      alert("Please fill in all required fields")
      return
    }
    
    if (mode === "create" && !formData.password) {
      alert("Please enter a password for new user")
      return
    }

    await onSubmit(formData)
    
    // Only reset form after successful creation
    if (mode === "create") {
      setFormData({ username: "", name: "", email: "", password: "", roleId: "" })
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new user to the system" : "Update user details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </div>
              ) : (
                mode === "create" ? "Create User" : "Update User"
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