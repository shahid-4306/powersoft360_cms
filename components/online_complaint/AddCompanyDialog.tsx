

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Building, Loader2, AlertTriangle } from 'lucide-react'
import type { Company } from './CompanySearch'

interface AddCompanyDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (company: Company) => void
}

/**
 * Lets a customer register a company that isn't yet in the system while
 * submitting a complaint, without leaving the complaint registration
 * form. Only Company Name is mandatory here — City, Mobile Number, and
 * Remarks stay optional, and the same duplicate-prevention rules used
 * everywhere else (Admin "Create New Company", XLSX import) are enforced
 * server-side by the same /api/company_information endpoint.
 */
export function AddCompanyDialog({ isOpen, onOpenChange, onCreated }: AddCompanyDialogProps) {
  const [companyName, setCompanyName] = useState('')
  const [city, setCity] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setCompanyName('')
    setCity('')
    setMobileNumber('')
    setRemarks('')
    setError(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!companyName.trim()) {
      setError('Company Name is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/company_information', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: `CMP-${Date.now()}`,
          companyName: companyName.trim(),
          city: city.trim(),
          phoneNumber: mobileNumber.trim(),
          remarks: remarks.trim(),
          address: '',
          support: 'Active',
          designatedDeveloper: 'N/A',
          companyRepresentative: 'N/A',
          softwareInformation: [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add company')
      }

      onCreated(data as Company)
      resetForm()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to add company. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Add Your Company
          </DialogTitle>
          <DialogDescription>
            Can&apos;t find your company in the list? Register it here — only the
            company name is required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-company-name">Company Name *</Label>
            <Input
              id="new-company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-company-city">City</Label>
            <Input
              id="new-company-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-company-mobile">Mobile Number</Label>
            <Input
              id="new-company-mobile"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter mobile number (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-company-remarks">Remarks</Label>
            <Input
              id="new-company-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks (optional)"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 border border-red-200 rounded-md bg-red-50 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Company'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}