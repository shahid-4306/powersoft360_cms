"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ReportFilters } from "@/hooks/useReport"

interface ReportFilterProps {
  filters: ReportFilters
  onFilterChange: (filters: Partial<ReportFilters>) => void
  onResetFilters: () => void
  companies: string[]
}

export const ReportFilter = ({
  filters,
  onFilterChange,
  onResetFilters,
  companies,
}: ReportFilterProps) => {
  // Set to true by default to show filters
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "assigned", label: "Assigned" },
    { value: "approved", label: "Approved" },
    { value: "completed", label: "Completed" },
    { value: "on-hold", label: "On Hold" },
    { value: "unposted", label: "Unposted" },
    { value: "in-progress", label: "In Progress" },
    { value: "rejected", label: "Rejected" },
  ]

  const developerStatusOptions = [
    { value: "all", label: "All Developer Statuses" },
    { value: "pending", label: "Pending" },
    { value: "done", label: "Done" },
    { value: "not-done", label: "Not Done" },
    { value: "on-hold", label: "On Hold" },
  ]

  const reportTypeOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom Date Range" },
  ]

  const handleDateRangeSelect = (range: { start: Date | null; end: Date | null }) => {
    onFilterChange({
      dateRange: range,
      reportType: range.start && range.end ? "custom" : filters.reportType,
    })
  }

  // Handle select change with conversion from "all" to empty string
  const handleSelectChange = (key: keyof ReportFilters, value: string) => {
    if (value === "all") {
      onFilterChange({ [key]: "" })
    } else {
      onFilterChange({ [key]: value })
    }
  }

  // Get display value for selects
  const getSelectValue = (value: string) => {
    return value === "" ? "all" : value
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-8 w-8 p-0"
          >
            {isFilterOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isFilterOpen && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Report Type */}
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value) =>
                  onFilterChange({ reportType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex flex-col space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start
                        ? format(filters.dateRange.start, "PPP")
                        : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) =>
                        handleDateRangeSelect({
                          ...filters.dateRange,
                          start: date || null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.end
                        ? format(filters.dateRange.end, "PPP")
                        : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) =>
                        handleDateRangeSelect({
                          ...filters.dateRange,
                          end: date || null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Company Filter */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select
                value={getSelectValue(filters.companyName)}
                onValueChange={(value) => handleSelectChange("companyName", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={getSelectValue(filters.status)}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Developer Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="developer-status">Developer Status</Label>
              <Select
                value={getSelectValue(filters.developerStatus)}
                onValueChange={(value) => handleSelectChange("developerStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select developer status" />
                </SelectTrigger>
                <SelectContent>
                  {developerStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 lg:col-span-4 flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  // Trigger filter application
                  onFilterChange({})
                  setIsFilterOpen(false)
                }} 
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Apply Filters
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  onResetFilters()
                  setIsFilterOpen(false)
                }} 
                className="flex-1"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}