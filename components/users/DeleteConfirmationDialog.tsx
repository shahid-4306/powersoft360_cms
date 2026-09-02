"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isLoading: boolean
  title: string
  description: string
  type: "user" | "role" | "company" | "project" | "task"
}

export function DeleteConfirmationDialog({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  isLoading, 
  title, 
  description,
  type 
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}