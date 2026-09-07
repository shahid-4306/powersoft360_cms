// // "use client"

// // import { useEffect } from "react"
// // import { useRouter } from "next/navigation"
// // import { motion } from "framer-motion"
// // import { Button } from "@/components/ui/button"
// // import { ArrowRight, FileText, Search, Loader2, LogOut } from "lucide-react"
// // import { useCustomerAuth } from "@/contexts/CustomerAuthContext"

// // export default function ComplaintModulePage() {
// //   const router = useRouter()
// //   const { customerUser, isLoading, customerLogout } = useCustomerAuth()

// //   // Route guard: only an approved, verified customer may see this hub.
// //   useEffect(() => {
// //     if (!isLoading && !customerUser) {
// //       router.replace("/verify-email?next=/complaint-module")
// //     }
// //   }, [isLoading, customerUser, router])

// //   if (isLoading || !customerUser) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/40 via-blue-50 to-accent/15">
// //         <Loader2 className="h-10 w-10 animate-spin text-primary" />
// //       </div>
// //     )
// //   }

// //   const handleLogout = async () => {
// //     await customerLogout()
// //     router.push("/")
// //   }

// //   return (
// //     <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-muted/40 via-blue-50 to-accent/15 px-4">
// //       <div className="max-w-3xl mx-auto text-center space-y-10 py-16">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.6 }}
// //           className="space-y-3"
// //         >
// //           <p className="text-sm font-medium text-primary">
// //             Welcome, {customerUser.fullName}
// //           </p>
// //           <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
// //             Complaint Module
// //           </h1>
// //           <p className="text-muted-foreground max-w-xl mx-auto">
// //             Your email has been verified. You can now submit a new complaint or check
// //             the status of complaints you have already submitted.
// //           </p>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.15, duration: 0.6 }}
// //           className="flex flex-col sm:flex-row gap-4 justify-center items-center"
// //         >
// //           <Button
// //             size="lg"
// //             className="text-lg px-8 py-6 group"
// //             onClick={() => router.push("/online_complaint")}
// //           >
// //             <FileText className="mr-2 w-5 h-5" />
// //             Complaint Register
// //             <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
// //           </Button>

// //           <Button
// //             variant="outline"
// //             size="lg"
// //             className="text-lg px-8 py-6 group"
// //             onClick={() => router.push("/complaint_status")}
// //           >
// //             <Search className="mr-2 w-5 h-5" />
// //             Complaint Status
// //             <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
// //           </Button>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 0.3 }}
// //         >
// //           <button
// //             onClick={handleLogout}
// //             className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80 transition-colors"
// //           >
// //             <LogOut className="w-4 h-4" />
// //             Not you? Sign out
// //           </button>
// //         </motion.div>
// //       </div>
// //     </section>
// //   )
// // }

// "use client"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Loader2 } from "lucide-react"
// import { useCustomerAuth } from "@/contexts/CustomerAuthContext"

// // Per the updated complaint registration flow: once a customer's email is
// // verified, the complaint registration form is rendered directly instead
// // of this intermediate "Complaint Module" hub. This route is kept (rather
// // than deleted) purely so any existing bookmarks/links to /complaint-module
// // keep working -- it silently forwards straight into the registration
// // form (or, for an unverified visitor, into the same email verification
// // gate used everywhere else) without showing the old
// // Welcome / "Complaint Register" / "Complaint Status" / "Sign out" screen.
// export default function ComplaintModulePage() {
//   const router = useRouter()
//   const { customerUser, isLoading } = useCustomerAuth()

//   useEffect(() => {
//     if (isLoading) return

//     if (customerUser) {
//       router.replace("/online_complaint")
//     } else {
//       router.replace("/verify-email?next=/online_complaint")
//     }
//   }, [isLoading, customerUser, router])

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/40 via-blue-50 to-accent/15">
//       <Loader2 className="h-10 w-10 animate-spin text-primary" />
//     </div>
//   )
// }
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Email verification gate removed: this route is kept (rather than
// deleted) purely so any existing bookmarks/links to /complaint-module
// keep working -- it silently forwards straight into the registration
// form, for everyone, without showing the old
// Welcome / "Complaint Register" / "Complaint Status" / "Sign out" screen.
export default function ComplaintModulePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/online_complaint")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/40 via-blue-50 to-accent/15">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}