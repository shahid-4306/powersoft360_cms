// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useUnpostTask, type CombinedItem, type TaskItem } from "@/hooks/useUnpostTask";
// import { UnpostTable } from "@/components/unpost/UnpostTable";
// import { UnpostDialog } from "@/components/unpost/UnpostDialog";
// import { DeleteDialog } from "@/components/unpost/DeleteDialog";

// export default function UnpostItemsPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const { toast } = useToast();
//   const router = useRouter();
  
//   const {
//     items,
//     developers,
//     isLoading,
//     isSubmitting,
//     selectedTask,
//     deleteDialogOpen,
//     itemToDelete,
//     isDeleting,
//     user,
//     currentPage,
//     itemsPerPage,
//     currentItems,
//     totalPages,
//     setSelectedTask,
//     setDeleteDialogOpen,
//     setItemToDelete,
//     setCurrentPage,
//     fetchAllItems,
//     handleDeleteItem,
//   } = useUnpostTask();

//   const handleOpenEditModal = (item: CombinedItem) => {
//     // Only allow editing for tasks, not complaints
//     if (item.type === 'task') {
//       setSelectedTask(item as TaskItem);
//       setIsModalOpen(true);
//     }
//   };

//   const handleOpenDeleteDialog = (item: CombinedItem) => {
//     setItemToDelete(item);
//     setDeleteDialogOpen(true);
//   };

//   const handleModalSubmit = async (formData: FormData) => {
//     if (!selectedTask) return;

//     try {
//       const response = await fetch(`/api/tasks/unpost/${selectedTask._id}`, {
//         method: "PUT",
//         body: formData,
//       });

//       const responseText = await response.text();
      
//       if (!response.ok) {
//         let errorMessage = "Failed to update task";
//         try {
//           const errorData = JSON.parse(responseText);
//           errorMessage = errorData.message || errorData.error || errorMessage;
//         } catch (e) {
//           errorMessage = responseText || errorMessage;
//         }
//         throw new Error(errorMessage);
//       }

//       const responseData = JSON.parse(responseText);
      
//       // Refresh the items list
//       fetchAllItems();
      
//       setIsModalOpen(false);
//       setSelectedTask(null);
//       toast({
//         title: "Task Unposted Successfully",
//         description: "The task has been moved back for review.",
//         duration: 5000,
//       });
//     } catch (error: any) {
//       console.error("Failed to update task:", error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update task. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   const handleCloseDialog = () => {
//     setIsModalOpen(false);
//     setSelectedTask(null);
//   };

//   if (!user || isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
//           <p className="text-muted-foreground">Loading items...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div className="text-center space-y-2">
//         <h1 className="text-3xl font-bold text-orange-600">
//           Tasks & Complaints
//         </h1>
//         <p className="text-muted-foreground">Manage completed tasks and all complaints</p>
//       </div>

//       <UnpostTable
//         items={items}
//         currentItems={currentItems}
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onEditTask={handleOpenEditModal}
//         onDeleteItem={handleOpenDeleteDialog}
//         onPageChange={handlePageChange}
//       />

//       <DeleteDialog
//         isOpen={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//         itemToDelete={itemToDelete}
//         onConfirm={handleDeleteItem}
//         isDeleting={isDeleting}
//       />

//       {/* Only show UnpostDialog for tasks */}
//       {selectedTask && (
//         <UnpostDialog
//           isOpen={isModalOpen}
//           onClose={handleCloseDialog}
//           selectedTask={selectedTask}
//           developers={developers}
//           onSubmit={handleModalSubmit}
//           isSubmitting={isSubmitting}
//           normalizeAttachments={() => []} // You'll need to implement this based on your data
//           getDownloadUrl={() => ""} // You'll need to implement this based on your data
//           downloadAllAttachments={async () => {}} // You'll need to implement this based on your data
//           handleFileClick={() => {}} // You'll need to implement this based on your data
//         />
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUnpostTask, type CombinedItem, type TaskItem } from "@/hooks/useUnpostTask";
import { UnpostTable } from "@/components/unpost/UnpostTable";
import { UnpostDialog } from "@/components/unpost/UnpostDialog";
import { DeleteDialog } from "@/components/unpost/DeleteDialog";

export default function UnpostItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const {
    items,
    developers,
    isLoading,
    isSubmitting,
    selectedTask,
    deleteDialogOpen,
    itemToDelete,
    isDeleting,
    user,
    currentPage,
    itemsPerPage,
    currentItems,
    totalPages,
    setSelectedTask,
    setDeleteDialogOpen,
    setItemToDelete,
    setCurrentPage,
    fetchAllItems,
    handleDeleteItem,
  } = useUnpostTask();

  const handleOpenEditModal = (item: CombinedItem) => {
    // Only allow editing for tasks, not complaints
    if (item.type === 'task') {
      setSelectedTask(item as TaskItem);
      setIsModalOpen(true);
    }
  };

  const handleOpenDeleteDialog = (item: CombinedItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleModalSubmit = async (formData: FormData) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/unpost/${selectedTask._id}`, {
        method: "PUT",
        body: formData,
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = "Failed to update task";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseData = JSON.parse(responseText);
      
      // Refresh the items list
      fetchAllItems();
      
      setIsModalOpen(false);
      setSelectedTask(null);
      toast({
        title: "Task Unposted Successfully",
        description: "The task has been moved back for review.",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCloseDialog = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
          <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading items...</p>
        </div>
      </div>
    );
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
          Tasks & Complaints
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>Manage completed tasks and all complaints</p>
      </div>

      <UnpostTable
        items={items}
        currentItems={currentItems}
        currentPage={currentPage}
        totalPages={totalPages}
        onEditTask={handleOpenEditModal}
        onDeleteItem={handleOpenDeleteDialog}
        onPageChange={handlePageChange}
      />

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        itemToDelete={itemToDelete}
        onConfirm={handleDeleteItem}
        isDeleting={isDeleting}
      />

      {/* Only show UnpostDialog for tasks */}
      {selectedTask && (
        <UnpostDialog
          isOpen={isModalOpen}
          onClose={handleCloseDialog}
          selectedTask={selectedTask}
          developers={developers}
          onSubmit={handleModalSubmit}
          isSubmitting={isSubmitting}
          normalizeAttachments={() => []} // You'll need to implement this based on your data
          getDownloadUrl={() => ""} // You'll need to implement this based on your data
          downloadAllAttachments={async () => {}} // You'll need to implement this based on your data
          handleFileClick={() => {}} // You'll need to implement this based on your data
        />
      )}
    </div>
  );
}