// // "use client"

// // import { useState } from "react"
// // import { useRouter } from "next/navigation"
// // import { Button } from "@/components/ui/button"
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Building, Sparkles, Loader2 } from "lucide-react"
// // import { useToast } from "@/hooks/use-toast"
// // import { useUserSession } from "@/hooks/useUserSession"
// // import { useUsers } from "@/hooks/useUsers"
// // import { useCompanyInformation } from "@/hooks/useCompanyInformation"
// // import { useCompanyStream } from "@/hooks/useCompanyStream"
// // import { CompanyForm } from "@/components/company/CompanyForm"
// // import { CompanyTable } from "@/components/company/CompanyTable"
// // import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"

// // export default function CreateCompanyPage() {
// //   const router = useRouter()
// //   const { toast } = useToast()
  
// //   // Custom hooks for data management
// //   const { user, isLoading: sessionLoading } = useUserSession("company_information.manage")
// //   const { users, isLoading: usersLoading } = useUsers()
// //   const { companies, isLoading: companiesLoading, createCompany, updateCompany, deleteCompany } = useCompanyInformation()
  
// //   // Use real-time stream for companies
// //   const streamCompanies = useCompanyStream()
// //   const displayCompanies = streamCompanies.length > 0 ? streamCompanies : companies

// //   // Dialog states
// //   const [isCreateOpen, setIsCreateOpen] = useState(false)
// //   const [isEditOpen, setIsEditOpen] = useState(false)
// //   const [isDeleteOpen, setIsDeleteOpen] = useState(false)

// //   // Loading states
// //   const [isCreating, setIsCreating] = useState(false)
// //   const [isUpdating, setIsUpdating] = useState(false)
// //   const [isDeleting, setIsDeleting] = useState(false)

// //   // Selected items for operations
// //   const [selectedCompany, setSelectedCompany] = useState<any>(null)
// //   const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)

// //   // Company operations
// //   const handleCreateCompany = async (companyData: any) => {
// //     setIsCreating(true)
// //     try {
// //       await createCompany({
// //         ...companyData,
// //         createdAt: new Date().toISOString(),
// //         createdBy: user?.id,
// //       })
// //       toast({
// //         title: "Company Created Successfully! ✨",
// //         description: `Company ${companyData.code} has been created.`,
// //         duration: 5000,
// //       })
// //       setIsCreateOpen(false)
// //     } catch (error: any) {
// //       toast({
// //         title: "Error",
// //         description: error.message || "Failed to create company. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsCreating(false)
// //     }
// //   }

// //   const handleUpdateCompany = async (companyData: any) => {
// //     if (!selectedCompany) return
    
// //     setIsUpdating(true)
// //     try {
// //       await updateCompany(selectedCompany._id!, companyData)
// //       toast({
// //         title: "Company Updated Successfully! ✅",
// //         description: `Company ${companyData.code} has been updated.`,
// //         duration: 5000,
// //       })
// //       setIsEditOpen(false)
// //       setSelectedCompany(null)
// //     } catch (error: any) {
// //       toast({
// //         title: "Error",
// //         description: error.message || "Failed to update company. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsUpdating(false)
// //     }
// //   }

// //   const handleDeleteCompany = async () => {
// //     if (!companyToDelete) return
    
// //     setIsDeleting(true)
// //     try {
// //       await deleteCompany(companyToDelete)
// //       toast({
// //         title: "Company Deleted Successfully! 🗑️",
// //         description: "The company has been removed from the system.",
// //         duration: 5000,
// //       })
// //       setIsDeleteOpen(false)
// //       setCompanyToDelete(null)
// //     } catch (error: any) {
// //       toast({
// //         title: "Error",
// //         description: error.message || "Failed to delete company. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsDeleting(false)
// //     }
// //   }

// //   // Helper functions
// //   const openEdit = (company: any) => {
// //     setSelectedCompany(company)
// //     setIsEditOpen(true)
// //   }

// //   const openDelete = (companyId: string) => {
// //     setCompanyToDelete(companyId)
// //     setIsDeleteOpen(true)
// //   }

// //   const isLoading = sessionLoading || usersLoading || companiesLoading

// //   if (isLoading || !user) {
// //     return (
// //       <div className="flex items-center justify-center min-h-[400px]">
// //         <div className="text-center">
// //           <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
// //           <p className="text-muted-foreground">Loading company information...</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="space-y-6 animate-fade-in p-4 md:p-6">
// //       {/* Header */}
// //       <div className="text-center space-y-2">
// //         <div className="flex items-center justify-center gap-2 mb-4">
// //           <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
// //             <Building className="h-6 w-6 text-white" />
// //           </div>
// //         </div>
// //         <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
// //           Add Company Information
// //         </h1>
// //         <p className="text-muted-foreground">Add new company details to your system</p>
// //       </div>

