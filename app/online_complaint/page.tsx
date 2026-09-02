
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Lock } from 'lucide-react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useCustomerTokenRefresh } from '@/hooks/useCustomerTokenRefresh'
import { VerifiedCompanyInfo, VerifiedCompany } from '@/components/online_complaint/VerifiedCompanyInfo'
import { VerifiedSoftwareTypeInfo } from '@/components/online_complaint/VerifiedSoftwareTypeInfo'
import { FileUpload } from '@/components/online_complaint/FileUpload'
import { SuccessMessage } from '@/components/online_complaint/SuccessMessage'
import { SessionStatus } from '@/components/online_complaint/SessionStatus'

interface FormData {
  selectedCompany: VerifiedCompany | null
  softwareType: string
  contactPerson: string
  contactPhone: string
  complaintRemarks: string
  attachments: File[]
}

export default function OnlineComplaintForm() {
  const router = useRouter()

  const { customerUser, isLoading: customerAuthLoading, customerLogout } = useCustomerAuth()
  const { token, isExpired, refreshToken } = useCustomerTokenRefresh()

  const [formData, setFormData] = useState<FormData>({
    selectedCompany: null,
    softwareType: '',
    contactPerson: '',
    contactPhone: '',
    complaintRemarks: '',
    attachments: [],
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [complaintNumber, setComplaintNumber] = useState('')

  const [companyResolving, setCompanyResolving] = useState(true)
  const [softwareTypeOptions, setSoftwareTypeOptions] = useState<string[]>([])

  // Requirement No. 2: the verified account's own Software Type(s)
  // are resolved against the backend (Administrator-managed Active
  // Software Types), the same backend-driven pattern used for the
  // verified Company above. Supports one or multiple software types.
  const [softwareTypeResolving, setSoftwareTypeResolving] = useState(true)
  const [accountSoftwareTypes, setAccountSoftwareTypes] = useState<string[]>([])

  const [globalSoftwareTypes, setGlobalSoftwareTypes] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true
    fetch('/api/software-types')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        const names = Array.isArray(data.softwareTypes)
          ? data.softwareTypes.map((t: { name: string }) => t.name)
          : []
        setGlobalSoftwareTypes(names)
      })
      .catch(() => {
        if (isMounted) setGlobalSoftwareTypes([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!customerUser) return
    setFormData(prev => ({
      ...prev,
      contactPerson: customerUser.fullName || prev.contactPerson,
      contactPhone: customerUser.phoneNumber || prev.contactPhone,
      softwareType: customerUser.softwareType || prev.softwareType,
    }))
  }, [customerUser])

  const handleCompanyResolved = (company: VerifiedCompany | null, softwareOptions: string[]) => {
    setCompanyResolving(false)
    setFormData(prev => ({
      ...prev,
      selectedCompany: company,
      contactPerson: prev.contactPerson || company?.companyRepresentative || '',
      contactPhone: prev.contactPhone || company?.phoneNumber || '',
    }))
    setSoftwareTypeOptions(softwareOptions)
  }

  const handleSoftwareTypeResolved = (softwareOptions: string[]) => {
    setSoftwareTypeResolving(false)
    setAccountSoftwareTypes(softwareOptions)
  }

  // Priority: the verified account's own backend-resolved software
  // type(s) first, then the verified company's software list, then
  // the global Active software type fallback.
  const effectiveSoftwareOptions =
    accountSoftwareTypes.length > 0
      ? accountSoftwareTypes
      : softwareTypeOptions.length > 0
        ? softwareTypeOptions
        : globalSoftwareTypes
  const softwareResolving = companyResolving || softwareTypeResolving
  const isSingleSoftware = effectiveSoftwareOptions.length === 1 && !softwareResolving

  // Auto-select when only one software exists (single option or global fallback of one)
  useEffect(() => {
    if (isSingleSoftware && formData.softwareType !== effectiveSoftwareOptions[0]) {
      setFormData(prev => ({ ...prev, softwareType: effectiveSoftwareOptions[0] }))
    }
  }, [isSingleSoftware, effectiveSoftwareOptions, formData.softwareType])

  useEffect(() => {
    if (!customerAuthLoading && !customerUser) {
      router.replace('/verify-email?next=/online_complaint')
    }
  }, [customerAuthLoading, customerUser, router])

  useEffect(() => {
    if (customerUser && isExpired) {
      console.log('Customer session expired, redirecting to email verification...')
      customerLogout().finally(() => {
        router.push('/verify-email?next=/online_complaint')
      })
    }
  }, [isExpired, customerUser, customerLogout, router])

  if (customerAuthLoading || !customerUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/15 to-secondary/15 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isExpired) {
    return (
      <SessionStatus
        isLoaded={true}
        isSignedIn={true}
        token={token}
        isExpired={true}
      />
    )
  }

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, attachments: files }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.selectedCompany) {
      alert('Your verified company could not be found. Please contact support.')
      return
    }

    if (!formData.softwareType) {
      alert('Please select software type')
      return
    }

    if (!formData.contactPerson || !formData.contactPhone || !formData.complaintRemarks) {
      alert('Please fill all required fields')
      return
    }

    const freshToken = await refreshToken()
    if (!freshToken) {
      alert('Session expired. Please verify your email again.')
      return
    }

    setSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('company', JSON.stringify(formData.selectedCompany))
      submitData.append('softwareType', formData.softwareType)
      submitData.append('contactPerson', formData.contactPerson)
      submitData.append('contactPhone', formData.contactPhone)
      submitData.append('complaintRemarks', formData.complaintRemarks)
      submitData.append('authorization', freshToken)

      submitData.append('email', customerUser.email || '')
      submitData.append('firstName', customerUser.fullName || '')
      submitData.append('lastName', '')

      formData.attachments.forEach(file => {
        submitData.append('attachments', file)
      })

      const response = await fetch('/api/online-complaints', {
        method: 'POST',
        body: submitData,
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setComplaintNumber(data.complaintNumber)
        setSuccess(true)

        setFormData(prev => ({
          ...prev,
          complaintRemarks: '',
          attachments: [],
        }))
      } else {
        const errorData = await response.json()
        console.error('API Error response:', errorData)
        throw new Error(errorData.error || `Failed to submit complaint: ${response.status}`)
      }
    } catch (error: any) {
      console.error('Error submitting complaint:', error)
      alert(error.message || 'Failed to submit complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <SuccessMessage
        complaintNumber={complaintNumber}
        onNewComplaint={() => setSuccess(false)}
        onReturnToDashboard={() => router.push('/complaint_status')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/15 to-secondary/15 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Register Online Complaint
              </CardTitle>
              <p className="text-muted-foreground">
                Your verified information is filled in automatically. Only the
                complaint details below need your input.
              </p>
              <p className="text-sm text-green-600">
                Welcome, {customerUser.fullName}!
                {token && ' Your session is active.'}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company auto-detected – remains non‑editable */}
                <VerifiedCompanyInfo
                  companyName={customerUser.companyName}
                  onResolved={handleCompanyResolved}
                />

                {/* Software Type – backend-driven, resolved from the
                    verified account (same pattern as Company above) */}
                <VerifiedSoftwareTypeInfo
                  softwareType={customerUser.softwareType}
                  onResolved={handleSoftwareTypeResolved}
                />

                {/* Software Type – conditionally shown */}
                {softwareResolving ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">
                      Software Type *
                    </label>
                    <Input
                      type="text"
                      value="Loading software types..."
                      readOnly
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                ) : isSingleSoftware ? (
                  // Single software: auto-selected, read-only display
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">
                      Software Type *
                    </label>
                    <Input
                      type="text"
                      value={effectiveSoftwareOptions[0]}
                      readOnly
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                ) : (
                  // Multiple software options: dropdown remains
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">
                      Software Type *
                    </label>
                    <select
                      value={formData.softwareType}
                      onChange={(e) => setFormData(prev => ({ ...prev, softwareType: e.target.value }))}
                      className="w-full p-3 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-primary bg-white"
                      required
                    >
                      <option value="">Select Software Type</option>
                      {effectiveSoftwareOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Contact Person – editable */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Contact Person Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>

                {/* Contact Phone – editable */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Contact Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Enter contact phone number"
                    required
                  />
                </div>

                {/* Complaint Remarks – editable */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Complaint Remarks *
                  </label>
                  <Textarea
                    value={formData.complaintRemarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, complaintRemarks: e.target.value }))}
                    placeholder="Describe your complaint in detail..."
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                {/* File Upload – unchanged */}
                <FileUpload onFilesChange={handleFilesChange} />

                {/* Submit Button – unchanged */}
                <Button
                  type="submit"
                  disabled={submitting || companyResolving || softwareResolving}
                  className="w-full py-3 text-lg font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting Complaint...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}