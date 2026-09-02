"use client"

import * as XLSX from "xlsx"
import { Task } from "@/hooks/useReport"

export const exportTaskToExcel = (task: Task) => {
  const worksheetData = [
    ["PowerSoft Daily Task Report"],
    [],
    ["Company Details"],
    ["Company Name", task.company?.name || "N/A"],
    ["City", task.company?.city || "N/A"],
    ["Address", task.company?.address || "N/A"],
    ["Contact", `${task.contact?.name || "N/A"} (${task.contact?.phone || "N/A"})`],
    [],
    ["Task Details"],
    ["Task Code", task.code],
    ["Work Description", task.working],
    ["Status", task.finalStatus || task.status],
    ["Developer Status", task.developer_status || "N/A"],
    ["Created At", new Date(task.createdAt).toLocaleString()],
    ["Created By", task.createdByUsername || "N/A"],
    ["Assigned", task.assignedTo ? "Yes" : "No"],
    ["Assigned To", task.assignedTo?.name || "N/A"],
    ["Assigned Date", task.assignedDate ? new Date(task.assignedDate).toLocaleString() : "N/A"],
    ["Approved", task.approved ? "Yes" : "No"],
    ["Approved At", task.approvedAt ? new Date(task.approvedAt).toLocaleString() : "N/A"],
    ["Completion Approved", task.completionApproved ? "Yes" : "No"],
    ["Completion Approved At", task.completionApprovedAt ? new Date(task.completionApprovedAt).toLocaleString() : "N/A"],
    ["Task Remarks", task.TaskRemarks || "N/A"],
    ["Assignment Remarks", task.assignmentRemarks || "N/A"],
    ["Completion Remarks", task.completionRemarks || "N/A"],
    ["Unposted", task.unposted ? "Yes" : "No"],
    ["Unpost Status", task.UnpostStatus || "N/A"],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Task Report")
  
  // Auto-size columns
  const colWidths = worksheetData.reduce((acc: number[], row) => {
    row.forEach((cell, i) => {
      const length = String(cell).length
      acc[i] = Math.max(acc[i] || 0, length)
    })
    return acc
  }, [])
  
  worksheet["!cols"] = colWidths.map(w => ({ wch: w + 2 }))

  XLSX.writeFile(workbook, `Task_${task.code}.xlsx`)
}