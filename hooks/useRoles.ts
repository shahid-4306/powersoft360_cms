import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface Role {
  _id: string
  name: string
  permissions: string[]
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const availablePermissions = [
    "dashboard",
    "tasks.create",
    "tasks.assign",
    "tasks.complete",
    "tasks.manage",
    "tasks.developer_working",
    "tasks.unpost",
    "users.manage",
    "reports.view",
    "company_information.manage",
    "projects.manage",
    "projects.view"
  ]

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/roles")
      if (!response.ok) throw new Error("Failed to fetch roles")
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const createRole = async (roleData: { name: string; permissions: string[] }) => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create role")
      }

      const newRole = await response.json()
      setRoles(prev => [...prev, newRole])
      return newRole
    } catch (error: any) {
      throw new Error(error.message || "Failed to create role")
    }
  }

  const updateRole = async (id: string, roleData: { name: string; permissions: string[] }) => {
    try {
      const response = await fetch("/api/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...roleData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update role")
      }

      const updatedRole = await response.json()
      setRoles(prev => prev.map(role => role._id === updatedRole._id ? updatedRole : role))
      return updatedRole
    } catch (error: any) {
      throw new Error(error.message || "Failed to update role")
    }
  }

  const deleteRole = async (id: string) => {
    try {
      const response = await fetch("/api/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete role")
      }

      setRoles(prev => prev.filter(role => role._id !== id))
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete role")
    }
  }

  const initializeDefaultRoles = useCallback(async () => {
    if (roles.length === 0 && !isLoading) {
      const defaultRoles = [
        {
          name: "Admin",
          permissions: availablePermissions,
        },
        {
          name: "Manager",
          permissions: [
            "dashboard",
            "tasks.create",
            "tasks.assign",
            "tasks.complete",
            "tasks.manage",
            "tasks.developer_working",
            "users.manage",
            "tasks.unpost",
            "reports.view",
            "company_information.manage",
            "projects.manage"
          ],
        },
        {
          name: "Employee",
          permissions: ["dashboard"],
        },
      ]

      try {
        for (const role of defaultRoles) {
          await createRole(role)
        }
        // Refresh the roles list after creating defaults
        await fetchRoles()
      } catch (error) {
        console.error("Failed to initialize default roles:", error)
      }
    }
  }, [roles.length, isLoading, createRole, fetchRoles])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    if (!isLoading && roles.length === 0) {
      initializeDefaultRoles()
    }
  }, [isLoading, roles.length, initializeDefaultRoles])

  return {
    roles,
    isLoading,
    availablePermissions,
    createRole,
    updateRole,
    deleteRole,
    refetch: fetchRoles,
  }
}