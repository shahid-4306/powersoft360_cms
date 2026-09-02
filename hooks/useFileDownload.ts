"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloadingAssignment, setIsDownloadingAssignment] = useState(false)
  const { toast } = useToast()
  const [isDownloadingRejection, setIsDownloadingRejection] = useState(false) // Add this line

  const downloadAllAttachments = async (taskId: string, attachments?: string[], type: string = 'task') => {
    try {
      if (type === 'assignment') {
        setIsDownloadingAssignment(true)
      }else if (type === 'rejection') {  // Add this condition
        setIsDownloadingRejection(true)
      }else if (type === 'developer') {  // Add this condition if you need it
        setIsDownloading(true) // Or create a separate state for developer
      }  else {
        setIsDownloading(true)
      }
      
      console.log(`[useFileDownload] Starting download for task: ${taskId}, type: ${type}`);
      console.log(`[useFileDownload] Attachments provided:`, attachments);
      
      // Construct URL based on type
      const url = type === 'assignment' 
        ? `/api/tasks/assign?taskId=${taskId}&download=zip&type=assignment`
        : type === 'rejection'  // Add this
        ? `/api/tasks/assign?taskId=${taskId}&download=zip&type=rejection`  // Add rejection URL
        : type === 'developer'  // Add this if you need developer attachments
        ? `/api/tasks/assign?taskId=${taskId}&download=zip&type=developer`
        : `/api/tasks/assign?taskId=${taskId}&download=zip`
      
      console.log(`[useFileDownload] Fetching ZIP from: ${url}`);
      
      const response = await fetch(url)
      
      console.log(`[useFileDownload] Response status: ${response.status}`);
      console.log(`[useFileDownload] Response headers:`, {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'content-disposition': response.headers.get('content-disposition')
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `Server error: ${response.status}` 
        }));
        console.error(`[useFileDownload] Server error:`, errorData);
        
        // If ZIP download fails, fall back to individual files
        console.log(`[useFileDownload] ZIP download failed, falling back to individual files`);
        return await downloadFilesIndividually(taskId, type);
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log(`[useFileDownload] Blob created:`, {
        size: blob.size,
        type: blob.type,
        sizeInMB: (blob.size / (1024 * 1024)).toFixed(2)
      });
      
      if (blob.size === 0) {
        console.error(`[useFileDownload] Empty blob received`);
        throw new Error("Empty ZIP file received from server");
      }

      // Create a download link
      const urlObject = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObject;
      
      // Get filename from Content-Disposition header or use default
      let filename = `${type}-attachments-${taskId}.zip`;
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      
      a.download = filename;
      
      // Append to body and trigger click
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(urlObject);
        document.body.removeChild(a);
        console.log(`[useFileDownload] Download cleanup completed`);
      }, 100);

      console.log(`[useFileDownload] ZIP download triggered for: ${filename}`);
      
      toast({
        title: "Download Started",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} ZIP file download has started`,
      });
      
      return { success: true, message: "ZIP download started" }
      
    } catch (error) {
      console.error("[useFileDownload] Error in main download:", error);
      
      // Fallback to individual downloads if ZIP fails
      console.log(`[useFileDownload] Attempting fallback to individual downloads`);
      try {
        const result = await downloadFilesIndividually(taskId, type);
        
        if (result.success) {
          toast({
            title: "Download Started",
            description: "Started individual file downloads",
          });
        } else {
          toast({
            title: "Download Failed",
            description: result.message || "Could not download files",
            variant: "destructive",
          });
        }
        
        return result;
      } catch (fallbackError) {
        console.error("[useFileDownload] Fallback also failed:", fallbackError);
        toast({
          title: "Download Failed",
          description: "Could not download any files",
          variant: "destructive",
        });
        return { 
          success: false, 
          message: "Download failed completely" 
        };
      }
    } finally {
      if (type === 'assignment') {
        setIsDownloadingAssignment(false)
      } else if (type === 'rejection') {  // Add this
        setIsDownloadingRejection(false)
      } else {
        setIsDownloading(false)
      }
    }
  }

  // Function for individual file downloads
  const downloadFilesIndividually = async (taskId: string, type: string = 'task') => {
    console.log(`[useFileDownload] Starting individual downloads for task: ${taskId}, type: ${type}`);
    
    try {
      // Fetch task details to get attachments
      console.log(`[useFileDownload] Fetching task details...`);
      const taskResponse = await fetch(`/api/tasks/${taskId}`)
      if (!taskResponse.ok) {
        throw new Error("Failed to fetch task details");
      }
      
      const task = await taskResponse.json();
      console.log(`[useFileDownload] Task details received:`, {
        id: task._id,
        taskAttachments: task.TasksAttachment?.length || 0,
        assignmentAttachments: task.assignmentAttachment?.length || 0
      });
      
      // Get attachments based on type
      let allAttachments: string[] = [];
      if (type === 'assignment') {
        allAttachments = task.assignmentAttachment || [];
      } else if (type === 'rejection') {  // Add this
        allAttachments = task.rejectionAttachment || [];
      } else if (type === 'developer') {  // Add this if needed
        allAttachments = task.developer_attachment || [];
      } else {
        allAttachments = task.TasksAttachment || [];
      }
      
      console.log(`[useFileDownload] ${type} attachments found: ${allAttachments.length}`);
      
      if (allAttachments.length === 0) {
        return { 
          success: false, 
          message: `No ${type} attachments found for this task` 
        };
      }

      let downloadedCount = 0;
      let failedCount = 0;
      
      // Download each file individually
      console.log(`[useFileDownload] Starting to download ${allAttachments.length} files...`);
      
      for (const [index, attachment] of allAttachments.entries()) {
        try {
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(attachment);
          
          if (!isValidObjectId) {
            console.warn(`[useFileDownload] Attachment ${index + 1} is not a valid ObjectId: ${attachment}`);
            continue;
          }
          
          console.log(`[useFileDownload] Downloading file ${index + 1}/${allAttachments.length}: ${attachment}`);
          
          const fileResponse = await fetch(`/api/tasks/assign?taskId=${taskId}&fileId=${attachment}&type=${type}`);
          
          if (fileResponse.ok) {
            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Get filename
            let filename = `${type}-attachment-${index + 1}`;
            const contentDisposition = fileResponse.headers.get('content-disposition');
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/);
              if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
              }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, 100);
            
            downloadedCount++;
            console.log(`[useFileDownload] Successfully downloaded: ${filename}`);
            
            // Delay between downloads to avoid overwhelming the browser
            if (index < allAttachments.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } else {
            console.error(`[useFileDownload] Failed to download file ${attachment}: ${fileResponse.status}`);
            failedCount++;
          }
        } catch (fileError) {
          console.error(`[useFileDownload] Error downloading individual file ${attachment}:`, fileError);
          failedCount++;
        }
      }

      console.log(`[useFileDownload] Download summary: ${downloadedCount} succeeded, ${failedCount} failed`);
      
      if (downloadedCount > 0) {
        return { 
          success: true, 
          message: `Downloaded ${downloadedCount} file(s)` 
        };
      } else {
        return { 
          success: false, 
          message: "Could not download any files" 
        };
      }
    } catch (error) {
      console.error("[useFileDownload] Error in individual download:", error);
      return { 
        success: false, 
        message: "Failed to download individual files" 
      };
    }
  }

  return {
    isDownloading,
    isDownloadingAssignment,
    isDownloadingRejection, // Export the new state
    downloadAllAttachments
  }
}