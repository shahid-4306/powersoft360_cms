// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Folder, Sparkles, Loader2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useUserSession } from "@/hooks/useUserSession"
// import { useProjects } from "@/hooks/useProjects"
// import { useProjectStream } from "@/hooks/useProjectStream"
// import { useCompanyInformation } from "@/hooks/useCompanyInformation"
// import { ProjectForm } from "@/components/project/ProjectForm"
// import { ProjectTable } from "@/components/project/ProjectTable"
// import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"

// export default function ProjectsPage() {
//   const router = useRouter()
//   const { toast } = useToast()
  
//   // Custom hooks for data management
//   const { user, isLoading: sessionLoading } = useUserSession("projects.manage")
//   const { companies } = useCompanyInformation()
//   const { projects, isLoading: projectsLoading, createProject, updateProject, deleteProject } = useProjects()
  
//   // Use real-time stream for projects
//   const streamProjects = useProjectStream()
//   const displayProjects = streamProjects.length > 0 ? streamProjects : projects

//   // Dialog states
//   const [isCreateOpen, setIsCreateOpen] = useState(false)
//   const [isEditOpen, setIsEditOpen] = useState(false)
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false)

//   // Loading states
//   const [isCreating, setIsCreating] = useState(false)
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [isDeleting, setIsDeleting] = useState(false)

//   // Selected items for operations
//   const [selectedProject, setSelectedProject] = useState<any>(null)
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

//   // Project operations
//   const handleCreateProject = async (projectData: any) => {
//     setIsCreating(true)
//     try {
//       await createProject({
//         ...projectData,
//         createdAt: new Date().toISOString(),
//         createdBy: user?.id,
//       })
//       toast({
//         title: "Project Created Successfully! ✨",
//         description: `Project ${projectData.projectName} has been created.`,
//         duration: 5000,
//       })
//       setIsCreateOpen(false)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create project. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsCreating(false)
//     }
//   }

//   const handleUpdateProject = async (projectData: any) => {
//     if (!selectedProject) return
    
//     setIsUpdating(true)
//     try {
//       await updateProject(selectedProject._id!, projectData)
//       toast({
//         title: "Project Updated Successfully! ✅",
//         description: `Project ${projectData.projectName} has been updated.`,
//         duration: 5000,
//       })
//       setIsEditOpen(false)
//       setSelectedProject(null)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update project. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   const handleDeleteProject = async () => {
//     if (!projectToDelete) return
    
//     setIsDeleting(true)
//     try {
//       await deleteProject(projectToDelete)
//       toast({
//         title: "Project Deleted Successfully! 🗑️",
//         description: "The project has been removed from the system.",
//         duration: 5000,
//       })
//       setIsDeleteOpen(false)
//       setProjectToDelete(null)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete project. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   // Helper functions
//   const openEdit = (project: any) => {
//     setSelectedProject(project)
//     setIsEditOpen(true)
//   }

//   const openDelete = (projectId: string) => {
//     setProjectToDelete(projectId)
//     setIsDeleteOpen(true)
//   }

//   const isLoading = sessionLoading || projectsLoading

//   if (isLoading || !user) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
//           <p className="text-muted-foreground">Loading projects...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 animate-fade-in p-4 md:p-6">
//       {/* Header */}
//       <div className="text-center space-y-2">
//         <div className="flex items-center justify-center gap-2 mb-4">
//           <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//             <Folder className="h-6 w-6 text-white" />
//           </div>
//         </div>
//         <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
//           Project Management
//         </h1>
//         <p className="text-muted-foreground">Create and manage projects for companies</p>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         {/* Create Project Card */}
//         <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 animate-slide-in">
//           {/* <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-t-xl border-b border-purple-200/50"> */}
//            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-t-xl border-b border-purple-200/50 pt-4 pb-6 px-6">

//             <CardTitle className="flex items-center gap-2">
//               <Sparkles className="h-5 w-5 text-purple-600" />
//               Project Information
//             </CardTitle>
//             <CardDescription>Create new projects and link them to companies</CardDescription>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="text-center space-y-4">
//               <p className="text-muted-foreground">
//                 Click the button below to add a new project to the system.
//               </p>
//               <Button
//                 onClick={() => setIsCreateOpen(true)}
//                 className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 <Folder className="h-4 w-4 mr-2" />
//                 Create New Project
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Create Project Form */}
//         <ProjectForm
//           isOpen={isCreateOpen}
//           onOpenChange={setIsCreateOpen}
//           onSubmit={handleCreateProject}
//           isLoading={isCreating}
//           companies={companies}
//           mode="create"
//         />

//         {/* Edit Project Form */}
//         <ProjectForm
//           key={`edit-${selectedProject?._id || 'new'}`}
//           isOpen={isEditOpen}
//           onOpenChange={setIsEditOpen}
//           onSubmit={handleUpdateProject}
//           isLoading={isUpdating}
//           companies={companies}
//           initialData={selectedProject}
//           mode="edit"
//         />

