"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckSquare, Building, User, CheckCircle2, AlertCircle } from "lucide-react"
import type { ITask } from "@/models/Task"
import type { IOnlineComplaint } from "@/models/OnlineComplaint"

type CombinedItem = (ITask & { type: 'task' }) | (IOnlineComplaint & { type: 'complaint' })

interface AllTasksTableProps {
  items: CombinedItem[]
  isLoading: boolean
  onItemSelect: (item: CombinedItem) => void
  getStatusColor: (status: string) => string
  getDeveloperStatusColor: (status: string) => string
}

export function AllTasksTable({
  items,
  isLoading,
  onItemSelect,
  getStatusColor,
  getDeveloperStatusColor
}: AllTasksTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading items...</p>
        </div>
      </div>
    )
  }

  // Helper function to get item code/number
  const getItemCode = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.code?.split("-")[1] || item.code
    } else {
      return item.complaintNumber?.split("-")[1] || item.complaintNumber
    }
  }

  // Helper function to get item name
  const getItemName = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.company?.name
    } else {
      return item.company.companyName
    }
  }

  // Helper function to get work/software type
  const getWorkType = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.working
    } else {
      return item.softwareType
    }
  }

  // Helper function to get assigned person
  const getAssignedTo = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.assignedTo?.name || "Unassigned"
    } else {
      return item.assignedTo?.name || "Unassigned"
    }
  }

  // Helper function to get current status
  const getCurrentStatus = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.finalStatus || item.status || "approved"
    } else {
      return item.status
    }
  }

  // Helper function to get developer status
  const getDeveloperStatus = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.developer_status || "pending"
    } else {
      // Check both developerStatus and developer_status fields
      return item.developerStatus || item.developer_status || "pending"
    }
  }

  // Helper function to check if completion is approved
  const isCompletionApproved = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.completionApproved
    } else {
      // For complaints, check if status is "closed" (means completed)
      return item.status === "closed"
    }
  }

  // Helper function to check if item can be completed
const canCompleteItem = (item: CombinedItem) => {
  if (item.type === "task") {
    // ✅ TASK LOGIC (unchanged)
    return (
      !item.completionApproved ||
      (item.finalStatus === "in-progress" &&
        item.developer_status_rejection === "fixed")
    )
  }

  // ✅ COMPLAINT LOGIC (ONLY THESE CASES)
  const isInProgressDone =
    item.status === "in-progress" &&
    (item.developerStatus === "done" || item.developer_status === "done")

  const isResolvedDone =
    item.status === "resolved" &&
    (item.developerStatus === "done" || item.developer_status === "done")

  return isInProgressDone || isResolvedDone
}

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckSquare className="h-4 w-4" />
          All Pending Items ({items.length})
        </CardTitle>
        <CardDescription className="text-sm">
          Manage completion status of all pending tasks and complaints
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium">No pending items to manage</p>
            <p className="text-xs">
              Tasks/Complaints will appear here once they are ready for completion approval
            </p>
          </div>
        ) : (
          <div className="responsive-table max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/15 border-b sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Company
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Work/Software
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Assigned To
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Current Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Developer Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Completion
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr
                    key={item._id}
                    className={
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-accent/15/30 hover:bg-accent/30 transition-colors"
                    }
                  >
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={
                        item.type === 'task' 
                          ? "bg-accent/30 text-secondary border-primary/40 text-xs"
                          : "bg-purple-100 text-purple-800 border-purple-300 text-xs"
                      }>
                        {item.type === 'task' ? (
                          <>
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Task
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Complaint
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-xs font-mono border-primary/40">
                        {getItemCode(item)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 text-muted-foreground/70 mr-1" />
                        <span
                          className="font-medium text-foreground truncate max-w-[80px] sm:max-w-24"
                          title={getItemName(item)}
                        >
                          {getItemName(item)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="text-foreground truncate max-w-[100px] block text-xs"
                        title={getWorkType(item)}
                      >
                        {getWorkType(item)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-accent/30 rounded-full flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-primary text-xs">
                            {getAssignedTo(item)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        className={`text-xs ${getStatusColor(getCurrentStatus(item))}`}
                      >
                        {item.type === 'task' ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1 capitalize">
                          {getCurrentStatus(item)}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getDeveloperStatusColor(getDeveloperStatus(item))}`}
                      >
                        {getDeveloperStatus(item)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      {isCompletionApproved(item) ? (
                        <Badge className="bg-green-600 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs border-yellow-400 text-yellow-700"
                        >
                          Pending Review
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {canCompleteItem(item) && (
                        <Button
                          onClick={() => onItemSelect(item)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-secondary hover:from-purple-700 hover:to-secondary text-xs px-3 py-1"
                        >
                          Complete
                        </Button>
                      )}
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