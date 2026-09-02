import type { CSSProperties, ReactNode } from "react"
import { DashboardStats } from "@/hooks/use-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ClipboardList,
  CheckCircle,
  Award,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Archive
} from "lucide-react"

interface StatsCardsProps {
  stats: DashboardStats
  isAdminOrManager: boolean
  isTaskCreator: boolean
  canViewComplaints: boolean
  onCardClick: (metric: string) => void
}

// Every stats card opens its detail (search, filter, sort, pagination,
// CSV export) in a modal instead of navigating to a new page. The card's
// own look, layout, spacing, and animations are unchanged — only the
// interaction (button + onClick instead of Link) is different.
function ClickableCard({ metric, className, style, onCardClick, children }: {
  metric: string
  className?: string
  style?: CSSProperties
  onCardClick: (metric: string) => void
  children: ReactNode
}) {
  return (
    <button type="button" onClick={() => onCardClick(metric)} className="block w-full text-left">
      <Card
  className={`min-h-[140px] rounded-xl cursor-pointer active:scale-[0.98] hover:shadow-xl transition-all duration-300 ${className || ""}`}
        style={style}
      >
        {children}
      </Card>
    </button>
  )
}

export function StatsCards({ stats, isAdminOrManager, isTaskCreator, canViewComplaints, onCardClick }: StatsCardsProps) {
  return (
    // <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {/* Task Stats */}
      <ClickableCard
        metric={isAdminOrManager ? "totalTasks" : "userTotalTasks"}
        onCardClick={onCardClick}
        className="border-0 shadow-lg bg-gradient-to-br from-accent/15 to-accent/30/50 hover:shadow-xl transition-all-smooth animate-slide-in"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
          <CardTitle className="text-sm md:text-base font-semibold text-primary">
            {isAdminOrManager ? "Total Tasks" : isTaskCreator ? "My Created Tasks" : "My Tasks"}
          </CardTitle>
          <div className="w-8 h-8 bg-accent/30 rounded-lg flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-primary">
            {isAdminOrManager ? stats.totalTasks : stats.userTotalTasks}
          </div>
          <p className="text-xs text-primary/70">
            {isAdminOrManager 
              ? "All tasks created" 
              : isTaskCreator 
              ? "Tasks I created" 
              : "Tasks assigned to me"}
          </p>
        </CardContent>
      </ClickableCard>

      <ClickableCard
        metric={isAdminOrManager ? "completedTasks" : "userCompletedTasks"}
        onCardClick={onCardClick}
        className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
        style={{ animationDelay: "0.1s" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
          <CardTitle className="text-xs md:text-sm font-medium text-emerald-700">
            {isAdminOrManager ? "Completed Tasks" : "My Completed Tasks"}
          </CardTitle>
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-emerald-600">
            {isAdminOrManager ? stats.completedTasks : stats.userCompletedTasks}
          </div>
          <p className="text-xs text-emerald-600/70">
            {isAdminOrManager 
              ? "Tasks finished" 
              : isTaskCreator 
              ? "Tasks I created that are completed" 
              : "My completed tasks"}
          </p>
        </CardContent>
      </ClickableCard>

      {/* Complaint Stats for Admin */}
      {canViewComplaints && isAdminOrManager && (
        <>
          <ClickableCard
            metric="totalComplaints"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-orange-700">
                Total Complaints
              </CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {stats.totalComplaints}
              </div>
              <p className="text-xs text-orange-600/70">All complaints registered</p>
            </CardContent>
          </ClickableCard>

          <ClickableCard
            metric="inProgressComplaints"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-red-700">
                In Progress
              </CardTitle>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {stats.inProgressComplaints}
              </div>
              <p className="text-xs text-red-600/70">Complaints in progress</p>
            </CardContent>
          </ClickableCard>
        </>
      )}

      {/* Complaint Stats for Developer */}
      {canViewComplaints && !isAdminOrManager && (
        <>
          <ClickableCard
            metric="userInProgressComplaints"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-red-700">
                Assign Complaint
              </CardTitle>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {stats.userInProgressComplaints}
              </div>
              <p className="text-xs text-red-600/70">My in-progress complaints</p>
            </CardContent>
          </ClickableCard>

          <ClickableCard
            metric="userResolvedComplaints"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-green-700">
                My Resolve Complaint
              </CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {stats.userResolvedComplaints}
              </div>
              <p className="text-xs text-green-600/70">My resolved complaints</p>
            </CardContent>
          </ClickableCard>
        </>
      )}

      {/* Additional stats for admin */}
      {isAdminOrManager && (
        <>
          <ClickableCard
            metric="approvedTasks"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-amber-700">Approved Tasks</CardTitle>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-amber-600">{stats.approvedTasks}</div>
              <p className="text-xs text-amber-600/70">Ready for work</p>
            </CardContent>
          </ClickableCard>

          <ClickableCard
            metric="pendingTasks"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-rose-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-rose-700">Pending Tasks</CardTitle>
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-rose-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-rose-600">{stats.pendingTasks}</div>
              <p className="text-xs text-rose-600/70">Awaiting action</p>
            </CardContent>
          </ClickableCard>
        </>
      )}

      {/* Non-admin additional task stats */}
      {!isAdminOrManager && (
        <>
          <ClickableCard
            metric="userPendingTasks"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-rose-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-rose-700">My Pending Tasks</CardTitle>
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-rose-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-rose-600">{stats.userPendingTasks}</div>
              <p className="text-xs text-rose-600/70">
                {isTaskCreator 
                  ? "Tasks I created that are pending" 
                  : "My pending tasks"}
              </p>
            </CardContent>
          </ClickableCard>

          {/* Developer additional complaint stats */}
          {canViewComplaints && !isAdminOrManager && (
            <>
              <ClickableCard
                metric="userClosedComplaints"
                onCardClick={onCardClick}
                className="border-0 shadow-lg bg-gradient-to-br from-muted/40 to-muted/50 hover:shadow-xl transition-all-smooth animate-slide-in"
                style={{ animationDelay: "0.5s" }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
                  <CardTitle className="text-xs md:text-sm font-medium text-foreground/80">
                    My Closed Complaint
                  </CardTitle>
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-muted-foreground">
                    {stats.userClosedComplaints}
                  </div>
                  <p className="text-xs text-muted-foreground/70">My closed complaints</p>
                </CardContent>
              </ClickableCard>

              <ClickableCard
                metric="userTotalComplaints"
                onCardClick={onCardClick}
                className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
                style={{ animationDelay: "0.6s" }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
                  <CardTitle className="text-xs md:text-sm font-medium text-orange-700">
                    Total My Complaints
                  </CardTitle>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-orange-600">
                    {stats.userTotalComplaints}
                  </div>
                  <p className="text-xs text-orange-600/70">All my assigned complaints</p>
                </CardContent>
              </ClickableCard>
            </>
          )}
        </>
      )}

      {/* Admin additional complaint stats */}
      {canViewComplaints && isAdminOrManager && (
        <>
          <ClickableCard
            metric="resolvedComplaints"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.6s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-green-700">Resolved Complaints</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.resolvedComplaints}</div>
              <p className="text-xs text-green-600/70">Successfully resolved</p>
            </CardContent>
          </ClickableCard>

          <ClickableCard
            metric="closedComplaints"
            onCardClick={onCardClick}
            className="border-0 shadow-lg bg-gradient-to-br from-muted/40 to-muted/50 hover:shadow-xl transition-all-smooth animate-slide-in"
            style={{ animationDelay: "0.7s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 ">
              <CardTitle className="text-xs md:text-sm font-medium text-foreground/80">Closed and Complete</CardTitle>
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Archive className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-muted-foreground">{stats.closedComplaints}</div>
              <p className="text-xs text-muted-foreground/70">Confirmed complete and closed</p>
            </CardContent>
          </ClickableCard>
        </>
      )}
    </div>
  )
}
