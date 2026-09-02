import { useState, useEffect, useCallback } from 'react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'

export function useCustomerTokenRefresh() {
  const { customerUser, isLoading } = useCustomerAuth()
  const [token, setToken] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/customer/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setIsExpired(false)

        localStorage.setItem('customer_jwt_token', data.token)
        localStorage.setItem('customer_token_timestamp', Date.now().toString())

        return data.token
      } else {
        throw new Error('Failed to refresh customer token')
      }
    } catch (error) {
      console.error('Error refreshing customer token:', error)
      setIsExpired(true)
      return null
    }
  }, [])

  const getStoredToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null

    const storedToken = localStorage.getItem('customer_jwt_token')
    const tokenTimestamp = localStorage.getItem('customer_token_timestamp')

    if (!storedToken || !tokenTimestamp) return null

    const timeElapsed = Date.now() - parseInt(tokenTimestamp)
    if (timeElapsed > 9 * 60 * 1000) {
      setIsExpired(true)
      return null
    }

    return storedToken
  }, [])

  useEffect(() => {
    if (!isLoading && customerUser) {
      const storedToken = getStoredToken()
      if (storedToken) {
        setToken(storedToken)
      } else {
        refreshToken()
      }

      const refreshInterval = setInterval(refreshToken, 8 * 60 * 1000)
      return () => clearInterval(refreshInterval)
    }
  }, [isLoading, customerUser, refreshToken, getStoredToken])

  return {
    token,
    refreshToken,
    isExpired,
  }
}
