
// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Plus, Sparkles, Loader2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useUserSession } from "@/hooks/useUserSession"
// import { useTasks } from "@/hooks/useTasks"
// import { useTaskStream } from "@/hooks/useTaskStream"
// import { useCompanies } from "@/hooks/useCompanies"
// import { TaskForm } from "@/components/tasks/TaskForm"
// import { TaskTable } from "@/components/tasks/TaskTable"
// import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"

// export default function CreateTaskPage() {
//   const router = useRouter()
//   const { toast } = useToast()
  
//   // Custom hooks for data management
//   const { user, isLoading: sessionLoading } = useUserSession("tasks.create")
//   const { companies, isLoading: companiesLoading } = useCompanies()
//   const { tasks, isLoading: tasksLoading, createTask, updateTask, deleteTask } = useTasks()
  
//   // Use real-time stream for tasks
//   const streamTasks = useTaskStream()
//   const displayTasks = streamTasks.length > 0 ? streamTasks : tasks

//   // Dialog states
//   const [isCreateOpen, setIsCreateOpen] = useState(false)
//   const [isEditOpen, setIsEditOpen] = useState(false)
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false)

//   // Loading states
//   const [isCreating, setIsCreating] = useState(false)
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [isDeleting, setIsDeleting] = useState(false)

//   // Selected items for operations
//   const [selectedTask, setSelectedTask] = useState<any>(null)
//   const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

//   // Task operations
//   const handleCreateTask = async (taskData: any) => {
//     setIsCreating(true)
//     try {
//       await createTask({
//         ...taskData,
//         createdAt: new Date().toISOString(),
//         createdBy: user?.id,
//         assigned: false,
//         approved: false,
//         unposted: false,
//       })
//       toast({
//         title: "Task Created Successfully! ✨",
//         description: `Task ${taskData.code} has been created.`,
//         duration: 5000,
//       })
//       setIsCreateOpen(false)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create task. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsCreating(false)
//     }
//   }

//   const handleUpdateTask = async (taskData: any) => {
//     if (!selectedTask) return
    
//     setIsUpdating(true)
//     try {
//       await updateTask(selectedTask._id!, taskData)
//       toast({
//         title: "Task Updated Successfully! ✅",
//         description: `Task ${taskData.code} has been updated.`,
//         duration: 5000,
//       })
//       setIsEditOpen(false)
//       setSelectedTask(null)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update task. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   const handleDeleteTask = async () => {
//     if (!taskToDelete) return
    
//     setIsDeleting(true)
//     try {
//       await deleteTask(taskToDelete)
//       toast({
//         title: "Task Deleted Successfully! 🗑️",
//         description: "The task has been removed from the system.",
//         duration: 5000,
//       })
//       setIsDeleteOpen(false)
//       setTaskToDelete(null)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete task. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   // Helper functions
//   const openEdit = (task: any) => {
//     setSelectedTask(task)
//     setIsEditOpen(true)
//   }

//   const openDelete = (taskId: string) => {
//     setTaskToDelete(taskId)
//     setIsDeleteOpen(true)
//   }

//   const isLoading = sessionLoading || companiesLoading || tasksLoading

//   if (isLoading || !user) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
//           <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading task information...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 animate-fade-in p-4 md:p-6 bg-[#FEFFFF]">
//       {/* Header */}
//       <div className="text-center space-y-2">
//         <div className="flex items-center justify-center gap-2 mb-4">
//           <div 
//             className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
//             style={{ 
//               background: 'linear-gradient(135deg, #11519B, #114A9B)'
//             }}
//           >
//             <Plus className="h-6 w-6 text-white" />
//           </div>
//         </div>
//         <h1 
//           className="text-2xl md:text-3xl font-bold"
//           style={{ 
//             background: 'linear-gradient(135deg, #11519B, #114A9B)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             backgroundClip: 'text'
//           }}
//         >
//           Create New Task
//         </h1>
//         <p className="text-[#000000]" style={{ opacity: 0.6 }}>Add a new task to your daily activity workflow</p>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         {/* Create Task Card */}
//         <Card 
//           className="border-0 shadow-xl animate-slide-in"
//           style={{ 
//             background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
//           }}
//         >
//           <CardHeader 
//             className="border-0 pt-4 pb-4"
//             style={{ 
//               background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.2), rgba(17, 81, 155, 0.1))',
//               borderBottomColor: 'rgba(158, 195, 249, 0.3)'
//             }}
//           >
//             <CardTitle className="flex items-center gap-2 text-[#000000]">
//               <Sparkles className="h-5 w-5" style={{ color: '#11519B' }} />
//               Task Information
//             </CardTitle>
//             <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>Fill in the details for your new task</CardDescription>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="text-center space-y-4">
//               <p className="text-[#000000]" style={{ opacity: 0.6 }}>
//                 Click the button below to add a new task to the system.
//               </p>
//               <Button
//                 onClick={() => setIsCreateOpen(true)}
//                 className="shadow-lg hover:shadow-xl transition-all duration-300 text-white"
//                 style={{ 
//                   background: 'linear-gradient(135deg, #11519B, #114A9B)'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = 'linear-gradient(135deg, #114A9B, #0D3D7A)'
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'linear-gradient(135deg, #11519B, #114A9B)'
//                 }}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Create New Task
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Create Task Form */}
//         <TaskForm
//           isOpen={isCreateOpen}
//           onOpenChange={setIsCreateOpen}
//           onSubmit={handleCreateTask}
//           isLoading={isCreating}
//           companies={companies}
//           mode="create"
//         />

