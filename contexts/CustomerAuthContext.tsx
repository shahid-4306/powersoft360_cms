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

export interface CustomerUser {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  companyName?: string
  softwareType?: string
  status: "pending" | "approved" | "rejected"
}

interface CustomerAuthContextValue {
  customerUser: CustomerUser | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshCustomerUser: () => Promise<void>
  customerLogout: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const hasLoadedOnce = useRef(false)

  const refreshCustomerUser = useCallback(async () => {
    try {
      const response = await fetch("/api/customer/me", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        setCustomerUser(null)
        return
      }

      const data = await response.json()
      setCustomerUser(data.user ?? null)
    } catch (error) {
      console.error("Failed to load customer session:", error)
      setCustomerUser(null)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      setIsLoading(true)
      await refreshCustomerUser()
      if (isMounted) {
        setIsLoading(false)
        hasLoadedOnce.current = true
      }
    })()
    return () => {
      isMounted = false
    }
  }, [refreshCustomerUser])

  useEffect(() => {
    if (!hasLoadedOnce.current) return
    refreshCustomerUser()
  }, [pathname, refreshCustomerUser])

  const customerLogout = useCallback(async () => {
    try {
      await fetch("/api/customer/logout", { method: "POST", credentials: "include" })
    } catch (error) {
      console.error("Customer logout request failed:", error)
    } finally {
      setCustomerUser(null)
    }
  }, [])

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        isLoading,
        isAuthenticated: !!customerUser,
        refreshCustomerUser,
        customerLogout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider")
  }
  return context
}
