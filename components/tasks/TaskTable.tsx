
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Edit,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  User,
  Phone,
  Laptop,
} from "lucide-react";

interface Task {
  _id?: string;
  code: string;
  company: {
    name: string;
    city: string;
    address: string;
  };
  contact: {
    name: string;
    phone: string;
  };
  working: string;
  dateTime: string;
  priority: "Urgent" | "High" | "Normal";
  status: string;
  TaskRemarks: string;
  TasksAttachment: string[];
  softwareType?: string;
  createdAt?: string;
}

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskTable({
  tasks,
  isLoading,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Filter tasks to show only pending ones
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const totalPages = Math.ceil(pendingTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = pendingTasks.slice(startIndex, endIndex);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string): void => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getPageNumbers = (): (number | string)[] => {
    const maxVisiblePages = 5;
    const pages: (number | string)[] = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 1) {
      pages.unshift("...");
      pages.unshift(1);
    }
    if (endPage < totalPages) {
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const downloadFile = async (fileId: string, filename: string): Promise<void> => {
    try {
      const response = await fetch(`/api/download?fileId=${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Function to get software type badge color
  const getSoftwareTypeBadgeColor = (type: string | undefined): string => {
    if (!type) return "bg-muted text-foreground";
    
    const typeLower = type.toLowerCase();
    if (typeLower.includes("pos") || typeLower.includes("point of sale")) {
      return "bg-green-100 text-green-800";
    } else if (typeLower.includes("inventory") || typeLower.includes("stock")) {
      return "bg-accent/30 text-secondary";
    } else if (typeLower.includes("accounting") || typeLower.includes("finance")) {
      return "bg-purple-100 text-purple-800";
    } else if (typeLower.includes("crm") || typeLower.includes("customer")) {
      return "bg-orange-100 text-orange-800";
    } else if (typeLower.includes("hr") || typeLower.includes("human resource")) {
      return "bg-pink-100 text-pink-800";
    } else {
      return "bg-muted text-foreground";
    }
  };

  return (
    <Card 
      className="border-0 shadow-xl mt-8"
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
        <CardTitle className="flex items-center gap-2 text-lg text-[#000000]">
          <FileText className="h-5 w-5" style={{ color: '#11519B' }} />
          Pending Tasks ({pendingTasks.length})
        </CardTitle>
        <CardDescription className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>
          Tasks waiting to be processed. Total tasks: {tasks.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-12 bg-[#FEFFFF]">
            <div className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#11519B', borderTopColor: 'transparent' }} />
            <p className="text-lg font-medium text-[#000000]" style={{ opacity: 0.6 }}>Loading tasks...</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center py-12 bg-[#FEFFFF]">
            <ClipboardList className="h-16 w-16 mx-auto mb-4" style={{ opacity: 0.5, color: '#11519B' }} />
            <p className="text-lg font-medium text-[#000000]" style={{ opacity: 0.6 }}>No pending tasks found</p>
            <p className="text-sm text-[#000000]" style={{ opacity: 0.5 }}>
              All tasks have been processed or create a new task
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead 
                  className="border-b sticky top-0"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.15), rgba(17, 81, 155, 0.05))'
                  }}
                >
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Code
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Company
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Software Type
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell text-[#000000]" style={{ opacity: 0.6 }}>
                      Contact
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell text-[#000000]" style={{ opacity: 0.6 }}>
                      Phone
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Work
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell text-[#000000]" style={{ opacity: 0.6 }}>
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Task Remarks
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Task Attachment
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}>
                  {currentTasks.map((task, index) => (
                    <tr
                      key={task._id || `task-${index}`}
                      className="transition-colors"
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#FEFFFF' : 'rgba(240, 247, 255, 0.5)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(240, 247, 255, 0.8)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FEFFFF' : 'rgba(240, 247, 255, 0.5)'
                      }}
                    >
                      <td className="px-3 py-3">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-mono"
                          style={{ 
                            borderColor: 'rgba(17, 81, 155, 0.3)',
                            color: '#11519B',
                            backgroundColor: 'rgba(17, 81, 155, 0.05)'
                          }}
                        >
                          {task.code?.split("-")[1] || task.code}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-2" style={{ color: '#11519B', opacity: 0.6 }} />
                          <span
                            className="font-medium truncate max-w-[80px] sm:max-w-24 text-[#000000]"
                            title={task.company.name}
                          >
                            {task.company.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <Laptop className="h-3 w-3 mr-2" style={{ color: '#11519B', opacity: 0.6 }} />
                          {task.softwareType ? (
                            <Badge 
                              className={`text-xs ${getSoftwareTypeBadgeColor(task.softwareType)}`}
                              variant="secondary"
                            >
                              {task.softwareType}
                            </Badge>
                          ) : (
                            <span className="text-[#000000] text-xs" style={{ opacity: 0.6 }}>Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-2" style={{ color: '#11519B', opacity: 0.6 }} />
                          <span
                            className="truncate max-w-20 block text-[#000000]"
                            title={task.contact.name}
                          >
                            {task.contact.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" style={{ color: '#11519B', opacity: 0.6 }} />
                          <span className="text-[#000000] text-xs">
                            {task.contact.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="truncate max-w-[100px] block text-xs text-[#000000]"
                          title={task.working}
                        >
                          {task.working}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-[#000000] text-xs">
                          {new Date(task.dateTime).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="truncate max-w-[100px] block text-xs text-[#000000]"
                          title={task.TaskRemarks}
                        >
                          {task.TaskRemarks || "None"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-[#000000]" style={{ opacity: 0.6 }}>
                        {task.TasksAttachment && task.TasksAttachment.length > 0
                          ? `${task.TasksAttachment.length} file${task.TasksAttachment.length > 1 ? "s" : ""}`
                          : "None"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(task)}
                            disabled={isLoading}
                            type="button"
                          >
                            <Edit className="h-4 w-4" style={{ color: '#11519B' }} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => task._id && onDelete(task._id)}
                            disabled={isLoading}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-4" style={{ backgroundColor: '#FEFFFF' }}>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="itemsPerPage" className="text-sm font-medium text-[#000000]" style={{ opacity: 0.6 }}>
                  Tasks per page:
                </label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger id="itemsPerPage" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="min-w-[90px] text-xs sm:text-sm"
                  style={{ 
                    borderColor: 'rgba(17, 81, 155, 0.3)',
                    color: '#11519B'
                  }}
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 hidden sm:flex">
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={`page-${index}-${page}`}
                      variant={
                        page === currentPage
                          ? "default"
                          : page === "..."
                          ? "ghost"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
                      disabled={page === "..." || isLoading}
                      className={
                        page === "..."
                          ? "cursor-default"
                          : "min-w-[32px] text-xs"
                      }
                      style={page === currentPage ? 
                        { 
                          background: 'linear-gradient(135deg, #11519B, #114A9B)',
                          color: '#FEFFFF'
                        } : page !== '...' ? 
                        { 
                          borderColor: 'rgba(17, 81, 155, 0.3)',
                          color: '#11519B'
                        } : 
                        {}
                      }
                      type="button"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="min-w-[90px] text-xs sm:text-sm"
                  style={{ 
                    borderColor: 'rgba(17, 81, 155, 0.3)',
                    color: '#11519B'
                  }}
                  type="button"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}