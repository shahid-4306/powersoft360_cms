import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"

interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  color: string
  iconBg: string
  iconColor: string
  permission: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  prefetchedRoutes: Set<string>
}

export function QuickActions({ actions, prefetchedRoutes }: QuickActionsProps) {
  const router = useRouter()

  const handleQuickActionClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLAnchorElement
    target.classList.add("scale-95", "opacity-80")
    setTimeout(() => {
      router.push(href)
    }, 80)
  }

  if (actions.length === 0) {
    return null
  }

  return (
    <Card
      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in"
      style={{ animationDelay: "0.7s" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks and shortcuts to boost your productivity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              prefetch={false}
              onClick={(e) => handleQuickActionClick(e, action.href)}
              onMouseEnter={() => {
                if (!prefetchedRoutes.has(action.href)) {
                  router.prefetch(action.href)
                  prefetchedRoutes.add(action.href)
                }
              }}
              className="group p-4 border border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-background to-muted/20 hover:scale-105 active:scale-95 active:opacity-80 transform"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}