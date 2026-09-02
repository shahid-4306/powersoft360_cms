import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface SoftwareInfo {
  softwareType: string
  version: string
  lastUpdated: string
}

interface Company {
  _id?: string
  code: string
  companyName: string
  city: string
  phoneNumber: string
  address: string
  support: string
  designatedDeveloper: string
  companyRepresentative: string
  softwareInformation: SoftwareInfo[]
  createdAt?: string
  createdBy?: string
}

export const useCompanyInformation = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/company_information")
      if (!response.ok) throw new Error("Failed to fetch companies")
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const createCompany = async (companyData: Omit<Company, '_id'>) => {
    try {
      const response = await fetch("/api/company_information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create company")
      }

      const newCompany = await response.json()
      setCompanies(prev => [...prev, newCompany])
      return newCompany
    } catch (error: any) {
      throw new Error(error.message || "Failed to create company")
    }
  }

  const updateCompany = async (id: string, companyData: Partial<Company>) => {
    try {
      const response = await fetch(`/api/company_information/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update company")
      }

      const updatedCompany = await response.json()
      setCompanies(prev => prev.map(company => company._id === updatedCompany._id ? updatedCompany : company))
      return updatedCompany
    } catch (error: any) {
      throw new Error(error.message || "Failed to update company")
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      const response = await fetch(`/api/company_information/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete company")
      }

      setCompanies(prev => prev.filter(company => company._id !== id))
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete company")
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  return {
    companies,
    isLoading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies,
  }
}