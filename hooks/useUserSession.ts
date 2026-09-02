import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export interface UserSession {
  id: string
  username: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

/**
 * ROOT CAUSE (fixed here):
 * This hook used to read `localStorage.getItem("user")` to decide whether
 * the Administrator was logged in. The real login flow (app/api/login)
 * never wrote anything to localStorage — it only sets an httpOnly "token"
 * cookie, which is verified through /api/auth/me and exposed via
 * AuthContext (contexts/AuthContext.tsx). Because localStorage("user") was
 * therefore ALWAYS empty, every page that called this hook treated a fully
 * authenticated Administrator as logged-out and immediately fired the
 * "Session Expired" toast + redirect — regardless of how valid the session
 * actually was. Pages that never called this hook (e.g. Project Search
 * Report) were unaffected, which is why that one page worked fine.
 *
 * Fix: source the session from the same cookie-backed AuthContext that
 * app/dashboard/layout.tsx already uses successfully (which is why the
 * sidebar itself always rendered correctly). The public API of this hook
 * (user, isLoading, updateSession, logout, checkSession) is preserved so
 * every existing call site keeps working without any changes.
 */
export const useUserSession = (requiredPermission?: string) => {
  const { user, isLoading, refreshUser, logout: authLogout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const hasNotifiedRef = useRef(false)

  useEffect(() => {
    // Wait for the real session check to finish before deciding anything —
    // this is exactly the step the old localStorage-based check skipped.
    if (isLoading) return

    if (!user) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true
        toast({
          title: "Session Expired",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        router.push("/login")
      }
      return
    }

    if (requiredPermission && !user.role?.permissions?.includes(requiredPermission)) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this page.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
      return
    }

    hasNotifiedRef.current = false
  }, [isLoading, user, requiredPermission, toast, router])

  // Kept for backward compatibility with existing call sites; re-syncs
  // from the server-verified session instead of writing to localStorage.
  const updateSession = useCallback(
    async (_updatedUser?: UserSession) => {
      await refreshUser()
    },
    [refreshUser],
  )

  const logout = useCallback(async () => {
    await authLogout()
    router.push("/login")
  }, [authLogout, router])

  const checkSession = useCallback(() => user as UserSession | null, [user])

  return {
    user: user as UserSession | null,
    isLoading,
    updateSession,
    logout,
    checkSession,
  }
}
