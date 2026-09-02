// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Building, Edit, Trash2, FileText, ChevronLeft, ChevronRight, ClipboardList, Folder, Database } from "lucide-react"

// interface Project {
//   _id?: string
//   companyCode: string
//   companyName: string
//   city: string
//   address: string
//   projectName: string
//   projectPath: string
//   dbName: string
//   dbLocation: string
//   rProjectName: string
//   rProjectPath: string
//   createdAt?: string
// }

// interface ProjectTableProps {
//   projects: Project[]
//   isLoading: boolean
//   onEdit: (project: Project) => void
//   onDelete: (projectId: string) => void
// }

// export function ProjectTable({ projects, isLoading, onEdit, onDelete }: ProjectTableProps) {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(5)

//   const totalPages = Math.ceil(projects.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentProjects = projects.slice(startIndex, endIndex)

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page)
//     }
//   }

//   const handleItemsPerPageChange = (value: string) => {
//     setItemsPerPage(Number(value))
//     setCurrentPage(1)
//   }

//   const getPageNumbers = () => {
//     const maxVisiblePages = 5
//     const pages = []
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

//     if (endPage - startPage < maxVisiblePages - 1) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1)
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i)
//     }

//     if (startPage > 1) {
//       pages.unshift('...')
//       pages.unshift(1)
//     }
//     if (endPage < totalPages) {
//       pages.push('...')
//       pages.push(totalPages)
//     }

//     return pages
//   }

//   return (
//     <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
//       <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-t-xl border-b border-purple-200/50 py-4">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <FileText className="h-5 w-5 text-purple-600" />
//           All Projects ({projects.length})
//         </CardTitle>
//         <CardDescription className="text-sm">Complete list of all projects in the system</CardDescription>
//       </CardHeader>
//       <CardContent className="p-0">
//         {isLoading ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <div className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//             <p className="text-lg font-medium">Loading projects...</p>
//           </div>
//         ) : projects.length === 0 ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
//             <p className="text-lg font-medium">No projects created yet</p>
//             <p className="text-sm">Create your first project using the form above</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gradient-to-r from-muted/50 to-muted/30 border-b sticky top-0">
//                   <tr>
//                     <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                       Company
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                       Project
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
//                       Project Path
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
//                       DB Name
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
//                       DB Location
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
//                       R-Project
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-background divide-y divide-border/50">
//                   {currentProjects.map((project, index) => (
//                     <tr
//                       key={project._id}
//                       className={`${index % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-muted/30 transition-colors`}
//                     >
//                       <td className="px-3 py-3">
//                         <div className="space-y-1">
//                           <div className="flex items-center gap-2">
//                             <Building className="h-3 w-3 text-muted-foreground" />
//                             <span className="font-medium text-xs">{project.companyName}</span>
//                           </div>
//                           <Badge variant="outline" className="text-xs">
//                             {project.companyCode}
//                           </Badge>
//                         </div>
//                       </td>
//                       <td className="px-3 py-3">
//                         <div className="flex items-center gap-2">
//                           <Folder className="h-3 w-3 text-muted-foreground" />
//                           <span className="font-medium text-sm">{project.projectName}</span>
//                         </div>
//                       </td>
//                       <td className="px-3 py-3 hidden lg:table-cell">
//                         <code className="text-xs bg-muted px-2 py-1 rounded">{project.projectPath}</code>
//                       </td>
//                       <td className="px-3 py-3 hidden md:table-cell">
//                         <div className="flex items-center gap-2">
//                           <Database className="h-3 w-3 text-muted-foreground" />
//                           <span className="text-xs">{project.dbName || 'N/A'}</span>
//                         </div>
//                       </td>
//                       <td className="px-3 py-3 hidden xl:table-cell">
//                         <span className="text-xs">{project.dbLocation || 'N/A'}</span>
//                       </td>
//                       <td className="px-3 py-3 hidden xl:table-cell">
//                         <div className="space-y-1">
//                           <span className="text-xs block">{project.rProjectName || 'N/A'}</span>
//                           {project.rProjectPath && (
//                             <code className="text-xs bg-muted px-1 py-0.5 rounded">{project.rProjectPath}</code>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-3 py-3">
//                         <div className="flex gap-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => onEdit(project)}
//                             disabled={isLoading}
//                           >
//                             <Edit className="h-4 w-4 text-primary" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => project._id && onDelete(project._id)}
//                             disabled={isLoading}
//                           >
//                             <Trash2 className="h-4 w-4 text-red-600" />
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-4">
//               <div className="flex items-center gap-2 w-full sm:w-auto">
//                 <label htmlFor="itemsPerPage" className="text-sm font-medium">
//                   Projects per page:
//                 </label>
//                 <Select
//                   value={itemsPerPage.toString()}
//                   onValueChange={handleItemsPerPageChange}
//                 >
//                   <SelectTrigger id="itemsPerPage" className="w-[100px]">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="5">5</SelectItem>
//                     <SelectItem value="10">10</SelectItem>
//                     <SelectItem value="15">15</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="flex items-center justify-center gap-2 flex-wrap">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1 || isLoading}
//                   className="min-w-[90px] text-xs sm:text-sm"
//                 >
//                   <ChevronLeft className="h-4 w-4 mr-1" />
//                   Previous
//                 </Button>
//                 <div className="flex items-center gap-1 hidden sm:flex">
//                   {getPageNumbers().map((page, index) => (
//                     <Button
//                       key={index}
//                       variant={page === currentPage ? "default" : page === '...' ? "ghost" : "outline"}
//                       size="sm"
//                       onClick={() => typeof page === 'number' && handlePageChange(page)}
//                       disabled={page === '...' || isLoading}
//                       className={page === '...' ? "cursor-default" : "min-w-[32px] text-xs"}
//                     >
//                       {page}
//                     </Button>
//                   ))}
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages || isLoading}
//                   className="min-w-[90px] text-xs sm:text-sm"
//                 >
//                   Next
//                   <ChevronRight className="h-4 w-4 ml-1" />
//                 </Button>
//               </div>
//             </div>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   )
// }
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Edit, Trash2, FileText, ChevronLeft, ChevronRight, ClipboardList, Folder, Database } from "lucide-react"

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
  createdAt?: string
}

