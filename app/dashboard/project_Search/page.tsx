// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Search, FileText } from "lucide-react"
// import { useProjectSearchReport } from "@/hooks/useProjectSearchReport"
// import { ProjectReportTable } from "@/components/project/ProjectReportTable"
// import { ProjectSearchReportInput } from "@/components/project/ProjectSearchReportInput"

// export default function ProjectSearchPage() {
//   const { 
//     projects, 
//     isLoading, 
//     searchTerm, 
//     setSearchTerm 
//   } = useProjectSearchReport()

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       {/* Header */}
//       <div className="text-center space-y-2">
//         <div className="flex items-center justify-center gap-2 mb-4">
//           <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
//             <Search className="h-6 w-6 text-white" />
//           </div>
//         </div>
//         <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
//           Project Search Report
//         </h1>
//         <p className="text-muted-foreground">Search and view project details</p>
//       </div>

//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Search Card */}
//         <Card className="border-0 shadow-lg">
//           <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-t-xl border-b border-green-200/50 pt-6">
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5 text-green-600" />
//               Search Projects
//             </CardTitle>
//             <CardDescription>
//               Enter project name, company name, or company code to search
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="p-6">
//             <ProjectSearchReportInput
//               searchTerm={searchTerm}
//               onSearchChange={setSearchTerm}
//               resultsCount={projects.length}
//             />
//           </CardContent>
//         </Card>

//         {/* Results Table */}
//         <ProjectReportTable
//           projects={projects}
//           isLoading={isLoading}
//         />
//       </div>
//     </div>
//   )
// }
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText } from "lucide-react"
import { useProjectSearchReport } from "@/hooks/useProjectSearchReport"
import { ProjectReportTable } from "@/components/project/ProjectReportTable"
import { ProjectSearchReportInput } from "@/components/project/ProjectSearchReportInput"

export default function ProjectSearchPage() {
  const { 
    projects, 
    isLoading, 
    searchTerm, 
    setSearchTerm 
  } = useProjectSearchReport()

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#FEFFFF]">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #11519B, #114A9B)'
            }}
          >
            <Search className="h-6 w-6 text-white" />
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
          Project Search Report
        </h1>
        <p className="text-[#000000]" style={{ opacity: 0.6 }}>Search and view project details</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Card */}
        <Card 
          className="border-0 shadow-xl"
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
            <CardTitle className="flex items-center gap-2 text-[#000000]">
              <FileText className="h-5 w-5" style={{ color: '#11519B' }} />
              Search Projects
            </CardTitle>
            <CardDescription className="text-[#000000]" style={{ opacity: 0.6 }}>
              Enter project name, company name, or company code to search
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ProjectSearchReportInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              resultsCount={projects.length}
            />
          </CardContent>
        </Card>

        {/* Results Table */}
        <ProjectReportTable
          projects={projects}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}