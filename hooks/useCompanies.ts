"use client"

import { useState, useEffect } from 'react'

interface Company {
  _id: string
  code: string
  companyName: string
  city: string
  address: string
  phoneNumber: string
  companyRepresentative: string
  support: string
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCompanies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/company_information?limit=1000')
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      
      const data = await response.json()
      setCompanies(Array.isArray(data) ? data : [data])
    } catch (error: any) {
      console.error('Failed to load companies:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  return {
    companies,
    isLoading,
    error,
    refetch: loadCompanies
  }
}