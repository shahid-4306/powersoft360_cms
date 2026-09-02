"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useTaskStream } from "@/hooks/useTaskStream"
import { useFileDownload } from "@/hooks/useFileDownload"
import { useComplaintDownload } from "@/hooks/useComplaintDownload"
import type { ITask } from "@/models/Task"
import type { IOnlineComplaint } from "@/models/OnlineComplaint"

interface UserSession {
  id: string
  username: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

type CombinedItem = (ITask & { type: 'task' }) | (IOnlineComplaint & { type: 'complaint' })

export function useAllTasks() {
  const [combinedItems, setCombinedItems] = useState<CombinedItem[]>([])
  const [selectedItem, setSelectedItem] = useState<CombinedItem | null>(null)
  const [taskStatus, setTaskStatus] = useState("")
  const [completionRemarks, setCompletionRemarks] = useState("")
  const [completionAttachments, setCompletionAttachments] = useState<File[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [user, setUser] = useState<UserSession | null>(null)
  
  const { toast } = useToast()
  const router = useRouter()
  const { downloadAllAttachments: downloadTaskFiles } = useFileDownload()
  const { downloadAllAttachments: downloadComplaintFiles } = useComplaintDownload()
  const streamedTasks = useTaskStream()

  // Filter tasks based on status - IMPORTANT: We need to show tasks that are approved but not completed
  const filterTasks = useCallback((tasks: ITask[]) => {
    return tasks.filter(task => {
      // Tasks that are assigned (approved) but not yet completed
      if (task.status === "assigned" && !task.completionApproved) {
        return true
      }
      // Tasks that are in-progress and rejection is fixed
      if (task.finalStatus === "in-progress" && task.developer_status_rejection === "fixed") {
        return true
      }
      return false
    })
  }, [])

  // Filter complaints based on status - IMPORTANT: Show resolved complaints with developerStatus done
 const filterComplaints = useCallback((complaints: IOnlineComplaint[]) => {
  return complaints.filter(complaint => {
    const statusOk =
      complaint.status === "resolved" ||
      complaint.status === "in-progress"

    const developerDone =
      complaint.developerStatus === "done" ||
      complaint.developer_status === "done"

    return statusOk && developerDone
  })
}, [])

  // Initialize user session from the real cookie-backed session
  // (AuthContext / /api/auth/me) instead of localStorage, which the
  // login flow never populates. This is the same root cause and fix
  // already applied to hooks/useUserSession.ts.
  const { user: authUser, isLoading: authLoading } = useAuth()
  const hasNotifiedRef = useRef(false)

  useEffect(() => {
    if (authLoading) return

    if (!authUser) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true
        toast({
          title: "Session Expired",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        router.push("/login")
      }
      return
    }

    if (!authUser.role?.permissions?.includes("tasks.complete")) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true
        toast({
          title: "Access Denied",
          description: "You do not have permission to approve task completion.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
      return
    }

    hasNotifiedRef.current = false
    setUser(authUser as UserSession)
  }, [authLoading, authUser, router, toast])

  // Fetch tasks and complaints from API
  const fetchAllItems = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      console.log("Fetching tasks and complaints...")
      
      // Fetch approved tasks
      const tasksResponse = await fetch("/api/tasks/approved")
      
      // Fetch all complaints and filter on client side
      const complaintsResponse = await fetch("/api/online-complaints")
      
      if (!tasksResponse.ok) {
        throw new Error(`Tasks fetch error! status: ${tasksResponse.status}`)
      }
      
      if (!complaintsResponse.ok) {
        throw new Error(`Complaints fetch error! status: ${complaintsResponse.status}`)
      }

      const tasks: ITask[] = await tasksResponse.json()
      const allComplaints: IOnlineComplaint[] = await complaintsResponse.json()

      console.log("Raw tasks count:", tasks.length)
      console.log("Raw complaints count:", allComplaints.length)

      const filteredTasks = filterTasks(tasks).map(task => ({ ...task, type: 'task' as const }))
      const filteredComplaints = filterComplaints(allComplaints).map(complaint => ({ 
        ...complaint, 
        type: 'complaint' as const 
      }))

      console.log("Filtered tasks:", filteredTasks.length)
      console.log("Filtered complaints:", filteredComplaints.length)
      
      // Log sample complaints for debugging
      filteredComplaints.forEach((complaint, index) => {
        console.log(`Complaint ${index + 1}:`, {
          id: complaint._id,
          number: complaint.complaintNumber,
          status: complaint.status,
          developerStatus: complaint.developerStatus,
          developer_status: complaint.developer_status
        })
      })

      const combined = [...filteredTasks, ...filteredComplaints]
      setCombinedItems(combined)
    } catch (error) {
      console.error("Failed to fetch items:", error)
      toast({
        title: "Error fetching items",
        description: "Could not load tasks/complaints. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, filterTasks, filterComplaints, toast])

  // Update tasks from stream (only tasks, not complaints)
  useEffect(() => {
    if (streamedTasks.length > 0) {
      const filteredTasks = filterTasks(streamedTasks).map(task => ({ ...task, type: 'task' as const }))
      
      setCombinedItems(prev => {
        const existingComplaints = prev.filter(item => item.type === 'complaint')
        return [...filteredTasks, ...existingComplaints]
      })
    }
  }, [streamedTasks, filterTasks])

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchAllItems()
    }
  }, [user, fetchAllItems])

  // Handle file input changes
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setCompletionAttachments(prev => [...prev, ...newFiles])
  }, [])