//         {/* Edit Task Form */}
//         <TaskForm
//           key={`edit-${selectedTask?._id || 'new'}`}
//           isOpen={isEditOpen}
//           onOpenChange={setIsEditOpen}
//           onSubmit={handleUpdateTask}
//           isLoading={isUpdating}
//           companies={companies}
//           initialData={selectedTask}
//           mode="edit"
//         />

//         {/* Delete Confirmation Dialog */}
//         <DeleteConfirmationDialog
//           isOpen={isDeleteOpen}
//           onOpenChange={setIsDeleteOpen}
//           onConfirm={handleDeleteTask}
//           isLoading={isDeleting}
//           title="Confirm Task Deletion"
//           description="Are you sure you want to delete this task? This action cannot be undone."
//           type="task"
//         />

//         {/* Tasks Table */}
//         <TaskTable
//           tasks={displayTasks}
//           isLoading={tasksLoading}
//           onEdit={openEdit}
//           onDelete={openDelete}
//         />
//       </div>
//     </div>
//   )
// }
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserSession } from "@/hooks/useUserSession"
import { useTasks } from "@/hooks/useTasks"
import { useTaskStream } from "@/hooks/useTaskStream"
import { useCompanies } from "@/hooks/useCompanies"
import { TaskForm } from "@/components/tasks/TaskForm"
import { TaskTable } from "@/components/tasks/TaskTable"
import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"

export default function CreateTaskPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Custom hooks for data management
  const { user, isLoading: sessionLoading } = useUserSession("tasks.create")
  const { companies, isLoading: companiesLoading } = useCompanies()
  const { tasks, isLoading: tasksLoading, createTask, updateTask, deleteTask } = useTasks()
  
  // Use real-time stream for tasks
  const streamTasks = useTaskStream()
  const displayTasks = streamTasks.length > 0 ? streamTasks : tasks

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Loading states
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Selected items for operations
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  // Task operations
  const handleCreateTask = async (taskData: any) => {
    setIsCreating(true)
    try {
      await createTask({
        ...taskData,
        createdAt: new Date().toISOString(),
        createdBy: user?.id,
        assigned: false,
        approved: false,
        unposted: false,
      })
      toast({
        title: "Task Created Successfully! ✨",
        description: `Task ${taskData.code} has been created.`,
        duration: 5000,
      })
      setIsCreateOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateTask = async (taskData: any) => {
    if (!selectedTask) return
    
    setIsUpdating(true)
    try {
      await updateTask(selectedTask._id!, taskData)
      toast({
        title: "Task Updated Successfully! ✅",
        description: `Task ${taskData.code} has been updated.`,
        duration: 5000,
      })
      setIsEditOpen(false)
      setSelectedTask(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteTask(taskToDelete)
      toast({
        title: "Task Deleted Successfully! 🗑️",
        description: "The task has been removed from the system.",
        duration: 5000,
      })
      setIsDeleteOpen(false)
      setTaskToDelete(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper functions
  const openEdit = (task: any) => {
    setSelectedTask(task)
    setIsEditOpen(true)
  }

  const openDelete = (taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteOpen(true)
  }

  const isLoading = sessionLoading || companiesLoading || tasksLoading

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
          <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading task information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6 bg-[#FEFFFF]">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #11519B, #114A9B)'
            }}
          >
            <Plus className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 
          className="text-2xl md:text-3xl font-bold"
          style={{ 
            background: 'linear-gradient(135deg, #11519B, #114A9B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Create New Task
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>Add a new task to your daily activity workflow</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Create Task Card */}
        <Card 
          className="border-0 shadow-xl animate-slide-in"
          style={{ 
            background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
          }}
        >
          <CardHeader 
            className="border-0 pt-4 pb-4"
            style={{ 
              background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.2), rgba(17, 81, 155, 0.1))',
              borderBottomColor: 'rgba(158, 195, 249, 0.3)'
            }}
          >
            <CardTitle className="flex items-center gap-2 text-[#000000]">
              <Sparkles className="h-5 w-5" style={{ color: '#11519B' }} />
              Task Information
            </CardTitle>
            <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>Fill in the details for your new task</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-[#000000]" style={{ opacity: 0.6 }}>
                Click the button below to add a new task to the system.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                style={{ 
                  background: 'linear-gradient(135deg, #11519B, #114A9B)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #114A9B, #0D3D7A)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #11519B, #114A9B)'
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Task Form */}
        <TaskForm
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateTask}
          isLoading={isCreating}
          companies={companies as any}
          mode="create"
        />

        {/* Edit Task Form */}
        <TaskForm
          key={`edit-${selectedTask?._id || 'new'}`}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleUpdateTask}
          isLoading={isUpdating}
          companies={companies as any}
          initialData={selectedTask}
          mode="edit"
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteTask}
          isLoading={isDeleting}
          title="Confirm Task Deletion"
          description="Are you sure you want to delete this task? This action cannot be undone."
          type="task"
        />

        {/* Tasks Table */}
        <TaskTable
          tasks={displayTasks}
          isLoading={tasksLoading}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>
    </div>
  )
}