// //       <div className="max-w-4xl mx-auto">
// //         {/* Create Company Card */}
// //         <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 animate-slide-in">
// //           <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-t-xl border-b border-emerald-200/50">
// //             <CardTitle className="flex items-center gap-2">
// //               <Sparkles className="h-5 w-5 text-emerald-600" />
// //               Company Information
// //             </CardTitle>
// //             <CardDescription>Fill in the details for the new company</CardDescription>
// //           </CardHeader>
// //           <CardContent className="p-6">
// //             <div className="text-center space-y-4">
// //               <p className="text-muted-foreground">
// //                 Click the button below to add a new company to the system.
// //               </p>
// //               <Button
// //                 onClick={() => setIsCreateOpen(true)}
// //                 className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300"
// //               >
// //                 <Building className="h-4 w-4 mr-2" />
// //                 Create New Company
// //               </Button>
// //             </div>
// //           </CardContent>
// //         </Card>

// //         {/* Create Company Form */}
// //         <CompanyForm
// //           isOpen={isCreateOpen}
// //           onOpenChange={setIsCreateOpen}
// //           onSubmit={handleCreateCompany}
// //           isLoading={isCreating}
// //           users={users}
// //           mode="create"
// //         />

// //         {/* Edit Company Form */}
// //         <CompanyForm
// //           key={`edit-${selectedCompany?._id || 'new'}`}
// //           isOpen={isEditOpen}
// //           onOpenChange={setIsEditOpen}
// //           onSubmit={handleUpdateCompany}
// //           isLoading={isUpdating}
// //           users={users}
// //           initialData={selectedCompany}
// //           mode="edit"
// //         />

// //         {/* Delete Confirmation Dialog */}
// //         <DeleteConfirmationDialog
// //           isOpen={isDeleteOpen}
// //           onOpenChange={setIsDeleteOpen}
// //           onConfirm={handleDeleteCompany}
// //           isLoading={isDeleting}
// //           title="Confirm Deletion"
// //           description="Are you sure you want to delete this company? This action cannot be undone."
// //           type="company"
// //         />

// //         {/* Companies Table */}
// //         <CompanyTable
// //           companies={displayCompanies}
// //           isLoading={companiesLoading}
// //           onEdit={openEdit}
// //           onDelete={openDelete}
// //         />
// //       </div>
// //     </div>
// //   )
// // }
// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Building, Sparkles, Loader2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useUserSession } from "@/hooks/useUserSession"
// import { useUsers } from "@/hooks/useUsers"
// import { useCompanyInformation } from "@/hooks/useCompanyInformation"
// import { useCompanyStream } from "@/hooks/useCompanyStream"
// import { CompanyForm } from "@/components/company/CompanyForm"
// import { CompanyTable } from "@/components/company/CompanyTable"
// import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"

// export default function CreateCompanyPage() {
//   const router = useRouter()
//   const { toast } = useToast()
  
//   // Custom hooks for data management
//   const { user, isLoading: sessionLoading } = useUserSession("company_information.manage")
//   const { users, isLoading: usersLoading } = useUsers()
//   const { companies, isLoading: companiesLoading, createCompany, updateCompany, deleteCompany } = useCompanyInformation()
  
//   // Use real-time stream for companies
//   const streamCompanies = useCompanyStream()
//   const displayCompanies = streamCompanies.length > 0 ? streamCompanies : companies

//   // Dialog states
//   const [isCreateOpen, setIsCreateOpen] = useState(false)
//   const [isEditOpen, setIsEditOpen] = useState(false)
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false)

//   // Loading states
//   const [isCreating, setIsCreating] = useState(false)
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [isDeleting, setIsDeleting] = useState(false)

//   // Selected items for operations
//   const [selectedCompany, setSelectedCompany] = useState<any>(null)
//   const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)

//   // Company operations
//   const handleCreateCompany = async (companyData: any) => {
//     setIsCreating(true)
//     try {
//       await createCompany({
//         ...companyData,
//         createdAt: new Date().toISOString(),
//         createdBy: user?.id,
//       })
//       toast({
//         title: "Company Created Successfully! ✨",
//         description: `Company ${companyData.code} has been created.`,
//         duration: 5000,
//       })
//       setIsCreateOpen(false)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create company. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsCreating(false)
//     }
//   }