//         {/* Delete Confirmation Dialog */}
//         <DeleteConfirmationDialog
//           isOpen={isDeleteOpen}
//           onOpenChange={setIsDeleteOpen}
//           onConfirm={handleDeleteProject}
//           isLoading={isDeleting}
//           title="Confirm Project Deletion"
//           description="Are you sure you want to delete this project? This action cannot be undone."
//           type="project"
//         />

//         {/* Projects Table */}
//         <ProjectTable
//           projects={displayProjects}
//           isLoading={projectsLoading}
//           onEdit={openEdit}
//           onDelete={openDelete}
//         />
//       </div>
//     </div>
//   )
// }
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserSession } from "@/hooks/useUserSession"
import { useProjects } from "@/hooks/useProjects"
import { useProjectStream } from "@/hooks/useProjectStream"
import { useCompanyInformation } from "@/hooks/useCompanyInformation"
import { ProjectForm } from "@/components/project/ProjectForm"
import { ProjectTable } from "@/components/project/ProjectTable"
import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"

export default function ProjectsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Custom hooks for data management
  const { user, isLoading: sessionLoading } = useUserSession("projects.manage")
  const { companies } = useCompanyInformation()
  const { projects, isLoading: projectsLoading, createProject, updateProject, deleteProject } = useProjects()
  
  // Use real-time stream for projects
  const streamProjects = useProjectStream()
  const displayProjects = streamProjects.length > 0 ? streamProjects : projects

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Loading states
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Selected items for operations
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  // Project operations
  const handleCreateProject = async (projectData: any) => {
    setIsCreating(true)
    try {
      await createProject({
        ...projectData,
        createdAt: new Date().toISOString(),
        createdBy: user?.id,
      })
      toast({
        title: "Project Created Successfully! ✨",
        description: `Project ${projectData.projectName} has been created.`,
        duration: 5000,
      })
      setIsCreateOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateProject = async (projectData: any) => {
    if (!selectedProject) return
    
    setIsUpdating(true)
    try {
      await updateProject(selectedProject._id!, projectData)
      toast({
        title: "Project Updated Successfully! ✅",
        description: `Project ${projectData.projectName} has been updated.`,
        duration: 5000,
      })
      setIsEditOpen(false)
      setSelectedProject(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteProject(projectToDelete)
      toast({
        title: "Project Deleted Successfully! 🗑️",
        description: "The project has been removed from the system.",
        duration: 5000,
      })
      setIsDeleteOpen(false)
      setProjectToDelete(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper functions
  const openEdit = (project: any) => {
    setSelectedProject(project)
    setIsEditOpen(true)
  }

  const openDelete = (projectId: string) => {
    setProjectToDelete(projectId)
    setIsDeleteOpen(true)
  }

  const isLoading = sessionLoading || projectsLoading

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
          <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6 bg-[#FEFFFF]">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #11519B, #114A9B)'
            }}
          >
            <Folder className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 
          className="text-2xl md:text-3xl font-bold"
          style={{ 
            background: 'linear-gradient(135deg, #11519B, #114A9B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Project Management
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>Create and manage projects for companies</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Create Project Card */}
        <Card 
          className="border-0 shadow-xl animate-slide-in"
          style={{ 
            background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
          }}
        >
          <CardHeader 
            className="border-0 shadow-xl animate-slide-in pt-4 pb-4"
            style={{ 
              background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.2), rgba(17, 81, 155, 0.1))',
              borderBottomColor: 'rgba(158, 195, 249, 0.3)'
            }}
          >
            <CardTitle className="flex items-center gap-2 text-[#000000]">
              <Sparkles className="h-5 w-5" style={{ color: '#11519B' }} />
              Project Information
            </CardTitle>
            <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>Create new projects and link them to companies</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-[#000000]" style={{ opacity: 0.6 }}>
                Click the button below to add a new project to the system.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                style={{ 
                  background: 'linear-gradient(135deg, #11519B, #114A9B)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #114A9B, #0D3D7A)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #11519B, #114A9B)'
                }}
              >
                <Folder className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Project Form */}
        <ProjectForm
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateProject}
          isLoading={isCreating}
          companies={companies}
          mode="create"
        />

        {/* Edit Project Form */}
        <ProjectForm
          key={`edit-${selectedProject?._id || 'new'}`}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleUpdateProject}
          isLoading={isUpdating}
          companies={companies}
          initialData={selectedProject}
          mode="edit"
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteProject}
          isLoading={isDeleting}
          title="Confirm Project Deletion"
          description="Are you sure you want to delete this project? This action cannot be undone."
          type="project"
        />

        {/* Projects Table */}
        <ProjectTable
          projects={displayProjects}
          isLoading={projectsLoading}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>
    </div>
  )
}