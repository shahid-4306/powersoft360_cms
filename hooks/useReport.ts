"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface Task {
  _id: string
  code: string
  working: string
  status: "pending" | "assigned" | "approved" | "completed" | "on-hold" | "unposted" | "in-progress" | "rejected"
  finalStatus?: "done" | "on-hold"
  developer_status?: "pending" | "done" | "not-done" | "on-hold"
  company: {
    name: string
    city?: string
    address?: string
  }
  assignedTo?: {
    name: string
    email?: string
  }
  createdAt: string
  assignedDate?: string
  approved: boolean
  approvedAt?: string
  completionApproved?: boolean
  completionApprovedAt?: string
  TaskRemarks?: string
  assignmentRemarks?: string
  completionRemarks?: string
  unposted?: boolean
  UnpostStatus?: string
  TasksAttachment?: string
  assignmentAttachment?: string
  completionAttachment?: string
  contact?: {
    name: string
    phone?: string
  }
  createdByUsername?: string
}

export interface ReportFilters {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  companyName: string
  status: string
  developerStatus: string
  reportType: "daily" | "weekly" | "monthly" | "custom"
}

export interface ReportData {
  total: number
  completed: number
  pending: number
  assigned: number
  onHold: number
  tasks: Task[]
  completionRate: number
  statusCounts: {
    pending: number
    assigned: number
    approved: number
    completed: number
    onHold: number
    unposted: number
    inProgress: number
    rejected: number
  }
  developerStatusCounts: {
    pending: number
    done: number
    "not-done": number
    "on-hold": number
  }
}

export const useReport = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [reportData, setReportData] = useState<ReportData>({
    total: 0,
    completed: 0,
    pending: 0,
    assigned: 0,
    onHold: 0,
    tasks: [],
    completionRate: 0,
    statusCounts: {
      pending: 0,
      assigned: 0,
      approved: 0,
      completed: 0,
      onHold: 0,
      unposted: 0,
      inProgress: 0,
      rejected: 0,
    },
    developerStatusCounts: {
      pending: 0,
      done: 0,
      "not-done": 0,
      "on-hold": 0,
    },
  })
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: null,
      end: null,
    },
    companyName: "",
    status: "",
    developerStatus: "",
    reportType: "daily",
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tasks")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTasks(data)
      applyFilters(data, filters)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      toast({
        title: "Error fetching tasks",
        description: "Could not load tasks for reports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const applyFilters = (tasksList: Task[], currentFilters: ReportFilters) => {
    let filtered = [...tasksList]

    // Apply date range filter
    if (currentFilters.dateRange.start && currentFilters.dateRange.end) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return (
          taskDate >= currentFilters.dateRange.start! &&
          taskDate <= currentFilters.dateRange.end!
        )
      })
    } else {
      // Apply default report type filter
      const now = new Date()
      switch (currentFilters.reportType) {
        case "daily":
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.createdAt)
            return taskDate.toDateString() === now.toDateString()
          })
          break
        case "weekly":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.createdAt)
            return taskDate >= weekStart
          })
          break
        case "monthly":
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.createdAt)
            return (
              taskDate.getMonth() === now.getMonth() &&
              taskDate.getFullYear() === now.getFullYear()
            )
          })
          break
      }
    }

    // Apply company name filter
    if (currentFilters.companyName) {
      filtered = filtered.filter((task) =>
        task.company.name.toLowerCase().includes(currentFilters.companyName.toLowerCase())
      )
    }

    // Apply status filter
    if (currentFilters.status) {
      filtered = filtered.filter((task) => task.status === currentFilters.status)
    }

    // Apply developer status filter
    if (currentFilters.developerStatus) {
      filtered = filtered.filter(
        (task) => task.developer_status === currentFilters.developerStatus
      )
    }

    setFilteredTasks(filtered)
    generateReportData(filtered)
  }

  const generateReportData = (tasksList: Task[]) => {
    const completed = tasksList.filter(
      (t) => t.status === "completed" || t.finalStatus === "done"
    ).length
    const pending = tasksList.filter((t) => t.status === "pending").length
    const assigned = tasksList.filter((t) => t.status === "assigned" || t.approved).length
    const onHold = tasksList.filter(
      (t) => t.status === "on-hold" || t.finalStatus === "on-hold"
    ).length

    // Calculate status counts
    const statusCounts = {
      pending: tasksList.filter((t) => t.status === "pending").length,
      assigned: tasksList.filter((t) => t.status === "assigned").length,
      approved: tasksList.filter((t) => t.status === "approved").length,
      completed: tasksList.filter((t) => t.status === "completed").length,
      onHold: tasksList.filter((t) => t.status === "on-hold").length,
      unposted: tasksList.filter((t) => t.status === "unposted").length,
      inProgress: tasksList.filter((t) => t.status === "in-progress").length,
      rejected: tasksList.filter((t) => t.status === "rejected").length,
    }

    // Calculate developer status counts
    const developerStatusCounts = {
      pending: tasksList.filter((t) => t.developer_status === "pending").length,
      done: tasksList.filter((t) => t.developer_status === "done").length,
      "not-done": tasksList.filter((t) => t.developer_status === "not-done").length,
      "on-hold": tasksList.filter((t) => t.developer_status === "on-hold").length,
    }

    setReportData({
      total: tasksList.length,
      completed,
      pending,
      assigned,
      onHold,
      tasks: tasksList,
      completionRate: tasksList.length > 0 ? (completed / tasksList.length) * 100 : 0,
      statusCounts,
      developerStatusCounts,
    })
  }

  const handleFilterChange = (newFilters: Partial<ReportFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    applyFilters(tasks, updatedFilters)
  }

  const resetFilters = () => {
    const resetFilters: ReportFilters = {
      dateRange: {
        start: null,
        end: null,
      },
      companyName: "",
      status: "",
      developerStatus: "",
      reportType: "daily",
    }
    setFilters(resetFilters)
    applyFilters(tasks, resetFilters)
  }

  const getReportTitle = () => {
    if (filters.dateRange.start && filters.dateRange.end) {
      return "Custom Date Range Report"
    }
    switch (filters.reportType) {
      case "daily":
        return "Daily Task Report"
      case "weekly":
        return "Weekly Task Report"
      case "monthly":
        return "Monthly Task Report"
      default:
        return "Task Report"
    }
  }

  const getReportPeriod = () => {
    const now = new Date()
    if (filters.dateRange.start && filters.dateRange.end) {
      return `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
    }
    switch (filters.reportType) {
      case "daily":
        return now.toLocaleDateString()
      case "weekly":
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
      case "monthly":
        return now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      default:
        return ""
    }
  }

  return {
    tasks,
    filteredTasks,
    reportData,
    filters,
    isLoading,
    handleFilterChange,
    resetFilters,
    getReportTitle,
    getReportPeriod,
    fetchTasks,
  }
}