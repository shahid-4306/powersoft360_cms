
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ThumbsUp,
  RotateCcw,
  Paperclip,
} from 'lucide-react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useToast } from '@/hooks/use-toast'

// --- Types ---
interface ComplaintHistoryEntry {
  action:
    | 'created'
    | 'assigned'
    | 'resolved'
    | 'closed_by_user'
    | 'reopened_by_user'
    | 'admin_closed'
    | 'admin_rejected'
    | 'note'
  status?: string
  by?: string
  byRole?: string
  remarks?: string
  at: string
}

interface ComplaintData {
  complaintNumber: string
  status: 'registered' | 'in-progress' | 'resolved' | 'closed' | 'rejected'
  company: {
    companyName?: string
    name?: string
    city: string
    address: string
  }
  softwareType: string
  contactPerson: string
  contactPhone: string
  complaintRemarks: string
  attachments?: Array<{ fileName: string; fileSize: number }>
  createdAt: string
  updatedAt: string

  assignedTo?: { name: string; role?: { name?: string } } | null
  assignedDate?: string | null
  assignmentRemarks?: string

  // Rejection fields — set when an Administrator rejects an
  // incomplete/invalid complaint from the Task & Complaint Assignment
  // screen.
  adminRejectionRemarks?: string
  rejectedBy?: { id?: string; username?: string; name?: string } | null
  rejectedDate?: string | null

  developerStatus?: string
  resolvedDate?: string | null
  resolutionRemarks?: string
  resolutionAttachments?: Array<{ fileName: string; fileSize: number }>

  closedByUser?: boolean
  closedByUserAt?: string | null
  reopenCount?: number
  lastReopenedAt?: string | null
  lastReopenRemarks?: string

  completionApproved?: boolean
  completionApprovedAt?: string | null
  completionRemarks?: string
  completionRejectionRemarks?: string

  history?: ComplaintHistoryEntry[]
}

const HISTORY_ACTION_LABELS: Record<string, string> = {
  created: 'Complaint Registered',
  assigned: 'Assigned to Support',
  closed_by_user: 'Closed by You (Done)',
  reopened_by_user: 'Re-opened by You',
  admin_closed: 'Closed by Administrator',
  admin_rejected: 'Sent Back by Administrator',
  note: 'Note',
}

