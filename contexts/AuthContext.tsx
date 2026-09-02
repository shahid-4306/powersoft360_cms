// "use client"

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
//   type ReactNode,
// } from "react"

// export interface AuthUser {
//   id: string
//   username: string
//   name?: string
//   email?: string
//   role: {
//     id: string
//     name: string
//     permissions: string[]
//   }
// }

// interface AuthContextValue {
//   user: AuthUser | null
//   isLoading: boolean
//   refreshUser: () => Promise<void>
//   logout: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   const refreshUser = useCallback(async () => {
//     try {
//       const response = await fetch("/api/auth/me", {
//         credentials: "include",
//         cache: "no-store",
//       })

//       if (!response.ok) {
//         setUser(null)
//         return
//       }

//       const data = await response.json()
//       setUser(data.user ?? null)
//     } catch (error) {
//       console.error("Failed to load session:", error)
//       setUser(null)
//     }
//   }, [])

//   useEffect(() => {
//     let isMounted = true
//     ;(async () => {
//       setIsLoading(true)
//       await refreshUser()
//       if (isMounted) setIsLoading(false)
//     })()
//     return () => {
//       isMounted = false
//     }
//   }, [refreshUser])

//   const logout = useCallback(async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
//     } catch (error) {
//       console.error("Logout request failed:", error)
//     } finally {
//       setUser(null)
//     }
//   }, [])

//   return (
//     <AuthContext.Provider value={{ user, isLoading, refreshUser, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }
"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"

export interface AuthUser {
  id: string
  username: string
  name?: string
  email?: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const hasLoadedOnce = useRef(false)

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        setUser(null)
        return
      }

      const data = await response.json()
      setUser(data.user ?? null)
      console.log("✅ Auth refreshed:", data.user?.username || "No user")
    } catch (error) {
      console.error("Failed to load session:", error)
      setUser(null)
    }
  }, [])

  // Initial load on mount
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      setIsLoading(true)
      await refreshUser()
      if (isMounted) {
        setIsLoading(false)
        hasLoadedOnce.current = true
      }
    })()
    return () => {
      isMounted = false
    }
  }, [refreshUser])

  // Re-check on every route change after initial load
  useEffect(() => {
    if (!hasLoadedOnce.current) return
    refreshUser()
  }, [pathname, refreshUser])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } catch (error) {
      console.error("Logout request failed:", error)
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      refreshUser, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}