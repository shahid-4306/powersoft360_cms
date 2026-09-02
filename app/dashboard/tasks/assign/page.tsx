// "use client"

// import { Loader2 } from "lucide-react"
// import { useTaskAssignment } from "@/hooks/useTaskAssignment"
// import { useAssignmentDialog } from "@/hooks/useAssignmentDialog"
// import { PendingTasksTable } from "@/components/tasks/PendingTasksTable"
// import { AssignmentDialog } from "@/components/tasks/AssignmentDialog"
// import { useToast } from "@/hooks/use-toast"

// export default function TaskAssignPage() {
//   const { toast } = useToast()
//   const {
//     pendingTasks,
//     onlineComplaints,
//     users,
//     user,
//     isLoading,
//     assignTask,
//     assignComplaint,
//     setPendingTasks,
//     setOnlineComplaints,
//     setApprovedTasks
//   } = useTaskAssignment()

//   const {
//     selectedTask,
//     isDialogOpen,
//     assignmentData,
//     remarks,
//     files,
//     isAssigning,
//     setAssignmentData,
//     setRemarks,
//     setFiles,
//     setIsAssigning,
//     openDialog,
//     closeDialog,
//     handleFileChange,
//     removeFile
//   } = useAssignmentDialog()

//   const handleAssignItem = async () => {
//     if (!selectedTask || !assignmentData.userId) {
//       toast({
//         title: "Assignment Required",
//         description: "Please select a user to assign the item before approval.",
//         variant: "destructive",
//       })
//       return
//     }

//     const isComplaint = selectedTask.isComplaint || false
    
//     setIsAssigning(true)
//     try {
//       if (isComplaint) {
//         const updatedComplaint = await assignComplaint(selectedTask._id, assignmentData, remarks, files)
        
//         // Update local state
//         setOnlineComplaints((prev) => prev.filter((complaint) => complaint._id !== selectedTask._id))
        
//         toast({
//           title: "Complaint Assigned Successfully! ✅",
//           description: `Complaint ${selectedTask.complaintNumber} has been assigned.`,
//           duration: 5000,
//         })
//       } else {
//         const updatedTask = await assignTask(selectedTask._id, assignmentData, remarks, files)

//         // Update local state
//         setPendingTasks((prev) => prev.filter((task) => task._id !== selectedTask._id))
//         setApprovedTasks((prev) => [...prev, updatedTask])

//         toast({
//           title: "Task Approved & Assigned Successfully! ✅",
//           description: `Task ${selectedTask.code} has been approved and assigned.`,
//           duration: 5000,
//         })
//       }

//       closeDialog()
//     } catch (error) {
//       console.error("Failed to assign item:", error)
//       toast({
//         title: "Error",
//         description: "Failed to assign item. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsAssigning(false)
//     }
//   }

//   const handleOpenDialog = (item: any, isComplaint: boolean = false) => {
//     if (!item) {
//       toast({
//         title: "Error",
//         description: "Cannot assign: Item data is missing.",
//         variant: "destructive",
//       })
//       return
//     }
    
//     // Ensure item has isComplaint property
//     const itemWithType = {
//       ...item,
//       isComplaint: isComplaint
//     }
    
//     openDialog(itemWithType)
//   }

//   if (!user || isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
//           <p className="text-muted-foreground">Loading tasks, complaints and users...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div className="text-center space-y-2">
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
//           Task & Complaint Assignment
//         </h1>
//         <p className="text-muted-foreground">Review, assign, and approve tasks and complaints for team members</p>
//       </div>

//       <PendingTasksTable 
//         tasks={pendingTasks}
//         onlineComplaints={onlineComplaints}
//         onAssignTask={handleOpenDialog}
//       />

//       {/* Always render the dialog but control its visibility */}
//       <AssignmentDialog
//         isOpen={isDialogOpen}
//         onClose={closeDialog}
//         item={selectedTask}
//         isComplaint={selectedTask?.isComplaint}
//         users={users}
//         assignmentData={assignmentData}
//         remarks={remarks}
//         files={files}
//         isAssigning={isAssigning}
//         onAssignmentDataChange={setAssignmentData}
//         onRemarksChange={setRemarks}
//         onFilesChange={setFiles}
//         onFileAdd={handleFileChange}
//         onFileRemove={removeFile}
//         onAssign={handleAssignItem}
//       />
//     </div>
//   )
// }
"use client"

import { Loader2 } from "lucide-react"
import { useTaskAssignment } from "@/hooks/useTaskAssignment"
import { useAssignmentDialog } from "@/hooks/useAssignmentDialog"
import { PendingTasksTable } from "@/components/tasks/PendingTasksTable"
import { AssignmentDialog } from "@/components/tasks/AssignmentDialog"
import { useToast } from "@/hooks/use-toast"

export default function TaskAssignPage() {
  const { toast } = useToast()
  const {
    pendingTasks,
    onlineComplaints,
    users,
    user,
    isLoading,
    assignTask,
    assignComplaint,
    setPendingTasks,
    setOnlineComplaints,
    setApprovedTasks
  } = useTaskAssignment()

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