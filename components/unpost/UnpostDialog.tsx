"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, X, Download, User, Building } from "lucide-react";
import type { TaskItem, Developer } from "@/hooks/useUnpostTask";

interface UnpostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: TaskItem | null;
  developers: Developer[];
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  normalizeAttachments: (attachments: any) => string[];
  getDownloadUrl: (attachment: string) => string;
  downloadAllAttachments: (taskId: string, attachments: string[], type: string) => void;
  handleFileClick: (e: React.MouseEvent, attachment: string) => void;
}

export function UnpostDialog({
  isOpen,
  onClose,
  selectedTask,
  developers,
  onSubmit,
  isSubmitting,
  normalizeAttachments,
  getDownloadUrl,
  downloadAllAttachments,
  handleFileClick,
}: UnpostDialogProps) {
  const [newDeveloperFiles, setNewDeveloperFiles] = useState<File[]>([]);
  const [newTaskFiles, setNewTaskFiles] = useState<File[]>([]);
  const [newAssignmentFiles, setNewAssignmentFiles] = useState<File[]>([]);
  const [newCompletionFiles, setNewCompletionFiles] = useState<File[]>([]);
  const [existingTaskAttachments, setExistingTaskAttachments] = useState<string[]>([]);
  const [existingAssignmentAttachments, setExistingAssignmentAttachments] = useState<string[]>([]);
  const [existingCompletionAttachments, setExistingCompletionAttachments] = useState<string[]>([]);
  const [existingDeveloperAttachments, setExistingDeveloperAttachments] = useState<string[]>([]);

  // Initialize attachments when task changes
  useEffect(() => {
    if (selectedTask) {
      // For now, we'll use empty arrays since we don't have attachments in TaskItem
      // You might need to fetch the full task with attachments from API
      setExistingTaskAttachments([]);
      setExistingAssignmentAttachments([]);
      setExistingCompletionAttachments([]);
      setExistingDeveloperAttachments([]);
    }
  }, [selectedTask]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number, setAttachments: React.Dispatch<React.SetStateAction<string[]>>) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTask) return;

    const formData = new FormData();
    const formElements = e.currentTarget.elements;

    // Basic task info
    formData.append("code", selectedTask.code || "");
    formData.append("working", (formElements.namedItem("working") as HTMLTextAreaElement)?.value || selectedTask.working || "");
    formData.append("dateTime", (formElements.namedItem("dateTime") as HTMLInputElement)?.value || selectedTask.dateTime || "");
    formData.append("priority", selectedTask.priority || "Normal");
    formData.append("status", "unposted");
    formData.append("UnpostStatus", "unposted");
    formData.append("assigned", selectedTask.assignedTo ? "true" : "false");
    formData.append("approved", selectedTask.approved ? "true" : "false");
    formData.append("completionApproved", selectedTask.completionApproved ? "true" : "false");
    formData.append("unposted", "true");

    // Remarks
    formData.append("TaskRemarks", (formElements.namedItem("TaskRemarks") as HTMLTextAreaElement)?.value || selectedTask.TaskRemarks || "");
    formData.append("assignmentRemarks", (formElements.namedItem("assignmentRemarks") as HTMLTextAreaElement)?.value || selectedTask.assignmentRemarks || "");
    formData.append("completionRemarks", (formElements.namedItem("completionRemarks") as HTMLTextAreaElement)?.value || selectedTask.completionRemarks || "");
    formData.append("developerRemarks", (formElements.namedItem("developerRemarks") as HTMLTextAreaElement)?.value || selectedTask.developer_remarks || "");
    formData.append("developerStatus", selectedTask.developer_status || "pending");

    // Company
    if (selectedTask.company) {
      formData.append("company", JSON.stringify({
        name: selectedTask.company.name || "",
        city: selectedTask.company.city || "",
        address: selectedTask.company.address || "",
        companyRepresentative: selectedTask.company.companyRepresentative || "",
        support: selectedTask.company.support || "",
      }));
    }

    // Contact
    if (selectedTask.contact) {
      formData.append("contact", JSON.stringify({
        name: selectedTask.contact.name || "",
        phone: selectedTask.contact.phone || "",
      }));
    }

    // Assigned to
    const assignedToSelect = formElements.namedItem("assignedTo") as HTMLSelectElement;
    const assignedToId = assignedToSelect?.value;
    if (assignedToId && assignedToId !== "unassigned") {
      const assignedDeveloper = developers.find(dev => dev._id === assignedToId);
      if (assignedDeveloper) {
        formData.append("assignedTo", JSON.stringify({
          id: assignedDeveloper._id,
          username: assignedDeveloper.username,
          name: assignedDeveloper.name,
          role: { name: assignedDeveloper.role.name },
        }));
      }
    } else {
      formData.append("assignedTo", "");
    }

    // Dates
    if (selectedTask.dateTime) {
      formData.append("dateTime", selectedTask.dateTime);
    }
    if (selectedTask.assignedDate) {
      formData.append("assignedDate", (formElements.namedItem("assignedDate") as HTMLInputElement)?.value || selectedTask.assignedDate);
    }

    // Append existing attachments
    existingTaskAttachments.forEach((attachment, index) => {
      formData.append(`existingTasksAttachment[${index}]`, attachment);
    });
    existingAssignmentAttachments.forEach((attachment, index) => {
      formData.append(`existingAssignmentAttachment[${index}]`, attachment);
    });
    existingCompletionAttachments.forEach((attachment, index) => {
      formData.append(`existingCompletionAttachment[${index}]`, attachment);
    });
    existingDeveloperAttachments.forEach((attachment, index) => {
      formData.append(`existingDeveloperAttachment[${index}]`, attachment);
    });

    // Append new files
    newTaskFiles.forEach((file) => {
      formData.append("TasksAttachment", file);
    });
    newAssignmentFiles.forEach((file) => {
      formData.append("assignmentAttachment", file);
    });
    newCompletionFiles.forEach((file) => {
      formData.append("completionAttachment", file);
    });
    newDeveloperFiles.forEach((file) => {
      formData.append("developerAttachment", file);
    });

    await onSubmit(formData);
  };

  if (!selectedTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[800px] max-h-[80vh] overflow-y-auto bg-muted/50">
        <DialogHeader>
          <DialogTitle className="text-left border-b pb-2 text-orange-700">
            Unpost Task - {selectedTask.code}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Company Details */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" /> Company Details
              </h3>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="companyName" className="text-left text-muted-foreground">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={selectedTask.company?.name || ""}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="companyCity" className="text-left text-muted-foreground">
                  City
                </Label>
                <Input
                  id="companyCity"
                  name="companyCity"
                  defaultValue={selectedTask.company?.city || ""}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="companyAddress" className="text-left text-muted-foreground">
                  Address
                </Label>
                <Input
                  id="companyAddress"
                  name="companyAddress"
                  defaultValue={selectedTask.company?.address || ""}
                  className="col-span-3"
                  disabled
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground/80 mb-3">Contact Information</h3>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="contactName" className="text-left text-muted-foreground">
                  Contact Name
                </Label>
                <Input
                  id="contactName"
                  name="contactName"
                  defaultValue={selectedTask.contact?.name || ""}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="contactPhone" className="text-left text-muted-foreground">
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={selectedTask.contact?.phone || ""}
                  className="col-span-3"
                  disabled
                />
              </div>
            </div>

            {/* Task Details */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground/80 mb-3">Task Details</h3>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="working" className="text-left text-muted-foreground">
                  Work Description
                </Label>
                <Textarea
                  id="working"
                  name="working"
                  defaultValue={selectedTask.working || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="dateTime" className="text-left text-muted-foreground">
                  Date & Time
                </Label>
                <Input
                  id="dateTime"
                  name="dateTime"
                  type="datetime-local"
                  defaultValue={selectedTask.dateTime ? new Date(selectedTask.dateTime).toISOString().slice(0, 16) : ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="priority" className="text-left text-muted-foreground">
                  Priority
                </Label>
                <Input
                  id="priority"
                  name="priority"
                  value={selectedTask.priority || "Normal"}
                  className="col-span-3"
                  disabled
                />
              </div>
            </div>

            {/* Assignment Details */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground/80 mb-3">Assignment Details</h3>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="assignedTo" className="text-left text-muted-foreground">
                  Assigned To
                </Label>
                <Select
                  name="assignedTo"
                  value={selectedTask.assignedTo?.id || "unassigned"}
                  onValueChange={() => {}} // Handler will be in parent
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a developer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Unassigned</span>
                      </div>
                    </SelectItem>
                    {developers.map((developer) => (
                      <SelectItem key={developer._id} value={developer._id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{developer.name} ({developer.username})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="assignedDate" className="text-left text-muted-foreground">
                  Assigned Date
                </Label>
                <Input
                  id="assignedDate"
                  name="assignedDate"
                  type="datetime-local"
                  defaultValue={selectedTask.assignedDate ? new Date(selectedTask.assignedDate).toISOString().slice(0, 16) : ""}
                  className="col-span-3"
                />
              </div>
            </div>

            {/* Developer Details */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground/80 mb-3">Developer Details</h3>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="developerStatus" className="text-left text-muted-foreground">
                  Developer Status
                </Label>
                <Input
                  id="developerStatus"
                  name="developerStatus"
                  value={selectedTask.developer_status || "N/A"}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="developerRemarks" className="text-left text-muted-foreground">
                  Developer Remarks
                </Label>
                <Textarea
                  id="developerRemarks"
                  name="developerRemarks"
                  defaultValue={selectedTask.developer_remarks || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="developerAttachment" className="text-left text-muted-foreground">
                  Developer Attachments
                </Label>
                <div className="col-span-3">
                  <Input
                    id="developerAttachment"
                    name="developerAttachment"
                    type="file"
                    accept=".txt,.doc,.docx,.xls,.xlsx,.pdf,.png,.jpg,.jpeg,.gif,.bmp,.csv,.rtf,.odt,.ods,.odp"
                    multiple
                    onChange={(e) => handleFileChange(e, setNewDeveloperFiles)}
                  />
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Existing Attachments:</p>
                    {existingDeveloperAttachments.length > 0 ? (
                      <div className="space-y-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => downloadAllAttachments(selectedTask._id, existingDeveloperAttachments, 'developer')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download All ({existingDeveloperAttachments.length})
                        </Button>
                        <ul className="space-y-1">
                          {existingDeveloperAttachments.map((attachment, index) => (
                            <li key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                <a 
                                  href={getDownloadUrl(attachment)} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-primary hover:underline text-xs"
                                  onClick={(e) => handleFileClick(e, attachment)}
                                >
                                  Attachment {index + 1}
                                </a>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExistingAttachment(index, setExistingDeveloperAttachments)}
                                className="h-4 w-4 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No existing attachments</p>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">New Attachments:</p>
                    {newDeveloperFiles.length > 0 ? (
                      <ul className="space-y-1">
                        {newDeveloperFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span className="text-xs">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index, setNewDeveloperFiles)}
                              className="h-4 w-4 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No new attachments added</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Details */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground/80 mb-3">Approval Details</h3>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="approved" className="text-left text-muted-foreground">
                  Approved
                </Label>
                <Input
                  id="approved"
                  name="approved"
                  value={selectedTask.approved ? "Yes" : "No"}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="completionApproved" className="text-left text-muted-foreground">
                  Completion Approved
                </Label>
                <Input
                  id="completionApproved"
                  name="completionApproved"
                  value={selectedTask.completionApproved ? "Yes" : "No"}
                  className="col-span-3"
                  disabled
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground/80 mb-3">Remarks</h3>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="TaskRemarks" className="text-left text-muted-foreground">
                  Task Remarks
                </Label>
                <Textarea
                  id="TaskRemarks"
                  name="TaskRemarks"
                  defaultValue={selectedTask.TaskRemarks || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label htmlFor="assignmentRemarks" className="text-left text-muted-foreground">
                  Assignment Remarks
                </Label>
                <Textarea
                  id="assignmentRemarks"
                  name="assignmentRemarks"
                  defaultValue={selectedTask.assignmentRemarks || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="completionRemarks" className="text-left text-muted-foreground">
                  Completion Remarks
                </Label>
                <Textarea
                  id="completionRemarks"
                  name="completionRemarks"
                  defaultValue={selectedTask.completionRemarks || ""}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Unposting Task...
                </div>
              ) : (
                "Confirm Unpost"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}