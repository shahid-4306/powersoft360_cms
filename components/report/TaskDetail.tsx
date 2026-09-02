"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, User, FileText, Eye, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Task } from "@/hooks/useReport"

interface TaskDetailProps {
  tasks: Task[]
  isLoading: boolean
}

export const TaskDetail = ({ tasks, isLoading }: TaskDetailProps) => {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const tasksPerPage = 10

  const getStatusBadge = (task: Task) => {
    const status = task.finalStatus || task.status
    const baseClass = "text-xs"
    
    switch (status) {
      case "done":
      case "completed":
        return (
          <Badge className={`${baseClass} bg-green-600`}>
            <FileText className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "assigned":
      case "approved":
        return (
          <Badge className={`${baseClass} bg-primary`}>
            <FileText className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "pending":
        return (
          <Badge className={`${baseClass} bg-yellow-600`}>
            <FileText className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "on-hold":
        return (
          <Badge className={`${baseClass} bg-red-600`}>
            <FileText className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      default:
        return (
          <Badge className={`${baseClass} bg-muted-foreground`}>
            {status}
          </Badge>
        )
    }
  }

  const getDeveloperStatusBadge = (task: Task) => {
    if (!task.developer_status) return null
    
    const baseClass = "text-xs ml-2"
    switch (task.developer_status) {
      case "done":
        return <Badge className={`${baseClass} bg-green-100 text-green-800`}>Dev: Done</Badge>
      case "not-done":
        return <Badge className={`${baseClass} bg-red-100 text-red-800`}>Dev: Not Done</Badge>
      case "on-hold":
        return <Badge className={`${baseClass} bg-yellow-100 text-yellow-800`}>Dev: On Hold</Badge>
      case "pending":
        return <Badge className={`${baseClass} bg-accent/30 text-secondary`}>Dev: Pending</Badge>
      default:
        return null
    }
  }

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage
  const indexOfFirstTask = indexOfLastTask - tasksPerPage
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask)
  const totalPages = Math.ceil(tasks.length / tasksPerPage)

  return (
    <Card className="animate-slide-in" style={{ animationDelay: "0.6s" }}>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Task Details
            <span className="text-sm font-normal text-muted-foreground">
              ({tasks.length} tasks)
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          Detailed breakdown of tasks for the selected period
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-12 w-12 mx-auto mb-3 opacity-50 animate-spin" />
            <p className="text-base font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium">No tasks found for this period</p>
            <p className="text-xs">Tasks will appear here once created</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gradient-to-r from-purple-50 to-accent/20 border-b sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase">
                    Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase">
                    Company
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase hidden sm:table-cell">
                    Work
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase">
                    Assign To
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-purple-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentTasks.map((task, index) => (
                  <tr key={task._id} className={index % 2 === 0 ? "bg-white" : "bg-purple-50/30"}>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {task.code?.split("-")[1]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 text-muted-foreground/70 mr-1" />
                        <span
                          className="font-medium text-foreground truncate max-w-[80px] sm:max-w-24"
                          title={task.company?.name}
                        >
                          {task.company?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <span
                        className="text-foreground truncate max-w-[100px] block text-xs"
                        title={task.working}
                      >
                        {task.working}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        {getStatusBadge(task)}
                        {getDeveloperStatusBadge(task)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {task.assignedTo ? (
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                            <User className="h-3 w-3 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-700 text-xs">
                              {task.assignedTo.name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          Unassigned
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/reports/view?id=${task._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}