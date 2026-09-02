import { DashboardStats } from "@/hooks/use-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp } from "lucide-react"

interface TaskProgressProps {
  stats: DashboardStats
  taskCompletionRate: number
  taskApprovalRate: number
  isAdminOrManager: boolean
}

export function TaskProgress({ stats, taskCompletionRate, taskApprovalRate, isAdminOrManager }: TaskProgressProps) {
  return (
    <Card
      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in"
      style={{ animationDelay: "0.4s" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          {isAdminOrManager ? "Task Progress Overview" : "My Task Progress"}
        </CardTitle>
        <CardDescription>
          {isAdminOrManager 
            ? "Track your productivity metrics" 
            : "Track your personal task progress"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {isAdminOrManager ? "Completion Rate" : "My Completion Rate"}
            </span>
            <span className="text-sm text-muted-foreground">{taskCompletionRate.toFixed(1)}%</span>
          </div>
          <Progress value={taskCompletionRate} className="h-3 bg-muted/50" />
        </div>

        {isAdminOrManager && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Approval Rate</span>
              <span className="text-sm text-muted-foreground">{taskApprovalRate.toFixed(1)}%</span>
            </div>
            <Progress value={taskApprovalRate} className="h-3 bg-muted/50" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <div className="text-lg font-bold text-emerald-600">
              {isAdminOrManager ? stats.completedTasks : stats.userCompletedTasks}
            </div>
            <div className="text-xs text-emerald-600/70">Done</div>
          </div>
          {isAdminOrManager ? (
            <div className="text-center p-3 bg-accent/15 rounded-xl">
              <div className="text-lg font-bold text-primary">{stats.approvedTasks}</div>
              <div className="text-xs text-primary/70">Approved</div>
            </div>
          ) : (
            <div className="text-center p-3 bg-rose-50 rounded-xl">
              <div className="text-lg font-bold text-rose-600">{stats.userPendingTasks}</div>
              <div className="text-xs text-rose-600/70">Pending</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}