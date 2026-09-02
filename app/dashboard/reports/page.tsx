// "use client"

// import { useReport } from "@/hooks/useReport"
// import { useRouter } from "next/navigation"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { BarChart3, Calendar, Download } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useMediaQuery } from "@/hooks/use-media-query"
// import { StatsCardsGrid } from "@/components/report/StatsCard"
// import { CompletionRate } from "@/components/report/CompletionRate"
// import { TaskDetail } from "@/components/report/TaskDetail"
// import { ReportFilter } from "@/components/report/ReportFilter"
// import { useEffect, useState } from "react"

// export default function ReportsPage() {
//   const {
//     tasks,
//     reportData,
//     filters,
//     isLoading,
//     handleFilterChange,
//     resetFilters,
//     getReportTitle,
//     getReportPeriod,
//     fetchTasks,
//   } = useReport()
//   const { toast } = useToast()
//   const isMobile = useMediaQuery("(max-width: 640px)")
//   const router = useRouter()
  
//   // Get unique companies for filter
//   const [companies, setCompanies] = useState<string[]>([])
  
//   useEffect(() => {
//     const uniqueCompanies = Array.from(
//       new Set(tasks.map((task) => task.company?.name).filter(Boolean))
//     ) as string[]
//     setCompanies(uniqueCompanies)
//   }, [tasks])

//   const handleExportReport = () => {
//     try {
//       // Create CSV data
//       const headers = [
//         "Code",
//         "Company",
//         "Work Description",
//         "Status",
//         "Developer Status",
//         "Assigned To",
//         "Created At",
//         "Completed",
//       ]
      
//       const csvData = reportData.tasks.map((task) => [
//         task.code,
//         task.company?.name,
//         task.working,
//         task.finalStatus || task.status,
//         task.developer_status || "N/A",
//         task.assignedTo?.name || "Unassigned",
//         new Date(task.createdAt).toLocaleDateString(),
//         task.status === "completed" || task.finalStatus === "done" ? "Yes" : "No",
//       ])

//       // Convert to CSV string
//       const csvContent = [
//         headers.join(","),
//         ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
//       ].join("\n")

//       // Create blob and download
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//       const link = document.createElement("a")
//       const url = URL.createObjectURL(blob)
//       link.setAttribute("href", url)
//       link.setAttribute("download", `Task_Report_${new Date().toISOString().split("T")[0]}.csv`)
//       link.style.visibility = "hidden"
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)

//       toast({
//         title: "Report exported",
//         description: "The report has been exported successfully.",
//       })
//     } catch (error) {
//       console.error("Failed to export report:", error)
//       toast({
//         title: "Export failed",
//         description: "Could not export the report. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
//             Reports & Analytics
//           </h1>
//           <p className="text-muted-foreground text-xs sm:text-base">
//             Track your productivity and task completion rates
//           </p>
//         </div>
//         <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
//           <Button 
//             variant="outline" 
//             className="w-full sm:w-auto bg-transparent" 
//             onClick={handleExportReport}
//           >
//             <Download className="h-4 w-4 mr-2" />
//             {isMobile ? "Export" : "Export Report"}
//           </Button>
//         </div>
//       </div>

//       {/* Report Filters - Now properly wrapped in a Card */}
//       <ReportFilter
//         filters={filters}
//         onFilterChange={handleFilterChange}
//         onResetFilters={resetFilters}
//         companies={companies}
//       />

//       {/* Report Summary Card */}
//       <Card className="bg-gradient-to-r from-accent/15 to-cyan-50 border-primary/25 animate-slide-in">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <BarChart3 className="h-5 w-5" />
//             {getReportTitle()}
//           </CardTitle>
//           <CardDescription className="text-sm">
//             <Calendar className="h-4 w-4 inline mr-1" />
//             {getReportPeriod()}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-purple-600">{reportData.statusCounts.pending}</div>
//               <p className="text-sm text-muted-foreground">Pending</p>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-primary">{reportData.statusCounts.assigned}</div>
//               <p className="text-sm text-muted-foreground">Assigned</p>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-green-600">{reportData.statusCounts.completed}</div>
//               <p className="text-sm text-muted-foreground">Completed</p>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-red-600">{reportData.statusCounts.onHold}</div>
//               <p className="text-sm text-muted-foreground">On Hold</p>
//             </div>
//           </div>
//           <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-yellow-600">
//                 {reportData.developerStatusCounts.pending}
//               </div>
//               <p className="text-sm text-muted-foreground">Dev Pending</p>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-green-600">
//                 {reportData.developerStatusCounts.done}
//               </div>
//               <p className="text-sm text-muted-foreground">Dev Done</p>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-red-600">
//                 {reportData.developerStatusCounts["not-done"]}
//               </div>
//               <p className="text-sm text-muted-foreground">Dev Not Done</p>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-orange-600">
//                 {reportData.developerStatusCounts["on-hold"]}
//               </div>
//               <p className="text-sm text-muted-foreground">Dev On Hold</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Stats Cards */}
//       <StatsCardsGrid reportData={reportData} />

