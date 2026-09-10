


"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, User, Phone, FileText, Calendar, ClipboardList, Paperclip, Download, Loader2, Trash2, Zap, AlertTriangle, MapPin, Users } from "lucide-react"
import { useFileDownload } from "@/hooks/useFileDownload"
import { useComplaintDownload } from "@/hooks/useComplaintDownload"
import { useEffect, useState } from "react"

interface AssignmentDialogProps {
  isOpen: boolean
  onClose: () => void
  item: any
  isComplaint?: boolean
  users: any[]
  assignmentData: {
    userId: string
    assignedDate: string
    expectedCompletionAt: string
  }
  remarks: string
  files: File[]
  isAssigning: boolean
  onAssignmentDataChange: (data: any) => void
  onRemarksChange: (remarks: string) => void
  onFilesChange: (files: File[]) => void
  onFileAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileRemove: (index: number) => void
  onAssign: () => void
}

export function AssignmentDialog({
  isOpen,
  onClose,
  item,
  isComplaint = false,
  users,
  assignmentData,
  remarks,
  files,
  isAssigning,
  onAssignmentDataChange,
  onRemarksChange,
  onFilesChange,
  onFileAdd,
  onFileRemove,
  onAssign
}: AssignmentDialogProps) {
  const { isDownloading: isTaskDownloading, downloadAllAttachments: downloadTaskAttachments } = useFileDownload()
  const [localItem, setLocalItem] = useState<any>(null)
  const { isDownloading: isComplaintDownloading, downloadAllAttachments: downloadComplaintAttachments } = useComplaintDownload()

  // Validation state for expected completion
  const [expectedError, setExpectedError] = useState<string>("")
  const [touched, setTouched] = useState(false)
  const [assignedDateError, setAssignedDateError] = useState<string>("")
  const [assignedDateTouched, setAssignedDateTouched] = useState(false)

  // Update local item when prop changes
  useEffect(() => {
    if (item) {
      setLocalItem(item)
    }
  }, [item])

  // Reset local item when dialog closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setLocalItem(null)
        setExpectedError("")
        setTouched(false)
        setAssignedDateError("")
        setAssignedDateTouched(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Re-validate expected completion when assignedDate changes
  useEffect(() => {
    if (touched && assignmentData.expectedCompletionAt) {
      setExpectedError(validateExpectedCompletion(assignmentData.expectedCompletionAt))
    }
  }, [assignmentData.assignedDate])

  // Helper function to get company data consistently
  const getCompanyData = () => {
    if (!localItem) return null;
    
    // For both tasks and complaints, company data should be in item.company
    const company = localItem.company || {};
    
    return {
      name: company.name || company.companyName || 'N/A',
      representative: company.companyRepresentative || company.representative || company.contactPerson || 'N/A',
      city: company.city || company.location || 'N/A',
      phone: company.phone || company.contactPhone || company.phoneNumber || 'N/A',
      email: company.email || company.contactEmail || 'N/A',
      address: company.address || company.fullAddress || 'N/A'
    };
  };

  // Helper function to get contact data
  const getContactData = () => {
    if (!localItem) return null;
    
    if (isComplaint) {
      return {
        name: localItem.contactPerson || localItem.contact?.name || 'N/A',
        phone: localItem.contactPhone || localItem.contact?.phone || 'N/A'
      };
    } else {
      return {
        name: localItem.contact?.name || localItem.contactPerson || 'N/A',
        phone: localItem.contact?.phone || localItem.contactPhone || 'N/A'
      };
    }
  };

  // Normalize attachments for both tasks & complaints (covers different field names)
  const getAttachments = () => {
    if (!localItem) return []
    
    // For complaints: check both possible field names
    if (isComplaint) {
      return localItem.attachments || localItem.complaintAttachments || []
    }
    
    // For tasks: check various field names
    return localItem.TasksAttachment || localItem.attachments || localItem.Attachments || []
  }

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================

  // Validate assignment date
  const validateAssignedDate = (value: string): string => {
    if (!value) {
      return "Assignment date & time is required"
    }

    const selectedDate = new Date(value)
    if (isNaN(selectedDate.getTime())) {
      return "Please enter a valid date & time"
    }

    return ""
  }

  // Validate expected completion datetime
  const validateExpectedCompletion = (value: string): string => {
    if (!value) {
      return "Expected completion time is required"
    }

    const selectedDate = new Date(value)
    if (isNaN(selectedDate.getTime())) {
      return "Please enter a valid date & time"
    }

    const now = new Date()
    
    // Check if date is in the past
    if (selectedDate < now) {
      return "Expected completion time cannot be in the past"
    }

    // Check if expected completion is before/equal assigned date
    if (assignmentData.assignedDate) {
      const assignedDate = new Date(assignmentData.assignedDate)
      if (!isNaN(assignedDate.getTime()) && selectedDate <= assignedDate) {
        return "Expected completion must be after the assignment date"
      }
    }

    return ""
  }

  // Check if form is valid overall
  const isFormValid = (): boolean => {
    if (!assignmentData.userId) return false
    if (!assignmentData.assignedDate) return false
    if (!assignmentData.expectedCompletionAt) return false
    if (validateAssignedDate(assignmentData.assignedDate)) return false
    if (validateExpectedCompletion(assignmentData.expectedCompletionAt)) return false
    return true
  }

  // ============================================================
  // BADGE HELPERS
  // ============================================================

  const getPriorityBadge = (priority?: string) => {
    const prio = priority || "Normal";
    switch (prio) {
      case "Urgent":
        return <Badge variant="destructive" className="text-xs flex items-center gap-1"><Zap className="h-3 w-3" /> Urgent</Badge>
      case "High":
        return <Badge className="bg-orange-500 text-xs flex items-center gap-1">High</Badge>
      default:
        return <Badge variant="secondary" className="text-xs flex items-center gap-1">Normal</Badge>
    }
  }

  const getStatusBadge = () => {
    if (!localItem) return null
    
    const status = localItem.status || 'pending'
    
    if (isComplaint) {
      switch (status.toLowerCase()) {
        case 'registered':
          return <Badge className="bg-purple-600 text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Registered</Badge>
        case 'in-progress':
        case 'inprogress':
          return <Badge className="bg-primary text-xs">In Progress</Badge>
        default:
          return <Badge variant="outline" className="text-xs">{status}</Badge>
      }
    } else {
      switch (status.toLowerCase()) {
        case 'pending':
          return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">Pending Approval</Badge>
        default:
          return <Badge variant="outline" className="text-xs">{status}</Badge>
      }
    }
  }

  // Don't render the dialog content if item is null
  if (!localItem) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const companyData = getCompanyData();
  const contactData = getContactData();
  const attachments = getAttachments(); // unified attachments array

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[360px] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isComplaint ? 'Assign Complaint' : 'Approve & Assign Task'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isComplaint ? 
              `Assign complaint ${localItem.complaintNumber || ""} to a team member` :
              `Approve task ${localItem.code || ""} and assign it to a team member`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border rounded-lg bg-muted/50">
              <thead className="bg-muted">
                <tr>
                  <th colSpan={2} className="p-2 sm:p-3 text-left font-semibold text-foreground/80 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
                      {isComplaint ? 'Complaint Details' : 'Task Details'}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Company Section - Same for both tasks and complaints */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" /> Company
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    <div className="font-medium">{companyData?.name}</div>
                    {companyData?.representative && companyData.representative !== 'N/A' && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Representative: {companyData.representative}
                      </div>
                    )}
                    {companyData?.city && companyData.city !== 'N/A' && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location: {companyData.city}
                      </div>
                    )}
                    {companyData?.phone && companyData.phone !== 'N/A' && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Company Phone: {companyData.phone}
                      </div>
                    )}
                  </td>
                </tr>
                
                {/* Contact Person */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <User className="h-3 w-3 text-muted-foreground" /> Contact Person
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    <div>{contactData?.name}</div>
                    {contactData?.phone && contactData.phone !== 'N/A' && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Direct Phone: {contactData.phone}
                      </div>
                    )}
                  </td>
                </tr>
                
                {/* Software Type (for complaints) */}
                {isComplaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <FileText className="h-3 w-3 text-muted-foreground" /> Software
                    </td>
                    <td className="p-2 sm:p-3 break-words">{localItem.softwareType || 'N/A'}</td>
                  </tr>
                )}

                {/* Complaint Type (for complaints) */}
                {isComplaint && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <ClipboardList className="h-3 w-3 text-muted-foreground" /> Complaint Type
                    </td>
                    <td className="p-2 sm:p-3 break-words">{localItem.complaintType || 'N/A'}</td>
                  </tr>
                )}
                
                {/* Description/Remarks */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" /> 
                    {isComplaint ? 'Complaint Remarks' : 'Work Description'}
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {isComplaint ? 
                      localItem.complaintRemarks || 'No remarks provided' : 
                      localItem.working || 'No description provided'
                    }
                  </td>
                </tr>
                
                {/* Task Remarks (for tasks only) */}
                {!isComplaint && localItem.TaskRemarks && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <FileText className="h-3 w-3 text-muted-foreground" /> Task Remarks
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {localItem.TaskRemarks}
                    </td>
                  </tr>
                )}
                
                {/* Priority */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Zap className="h-3 w-3 text-muted-foreground" /> Priority
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {getPriorityBadge(localItem.priority)}
                  </td>
                </tr>
                
                {/* UNIFIED Attachments block: works for tasks AND complaints */}
                {attachments && attachments.length > 0 && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Paperclip className="h-3 w-3 text-muted-foreground" /> Attachments
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      <div className="space-y-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            if (isComplaint) {
                              console.log('Downloading complaint attachments:', {
                                _id: localItem._id,
                                complaintNumber: localItem.complaintNumber,
                                attachmentsCount: attachments.length
                              });
                              downloadComplaintAttachments(
                                localItem._id,
                                localItem.complaintNumber
                              );
                            } else {
                              console.log('Downloading task attachments:', localItem._id);
                              downloadTaskAttachments(localItem._id);
                            }
                          }}
                          disabled={isComplaint ? isComplaintDownloading : isTaskDownloading}
                        >
                          {(isComplaint ? isComplaintDownloading : isTaskDownloading) ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3 mr-1" />
                              Download All {attachments.length > 0 ? `(${attachments.length})` : ''}
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Created Date */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Created At
                  </td>
                  <td className="p-2 sm:p-3 break-words">
                    {localItem.createdAt 
                      ? new Date(localItem.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                      : "N/A"}
                  </td>
                </tr>
                
                {/* Scheduled Date (for tasks only) */}
                {!isComplaint && localItem.dateTime && (
                  <tr>
                    <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 flex items-center gap-1 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" /> Scheduled Date
                    </td>
                    <td className="p-2 sm:p-3 break-words">
                      {new Date(localItem.dateTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                )}
                
                {/* Status */}
                <tr>
                  <td className="p-2 sm:p-3 font-medium w-[100px] sm:w-[120px] shrink-0 text-xs sm:text-sm">
                    Status
                  </td>
                  <td className="p-2 sm:p-3">
                    {getStatusBadge()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ============================================================
              ASSIGNMENT FORM SECTION
          ============================================================ */}
          <div className="space-y-4">
            {/* Assign to User */}
            <div className="space-y-2">
              <Label htmlFor="user" className="text-xs sm:text-sm font-medium">Assign to User *</Label>
              <Select
                value={assignmentData.userId}
                onValueChange={(value) => onAssignmentDataChange({ ...assignmentData, userId: value })}
              >
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Choose a team member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id} className="text-xs sm:text-sm">
                      {user.name} ({user.role?.name || "No Role"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignment Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="assignedDate" className="text-xs sm:text-sm font-medium">Assignment Date & Time *</Label>
              <Input
                id="assignedDate"
                type="datetime-local"
                value={assignmentData.assignedDate}
                onChange={(e) => {
                  const value = e.target.value
                  onAssignmentDataChange({ ...assignmentData, assignedDate: value })
                  if (assignedDateTouched) {
                    setAssignedDateError(validateAssignedDate(value))
                  }
                  // Re-validate expected completion since assignedDate changed
                  if (touched && assignmentData.expectedCompletionAt) {
                    setExpectedError(validateExpectedCompletion(assignmentData.expectedCompletionAt))
                  }
                }}
                onBlur={(e) => {
                  setAssignedDateTouched(true)
                  setAssignedDateError(validateAssignedDate(e.target.value))
                }}
                className={`w-full text-xs sm:text-sm ${
                  assignedDateError && assignedDateTouched ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {assignedDateError && assignedDateTouched && (
                <p className="text-[11px] sm:text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {assignedDateError}
                </p>
              )}
            </div>

            {/* Expected Completion Time / Response Time */}
            <div className="space-y-2">
              <Label htmlFor="expectedCompletionAt" className="text-xs sm:text-sm font-medium">
                Expected Completion Time / Response Time *
              </Label>
              <Input
                id="expectedCompletionAt"
                type="datetime-local"
                value={assignmentData.expectedCompletionAt}
                min={assignmentData.assignedDate || new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  const value = e.target.value
                  onAssignmentDataChange({ ...assignmentData, expectedCompletionAt: value })
                  if (touched) {
                    setExpectedError(validateExpectedCompletion(value))
                  }
                }}
                onBlur={(e) => {
                  setTouched(true)
                  setExpectedError(validateExpectedCompletion(e.target.value))
                }}
                className={`w-full text-xs sm:text-sm ${
                  expectedError && touched ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                placeholder="YYYY-MM-DDTHH:mm"
              />
              
              {/* Error message */}
              {expectedError && touched && (
                <p className="text-[11px] sm:text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {expectedError}
                </p>
              )}
              
              {/* Helper text (only when no error) */}
              {!expectedError && (
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  {isComplaint
                    ? "The assigned user and the customer will both see this as the deadline to complete the complaint."
                    : "The assigned user will see this as the deadline to complete the task."}
                </p>
              )}
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-xs sm:text-sm font-medium">
                {isComplaint ? 'Assignment Remarks' : 'Assign Remarks'}
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => onRemarksChange(e.target.value)}
                placeholder="Enter any special instructions or remarks"
                rows={3}
                className="w-full text-xs sm:text-sm"
              />
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label htmlFor="files" className="text-xs sm:text-sm font-medium">Attach Files (Optional)</Label>
              <div className="border rounded-md p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm font-medium">Assignment Files</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt,.csv,.json"
                      onChange={onFileAdd}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline" size="sm" className="text-xs">
                      <Paperclip className="h-3 w-3 mr-1" />
                      Add Files
                    </Button>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Selected files:</div>
                    <div className="grid gap-2 max-h-32 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs truncate max-w-xs">{file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onFileRemove(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================
              ACTION BUTTONS
          ============================================================ */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              onClick={() => {
                setTouched(true)
                setAssignedDateTouched(true)
                const expError = validateExpectedCompletion(assignmentData.expectedCompletionAt)
                const assError = validateAssignedDate(assignmentData.assignedDate)
                setExpectedError(expError)
                setAssignedDateError(assError)
                if (!expError && !assError) {
                  onAssign()
                }
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-2"
              disabled={isAssigning || !localItem || !isFormValid()}
            >
              {isAssigning ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </div>
              ) : (
                isComplaint ? "Assign Complaint" : "Approve & Assign Task"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs sm:text-sm py-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}