const statusConfig = {
  registered: {
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Registered',
    description: 'Your complaint has been registered and is awaiting review.'
  },
  'in-progress': {
    icon: AlertCircle,
    color: 'text-primary bg-accent/30',
    label: 'In Progress',
    description: 'Our team is currently working on your complaint.'
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    label: 'Resolved',
    description: 'Your complaint has been resolved successfully.'
  },
  closed: {
    icon: XCircle,
    color: 'text-muted-foreground bg-muted',
    label: 'Closed ',
    description: 'This complaint has been closed and marked complete.'
  },
  rejected: {
    icon: XCircle,
    color: 'text-destructive bg-destructive/10',
    label: 'Rejected',
    description: 'This complaint was rejected. Please see the reason below and re-submit once corrected.'
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function ComplaintStatusPage() {
  const [complaintNumber, setComplaintNumber] = useState('')
  const [complaint, setComplaint] = useState<ComplaintData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ------------------------------------------------------------------
  // Phone-number search — a second way to look up a complaint,
  // alongside the existing Complaint Number search above. Results are
  // rendered through the same "Remarks Summary - All Complaints" table
  // and detail card already used for the verified-email lookup, so the
  // complete complaint details/status shown are identical either way.
  // ------------------------------------------------------------------
  const [searchMode, setSearchMode] = useState<'complaintNumber' | 'phone'>('complaintNumber')
  const [phoneQuery, setPhoneQuery] = useState('')

  const { customerUser } = useCustomerAuth()
  const [myComplaints, setMyComplaints] = useState<ComplaintData[]>([])
  const [myComplaintsLoading, setMyComplaintsLoading] = useState(false)
  const { toast } = useToast()

  const [showReopenBox, setShowReopenBox] = useState(false)
  const [reopenRemarks, setReopenRemarks] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState<'done' | 'reopen' | null>(null)
  const [actionError, setActionError] = useState('')
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<ComplaintData | null>(null)

  const canActOnComplaint = (c: ComplaintData) =>
    !!customerUser?.email &&
    c.status === 'resolved'

  const refetchComplaint = async (number: string) => {
    const res = await fetch(`/api/complaint-status?complaintNumber=${encodeURIComponent(number)}`)
    if (res.ok) {
      const data = await res.json()
      setComplaint(data)
      setMyComplaints((prev) => prev.map((c) => (c.complaintNumber === number ? data : c)))
    }
  }

  const handleDone = async (targetComplaint: ComplaintData) => {
    setActionSubmitting('done')
    setActionError('')
    try {
      const res = await fetch('/api/complaint-status/action', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintNumber: targetComplaint.complaintNumber, action: 'done' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Failed to close the complaint.')
        return
      }
      toast({ title: 'Complaint closed', description: data.message })
      await refetchComplaint(targetComplaint.complaintNumber)
      setSelectedComplaintForAction(null)
    } catch {
      setActionError('Failed to close the complaint. Please try again.')
    } finally {
      setActionSubmitting(null)
    }
  }

  const handleReopen = async () => {
    if (!selectedComplaintForAction) return
    if (!reopenRemarks.trim()) {
      setActionError('Please explain why the complaint still requires attention.')
      return
    }
    setActionSubmitting('reopen')
    setActionError('')
    try {
      const res = await fetch('/api/complaint-status/action', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintNumber: selectedComplaintForAction.complaintNumber,
          action: 'reopen',
          remarks: reopenRemarks.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Failed to re-open the complaint.')
        return
      }
      toast({ title: 'Complaint re-opened', description: data.message })
      setShowReopenBox(false)
      setReopenRemarks('')
      setSelectedComplaintForAction(null)
      await refetchComplaint(selectedComplaintForAction.complaintNumber)
    } catch {
      setActionError('Failed to re-open the complaint. Please try again.')
    } finally {
      setActionSubmitting(null)
    }
  }

  useEffect(() => {
    if (!customerUser?.email) return

    setMyComplaintsLoading(true)
    fetch(`/api/complaint-status?email=${encodeURIComponent(customerUser.email)}`)
      .then((res) => res.json())
      .then((data) => setMyComplaints(data.complaints || []))
      .catch(() => setMyComplaints([]))
      .finally(() => setMyComplaintsLoading(false))
  }, [customerUser?.email])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchMode === 'phone') {
      return handlePhoneSearch()
    }

    if (!complaintNumber.trim()) {
      setError('Please enter a complaint number')
      return
    }

    setLoading(true)
    setError('')
    setComplaint(null)
    setMyComplaints([])
    setShowReopenBox(false)
    setReopenRemarks('')
    setActionError('')

    try {
      const response = await fetch(`/api/complaint-status?complaintNumber=${encodeURIComponent(complaintNumber)}`)
      
      if (response.ok) {
        const data = await response.json()
        setComplaint(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Complaint not found')
      }
    } catch (err) {
      setError('Failed to fetch complaint status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Search by the phone number provided during complaint registration.
  // Returns every complaint tied to that number and shows the same
  // complete details/status as the Complaint Number search.
  const handlePhoneSearch = async () => {
    const digitsOnly = phoneQuery.replace(/\D/g, '')

    if (!digitsOnly) {
      setError('Please enter the phone number used when registering the complaint')
      return
    }

    setLoading(true)
    setError('')
    setComplaint(null)
    setMyComplaints([])
    setShowReopenBox(false)
    setReopenRemarks('')
    setActionError('')

    try {
      const response = await fetch(`/api/complaint-status?phone=${encodeURIComponent(digitsOnly)}`)
      const data = await response.json()

      if (response.ok) {
        const results: ComplaintData[] = data.complaints || []
        setMyComplaints(results)
        // If there's exactly one match, surface its full details
        // immediately, same as a direct Complaint Number search.
        if (results.length === 1) {
          setComplaint(results[0])
        }
      } else {
        setError(data.error || 'No complaints found for this phone number.')
      }
    } catch (err) {
      setError('Failed to fetch complaint status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Helper to extract the last user remark (from history)
  const getUserRemark = (c: ComplaintData): string => {
    const history = c.history || []
    const userEntry = history
      .slice()
      .reverse()
      .find((e) =>
        ['closed_by_user', 'reopened_by_user'].includes(e.action) && e.remarks
      )
    if (userEntry?.remarks) return userEntry.remarks
    return c.complaintRemarks || ''
  }

  // Developer remark is the resolution remarks
  const getDeveloperRemark = (c: ComplaintData): string => {
    return c?.resolutionRemarks || ''
  }

  const StatusIcon = complaint ? statusConfig[complaint.status].icon : Clock
  const statusColor = complaint ? statusConfig[complaint.status].color : ''
  const statusLabel = complaint ? statusConfig[complaint.status].label : ''
  const statusDescription = complaint ? statusConfig[complaint.status].description : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/15 to-secondary/15 py-8 px-4">
      <div className="max-w-9xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
            <CardTitle className="text-3xl font-bold">
              Welcome to Powersoft360
            </CardTitle>
            <p className="text-primary-foreground/80 text-lg">
              Complaint Status Check Portal
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Search Section */}
            <div className="mb-8">
              {/* Search mode toggle — Complaint Number vs Phone Number */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={searchMode === 'complaintNumber' ? 'default' : 'outline'}
                  onClick={() => {
                    setSearchMode('complaintNumber')
                    setError('')
                  }}
                  className={searchMode === 'complaintNumber' ? 'bg-primary hover:bg-primary/90' : ''}
                >
                  Search by Complaint Number
                </Button>
                <Button
                  type="button"
                  variant={searchMode === 'phone' ? 'default' : 'outline'}
                  onClick={() => {
                    setSearchMode('phone')
                    setError('')
                  }}
                  className={searchMode === 'phone' ? 'bg-primary hover:bg-primary/90' : ''}
                >
                  Search by Phone Number
                </Button>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                {searchMode === 'complaintNumber' ? (
                  <div>
                    <label htmlFor="complaintNumber" className="block text-sm font-medium text-foreground/80 mb-2">
                      Enter Your Complaint Number
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="complaintNumber"
                        type="text"
                        value={complaintNumber}
                        onChange={(e) => setComplaintNumber(e.target.value.toUpperCase())}
                        placeholder="e.g., COMP-1234567890"
                        className="flex-1 text-lg uppercase"
                        disabled={loading}
                      />
                      <Button 
                        type="submit" 
                        disabled={loading || !complaintNumber.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="phoneQuery" className="block text-sm font-medium text-foreground/80 mb-2">
                      Enter the Phone Number Used at Registration
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="phoneQuery"
                        type="tel"
                        inputMode="numeric"
                        value={phoneQuery}
                        onChange={(e) => setPhoneQuery(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="e.g., 03001234567"
                        maxLength={11}
                        className="flex-1 text-lg"
                        disabled={loading}
                      />
                      <Button
                        type="submit"
                        disabled={loading || !phoneQuery.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Searched Complaint — full details, retrieved dynamically
                from the database via /api/complaint-status, exactly as
                the customer originally submitted, plus the current
                real-time status. */}
            {complaint && (
              <div className="mb-8 space-y-4 animate-in fade-in duration-500">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Complaint: {complaint.complaintNumber}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Submitted: {formatDateTime(complaint.createdAt)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusColor}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold">{statusLabel}</span>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-accent/15 rounded-lg">
                      <p className="text-secondary">{statusDescription}</p>
                    </div>

                    {/* Rejection reason — shown only when the complaint
                        was rejected by an Administrator. */}
                    {complaint.status === 'rejected' && complaint.adminRejectionRemarks && (
                      <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-sm font-semibold text-destructive mb-1">Rejection Reason</p>
                        <p className="text-sm text-destructive/90">{complaint.adminRejectionRemarks}</p>
                        {complaint.rejectedDate && (
                          <p className="text-xs text-destructive/70 mt-2">
                            Rejected on {formatDateTime(complaint.rejectedDate)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Exactly what the user submitted at registration time */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Submitted Complaint Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Company</p>
                        <p className="font-medium text-foreground">
                          {complaint.company?.companyName || complaint.company?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Software Type</p>
                        <p className="font-medium text-foreground">{complaint.softwareType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contact Person</p>
                        <p className="font-medium text-foreground">{complaint.contactPerson || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contact Phone</p>
                        <p className="font-medium text-foreground">{complaint.contactPhone || 'N/A'}</p>
                      </div>
                      {(complaint.company?.city || complaint.company?.address) && (
                        <div className="sm:col-span-2">
                          <p className="text-muted-foreground">Company Location</p>
                          <p className="font-medium text-foreground">
                            {[complaint.company?.address, complaint.company?.city].filter(Boolean).join(', ') || 'N/A'}
                          </p>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground">Complaint / Problem Description</p>
                        <p className="font-medium text-foreground whitespace-pre-wrap break-words">
                          {complaint.complaintRemarks || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current working / progress — assignment & resolution,
                    reflecting real-time database state. */}
                {(complaint.assignedTo || complaint.resolutionRemarks || complaint.developerStatus) && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4">Current Progress</h4>
                      <div className="space-y-3 text-sm">
                        {complaint.assignedTo?.name && (
                          <div>
                            <p className="text-muted-foreground">Assigned To</p>
                            <p className="font-medium text-foreground">
                              {complaint.assignedTo.name}
                              {complaint.assignedTo.role?.name ? ` (${complaint.assignedTo.role.name})` : ''}
                            </p>
                            {complaint.assignedDate && (
                              <p className="text-xs text-muted-foreground">
                                Assigned on {formatDateTime(complaint.assignedDate)}
                              </p>
                            )}
                          </div>
                        )}
                        {complaint.assignmentRemarks && (
                          <div>
                            <p className="text-muted-foreground">Assignment Note</p>
                            <p className="font-medium text-foreground">{complaint.assignmentRemarks}</p>
                          </div>
                        )}
                        {complaint.resolutionRemarks && (
                          <div>
                            <p className="text-muted-foreground">Resolution Remarks</p>
                            <p className="font-medium text-foreground">{complaint.resolutionRemarks}</p>
                            {complaint.resolvedDate && (
                              <p className="text-xs text-muted-foreground">
                                Resolved on {formatDateTime(complaint.resolvedDate)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Your Complaints (verified email flow) */}
            {customerUser && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  Your Complaints ({customerUser.email})
                </h4>

                {myComplaintsLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your complaints...
                  </div>
                )}

                {!myComplaintsLoading && myComplaints.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t submitted any complaints with this email yet.
                  </p>
                )}

                
              </div>
            )}

            
            {/* ==================== ALL COMPLAINTS REMARKS SUMMARY ==================== */}
            {myComplaints.length > 0 && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4">
                    Remarks Summary - All Complaints
                  </h4>
                  <div className="overflow-x-auto">
                    <Table className="table-fixed w-full text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[12%] text-center text-xs font-semibold py-3">Complaint Code</TableHead>
                          <TableHead className="w-[10%] text-center text-xs font-semibold py-3">Date</TableHead>
                          <TableHead className="w-[10%] text-center text-xs font-semibold py-3">Status</TableHead>
                          <TableHead className="w-[22%] text-center text-xs font-semibold py-3">Client Remark</TableHead>
                          <TableHead className="w-[22%] text-center text-xs font-semibold py-3">Developer Remark</TableHead>
                          <TableHead className="w-[10%] text-center text-xs font-semibold py-3">Software</TableHead>
                          <TableHead className="w-[14%] text-center text-xs font-semibold py-3">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myComplaints.map((c) => {
                          const cfg = statusConfig[c.status]
                          const StatusIconComp = cfg.icon
                          const showActions = canActOnComplaint(c) || c.status === 'resolved'
                          
                          return (
                            <TableRow key={c.complaintNumber} className="hover:bg-muted/50">
                              <TableCell className="text-center text-xs py-2">
                                <button
                                  onClick={() => {
                                    setComplaint(c)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }}
                                  className="font-medium text-primary hover:text-primary hover:underline"
                                >
                                  {c.complaintNumber}
                                </button>
                              </TableCell>
                              <TableCell className="text-center text-xs py-2 text-muted-foreground">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-center text-xs py-2">
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${cfg.color}`}>
                                  <StatusIconComp className="w-3 h-3" />
                                  <span className="font-semibold">{cfg.label}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs py-2 align-top">
                                <div className="break-words whitespace-normal max-h-20 overflow-y-auto px-1 text-foreground/80">
                                  {getUserRemark(c) || <span className="text-muted-foreground/70 italic">—</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs py-2 align-top">
                                <div className="break-words whitespace-normal max-h-20 overflow-y-auto px-1 text-foreground/80">
                                  {getDeveloperRemark(c) || <span className="text-muted-foreground/70 italic">—</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-xs py-2 text-muted-foreground">
                                {c.softwareType}
                              </TableCell>
                              <TableCell className="text-center py-2">
                                {showActions ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    {c.status === 'resolved' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleDone(c)}
                                        disabled={actionSubmitting !== null}
                                        className="bg-green-600 hover:bg-green-700 h-6 px-1.5 text-[10px]"
                                      >
                                        {actionSubmitting === 'done' ? (
                                          <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />
                                        ) : (
                                          <ThumbsUp className="w-2.5 h-2.5 mr-0.5" />
                                        )}
                                        Done
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedComplaintForAction(c)
                                        setShowReopenBox(true)
                                        setActionError('')
                                        setReopenRemarks('')
                                      }}
                                      disabled={actionSubmitting !== null}
                                      className="h-6 px-1.5 text-[10px]"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
                                      Re-open
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/70 text-xs italic">No actions</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Re-open dialog */}
            {showReopenBox && selectedComplaintForAction && (
              <Card className="border-2 border-primary/25 mt-4">
                <CardContent className="p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">
                    Re-open Complaint: {selectedComplaintForAction.complaintNumber}
                  </h4>
                  {actionError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {actionError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="reopenRemarks" className="text-sm font-medium text-foreground/80">
                      Please explain why the complaint still requires attention{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="reopenRemarks"
                      value={reopenRemarks}
                      onChange={(e) => setReopenRemarks(e.target.value)}
                      placeholder="Describe what's still wrong or unresolved..."
                      rows={4}
                      disabled={actionSubmitting !== null}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReopen}
                        disabled={actionSubmitting !== null || !reopenRemarks.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {actionSubmitting === 'reopen' && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Submit Re-open Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReopenBox(false)
                          setSelectedComplaintForAction(null)
                          setReopenRemarks('')
                          setActionError('')
                        }}
                        disabled={actionSubmitting !== null}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments summary */}
            {complaint && ((complaint.attachments && complaint.attachments.length > 0) ||
              (complaint.resolutionAttachments && complaint.resolutionAttachments.length > 0)) && (
              <Card className="mt-4">
                <CardContent className="p-6 space-y-3">
                  <h4 className="text-lg font-semibold text-foreground">Attachments</h4>
                  {complaint.attachments && complaint.attachments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground/80 mb-1">Submitted with complaint</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {complaint.attachments.map((a, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Paperclip className="w-3.5 h-3.5" /> {a.fileName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {complaint.resolutionAttachments && complaint.resolutionAttachments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground/80 mb-1">Attached with resolution</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {complaint.resolutionAttachments.map((a, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Paperclip className="w-3.5 h-3.5" /> {a.fileName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Confirmation banner once closed by user */}
            {complaint && complaint.status === 'closed' && complaint.closedByUser && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                You confirmed this resolution on {formatDateTime(complaint.closedByUserAt)}. This complaint is
                now Closed and Complete.
              </div>
            )}

            {/* Support Information */}
            <Card className="bg-gradient-to-r from-green-50 to-accent/20 mt-4">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">Need Help?</h4>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about your complaint status, please contact our support team.
                </p>
                <div className="flex space-x-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> support@powersoft360.com
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> +92 321 6439416
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            {!complaint && !error && !loading && myComplaints.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Check Your Complaint Status
                </h3>
                <p className="text-muted-foreground">
                  Enter your complaint number above to view the current status and details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}