  // Remove file from attachments
  const removeFile = useCallback((index: number) => {
    setCompletionAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Handle task/complaint completion approval
  const handleApproveCompletion = useCallback(async () => {
    if (!selectedItem || !taskStatus) {
      toast({
        title: "Status Required",
        description: "Please select a completion status.",
        variant: "destructive",
      })
      return
    }

    // Validate file sizes
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    let totalSize = 0

    for (const file of completionAttachments) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: `File "${file.name}" exceeds 10MB limit. Please choose smaller files.`,
          variant: "destructive",
        })
        return
      }
      totalSize += file.size
    }

    if (totalSize > 25 * 1024 * 1024) { // 25MB total
      toast({
        title: "Total File Size Too Large",
        description: "Total attachment size exceeds 25MB. Please reduce the number or size of files.",
        variant: "destructive",
      })
      return
    }

    setIsApproving(true)
    try {
      if (selectedItem.type === 'task') {
        // Handle task approval (existing code)
        const formData = new FormData()
        formData.append("completionApproved", "true")
        formData.append("completionApprovedAt", new Date().toISOString())
        formData.append("finalStatus", taskStatus)
        formData.append("status", taskStatus === "done" ? "completed" : taskStatus)
        
        if (taskStatus === "rejected") {
          formData.append("rejectionRemarks", completionRemarks)
        } else {
          formData.append("completionRemarks", completionRemarks)
        }
        
        completionAttachments.forEach((file) => {
          if (taskStatus === "rejected") {
            formData.append("rejectionAttachment", file)
          } else {
            formData.append("completionAttachment", file)
          }
        })

        if (taskStatus === "done" && selectedItem.assignedDate) {
          const assignedDate = new Date(selectedItem.assignedDate)
          const completionDate = new Date()
          const timeTaken = completionDate.getTime() - assignedDate.getTime()
          formData.append("timeTaken", timeTaken.toString())
        }

        const response = await fetch(`/api/tasks/${selectedItem._id}`, {
          method: "PUT",
          body: formData,
        })

        if (!response.ok) {
          const errorResponse = await response.json()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorResponse.message}`)
        }

        await response.json()
        
      } else {
        // Handle complaint approval
        const formData = new FormData()
        formData.append("complaintId", selectedItem._id)
        formData.append("finalStatus", taskStatus)
        
        if (taskStatus === "rejected") {
          formData.append("rejectionRemarks", completionRemarks)
          completionAttachments.forEach((file) => {
            formData.append("rejectionAttachment", file)
          })
        } else {
          formData.append("completionRemarks", completionRemarks)
          completionAttachments.forEach((file) => {
            formData.append("completionAttachment", file)
          })
        }

        const response = await fetch("/api/online-complaints/closed", {
          method: "PUT",
          body: formData,
        })

        if (!response.ok) {
          const errorResponse = await response.json()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorResponse.message}`)
        }

