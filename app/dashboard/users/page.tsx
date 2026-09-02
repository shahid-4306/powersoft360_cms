"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useUsers } from "@/hooks/useUsers"
import { useRoles } from "@/hooks/useRoles"
import { useUserSession } from "@/hooks/useUserSession"
import { UserForm } from "@/components/users/UserForm"
import { RoleForm } from "@/components/users/RoleForm"
import { UsersTable } from "@/components/users/UsersTable"
import { RolesGrid } from "@/components/users/RolesGrid"
import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"
import { PageHeader } from "@/components/users/PageHeader"
import { Loader2 } from "lucide-react"

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Custom hooks for data management
  const { user, isLoading: sessionLoading } = useUserSession("users.manage")
  const { users, isLoading: usersLoading, createUser, updateUser, deleteUser } = useUsers()
  const { roles, isLoading: rolesLoading, availablePermissions, createRole, updateRole, deleteRole } = useRoles()

  // Dialog states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false)
  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false)

  // Loading states
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isCreatingRole, setIsCreatingRole] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  const [isDeletingRole, setIsDeletingRole] = useState(false)

  // Selected items for operations - reset when dialogs close
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  // Reset selected items when dialogs close
  useEffect(() => {
    if (!isEditUserOpen) {
      setSelectedUser(null)
    }
  }, [isEditUserOpen])

  useEffect(() => {
    if (!isEditRoleOpen) {
      setSelectedRole(null)
    }
  }, [isEditRoleOpen])

  useEffect(() => {
    if (!isDeleteUserOpen) {
      setSelectedUser(null)
    }
  }, [isDeleteUserOpen])

  useEffect(() => {
    if (!isDeleteRoleOpen) {
      setSelectedRole(null)
    }
  }, [isDeleteRoleOpen])

  // User operations
  const handleCreateUser = async (userData: any) => {
    setIsCreatingUser(true)
    try {
      await createUser(userData)
      toast({
        title: "User Created",
        description: `User ${userData.name} has been created successfully.`,
      })
      setIsCreateUserOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return
    
    setIsEditingUser(true)
    try {
      const updatedUser = await updateUser(selectedUser._id, userData)

      // Update current user session if editing own profile
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
      if (currentUser.id === updatedUser._id) {
        localStorage.setItem("user", JSON.stringify({
          ...currentUser,
          role: updatedUser.role
        }))
      }

      toast({
        title: "User Updated",
        description: `User ${userData.name} has been updated successfully.`,
      })
      setIsEditUserOpen(false)
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditingUser(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    // Prevent user from deleting themselves
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
    if (currentUser.id === selectedUser._id) {
      toast({
        title: "Cannot Delete User",
        description: "You cannot delete your own account.",
        variant: "destructive",
      })
      setIsDeleteUserOpen(false)
      return
    }

    setIsDeletingUser(true)
    try {
      await deleteUser(selectedUser._id)
      toast({
        title: "User Deleted",
        description: `User ${selectedUser.name} has been deleted successfully.`,
      })
      setIsDeleteUserOpen(false)
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingUser(false)
    }
  }

  // Role operations
  const handleCreateRole = async (roleData: any) => {
    setIsCreatingRole(true)
    try {
      await createRole(roleData)
      toast({
        title: "Role Created",
        description: `Role ${roleData.name} has been created successfully.`,
      })
      setIsCreateRoleOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingRole(false)
    }
  }

  const handleEditRole = async (roleData: any) => {
    if (!selectedRole) return
    
    setIsEditingRole(true)
    try {
      await updateRole(selectedRole._id, roleData)
      toast({
        title: "Role Updated",
        description: `Role ${roleData.name} has been updated successfully.`,
      })
      setIsEditRoleOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditingRole(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return
    
    setIsDeletingRole(true)
    try {
      await deleteRole(selectedRole._id)
      toast({
        title: "Role Deleted",
        description: `Role ${selectedRole.name} has been deleted successfully.`,
      })
      setIsDeleteRoleOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingRole(false)
    }
  }

  // Helper functions - properly set selected items
  const openEditUser = (user: any) => {
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }

  const openDeleteUser = (user: any) => {
    setSelectedUser(user)
    setIsDeleteUserOpen(true)
  }

  const openEditRole = (role: any) => {
    setSelectedRole(role)
    setIsEditRoleOpen(true)
  }

  const openDeleteRole = (role: any) => {
    setSelectedRole(role)
    setIsDeleteRoleOpen(true)
  }

  const isLoading = sessionLoading || usersLoading || rolesLoading

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading users and roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <PageHeader 
        onCreateUser={() => setIsCreateUserOpen(true)}
        onCreateRole={() => setIsCreateRoleOpen(true)}
      />

      {/* User Creation Form */}
      <UserForm
        isOpen={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
        onSubmit={handleCreateUser}
        isLoading={isCreatingUser}
        roles={roles}
        mode="create"
      />

      {/* User Edit Form */}
      <UserForm
        key={`edit-user-${selectedUser?._id || 'new'}`} // Force re-render when selected user changes
        isOpen={isEditUserOpen}
        onOpenChange={setIsEditUserOpen}
        onSubmit={handleEditUser}
        isLoading={isEditingUser}
        roles={roles}
        initialData={selectedUser}
        mode="edit"
      />

      {/* Role Creation Form */}
      <RoleForm
        isOpen={isCreateRoleOpen}
        onOpenChange={setIsCreateRoleOpen}
        onSubmit={handleCreateRole}
        isLoading={isCreatingRole}
        availablePermissions={availablePermissions}
        mode="create"
      />

      {/* Role Edit Form */}
      <RoleForm
        key={`edit-role-${selectedRole?._id || 'new'}`} // Force re-render when selected role changes
        isOpen={isEditRoleOpen}
        onOpenChange={setIsEditRoleOpen}
        onSubmit={handleEditRole}
        isLoading={isEditingRole}
        availablePermissions={availablePermissions}
        initialData={selectedRole}
        mode="edit"
      />

      {/* User Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteUserOpen}
        onOpenChange={setIsDeleteUserOpen}
        onConfirm={handleDeleteUser}
        isLoading={isDeletingUser}
        title="Confirm Delete"
        description={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`}
        type="user"
      />

      {/* Role Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteRoleOpen}
        onOpenChange={setIsDeleteRoleOpen}
        onConfirm={handleDeleteRole}
        isLoading={isDeletingRole}
        title="Confirm Delete"
        description={`Are you sure you want to delete role "${selectedRole?.name}"? This action cannot be undone.`}
        type="role"
      />

      {/* Roles Section */}
      <RolesGrid 
        roles={roles} 
        onEdit={openEditRole}
        onDelete={openDeleteRole}
      />

      {/* Users Section */}
      <UsersTable 
        users={users} 
        onEdit={openEditUser}
        onDelete={openDeleteUser}
      />
    </div>
  )
}