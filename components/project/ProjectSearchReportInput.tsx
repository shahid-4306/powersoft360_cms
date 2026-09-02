"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectSearchReportInputProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  resultsCount: number
}

export function ProjectSearchReportInput({ 
  searchTerm, 
  onSearchChange, 
  resultsCount 
}: ProjectSearchReportInputProps) {
  const clearSearch = () => {
    onSearchChange("")
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="project-search" className="text-lg font-semibold">
        Search Projects
      </Label>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="project-search"
          placeholder="Search by project name, company name, or company code..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 py-2 text-base"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Found {resultsCount} projects matching your search</p>
      </div>
    </div>
  )
}