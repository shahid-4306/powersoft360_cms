
import { UserSession } from "@/hooks/use-dashboard"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

interface WelcomeViewProps {
  user: UserSession
  isAdminOrManager: boolean
  isTaskCreator: boolean
}

export function WelcomeView({ user, isAdminOrManager, isTaskCreator }: WelcomeViewProps) {
  return (
    <div
  className="relative overflow-hidden rounded-2xl p-5 md:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      style={{ 
        background: 'linear-gradient(135deg, #11519B, #114A9B, #0D3D7A)',
        color: '#FEFFFF'
      }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/g fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fillOpacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
Welcome to TaskFlow, {user.username}!</h1>
           <p
  style={{ opacity: 0.85 }}
  className="text-xs md:text-sm leading-relaxed"
>

              {isAdminOrManager 
                ? "Manage all tasks, complaints, and team activities" 
                : isTaskCreator
                ? "Track your created tasks and complaints"
                : "Track your assigned tasks and complaints"}
            </p>
            <Badge
  className="text-xs px-2.5 py-1 transition-all duration-200 hover:scale-105"

              variant="secondary" 
              style={{ 
                backgroundColor: 'rgba(254, 255, 255, 0.2)',
                color: '#FEFFFF',
                backdropFilter: 'blur(8px)'
              }}
            >
              {user.role.name}
            </Badge>
          </div>
          <div 
            className="flex items-center gap-2 backdrop-blur-sm rounded-xl px-3 py-2 transition-all duration-300 hover:bg-white/20 hover:scale-105"

            style={{ 
              backgroundColor: 'rgba(254, 255, 255, 0.1)'
            }}
          >
           <Activity className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />

            <span className="text-xs md:text-sm font-medium">

              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}