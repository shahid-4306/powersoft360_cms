"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  color: string
  borderColor: string
  icon?: React.ReactNode
  delay?: string
}

export const StatsCard = ({
  title,
  value,
  color,
  borderColor,
  icon,
  delay = "0s",
}: StatsCardProps) => {
  return (
    <Card
      className={`border-l-4 animate-slide-in`}
      style={{
        borderLeftColor: borderColor,
        animationDelay: delay,
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold`} style={{ color }}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export const StatsCardsGrid = ({ reportData }: { reportData: any }) => {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <StatsCard
        title="Total Tasks"
        value={reportData.total || 0}
        color="#2563eb"
        borderColor="#2563eb"
        icon={<TrendingUp className="h-4 w-4" />}
        delay="0s"
      />
      <StatsCard
        title="Completed"
        value={reportData.completed || 0}
        color="#16a34a"
        borderColor="#16a34a"
        icon={<CheckCircle className="h-4 w-4" />}
        delay="0.1s"
      />
      <StatsCard
        title="Assigned"
        value={reportData.assigned || 0}
        color="#2563eb"
        borderColor="#2563eb"
        icon={<Clock className="h-4 w-4" />}
        delay="0.2s"
      />
      <StatsCard
        title="Pending"
        value={reportData.pending || 0}
        color="#ca8a04"
        borderColor="#ca8a04"
        icon={<Clock className="h-4 w-4" />}
        delay="0.3s"
      />
      <StatsCard
        title="On Hold"
        value={reportData.onHold || 0}
        color="#dc2626"
        borderColor="#dc2626"
        icon={<XCircle className="h-4 w-4" />}
        delay="0.4s"
      />
    </div>
  )
}