//       {/* Completion Rate */}
//       <CompletionRate reportData={reportData} />

//       {/* Task Details */}
//       <TaskDetail tasks={reportData.tasks} isLoading={isLoading} />
//     </div>
//   )
// }
"use client"

import { useReport } from "@/hooks/useReport"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Calendar, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { StatsCardsGrid } from "@/components/report/StatsCard"
import { CompletionRate } from "@/components/report/CompletionRate"
import { TaskDetail } from "@/components/report/TaskDetail"
import { ReportFilter } from "@/components/report/ReportFilter"
import { useEffect, useState } from "react"

export default function ReportsPage() {
  const {
    tasks,
    reportData,
    filters,
    isLoading,
    handleFilterChange,
    resetFilters,
    getReportTitle,
    getReportPeriod,
    fetchTasks,
  } = useReport()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const router = useRouter()
  
  // Get unique companies for filter
  const [companies, setCompanies] = useState<string[]>([])
  
  useEffect(() => {
    const uniqueCompanies = Array.from(
      new Set(tasks.map((task) => task.company?.name).filter(Boolean))
    ) as string[]
    setCompanies(uniqueCompanies)
  }, [tasks])

  const handleExportReport = () => {
    try {
      // Create CSV data
      const headers = [
        "Code",
        "Company",
        "Work Description",
        "Status",
        "Developer Status",
        "Assigned To",
        "Created At",
        "Completed",
      ]
      
      const csvData = reportData.tasks.map((task) => [
        task.code,
        task.company?.name,
        task.working,
        task.finalStatus || task.status,
        task.developer_status || "N/A",
        task.assignedTo?.name || "Unassigned",
        new Date(task.createdAt).toLocaleDateString(),
        task.status === "completed" || task.finalStatus === "done" ? "Yes" : "No",
      ])

      // Convert to CSV string
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `Task_Report_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Report exported",
        description: "The report has been exported successfully.",
      })
    } catch (error) {
      console.error("Failed to export report:", error)
      toast({
        title: "Export failed",
        description: "Could not export the report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#FEFFFF]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 
            className="text-2xl sm:text-3xl font-bold"
            style={{ 
              background: 'linear-gradient(135deg, #11519B, #114A9B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-base text-[#000000]" style={{ opacity: 0.6 }}>
            Track your productivity and task completion rates
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleExportReport}
            style={{ 
              borderColor: 'rgba(17, 81, 155, 0.3)',
              color: '#11519B',
              backgroundColor: 'transparent'
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Export" : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Report Filters - Now properly wrapped in a Card */}
      <ReportFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        companies={companies}
      />

      {/* Report Summary Card */}
      <Card 
        className="border-0 shadow-xl animate-slide-in"
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
            <BarChart3 className="h-5 w-5" style={{ color: '#11519B' }} />
            {getReportTitle()}
          </CardTitle>
          <CardDescription className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>
            <Calendar className="h-4 w-4 inline mr-1" style={{ color: '#11519B', opacity: 0.6 }} />
            {getReportPeriod()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#11519B' }}>{reportData.statusCounts.pending}</div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Pending</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#11519B' }}>{reportData.statusCounts.assigned}</div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Assigned</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#059669' }}>{reportData.statusCounts.completed}</div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>{reportData.statusCounts.onHold}</div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>On Hold</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#D97706' }}>
                {reportData.developerStatusCounts.pending}
              </div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Dev Pending</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#059669' }}>
                {reportData.developerStatusCounts.done}
              </div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Dev Done</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
                {reportData.developerStatusCounts["not-done"]}
              </div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Dev Not Done</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#EA580C' }}>
                {reportData.developerStatusCounts["on-hold"]}
              </div>
              <p className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>Dev On Hold</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <StatsCardsGrid reportData={reportData} />

      {/* Completion Rate */}
      <CompletionRate reportData={reportData} />

      {/* Task Details */}
      <TaskDetail tasks={reportData.tasks} isLoading={isLoading} />
    </div>
  )
}