"use client"

import { useState } from "react"

interface AssignmentData {
  userId: string
  assignedDate: string
}

export function useAssignmentDialog() {
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    userId: "",
    assignedDate: new Date().toISOString().slice(0, 16),
  })
  const [remarks, setRemarks] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  const openDialog = (task: any) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedTask(null)
    setAssignmentData({
      userId: "",
      assignedDate: new Date().toISOString().slice(0, 16),
    })
    setRemarks("")
    setFiles([])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return {
    selectedTask,
    isDialogOpen,
    assignmentData,
    remarks,
    files,
    isAssigning,
    setAssignmentData,
    setRemarks,
    setFiles,
    setIsAssigning,
    openDialog,
    closeDialog,
    handleFileChange,
    removeFile
  }
}