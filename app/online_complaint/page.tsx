
'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, PlusCircle, Search } from 'lucide-react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { CompanySearch } from '@/components/online_complaint/CompanySearch'
import type { Company } from '@/components/online_complaint/CompanySearch'
import { AddCompanyDialog } from '@/components/online_complaint/AddCompanyDialog'
import { VerifiedSoftwareTypeInfo } from '@/components/online_complaint/VerifiedSoftwareTypeInfo'
import { FileUpload } from '@/components/online_complaint/FileUpload'
import { SuccessMessage } from '@/components/online_complaint/SuccessMessage'

interface FormData {
  selectedCompany: Company | null
  softwareType: string
  complaintType: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  complaintRemarks: string
  attachments: File[]
}

const EMPTY_FORM: FormData = {
  selectedCompany: null,
  softwareType: '',
  complaintType: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  complaintRemarks: '',
  attachments: [],
}

// Builds a lightweight Company-shaped object for a name the user typed
// manually (i.e. not chosen from the CompanySearch dropdown). Downstream
// code (validation, contact prefill, submit payload) treats this exactly
// like a normal selected company.
function makeManualCompany(name: string): Company {
  return {
    companyName: name,
    isManualEntry: true,
  } as Company & { isManualEntry: boolean }
}

export default function OnlineComplaintForm() {
  const router = useRouter()

  const { customerUser, isLoading: customerAuthLoading } = useCustomerAuth()

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  // ------------------------------------------------------------------
  // Contact phone validation — must start with "03" and be exactly 11
  // digits (e.g. 03001234567). Shown inline under the field; also
  // re-checked in handleSubmit as a hard gate before the API call.
  // ------------------------------------------------------------------
  const [phoneError, setPhoneError] = useState('')
  const isValidPakistaniPhone = (value: string) => /^03\d{9}$/.test(value)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [complaintNumber, setComplaintNumber] = useState('')

  const [fileUploadKey, setFileUploadKey] = useState(0)

  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false)

  const [softwareTypeResolving, setSoftwareTypeResolving] = useState(true)
  const [accountSoftwareTypes, setAccountSoftwareTypes] = useState<string[]>([])

  const [globalSoftwareTypes, setGlobalSoftwareTypes] = useState<string[]>([])

  // Complaint Type — managed by the Administrator from Dashboard →
  // Complaint Types. Fetched once on mount, same pattern as software
  // types above, so any type the Administrator creates is immediately
  // available here without a code change.
  const [complaintTypeOptions, setComplaintTypeOptions] = useState<string[]>([])
  const [complaintTypeLoading, setComplaintTypeLoading] = useState(true)

  // Manual company entry state
  const [manualCompanyText, setManualCompanyText] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const manualEntryActiveRef = useRef(false)

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
    let isMounted = true
    setComplaintTypeLoading(true)
    fetch('/api/complaint-types')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        const names = Array.isArray(data.complaintTypes)
          ? data.complaintTypes.map((t: { name: string }) => t.name)
          : []
        setComplaintTypeOptions(names)
      })
      .catch(() => {
        if (isMounted) setComplaintTypeOptions([])
      })
      .finally(() => {
        if (isMounted) setComplaintTypeLoading(false)
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
      contactEmail: customerUser.email || prev.contactEmail,
    }))
  }, [customerUser])

  useEffect(() => {
    if (!customerUser?.companyName) return
    let isMounted = true

    const firstName = customerUser.companyName.split(',')[0]?.trim()
    if (!firstName) return

    fetch(`/api/company_information?search=${encodeURIComponent(firstName)}&limit=10`)
      .then(res => (res.ok ? res.json() : []))
      .then((data: Company[]) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return
        const normalized = (n: string) => n.trim().toLowerCase()
        const exact = data.find(c => normalized(c.companyName) === normalized(firstName)) || data[0]
        setFormData(prev => (prev.selectedCompany ? prev : { ...prev, selectedCompany: exact }))
      })
      .catch(() => {
        /* Non-fatal: the user can still pick their company manually. */
      })

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerUser?.companyName])

  const handleSoftwareTypeResolved = (softwareOptions: string[]) => {
    setSoftwareTypeResolving(false)
    setAccountSoftwareTypes(softwareOptions)
  }

  useEffect(() => {
    if (customerAuthLoading) return
    if (!customerUser?.softwareType) {
      setSoftwareTypeResolving(false)
    }
  }, [customerAuthLoading, customerUser])

  const companySoftwareOptions = useMemo(() => {
    const info = formData.selectedCompany?.softwareInformation
    if (!Array.isArray(info)) return []
    return Array.from(new Set(info.map(s => s.softwareType).filter((t): t is string => Boolean(t))))
  }, [formData.selectedCompany])

  const effectiveSoftwareOptions =
    accountSoftwareTypes.length > 0
      ? accountSoftwareTypes
      : companySoftwareOptions.length > 0
        ? companySoftwareOptions
        : globalSoftwareTypes
  const softwareResolving = softwareTypeResolving
  const isSingleSoftware = effectiveSoftwareOptions.length === 1 && !softwareResolving

  useEffect(() => {
    if (isSingleSoftware && formData.softwareType !== effectiveSoftwareOptions[0]) {
      setFormData(prev => ({ ...prev, softwareType: effectiveSoftwareOptions[0] }))
    }
  }, [isSingleSoftware, effectiveSoftwareOptions, formData.softwareType])

  if (customerAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/15 to-secondary/15 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, attachments: files }))
  }

  const handleCompanySelect = (company: Company) => {
    // A real selection from the list always wins over manual text.
    manualEntryActiveRef.current = false
    setManualCompanyText('')
    setShowManualInput(false)
    setFormData(prev => ({
      ...prev,
      selectedCompany: company,
      contactPerson: prev.contactPerson || company?.companyRepresentative || '',
      contactPhone: prev.contactPhone || company?.phoneNumber || '',
    }))
  }

  const handleCompanyCreated = (company: Company) => {
    manualEntryActiveRef.current = false
    setManualCompanyText('')
    setShowManualInput(false)
    setFormData(prev => ({
      ...prev,
      selectedCompany: company,
      contactPerson: prev.contactPerson || company?.companyRepresentative || '',
      contactPhone: prev.contactPhone || company?.phoneNumber || '',
    }))
  }

  // Handle manual company text input
  const handleManualCompanyTextChange = (value: string) => {
    manualEntryActiveRef.current = true
    setManualCompanyText(value)
    // If they clear the box, drop any manual company we'd set.
    if (!value.trim() && formData.selectedCompany?.isManualEntry) {
      setFormData(prev => ({ ...prev, selectedCompany: null }))
    }
  }

  // Commit manual company on blur
  const commitManualCompanyIfNeeded = () => {
    const text = manualCompanyText.trim()
    if (!text) {
      manualEntryActiveRef.current = false
      return
    }
    
    // Create manual company object
    const manualCompany = makeManualCompany(text)
    setFormData(prev => ({
      ...prev,
      selectedCompany: manualCompany,
    }))
    manualEntryActiveRef.current = false
  }

  // Switch to manual input mode
  const handleAddNewCompany = () => {
    setShowManualInput(true)
    setManualCompanyText('')
    manualEntryActiveRef.current = true
    setFormData(prev => ({ ...prev, selectedCompany: null }))
  }

  // Cancel manual input and go back to search
  const handleBackToSearch = () => {
    setShowManualInput(false)
    setManualCompanyText('')
    manualEntryActiveRef.current = false
    setFormData(prev => ({ ...prev, selectedCompany: null }))
  }

  const handleCancel = () => {
    manualEntryActiveRef.current = false
    setManualCompanyText('')
    setShowManualInput(false)
    setFormData(prev => ({
      ...EMPTY_FORM,
      contactPerson: customerUser?.fullName || '',
      contactPhone: customerUser?.phoneNumber || '',
      contactEmail: customerUser?.email || '',
    }))
    setPhoneError('')
    setFileUploadKey(k => k + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If in manual mode, commit the text first
    if (showManualInput && manualCompanyText.trim()) {
      const manualCompany = makeManualCompany(manualCompanyText.trim())
      setFormData(prev => ({ ...prev, selectedCompany: manualCompany }))
    }

    // Get the final company selection
    let company = formData.selectedCompany
    
    // If manual text exists but not committed (shouldn't happen normally)
    if (!company && manualCompanyText.trim()) {
      company = makeManualCompany(manualCompanyText.trim())
      setFormData(prev => ({ ...prev, selectedCompany: company }))
    }

    if (!company || !company.companyName?.trim()) {
      alert('Please select your company, or type its name if it is not listed.')
      return
    }

    if (!formData.softwareType) {
      alert('Please select software type')
      return
    }

    if (!formData.complaintType) {
      alert('Please select complaint type')
      return
    }

    if (!formData.contactPerson || !formData.contactPhone || !formData.contactEmail || !formData.complaintRemarks) {
      alert('Please fill all required fields')
      return
    }

    if (!isValidPakistaniPhone(formData.contactPhone.trim())) {
      setPhoneError('Phone number must start with 03 and contain exactly 11 digits (e.g. 03001234567).')
      return
    }

    setSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('company', JSON.stringify(company))
      submitData.append('softwareType', formData.softwareType)
      submitData.append('complaintType', formData.complaintType)
      submitData.append('contactPerson', formData.contactPerson)
      submitData.append('contactPhone', formData.contactPhone)
      submitData.append('complaintRemarks', formData.complaintRemarks)

      submitData.append('email', formData.contactEmail || '')
      submitData.append('firstName', customerUser?.fullName || formData.contactPerson || '')
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
        setFileUploadKey(k => k + 1)
        setShowManualInput(false)
        setManualCompanyText('')
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
                Select your company, choose the software, and describe your issue below.
              </p>
              {customerUser && (
                <p className="text-sm text-green-600">
                  Welcome, {customerUser.fullName}!
                </p>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company field - Single field with search and add functionality */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    Company *
                  </label>
                  
                  {!showManualInput ? (
                    <>
                      <CompanySearch
                        onCompanySelect={handleCompanySelect}
                        selectedCompany={formData.selectedCompany}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCompany}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Can&apos;t find your company? Add it manually
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={manualCompanyText}
                        onChange={(e) => handleManualCompanyTextChange(e.target.value)}
                        onBlur={commitManualCompanyIfNeeded}
                        placeholder="Enter company name"
                        className="text-sm"
                        autoFocus
                        required
                      />
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleBackToSearch}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          ← Back to company search
                        </button>
                        {manualCompanyText.trim() && (
                          <span className="text-xs text-green-600">
                            ✓ Company will be added
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {customerUser?.softwareType && (
                  <VerifiedSoftwareTypeInfo
                    softwareType={customerUser.softwareType}
                    onResolved={handleSoftwareTypeResolved}
                  />
                )}

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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Complaint Type *
                  </label>
                  <select
                    value={formData.complaintType}
                    onChange={(e) => setFormData(prev => ({ ...prev, complaintType: e.target.value }))}
                    className="w-full p-3 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-primary bg-white"
                    required
                    disabled={complaintTypeLoading}
                  >
                    <option value="">
                      {complaintTypeLoading ? "Loading complaint types..." : "Select Complaint Type"}
                    </option>
                    {complaintTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Contact Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => {
                      // Digits only, capped at 11 characters (e.g. 03001234567)
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11)
                      setFormData(prev => ({ ...prev, contactPhone: digitsOnly }))
                      if (!digitsOnly) {
                        setPhoneError('')
                      } else if (!isValidPakistaniPhone(digitsOnly)) {
                        setPhoneError('Phone number must start with 03 and contain exactly 11 digits (e.g. 03001234567).')
                      } else {
                        setPhoneError('')
                      }
                    }}
                    onBlur={() => {
                      if (formData.contactPhone && !isValidPakistaniPhone(formData.contactPhone)) {
                        setPhoneError('Phone number must start with 03 and contain exactly 11 digits (e.g. 03001234567).')
                      }
                    }}
                    placeholder="e.g., 03001234567"
                    inputMode="numeric"
                    maxLength={11}
                    aria-invalid={!!phoneError}
                    className={phoneError ? 'border-destructive focus-visible:ring-destructive' : ''}
                    required
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

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

                <FileUpload key={fileUploadKey} onFilesChange={handleFilesChange} />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={submitting || softwareResolving}
                    className="flex-1 py-3 text-lg font-medium"
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
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={handleCancel}
                    className="py-3 text-lg font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AddCompanyDialog
        isOpen={isAddCompanyOpen}
        onOpenChange={setIsAddCompanyOpen}
        onCreated={handleCompanyCreated}
      />
    </div>
  )
}