interface ProjectTableProps {
  projects: Project[]
  isLoading: boolean
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
}

export function ProjectTable({ projects, isLoading, onEdit, onDelete }: ProjectTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = projects.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const maxVisiblePages = 5
    const pages = []
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (startPage > 1) {
      pages.unshift('...')
      pages.unshift(1)
    }
    if (endPage < totalPages) {
      pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

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
          All Projects ({projects.length})
        </CardTitle>
        <CardDescription className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Complete list of all projects in the system</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-12 bg-[#FEFFFF]">
            <div className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#11519B', borderTopColor: 'transparent' }} />
            <p className="text-lg font-medium text-[#000000]" style={{ opacity: 0.6 }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-[#FEFFFF]">
            <ClipboardList className="h-16 w-16 mx-auto mb-4" style={{ opacity: 0.5, color: '#11519B' }} />
            <p className="text-lg font-medium text-[#000000]" style={{ opacity: 0.6 }}>No projects created yet</p>
            <p className="text-sm text-[#000000]" style={{ opacity: 0.5 }}>Create your first project using the form above</p>
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
                      Company
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Project
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell text-[#000000]" style={{ opacity: 0.6 }}>
                      Project Path
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell text-[#000000]" style={{ opacity: 0.6 }}>
                      DB Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell text-[#000000]" style={{ opacity: 0.6 }}>
                      DB Location
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell text-[#000000]" style={{ opacity: 0.6 }}>
                      R-Project
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}>
                  {currentProjects.map((project, index) => (
                    <tr
                      key={project._id}
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
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3" style={{ color: '#11519B', opacity: 0.6 }} />
                            <span className="font-medium text-xs text-[#000000]">{project.companyName}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: 'rgba(17, 81, 155, 0.3)',
                              color: '#11519B',
                              backgroundColor: 'rgba(17, 81, 155, 0.05)'
                            }}
                          >
                            {project.companyCode}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Folder className="h-3 w-3" style={{ color: '#11519B', opacity: 0.6 }} />
                          <span className="font-medium text-sm text-[#000000]">{project.projectName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <code 
                          className="text-xs px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: 'rgba(17, 81, 155, 0.05)',
                            color: '#11519B'
                          }}
                        >
                          {project.projectPath}
                        </code>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Database className="h-3 w-3" style={{ color: '#11519B', opacity: 0.6 }} />
                          <span className="text-xs text-[#000000]">{project.dbName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden xl:table-cell">
                        <span className="text-xs text-[#000000]">{project.dbLocation || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-3 hidden xl:table-cell">
                        <div className="space-y-1">
                          <span className="text-xs block text-[#000000]">{project.rProjectName || 'N/A'}</span>
                          {project.rProjectPath && (
                            <code 
                              className="text-xs px-1 py-0.5 rounded"
                              style={{ 
                                backgroundColor: 'rgba(17, 81, 155, 0.05)',
                                color: '#11519B'
                              }}
                            >
                              {project.rProjectPath}
                            </code>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(project)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" style={{ color: '#11519B' }} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => project._id && onDelete(project._id)}
                            disabled={isLoading}
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-4" style={{ backgroundColor: '#FEFFFF' }}>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="itemsPerPage" className="text-sm font-medium text-[#000000]" style={{ opacity: 0.6 }}>
                  Projects per page:
                </label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger id="itemsPerPage" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
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
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 hidden sm:flex">
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === currentPage ? "default" : page === '...' ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...' || isLoading}
                      className={page === '...' ? "cursor-default" : "min-w-[32px] text-xs"}
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
  )
}