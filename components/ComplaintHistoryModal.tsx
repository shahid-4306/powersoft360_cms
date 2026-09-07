"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  History,
  Loader2,
  Mail,
  Building,
  AlertCircle,
  Inbox,
  ArrowLeft,
} from "lucide-react"

interface ComplaintHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = "email" | "list"

function getStatusBadge(status: string) {
  switch ((status || "").toLowerCase()) {
    case "registered":
      return <Badge className="bg-purple-600 text-xs">Registered</Badge>
    case "in-progress":
      return <Badge className="bg-primary text-xs">In Progress</Badge>
    case "resolved":
      return <Badge className="bg-green-600 text-xs">Resolved</Badge>
    case "closed":
      return <Badge variant="outline" className="text-xs">Closed</Badge>
    case "rejected":
      return <Badge variant="destructive" className="text-xs">Rejected</Badge>
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}

export function ComplaintHistoryModal({ isOpen, onClose }: ComplaintHistoryModalProps) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [complaints, setComplaints] = useState<any[]>([])

  const resetState = () => {
    setStep("email")
    setEmail("")
    setMessage(null)
    setComplaints([])
    setIsVerifying(false)
    setIsLoadingHistory(false)
  }

  const handleClose = () => {
    onClose()
    setTimeout(resetState, 300)
  }

  const handleVerifyAndFetch = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setMessage("Please enter your registered email address.")
      return
    }

    setIsVerifying(true)
    setMessage(null)

    try {
      // Step 1 — verify this email belongs to a registered, approved
      // account. Only an approved/verified account may view history.
      const verifyRes = await fetch("/api/customer/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
        credentials: "include",
      })
      const verifyData = await verifyRes.json().catch(() => ({}))

      if (verifyData?.status !== "approved") {
        setMessage(
          verifyData?.message ||
            "This email is not a verified/registered account. Please register or wait for approval.",
        )
        setIsVerifying(false)
        return
      }

      // Step 2 — fetch this exact email's complaint history using the
      // existing, unmodified Complaint Status lookup-by-email endpoint.
      setIsLoadingHistory(true)
      const historyRes = await fetch(
        `/api/complaint-status?email=${encodeURIComponent(trimmedEmail)}`,
        { credentials: "include" },
      )
      const historyData = await historyRes.json().catch(() => ({}))

      if (!historyRes.ok) {
        setMessage(historyData?.error || "Failed to load complaint history.")
        setStep("email")
        return
      }

      setComplaints(Array.isArray(historyData?.complaints) ? historyData.complaints : [])
      setStep("list")
    } catch (error) {
      console.error("Complaint history lookup failed:", error)
      setMessage("Something went wrong while verifying your email. Please try again.")
    } finally {
      setIsVerifying(false)
      setIsLoadingHistory(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            Complaint History
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {step === "email"
              ? "Enter your registered & verified email to view your complaint history."
              : `Showing complaints submitted with ${email.trim().toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>

        {step === "email" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="history-email" className="text-xs sm:text-sm font-medium">
                Registered Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="history-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyAndFetch()}
                  placeholder="you@company.com"
                  className="pl-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            {message && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs sm:text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <Button
              onClick={handleVerifyAndFetch}
              disabled={isVerifying || isLoadingHistory}
              className="w-full text-xs sm:text-sm py-2"
            >
              {isVerifying || isLoadingHistory ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLoadingHistory ? "Loading history..." : "Verifying..."}
                </span>
              ) : (
                "View My Complaint History"
              )}
            </Button>
          </div>
        )}

        {step === "list" && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs -ml-2"
              onClick={() => {
                setStep("email")
                setComplaints([])
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Search another email
            </Button>

            {complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No complaints found for this email yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {complaints.map((complaint: any) => (
                  <div
                    key={complaint.complaintNumber}
                    className="rounded-lg border p-3 space-y-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono font-semibold">{complaint.complaintNumber}</span>
                      {getStatusBadge(complaint.status)}
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {complaint.company?.companyName || complaint.company?.name || "N/A"}
                      </span>
                    </div>

                    {complaint.softwareType && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Software:</span>{" "}
                        {complaint.softwareType}
                      </p>
                    )}

                    {complaint.complaintRemarks && (
                      <p className="text-muted-foreground line-clamp-2">
                        {complaint.complaintRemarks}
                      </p>
                    )}

                    {complaint.status === "rejected" && complaint.adminRejectionRemarks && (
                      <div className="rounded-md bg-destructive/5 border border-destructive/20 p-2 text-destructive">
                        <span className="font-medium">Rejection reason: </span>
                        {complaint.adminRejectionRemarks}
                      </div>
                    )}

                    {complaint.assignedTo?.name && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Assigned to:</span>{" "}
                        {complaint.assignedTo.name}
                        {complaint.assignmentRemarks ? ` — ${complaint.assignmentRemarks}` : ""}
                      </p>
                    )}

                    {complaint.resolutionRemarks && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Resolution:</span>{" "}
                        {complaint.resolutionRemarks}
                      </p>
                    )}

                    <p className="text-[11px] text-muted-foreground/80">
                      Submitted:{" "}
                      {complaint.createdAt
                        ? new Date(complaint.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
