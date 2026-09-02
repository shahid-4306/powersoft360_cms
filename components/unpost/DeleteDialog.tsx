import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { CombinedItem } from "@/hooks/useUnpostTask";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemToDelete: CombinedItem | null; // Changed from taskToDelete to itemToDelete
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteDialog({
  isOpen,
  onClose,
  itemToDelete, // Changed prop name
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  const getItemIdentifier = () => {
    if (!itemToDelete) return "";
    if (itemToDelete.type === 'task') {
      return itemToDelete.code || "Task";
    } else {
      return itemToDelete.complaintNumber || "Complaint";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {itemToDelete?.type === 'task' ? 'task' : 'complaint'} {getItemIdentifier()}? This action cannot be undone.
          </p>
        </DialogHeader>
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}