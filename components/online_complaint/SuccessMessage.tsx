'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface SuccessMessageProps {
  complaintNumber: string
  onNewComplaint: () => void
  onReturnToDashboard: () => void
}

export function SuccessMessage({ 
  complaintNumber, 
  onNewComplaint, 
  onReturnToDashboard 
}: SuccessMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/15 to-secondary/15 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Complaint Registered Successfully!
          </h2>
          <p className="text-muted-foreground mb-4">
            Your complaint number <strong>{complaintNumber}</strong> has been sent to your email.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            We will contact you shortly regarding your complaint.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={onNewComplaint}
              className="w-full"
            >
              Submit Another Complaint
            </Button>
            <Button 
              variant="outline" 
              onClick={onReturnToDashboard}
              className="w-full"
            >
              Check Complaint Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}