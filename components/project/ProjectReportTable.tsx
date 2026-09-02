"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Folder, Database, ClipboardList } from "lucide-react"

interface Project {
  _id?: string
  companyCode: string
  companyName: string
  city: string
  projectName: string
  projectPath: string
  dbName: string
  dbLocation: string
  rProjectName: string
  rProjectPath: string
  createdAt?: string
}

interface ProjectReportTableProps {
  projects: Project[]
  isLoading: boolean
}

export function ProjectReportTable({ projects, isLoading }: ProjectReportTableProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center py-12 text-muted-foreground">
            <div className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium">Loading projects...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-t-xl border-b border-green-200/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-green-600" />
          Project Report ({projects.length} projects)
        </CardTitle>
        <CardDescription className="text-sm">
          Project details and information
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
    <div className="responsive-table overflow-x-auto w-full">
      <div className="min-w-[800px] md:min-w-0"> {/* Crucial: minimum width for mobile scrolling */}
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Project Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Project Path
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                DB Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                DB Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                R-Project Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                R-Project Path
              </th>
            </tr>
          </thead>
            <tbody className="bg-background divide-y divide-border/50">
              {projects.map((project, index) => (
                <tr
                  key={project._id}
                  className={`${index % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-muted/30 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-sm">{project.companyName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {project.companyCode}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Folder className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{project.projectName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{project.city}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {project.projectPath}
                    </code>
                  </td>
                  <td className="px-4 py-3 ">
                    <div className="flex items-center gap-2">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{project.dbName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 ">
                    <span className="text-sm">{project.dbLocation || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 ">
                    <span className="text-sm">{project.rProjectName || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 ">
                    {project.rProjectPath ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {project.rProjectPath}
                      </code>
                    ) : (
                      <span className="text-sm">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </CardContent>
    </Card>
  )
}