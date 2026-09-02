"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building, MapPin, Folder, Database, Loader2, Search } from "lucide-react"

interface Company {
  _id?: string
  code: string
  companyName: string
  city: string
  address: string
}

interface Project {
  _id?: string
  companyCode: string
  companyName: string
  city: string
  address: string
  projectName: string
  projectPath: string
  dbName: string
  dbLocation: string
  rProjectName: string
  rProjectPath: string
}

interface ProjectFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (projectData: Omit<Project, '_id'>) => Promise<void>
  isLoading: boolean
  companies: Company[]
  initialData?: Project
  mode: "create" | "edit"
}

export function ProjectForm({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isLoading, 
  companies, 
  initialData,
  mode 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<Omit<Project, '_id'>>({
    companyCode: "",
    companyName: "",
    city: "",
    address: "",
    projectName: "",
    projectPath: "",
    dbName: "",
    dbLocation: "",
    rProjectName: "",
    rProjectPath: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies)

  // Filter companies based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(company => 
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCompanies(filtered)
    } else {
      setFilteredCompanies(companies)
    }
  }, [searchTerm, companies])

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData(initialData)
      } else {
        setFormData({
          companyCode: "",
          companyName: "",
          city: "",
          address: "",
          projectName: "",
          projectPath: "",
          dbName: "",
          dbLocation: "",
          rProjectName: "",
          rProjectPath: "",
        })
      }
    }
  }, [isOpen, initialData, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.companyCode || !formData.projectName || !formData.projectPath) {
      alert("Please fill in all required fields")
      return
    }

    await onSubmit(formData)
    
    // Only reset form after successful creation
    if (mode === "create") {
      setFormData({
        companyCode: "",
        companyName: "",
        city: "",
        address: "",
        projectName: "",
        projectPath: "",
        dbName: "",
        dbLocation: "",
        rProjectName: "",
        rProjectPath: "",
      })
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setShowCompanyDropdown(false)
      setSearchTerm("")
    }
  }

  const handleCompanySelect = (company: Company) => {
    setFormData({
      ...formData,
      companyCode: company.code,
      companyName: company.companyName,
      city: company.city,
      address: company.address,
    })
    setShowCompanyDropdown(false)
    setSearchTerm("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Project" : "Edit Project"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new project to the system" : "Update project details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection */}
          <div className="space-y-4">
            <Label>Company Information *</Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-auto py-3 px-3"
                onClick={() => setShowCompanyDropdown(true)}
              >
                {formData.companyCode ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formData.companyName}</span>
                      <Badge variant="secondary" className="ml-2">
                        {formData.companyCode}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {formData.city}
                      </div>
                      <div>{formData.address}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Search and select company...
                  </div>
                )}
              </Button>

              {showCompanyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </div>
                  <div className="py-1">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map((company) => (
                        <button
                          key={company._id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                          onClick={() => handleCompanySelect(company)}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{company.companyName}</span>
                              <Badge variant="outline" className="text-xs">
                                {company.code}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.city}
                              </div>
                              <div>{company.address}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-muted-foreground">
                        No companies found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <div className="relative">
                <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectPath">Project Path *</Label>
              <Input
                id="projectPath"
                placeholder="Enter project path"
                value={formData.projectPath}
                onChange={(e) => setFormData(prev => ({ ...prev, projectPath: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Database Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dbName">Database Name</Label>
              <div className="relative">
                <Database className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dbName"
                  placeholder="Enter database name"
                  value={formData.dbName}
                  onChange={(e) => setFormData(prev => ({ ...prev, dbName: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbLocation">Database Location</Label>
              <Input
                id="dbLocation"
                placeholder="Enter database location"
                value={formData.dbLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, dbLocation: e.target.value }))}
              />
            </div>
          </div>

          {/* R-Project Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rProjectName">R-Project Name</Label>
              <Input
                id="rProjectName"
                placeholder="Enter R-project name"
                value={formData.rProjectName}
                onChange={(e) => setFormData(prev => ({ ...prev, rProjectName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rProjectPath">R-Project Path</Label>
              <Input
                id="rProjectPath"
                placeholder="Enter R-project path"
                value={formData.rProjectPath}
                onChange={(e) => setFormData(prev => ({ ...prev, rProjectPath: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </div>
              ) : (
                mode === "create" ? "Create Project" : "Save Changes"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Badge component if not already available
const Badge = ({ variant, className, children }: any) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
)