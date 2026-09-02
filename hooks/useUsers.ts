import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  username: string
  name: string
  email: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const createUser = async (userData: {
    username: string
    name: string
    email: string
    password: string
    roleId: string
  }) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create user")
      }

      const newUser = await response.json()
      setUsers(prev => [...prev, newUser])
      return newUser
    } catch (error: any) {
      throw new Error(error.message || "Failed to create user")
    }
  }

  const updateUser = async (id: string, userData: {
    username: string
    name: string
    email: string
    roleId: string
  }) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update user")
      }

      const updatedUser = await response.json()
      setUsers(prev => prev.map(user => user._id === updatedUser._id ? updatedUser : user))
      return updatedUser
    } catch (error: any) {
      throw new Error(error.message || "Failed to update user")
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete user")
      }

      setUsers(prev => prev.filter(user => user._id !== id))
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete user")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  }
}