//   const handleUpdateCompany = async (companyData: any) => {
//     if (!selectedCompany) return
    
//     setIsUpdating(true)
//     try {
//       await updateCompany(selectedCompany._id!, companyData)
//       toast({
//         title: "Company Updated Successfully! ✅",
//         description: `Company ${companyData.code} has been updated.`,
//         duration: 5000,
//       })
//       setIsEditOpen(false)
//       setSelectedCompany(null)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update company. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   const handleDeleteCompany = async () => {
//     if (!companyToDelete) return
    
//     setIsDeleting(true)
//     try {
//       await deleteCompany(companyToDelete)
//       toast({
//         title: "Company Deleted Successfully! 🗑️",
//         description: "The company has been removed from the system.",
//         duration: 5000,
//       })
//       setIsDeleteOpen(false)
//       setCompanyToDelete(null)
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete company. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   // Helper functions
//   const openEdit = (company: any) => {
//     setSelectedCompany(company)
//     setIsEditOpen(true)
//   }

//   const openDelete = (companyId: string) => {
//     setCompanyToDelete(companyId)
//     setIsDeleteOpen(true)
//   }

//   const isLoading = sessionLoading || usersLoading || companiesLoading

//   if (isLoading || !user) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
//           <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading company information...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 animate-fade-in p-4 md:p-6 bg-[#FEFFFF]">
//       {/* Header */}
//       <div className="text-center space-y-2">
//         <div className="flex items-center justify-center gap-2 mb-4">
//           <div 
//             className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
//             style={{ 
//               background: 'linear-gradient(135deg, #11519B, #114A9B)'
//             }}
//           >
//             <Building className="h-6 w-6 text-white" />
//           </div>
//         </div>
//         <h1 
//           className="text-2xl md:text-3xl font-bold"
//           style={{ 
//             background: 'linear-gradient(135deg, #11519B, #114A9B)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             backgroundClip: 'text'
//           }}
//         >
//           Add Company Information
//         </h1>
//         <p className="text-[#000000]" style={{ opacity: 0.6 }}>Add new company details to your system</p>
//       </div>

//       <div className="max-w-4xl mx-auto">
//         {/* Create Company Card */}
//         <Card 
//           className="border-0 shadow-xl animate-slide-in"
//           style={{ 
//             background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
//           }}
//         >
//           <CardHeader 
//             className="border-0 shadow-xl animate-slide-in pt-4 pb-4"
//             style={{ 
//               background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.2), rgba(17, 81, 155, 0.1))',
//               borderBottomColor: 'rgba(158, 195, 249, 0.3)'
//             }}
//           >
//             <CardTitle className="flex items-center gap-2 text-[#000000]">
//               <Sparkles className="h-5 w-5" style={{ color: '#11519B' }} />
//               Company Information
//             </CardTitle>
//             <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>Fill in the details for the new company</CardDescription>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="text-center space-y-4">
//               <p className="text-[#000000]" style={{ opacity: 0.6 }}>
//                 Click the button below to add a new company to the system.
//               </p>
//               <Button
//                 onClick={() => setIsCreateOpen(true)}
//                 className="shadow-lg hover:shadow-xl transition-all duration-300 text-white"
//                 style={{ 
//                   background: 'linear-gradient(135deg, #11519B, #114A9B)'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = 'linear-gradient(135deg, #114A9B, #0D3D7A)'
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'linear-gradient(135deg, #11519B, #114A9B)'
//                 }}
//               >
//                 <Building className="h-4 w-4 mr-2" />
//                 Create New Company
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Create Company Form */}
//         <CompanyForm
//           isOpen={isCreateOpen}
//           onOpenChange={setIsCreateOpen}
//           onSubmit={handleCreateCompany}
//           isLoading={isCreating}
//           users={users}
//           mode="create"
//         />

//         {/* Edit Company Form */}
//         <CompanyForm
//           key={`edit-${selectedCompany?._id || 'new'}`}
//           isOpen={isEditOpen}
//           onOpenChange={setIsEditOpen}
//           onSubmit={handleUpdateCompany}
//           isLoading={isUpdating}
//           users={users}
//           initialData={selectedCompany}
//           mode="edit"
//         />

//         {/* Delete Confirmation Dialog */}
//         <DeleteConfirmationDialog
//           isOpen={isDeleteOpen}
//           onOpenChange={setIsDeleteOpen}
//           onConfirm={handleDeleteCompany}
//           isLoading={isDeleting}
//           title="Confirm Deletion"
//           description="Are you sure you want to delete this company? This action cannot be undone."
//           type="company"
//         />

