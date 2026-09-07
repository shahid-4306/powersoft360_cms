"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Loader2, AlertTriangle, Mail } from "lucide-react"

interface RejectComplaintDialogProps {
  isOpen: boolean
  onClose: () => void
  complaint: any
  remarks: string
  isRejecting: boolean
  onRemarksChange: (remarks: string) => void
  onReject: () => void
}

export function RejectComplaintDialog({
  isOpen,
  onClose,
  complaint,
  remarks,
  isRejecting,
  onRemarksChange,
  onReject,
}: RejectComplaintDialogProps) {
  const companyName = complaint?.company?.companyName || complaint?.company?.name || "N/A"
  const submitterEmail = complaint?.submitterEmail || "N/A"
  const trimmedRemarks = remarks.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            Reject Complaint
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {complaint
              ? `Reject complaint ${complaint.complaintNumber || ""}. The reason you provide will be emailed to the customer.`
              : "Reject this complaint"}
          </DialogDescription>
        </DialogHeader>

        {complaint && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-3 text-xs sm:text-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground break-all">{submitterEmail}</span>
              </div>
              {complaint.complaintRemarks && (
                <p className="text-muted-foreground pt-1 border-t mt-1.5">
                  {complaint.softwareType ? `${complaint.softwareType}: ` : ""}
                  {complaint.complaintRemarks}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reject-remarks" className="text-xs sm:text-sm font-medium">
                Rejection Reason / Remarks <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-remarks"
                value={remarks}
                onChange={(e) => onRemarksChange(e.target.value)}
                placeholder="Explain why this complaint is being rejected (e.g. incomplete details, invalid issue, duplicate submission)..."
                rows={4}
                className="w-full text-xs sm:text-sm"
              />
              {!trimmedRemarks && (
                <p className="text-[11px] text-muted-foreground">
                  Remarks are mandatory — this will be sent to the customer's email.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={onReject}
                variant="destructive"
                className="flex-1 text-xs sm:text-sm py-2"
                disabled={isRejecting || !trimmedRemarks}
              >
                {isRejecting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rejecting...
                  </div>
                ) : (
                  "Reject Complaint"
                )}
              </Button>
              <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm py-2" disabled={isRejecting}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
