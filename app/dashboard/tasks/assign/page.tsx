
"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useTaskAssignment } from "@/hooks/useTaskAssignment"
import { useAssignmentDialog } from "@/hooks/useAssignmentDialog"
import { PendingTasksTable } from "@/components/tasks/PendingTasksTable"
import { AssignmentDialog } from "@/components/tasks/AssignmentDialog"
import { ViewDetailsDialog } from "@/components/tasks/ViewDetailsDialog"
import { RejectComplaintDialog } from "@/components/tasks/RejectComplaintDialog"
import { useToast } from "@/hooks/use-toast"

export default function TaskAssignPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  // Present when this page was opened from the "New Complaint Registered"
  // notification — identifies which complaint should be selected and
  // made ready for processing as soon as the page loads.
  const notifiedComplaintId = searchParams.get("complaintId")
  const {
    pendingTasks,
    onlineComplaints,
    users,
    user,
    isLoading,
    assignTask,
    assignComplaint,
    rejectComplaint,
    setPendingTasks,
    setOnlineComplaints,
    setApprovedTasks
  } = useTaskAssignment()

  // Read-only "View complete details" dialog state, opened via the
  // Eye/View button in the Pending Items table.
  const [viewTarget, setViewTarget] = useState<any>(null)
  const [viewIsComplaint, setViewIsComplaint] = useState(false)

  const openViewDialog = (item: any, isComplaint: boolean = false) => {
    setViewTarget(item)
    setViewIsComplaint(isComplaint)
  }

  const closeViewDialog = () => {
    setViewTarget(null)
  }

  // Reject Complaint dialog state — separate from the Assign dialog so
  // both can be triggered independently from the same pending-items row.
  const [rejectTarget, setRejectTarget] = useState<any>(null)
  const [rejectRemarks, setRejectRemarks] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  const openRejectDialog = (complaint: any) => {
    setRejectTarget(complaint)
    setRejectRemarks("")
  }

  const closeRejectDialog = () => {
    if (isRejecting) return
    setRejectTarget(null)
    setRejectRemarks("")
  }

  const handleRejectComplaint = async () => {
    if (!rejectTarget || !rejectRemarks.trim()) return

    setIsRejecting(true)
    try {
      await rejectComplaint(rejectTarget._id, rejectRemarks.trim())

      setOnlineComplaints((prev) => prev.filter((c) => c._id !== rejectTarget._id))

      toast({
        title: "Complaint Rejected",
        description: `Complaint ${rejectTarget.complaintNumber} has been rejected and the customer has been notified.`,
        duration: 5000,
      })

      setRejectTarget(null)
      setRejectRemarks("")
    } catch (error: any) {
      console.error("Failed to reject complaint:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to reject complaint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const {
    selectedTask,
    isDialogOpen,
    assignmentData,
    remarks,
    files,
    isAssigning,
    setAssignmentData,
    setRemarks,
    setFiles,
    setIsAssigning,
    openDialog,
    closeDialog,
    handleFileChange,
    removeFile
  } = useAssignmentDialog()

  const handleAssignItem = async () => {
    if (!selectedTask || !assignmentData.userId) {
      toast({
        title: "Assignment Required",
        description: "Please select a user to assign the item before approval.",
        variant: "destructive",
      })
      return
    }

    if (!assignmentData.expectedCompletionAt) {
      toast({
        title: "Expected Completion Time Required",
        description: "Please specify an Expected Completion Time / Response Time before assigning.",
        variant: "destructive",
      })
      return
    }

    const isComplaint = selectedTask.isComplaint || false
    
    setIsAssigning(true)
    try {
      if (isComplaint) {
        const updatedComplaint = await assignComplaint(selectedTask._id, assignmentData, remarks, files)
        
        // Update local state
        setOnlineComplaints((prev) => prev.filter((complaint) => complaint._id !== selectedTask._id))
        
        toast({
          title: "Complaint Assigned Successfully! ✅",
          description: `Complaint ${selectedTask.complaintNumber} has been assigned.`,
          duration: 5000,
        })
      } else {
        const updatedTask = await assignTask(selectedTask._id, assignmentData, remarks, files)

        // Update local state
        setPendingTasks((prev) => prev.filter((task) => task._id !== selectedTask._id))
        setApprovedTasks((prev) => [...prev, updatedTask])

        toast({
          title: "Task Approved & Assigned Successfully! ✅",
          description: `Task ${selectedTask.code} has been approved and assigned.`,
          duration: 5000,
        })
      }

      closeDialog()
    } catch (error) {
      console.error("Failed to assign item:", error)
      toast({
        title: "Error",
        description: "Failed to assign item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleOpenDialog = (item: any, isComplaint: boolean = false) => {
    if (!item) {
      toast({
        title: "Error",
        description: "Cannot assign: Item data is missing.",
        variant: "destructive",
      })
      return
    }
    
    // Ensure item has isComplaint property
    const itemWithType = {
      ...item,
      isComplaint: isComplaint
    }
    
    openDialog(itemWithType)
  }

  // ------------------------------------------------------------------
  // Deep-link from the "New Complaint Registered" notification: once
  // the pending complaints have loaded, locate the complaint the
  // notification pointed at and make it "properly available for
  // processing" — the row is scrolled into view/highlighted (via
  // highlightItemId below) and its Assignment dialog opens
  // automatically so the admin can pick a user and assign it right
  // away. Guarded by a ref so it only fires once per notified id,
  // even if the admin closes the dialog afterwards.
  // ------------------------------------------------------------------
  const handledNotifiedComplaintRef = useRef<string | null>(null)

  useEffect(() => {
    if (!notifiedComplaintId || isLoading) return
    if (handledNotifiedComplaintRef.current === notifiedComplaintId) return

    const matchingComplaint = onlineComplaints.find(
      (c) => String(c._id) === String(notifiedComplaintId),
    )

    if (matchingComplaint) {
      handledNotifiedComplaintRef.current = notifiedComplaintId
      handleOpenDialog(matchingComplaint, true)
    } else {
      // Loaded, but this complaint isn't in the pending list anymore
      // (already assigned/rejected elsewhere) — let the admin know
      // instead of silently doing nothing.
      handledNotifiedComplaintRef.current = notifiedComplaintId
      toast({
        title: "Complaint Not Pending",
        description: "This complaint is no longer awaiting assignment — it may already have been assigned or rejected.",
        variant: "destructive",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifiedComplaintId, isLoading, onlineComplaints])

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
          <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading tasks, complaints and users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#FEFFFF]">
      <div className="text-center space-y-2">
        <h1 
          className="text-3xl font-bold"
          style={{ 
            background: 'linear-gradient(135deg, #11519B, #114A9B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Task & Complaint Assignment
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>Review, assign, and approve tasks and complaints for team members</p>
      </div>

      <PendingTasksTable 
        tasks={pendingTasks}
        onlineComplaints={onlineComplaints}
        onAssignTask={handleOpenDialog}
        onRejectComplaint={openRejectDialog}
        onViewItem={openViewDialog}
        highlightItemId={notifiedComplaintId}
      />

      <ViewDetailsDialog
        isOpen={!!viewTarget}
        onClose={closeViewDialog}
        item={viewTarget}
        isComplaint={viewIsComplaint}
      />

      <RejectComplaintDialog
        isOpen={!!rejectTarget}
        onClose={closeRejectDialog}
        complaint={rejectTarget}
        remarks={rejectRemarks}
        isRejecting={isRejecting}
        onRemarksChange={setRejectRemarks}
        onReject={handleRejectComplaint}
      />

      {/* Always render the dialog but control its visibility */}
      <AssignmentDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        item={selectedTask}
        isComplaint={selectedTask?.isComplaint}
        users={users}
        assignmentData={assignmentData}
        remarks={remarks}
        files={files}
        isAssigning={isAssigning}
        onAssignmentDataChange={setAssignmentData}
        onRemarksChange={setRemarks}
        onFilesChange={setFiles}
        onFileAdd={handleFileChange}
        onFileRemove={removeFile}
        onAssign={handleAssignItem}
      />
    </div>
  )
}