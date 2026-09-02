"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react"

interface CompletionRateProps {
  reportData: any
}

export const CompletionRate = ({ reportData }: CompletionRateProps) => {
  return (
    <Card className="animate-slide-in" style={{ animationDelay: "0.5s" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Completion Rate
        </CardTitle>
        <CardDescription>Task completion for selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-green-600">
              {reportData.completionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-muted-foreground">Tasks Completed</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto" />
              <div className="text-base sm:text-lg font-semibold">{reportData.completed || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="space-y-1">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto" />
              <div className="text-base sm:text-lg font-semibold">{reportData.assigned || 0}</div>
              <div className="text-xs text-muted-foreground">Assigned</div>
            </div>
            <div className="space-y-1">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto" />
              <div className="text-base sm:text-lg font-semibold">{reportData.pending || 0}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="space-y-1">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto" />
              <div className="text-base sm:text-lg font-semibold">{reportData.onHold || 0}</div>
              <div className="text-xs text-muted-foreground">On Hold</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}