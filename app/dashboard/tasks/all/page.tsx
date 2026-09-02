// "use client"

// import { AllTasksTable } from "@/components/tasks/AllTasksTable"
// import { AllTasksDialog } from "@/components/tasks/AllTasksDialog"
// import { useAllTasks } from "@/hooks/useAllTasks"

// export default function AllTasksPage() {
//   const {
//     items,
//     selectedItem,
//     taskStatus,
//     completionRemarks,
//     completionAttachments,
//     isDialogOpen,
//     isLoading,
//     isApproving,
//     setTaskStatus,
//     setCompletionRemarks,
//     openItemDialog,
//     closeItemDialog,
//     handleApproveCompletion,
//     handleFileChange,
//     removeFile,
//     handleDownloadFiles,
//     getDownloadUrl,
//     formatTimeTaken,
//     getStatusColor,
//     getDeveloperStatusColor,
//   } = useAllTasks()

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div className="text-center space-y-2">
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
//           All Items Management
//         </h1>
//         <p className="text-muted-foreground">Review and approve task/complaint completion status</p>
//       </div>

//       <AllTasksTable
//         items={items}
//         isLoading={isLoading}
//         onItemSelect={openItemDialog}
//         getStatusColor={getStatusColor}
//         getDeveloperStatusColor={getDeveloperStatusColor}
//       />

//       <AllTasksDialog
//         item={selectedItem}
//         isOpen={isDialogOpen}
//         onClose={closeItemDialog}
//         taskStatus={taskStatus}
//         completionRemarks={completionRemarks}
//         completionAttachments={completionAttachments}
//         isApproving={isApproving}
//         onTaskStatusChange={setTaskStatus}
//         onCompletionRemarksChange={setCompletionRemarks}
//         onFileChange={handleFileChange}
//         onRemoveFile={removeFile}
//         onApproveTask={handleApproveCompletion}
//         onDownloadFiles={handleDownloadFiles}
//         getDownloadUrl={getDownloadUrl}
//         formatTimeTaken={formatTimeTaken}
//         getDeveloperStatusColor={getDeveloperStatusColor}
//       />
//     </div>
//   )
// }
"use client"

import { AllTasksTable } from "@/components/tasks/AllTasksTable"
import { AllTasksDialog } from "@/components/tasks/AllTasksDialog"
import { useAllTasks } from "@/hooks/useAllTasks"

export default function AllTasksPage() {
  const {
    items,
    selectedItem,
    taskStatus,
    completionRemarks,
    completionAttachments,
    isDialogOpen,
    isLoading,
    isApproving,
    setTaskStatus,
    setCompletionRemarks,
    openItemDialog,
    closeItemDialog,
    handleApproveCompletion,
    handleFileChange,
    removeFile,
    handleDownloadFiles,
    getDownloadUrl,
    formatTimeTaken,
    getStatusColor,
    getDeveloperStatusColor,
  } = useAllTasks()

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
          All Items Management
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>Review and approve task/complaint completion status</p>
      </div>

      <AllTasksTable
        items={items}
        isLoading={isLoading}
        onItemSelect={openItemDialog}
        getStatusColor={getStatusColor}
        getDeveloperStatusColor={getDeveloperStatusColor}
      />

      <AllTasksDialog
        item={selectedItem}
        isOpen={isDialogOpen}
        onClose={closeItemDialog}
        taskStatus={taskStatus}
        completionRemarks={completionRemarks}
        completionAttachments={completionAttachments}
        isApproving={isApproving}
        onTaskStatusChange={setTaskStatus}
        onCompletionRemarksChange={setCompletionRemarks}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
        onApproveTask={handleApproveCompletion}
        onDownloadFiles={handleDownloadFiles}
        getDownloadUrl={getDownloadUrl}
        formatTimeTaken={formatTimeTaken}
        getDeveloperStatusColor={getDeveloperStatusColor}
      />
    </div>
  )
}