//         {/* Companies Table */}
//         <CompanyTable
//           companies={displayCompanies}
//           isLoading={companiesLoading}
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
import { Building, Sparkles, Loader2, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserSession } from "@/hooks/useUserSession"
import { useUsers } from "@/hooks/useUsers"
import { useCompanyInformation } from "@/hooks/useCompanyInformation"
import { useCompanyStream } from "@/hooks/useCompanyStream"
import { CompanyForm } from "@/components/company/CompanyForm"
import { CompanyTable } from "@/components/company/CompanyTable"
import { CompanyImportDialog } from "@/components/company/CompanyImportDialog"
import { DeleteConfirmationDialog } from "@/components/users/DeleteConfirmationDialog"

export default function CreateCompanyPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Custom hooks for data management
  const { user, isLoading: sessionLoading } = useUserSession("company_information.manage")
  const { users, isLoading: usersLoading } = useUsers()
  const { companies, isLoading: companiesLoading, createCompany, updateCompany, deleteCompany, importCompaniesFromXlsx } = useCompanyInformation()
  
  // Use real-time stream for companies
  const streamCompanies = useCompanyStream()
  const displayCompanies = streamCompanies.length > 0 ? streamCompanies : companies

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  // Loading states
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Selected items for operations
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)

  // Company operations
  const handleCreateCompany = async (companyData: any) => {
    setIsCreating(true)
    try {
      await createCompany({
        ...companyData,
        createdAt: new Date().toISOString(),
        createdBy: user?.id,
      })
      toast({
        title: "Company Created Successfully! ✨",
        description: `Company ${companyData.code} has been created.`,
        duration: 5000,
      })
      setIsCreateOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateCompany = async (companyData: any) => {
    if (!selectedCompany) return
    
    setIsUpdating(true)
    try {
      await updateCompany(selectedCompany._id!, companyData)
      toast({
        title: "Company Updated Successfully! ✅",
        description: `Company ${companyData.code} has been updated.`,
        duration: 5000,
      })
      setIsEditOpen(false)
      setSelectedCompany(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteCompany(companyToDelete)
      toast({
        title: "Company Deleted Successfully! 🗑️",
        description: "The company has been removed from the system.",
        duration: 5000,
      })
      setIsDeleteOpen(false)
      setCompanyToDelete(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleImportCompanies = async (file: File) => {
    const data = await importCompaniesFromXlsx(file)
    toast({
      title: "XLSX Import Complete",
      description: data.message,
      duration: 6000,
    })
    return data
  }

  // Helper functions
  const openEdit = (company: any) => {
    setSelectedCompany(company)
    setIsEditOpen(true)
  }

  const openDelete = (companyId: string) => {
    setCompanyToDelete(companyId)
    setIsDeleteOpen(true)
  }

  const isLoading = sessionLoading || usersLoading || companiesLoading

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#FEFFFF]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: '#11519B' }} />
          <p className="text-[#000000]" style={{ opacity: 0.6 }}>Loading company information...</p>
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
            <Building className="h-6 w-6 text-white" />
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
          Add Company Information
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>Add new company details to your system</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Create Company Card */}
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
              Company Information
            </CardTitle>
            <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>Fill in the details for the new company</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-[#000000]" style={{ opacity: 0.6 }}>
                Click the button below to add a new company to the system.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
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
                  <Building className="h-4 w-4 mr-2" />
                  Create New Company
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImportOpen(true)}
                  className="shadow-md hover:shadow-lg transition-all duration-300"
                  style={{ borderColor: '#11519B', color: '#11519B' }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Import from XLSX
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Company Form */}
        <CompanyForm
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateCompany}
          isLoading={isCreating}
          users={users}
          mode="create"
        />

        {/* Import Companies from XLSX */}
        <CompanyImportDialog
          isOpen={isImportOpen}
          onOpenChange={setIsImportOpen}
          onImport={handleImportCompanies}
        />

        {/* Edit Company Form */}
        <CompanyForm
          key={`edit-${selectedCompany?._id || 'new'}`}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleUpdateCompany}
          isLoading={isUpdating}
          users={users}
          initialData={selectedCompany}
          mode="edit"
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteCompany}
          isLoading={isDeleting}
          title="Confirm Deletion"
          description="Are you sure you want to delete this company? This action cannot be undone."
          type="company"
        />

        {/* Companies Table */}
        <CompanyTable
          companies={displayCompanies}
          isLoading={companiesLoading}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>
    </div>
  )
}