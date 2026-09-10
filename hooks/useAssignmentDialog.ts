"use client";

import { useState } from "react";

interface AssignmentData {
  userId: string;
  assignedDate: string;
  // Expected Completion Time / Response Time — set by the Administrator
  // when assigning a Task or Complaint from the Task & Complaint
  // Assignment dialog. Defaults to 24 hours from now so the field is
  // never blank, but the Administrator can freely change it.
  expectedCompletionAt: string;
}

function defaultExpectedCompletionAt(): string {
  const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return oneDayFromNow.toISOString().slice(0, 16);
}

export function useAssignmentDialog() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    userId: "",
    assignedDate: new Date().toISOString().slice(0, 16),
    expectedCompletionAt: defaultExpectedCompletionAt(),
  });
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const openDialog = (task: any) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
    setAssignmentData({
      userId: "",
      assignedDate: new Date().toISOString().slice(0, 16),
      expectedCompletionAt: defaultExpectedCompletionAt(),
    });
    setRemarks("");
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return {
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
    removeFile,
  };
}
