import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

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
  softwareInformation: any[]
  createdAt?: string
  createdBy?: string
}

export const useCompanyStream = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const eventSource = new EventSource("/api/company_information/stream")

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setCompanies(data)
      } catch (error) {
        console.error("Error parsing SSE data:", error)
      }
    }

    eventSource.onerror = () => {
      console.error("SSE connection error")
      toast({
        title: "Connection Error",
        description: "Failed to maintain real-time updates. Retrying...",
        variant: "destructive",
      })
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [toast])

  return companies
}