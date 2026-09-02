import { DashboardStats } from "@/hooks/use-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp } from "lucide-react"

interface ComplaintProgressProps {
  stats: DashboardStats
  complaintResolutionRate: number
  isAdminOrManager: boolean
}

export function ComplaintProgress({ stats, complaintResolutionRate, isAdminOrManager }: ComplaintProgressProps) {
  
  // Calculate developer resolution rate
  const developerResolutionRate = isAdminOrManager ? 0 : 
    (stats.userTotalComplaints > 0 
      ? ((stats.userResolvedComplaints + stats.userClosedComplaints) / stats.userTotalComplaints) * 100 
      : 0)

  return (
    <Card
      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in"
      style={{ animationDelay: "0.5s" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {isAdminOrManager ? "Complaint Resolution Overview" : "My Complaint Progress"}
        </CardTitle>
        <CardDescription>
          {isAdminOrManager 
            ? "Track complaint resolution metrics" 
            : "Track your complaint resolution progress"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdminOrManager ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Resolution Rate</span>
              <span className="text-sm text-muted-foreground">{complaintResolutionRate.toFixed(1)}%</span>
            </div>
            <Progress value={complaintResolutionRate} className="h-3 bg-muted/50" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">My Resolution Rate</span>
              <span className="text-sm text-muted-foreground">{developerResolutionRate.toFixed(1)}%</span>
            </div>
            <Progress value={developerResolutionRate} className="h-3 bg-muted/50" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
          {isAdminOrManager ? (
            <>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="text-lg font-bold text-red-600">{stats.inProgressComplaints}</div>
                <div className="text-xs text-red-600/70">In Progress</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-lg font-bold text-green-600">{stats.resolvedComplaints}</div>
                <div className="text-xs text-green-600/70">Resolved</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="text-lg font-bold text-red-600">{stats.userInProgressComplaints}</div>
                <div className="text-xs text-red-600/70">Assign Complaint</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-lg font-bold text-green-600">{stats.userResolvedComplaints}</div>
                <div className="text-xs text-green-600/70">My Resolve</div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isAdminOrManager ? (
            <>
              <div className="text-center p-3 bg-accent/15 rounded-xl">
                <div className="text-lg font-bold text-primary">{stats.registeredComplaints}</div>
                <div className="text-xs text-primary/70">Registered</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <div className="text-lg font-bold text-muted-foreground">{stats.closedComplaints}</div>
                <div className="text-xs text-muted-foreground/70">Closed</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <div className="text-lg font-bold text-muted-foreground">{stats.userClosedComplaints}</div>
                <div className="text-xs text-muted-foreground/70">My Closed</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-lg font-bold text-orange-600">{stats.userTotalComplaints}</div>
                <div className="text-xs text-orange-600/70">Total My Complaints</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}