        await response.json()
      }

      // Remove from list
      setCombinedItems(prev => prev.filter(item => item._id !== selectedItem._id))

      toast({
        title: `Item ${taskStatus === "rejected" ? "Rejected" : "Completed"}!`,
        description: `${selectedItem.type === 'task' ? 'Task' : 'Complaint'} ${selectedItem.type === 'task' ? selectedItem.code : selectedItem.complaintNumber} has been ${taskStatus === "rejected" ? 'rejected' : 'marked as completed'}.`,
        duration: 5000,
      })

      setIsDialogOpen(false)
      setSelectedItem(null)
      setTaskStatus("")
      setCompletionRemarks("")
      setCompletionAttachments([])
    } catch (error) {
      console.error("Failed to approve completion:", error)
      toast({
        title: "Error",
        description: "Failed to approve completion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }, [selectedItem, taskStatus, completionRemarks, completionAttachments, toast])

  // Download files based on type
  const handleDownloadFiles = useCallback(async (
    item: CombinedItem, 
    attachments: string[] = [], 
    type: string
  ) => {
    if (item.type === 'task') {
      await downloadTaskFiles(item._id, attachments, type)
    } else {
      // For complaints, use the complaint download function
      await downloadComplaintFiles(item._id, item.complaintNumber)
    }
  }, [downloadTaskFiles, downloadComplaintFiles])

  // Open item dialog
  const openItemDialog = useCallback((item: CombinedItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }, [])

  // Close item dialog
  const closeItemDialog = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedItem(null)
    setTaskStatus("")
    setCompletionRemarks("")
    setCompletionAttachments([])
  }, [])

  // Helper function for download URLs
  const getDownloadUrl = useCallback((attachment: string): string => {
    if (attachment.startsWith('/')) {
      return `${window.location.origin}${attachment}`
    } else if (/^[0-9a-fA-F]{24}$/.test(attachment)) {
      return `/api/files/download?fileId=${attachment}`
    }
    return attachment
  }, [])

  // Format time taken for tasks
  const formatTimeTaken = useCallback((milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }, [])

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "done":
      case "completed":
      case "closed":
      case "resolved":
        return "bg-green-600"
      case "on-hold":
        return "bg-yellow-600"
      case "not-done":
      case "rejected":
        return "bg-red-600"
      case "pending":
      case "approved":
      case "in-progress":
      case "registered":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }, [])

  // Get developer status color
  const getDeveloperStatusColor = useCallback((status: string) => {
    switch (status) {
      case "done":
      case "fixed":
        return "bg-green-100 text-green-800 border-green-300"
      case "not-done":
        return "bg-red-100 text-red-800 border-red-300"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }, [])

  return {
    // State
    items: combinedItems,
    selectedItem,
    taskStatus,
    completionRemarks,
    completionAttachments,
    isDialogOpen,
    isLoading,
    isApproving,
    user,
    
    // Setters
    setTaskStatus,
    setCompletionRemarks,
    
    // Actions
    openItemDialog,
    closeItemDialog,
    handleApproveCompletion,
    handleFileChange,
    removeFile,
    handleDownloadFiles,
    getDownloadUrl,
    formatTimeTaken,
    getStatusColor,
    getDeveloperStatusColor,
  }
}