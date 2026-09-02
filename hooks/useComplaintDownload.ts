import { useState } from "react";

export function useComplaintDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingAssignment, setIsDownloadingAssignment] = useState(false);

  // Download complaint attachments
  const downloadComplaintAttachments = async (complaintId: string, complaintNumber?: string) => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `/api/online-complaints/attachments?complaintId=${complaintId}&download=zip&type=complaint`
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = `complaint-${complaintNumber || complaintId}-attachments.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading complaint attachments:', error);
      alert('Failed to download complaint attachments. Trying individual downloads...');
      await downloadIndividual(complaintId, 'complaint');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download assignment attachments
  const downloadAssignmentAttachments = async (complaintId: string, complaintNumber?: string) => {
    setIsDownloadingAssignment(true);
    try {
      const response = await fetch(
        `/api/online-complaints/attachments?complaintId=${complaintId}&download=zip&type=assignment`
      );

      if (!response.ok) {
        // If no assignment attachments found, try individual fetch first
        const fileList = await fetch(
          `/api/online-complaints/attachments?complaintId=${complaintId}&type=assignment`
        );
        
        if (fileList.ok) {
          const data = await fileList.json();
          if (data.count === 0) {
            alert('No assignment attachments available.');
            return;
          }
        }
        
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = `assignment-${complaintNumber || complaintId}-attachments.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading assignment attachments:', error);
      alert('Failed to download assignment attachments. Trying individual downloads...');
      await downloadIndividual(complaintId, 'assignment');
    } finally {
      setIsDownloadingAssignment(false);
    }
  };

  // Download all attachments (both complaint and assignment)
  const downloadAllAttachments = async (complaintId: string, complaintNumber?: string) => {
    setIsDownloading(true);
    try {
      // Create a combined ZIP or download both separately
      await downloadComplaintAttachments(complaintId, complaintNumber);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
      await downloadAssignmentAttachments(complaintId, complaintNumber);
    } finally {
      setIsDownloading(false);
    }
  };

  // Individual file download fallback
  const downloadIndividual = async (complaintId: string, type: 'complaint' | 'assignment') => {
    try {
      const response = await fetch(
        `/api/online-complaints/attachments?complaintId=${complaintId}&type=${type}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch file list');
      }
      
      const data = await response.json();
      const files = data.files || [];

      for (const file of files) {
        try {
          const fileResponse = await fetch(file.downloadUrl);
          if (!fileResponse.ok) continue;
          
          const blob = await fileResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error downloading ${file.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in individual download fallback:', error);
    }
  };

  // Get file list for UI display
  const getFileLists = async (complaintId: string) => {
    try {
      const [complaintRes, assignmentRes] = await Promise.all([
        fetch(`/api/online-complaints/attachments?complaintId=${complaintId}&type=complaint`),
        fetch(`/api/online-complaints/attachments?complaintId=${complaintId}&type=assignment`)
      ]);

      const complaintData = await complaintRes.json();
      const assignmentData = await assignmentRes.json();

      return {
        complaintFiles: complaintData.files || [],
        assignmentFiles: assignmentData.files || [],
        complaintCount: complaintData.count || 0,
        assignmentCount: assignmentData.count || 0
      };
    } catch (error) {
      console.error('Error fetching file lists:', error);
      return {
        complaintFiles: [],
        assignmentFiles: [],
        complaintCount: 0,
        assignmentCount: 0
      };
    }
  };

  // Download single file
  const downloadSingleFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/online-complaints/attachments?fileId=${fileId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading single file:', error);
      alert('Failed to download file');
    }
  };

  return {
    isDownloading,
    isDownloadingAssignment,
    downloadComplaintAttachments,
    downloadAssignmentAttachments,
    downloadAllAttachments,
    getFileLists,
    downloadSingleFile,
    downloadIndividual
  };
}