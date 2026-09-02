import { Task, Complaint } from "@/hooks/use-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target } from "lucide-react"

interface RecentActivitiesProps {
  tasks: Task[]
  complaints: Complaint[]
  userTasks: Task[]
  userComplaints: Complaint[]
  isAdminOrManager: boolean
  isTaskCreator: boolean
  canViewComplaints: boolean
  type: 'tasks' | 'complaints'
}

// Type guard for Task
function isTask(item: Task | Complaint): item is Task {
  return (item as Task).working !== undefined
}

// Type guard for Complaint
function isComplaint(item: Task | Complaint): item is Complaint {
  return (item as Complaint).complaintRemarks !== undefined
}

export function RecentActivities({ 
  tasks, 
  complaints,
  userTasks,
  userComplaints,
  isAdminOrManager, 
  isTaskCreator, 
  canViewComplaints,
  type 
}: RecentActivitiesProps) {
  
  // Select the appropriate items based on type and user role
  let items: (Task | Complaint)[] = []
  
  if (type === 'tasks') {
    items = isAdminOrManager ? tasks.slice(0, 4) : userTasks.slice(0, 4)
  } else {
    items = isAdminOrManager ? complaints.slice(0, 4) : userComplaints.slice(0, 4)
  }
  
  const title = type === 'tasks' 
    ? (isAdminOrManager ? "Recent Tasks" : "My Recent Tasks")
    : (isAdminOrManager ? "Recent Complaints" : "My Assign Complaints")
  
  const description = type === 'tasks'
    ? (isAdminOrManager 
        ? "Latest task updates and changes" 
        : isTaskCreator 
        ? "Tasks I recently created" 
        : "Your recent task updates")
    : (isAdminOrManager 
        ? "Latest complaint updates and changes"
        : "Your assigned complaints")

  if (type === 'complaints' && !canViewComplaints) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
      case 'closed':
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700'
      case 'approved':
      case 'completed':
        return 'bg-accent/30 text-primary'
      case 'pending':
      case 'registered':
        return 'bg-amber-100 text-amber-700'
      case 'in-progress':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-rose-100 text-rose-700'
    }
  }

  const renderTaskItem = (task: Task, index: number) => {
    const displayStatus = isAdminOrManager || isTaskCreator
      ? task.finalStatus || task.status || "pending"
      : task.developer_status || task.status || "pending"
    
    return (
      <div
        key={task._id || index}
        className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-300"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-2 h-2 rounded-full ${
              displayStatus === "done"
                ? "bg-emerald-500"
                : displayStatus === "approved" || displayStatus === "completed"
                ? "bg-blue-500"
                : displayStatus === "pending"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {task.company?.name || "No Company"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {task.working || "No description"}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`text-xs ${getStatusColor(displayStatus)} whitespace-nowrap`}
        >
          {displayStatus}
        </Badge>
      </div>
    )
  }

  const renderComplaintItem = (complaint: Complaint, index: number) => {
    return (
      <div
        key={complaint._id || index}
        className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-300"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-2 h-2 rounded-full ${
              complaint.status === "closed" || complaint.status === "resolved"
                ? "bg-emerald-500"
                : complaint.status === "in-progress"
                ? "bg-red-500"
                : complaint.status === "registered"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {complaint.company?.companyName || complaint.complaintNumber}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {complaint.softwareType || complaint.complaintRemarks || "No description"}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`text-xs ${getStatusColor(complaint.status)} whitespace-nowrap`}
        >
          {complaint.status}
        </Badge>
      </div>
    )
  }

  return (
    <Card
      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in"
      style={{ animationDelay: "0.6s" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-secondary rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {items.map((item, index) => {
            if (type === 'tasks' && isTask(item)) {
              return renderTaskItem(item, index)
            } else if (type === 'complaints' && isComplaint(item)) {
              return renderComplaintItem(item, index)
            }
            return null
          })}
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No {type} yet</p>
              <p className="text-sm">
                {isAdminOrManager 
                  ? `Create your first ${type.slice(0, -1)} to get started` 
                  : type === 'tasks'
                  ? (isTaskCreator ? "You haven't created any tasks yet" : "No tasks assigned to you yet")
                  : "No complaints assigned to you yet"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}