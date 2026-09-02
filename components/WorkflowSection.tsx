// "use client"

// import { motion } from "framer-motion"
// import { useInView } from "framer-motion"
// import { useRef } from "react"
// import { 
//   UserPlus, 
//   FileText, 
//   Users, 
//   Code, 
//   CheckCircle, 
//   Upload,
//   Shield,
//   Zap,
//   MessageCircle,
//   BarChart3
// } from "lucide-react"
// import { Button } from "@/components/ui/button"

// const workflowSteps = [
//   {
//     icon: UserPlus,
//     title: "User Registration & Roles",
//     description: "Create users with specific roles (Admin, Manager, Developer, Customer)",
//     details: ["Admin: Full system access", "Manager: Team management", "Developer: Task execution", "Customer: Complaint submission"],
//     color: "from-primary to-secondary",
//     features: ["Role-based access", "User management", "Permission control"]
//   },
//   {
//     icon: FileText,
//     title: "Complaint Registration",
//     description: "Customers register complaints with detailed information and attachments",
//     details: ["Form-based submission", "Category selection", "Priority assignment", "File uploads (PDF, Images, Excel)"],
//     color: "from-purple-500 to-purple-600",
//     features: ["Multi-file upload", "Auto-categorization", "Priority scoring"]
//   },
//   {
//     icon: Users,
//     title: "Task Creation & Assignment",
//     description: "Manager creates tasks and assigns to specific developers with deadlines",
//     details: ["Task creation with attachments", "Developer assignment", "Deadline setting", "Priority classification"],
//     color: "from-green-500 to-green-600",
//     features: ["Smart assignment", "Deadline tracking", "Progress monitoring"]
//   },
//   {
//     icon: Code,
//     title: "Developer Work & Updates",
//     description: "Developers work on assigned tasks with progress updates and file attachments",
//     details: ["Task acceptance", "Progress tracking", "Intermediate updates", "Work documentation"],
//     color: "from-orange-500 to-orange-600",
//     features: ["Real-time updates", "File attachments", "Progress reporting"]
//   },
//   {
//     icon: CheckCircle,
//     title: "Quality Assurance",
//     description: "Comprehensive testing and quality checks before final delivery",
//     details: ["Code review", "Testing phase", "Bug fixes", "Quality validation"],
//     color: "from-cyan-500 to-cyan-600",
//     features: ["Automated testing", "Quality metrics", "Approval workflow"]
//   },
//   {
//     icon: BarChart3,
//     title: "Task Completion & Analytics",
//     description: "Final review, completion, and performance analytics",
//     details: ["Customer approval", "Performance analytics", "Documentation archive", "Report generation"],
//     color: "from-emerald-500 to-emerald-600",
//     features: ["Analytics dashboard", "Report generation", "Performance tracking"]
//   }
// ]

// function WorkflowStep({ step, index }: { step: typeof workflowSteps[0]; index: number }) {
//   const ref = useRef(null)
//   const isInView = useInView(ref, { once: true, margin: "-50px" })

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 50, scale: 0.9 }}
//       animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
//       transition={{ duration: 0.6, delay: (index % 2) * 0.2 + Math.floor(index / 2) * 0.1 }}
//       whileHover={{ 
//         y: -5,
//         scale: 1.02,
//         transition: { duration: 0.2 }
//       }}
//       className="group"
//     >
//       <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
//         {/* Background Gradient */}
//         <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
//         {/* Header */}
//         <div className="flex items-start space-x-4 mb-4">
//           <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
//             <step.icon className="w-6 h-6 text-white" />
//           </div>
//           <div className="flex-1">
//             <div className="flex items-start justify-between">
//               <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
//                 {step.title}
//               </h3>
//               <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
//                 Step {index + 1}
//               </span>
//             </div>
//             <p className="text-muted-foreground mt-2 leading-relaxed">
//               {step.description}
//             </p>
//           </div>
//         </div>

//         {/* Details */}
//         <div className="space-y-3 mb-4">
//           {step.details.map((detail, detailIndex) => (
//             <div key={detailIndex} className="flex items-center text-sm">
//               <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
//               <span className="text-foreground/90">{detail}</span>
//             </div>
//           ))}
//         </div>

//         {/* Features */}
//         <div className="mb-4">
//           <div className="flex flex-wrap gap-2">
//             {step.features.map((feature, featureIndex) => (
//               <span 
//                 key={featureIndex}
//                 className="px-3 py-1 bg-secondary/50 text-xs font-medium rounded-full border border-border text-foreground/80"
//               >
//                 {feature}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Attachment Support */}
//         <div className="pt-4 border-t border-border">
//           <div className="flex items-center justify-between text-sm">
//             <div className="flex items-center space-x-2 text-muted-foreground">
//               <Upload className="w-4 h-4" />
//               <span>Supported Files:</span>
//             </div>
//             <div className="flex space-x-1">
//               {['PDF', 'IMG', 'XLS', 'DOC'].map((type) => (
//                 <span 
//                   key={type}
//                   className="px-2 py-1 bg-background border border-border rounded text-xs font-medium text-foreground/70"
//                 >
//                   {type}
//                 </span>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Progress Line (for visual connection) */}
//         {index < workflowSteps.length - 1 && (
//           <div className="hidden lg:block absolute -bottom-4 -right-4 w-8 h-8 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//             <div className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   )
// }

// export function WorkflowSection() {
//   return (
//     <section id="workflow" className="py-4 bg-background">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           viewport={{ once: true }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
//             Our Complete Workflow Process
//           </h2>
//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//             End-to-end complaint resolution workflow from registration to completion with full transparency
//           </p>
//         </motion.div>

//         {/* Two Column Grid Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
//           {workflowSteps.map((step, index) => (
//             <WorkflowStep key={step.title} step={step} index={index} />
//           ))}
//         </div>

//                {/* Workflow Progress Bar */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 0.5 }}
//           viewport={{ once: true }}
//           className="mt-16 max-w-6xl mx-auto" // Changed from mt-12 to mt-16 and max-w-4xl to max-w-6xl
//         >
//           <div className="bg-card border border-border rounded-2xl p-8 lg:p-10"> {/* Added lg:p-10 for larger padding on big screens */}
//             <h3 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-10"> {/* Increased mb-8 to mb-10 and added lg:text-3xl */}
//               Workflow Progress Tracking
//             </h3>
            
//             {/* Progress Bar */}
//             <div className="relative">
//               <div className="flex justify-between mb-6"> {/* Increased mb-4 to mb-6 */}
//                 {workflowSteps.slice(0, 4).map((step, index) => (
//                   <div key={step.title} className="flex flex-col items-center text-center flex-1"> {/* Added flex-1 to make items take equal space */}
//                     <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}> {/* Increased icon size and added shadow */}
//                       <step.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" /> {/* Increased icon size */}
//                     </div>
//                     <span className="text-sm lg:text-base font-semibold text-foreground px-2"> {/* Added px-2 and increased font size */}
//                       {step.title.split(' ')[0]}
//                     </span>
//                     <span className="text-xs text-muted-foreground mt-1 hidden lg:block"> {/* Added subtitle for larger screens */}
//                       {step.title.split(' ').slice(1).join(' ')}
//                     </span>
//                   </div>
//                 ))}
//               </div>
              
//               {/* Progress Line - Made thicker and with better gradient */}
//               <div className="absolute top-7 lg:top-8 left-4 right-4 h-2 bg-border/50 rounded-full -z-10"> {/* Increased height to h-2, added rounded-full and adjusted top position */}
//                 <motion.div 
//                   className="h-2 bg-gradient-to-r from-primary via-purple-500 to-emerald-500 rounded-full shadow-lg" // Increased height to h-2 and added shadow
//                   initial={{ width: 0 }}
//                   whileInView={{ width: "calc(100% - 2rem)" }} // Adjusted to account for padding
//                   transition={{ duration: 2, delay: 0.5 }}
//                   viewport={{ once: true }}
//                 />
//               </div>
//             </div>

//             {/* Stats - Made larger and more prominent */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12"> {/* Increased gap and mt */}
//               {[
//                 { label: 'Avg. Resolution Time', value: '24-48 Hours', icon: Clock },
//                 { label: 'Success Rate', value: '98.5%', icon: CheckCircle },
//                 { label: 'Active Tasks', value: '156', icon: Zap },
//                 { label: 'Customer Satisfaction', value: '4.9/5.0', icon: MessageCircle },
//               ].map((stat, index) => (
//                 <motion.div
//                   key={stat.label}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
//                   viewport={{ once: true }}
//                   className="text-center p-6 bg-secondary/20 rounded-xl border border-border hover:shadow-lg transition-all duration-300" // Increased padding and added hover effects
//                 >
//                   <stat.icon className="w-10 h-10 lg:w-12 lg:h-12 text-primary mx-auto mb-3" /> {/* Increased icon size */}
//                   <div className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{stat.value}</div> {/* Increased font size */}
//                   <div className="text-sm lg:text-base text-muted-foreground font-medium">{stat.label}</div> {/* Increased font size and weight */}
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// // Add the missing Clock icon import
// const Clock = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// )
"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { 
  UserPlus, 
  FileText, 
  Users, 
  Code, 
  CheckCircle, 
  Upload,
  Shield,
  Zap,
  MessageCircle,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"

const workflowSteps = [
  {
    icon: UserPlus,
    title: "User Registration & Roles",
    description: "Create users with specific roles (Admin, Manager, Developer, Customer)",
    details: ["Admin: Full system access", "Manager: Team management", "Developer: Task execution", "Customer: Complaint submission"],
    color: "from-primary to-secondary",
    features: ["Role-based access", "User management", "Permission control"]
  },
  {
    icon: FileText,
    title: "Complaint Registration",
    description: "Customers register complaints with detailed information and attachments",
    details: ["Form-based submission", "Category selection", "Priority assignment", "File uploads (PDF, Images, Excel)"],
    color: "from-primary to-secondary",
    features: ["Multi-file upload", "Auto-categorization", "Priority scoring"]
  },
  {
    icon: Users,
    title: "Task Creation & Assignment",
    description: "Manager creates tasks and assigns to specific developers with deadlines",
    details: ["Task creation with attachments", "Developer assignment", "Deadline setting", "Priority classification"],
    color: "from-primary to-secondary",
    features: ["Smart assignment", "Deadline tracking", "Progress monitoring"]
  },
  {
    icon: Code,
    title: "Developer Work & Updates",
    description: "Developers work on assigned tasks with progress updates and file attachments",
    details: ["Task acceptance", "Progress tracking", "Intermediate updates", "Work documentation"],
    color: "from-primary to-secondary",
    features: ["Real-time updates", "File attachments", "Progress reporting"]
  },
  {
    icon: CheckCircle,
    title: "Quality Assurance",
    description: "Comprehensive testing and quality checks before final delivery",
    details: ["Code review", "Testing phase", "Bug fixes", "Quality validation"],
    color: "from-primary to-secondary",
    features: ["Automated testing", "Quality metrics", "Approval workflow"]
  },
  {
    icon: BarChart3,
    title: "Task Completion & Analytics",
    description: "Final review, completion, and performance analytics",
    details: ["Customer approval", "Performance analytics", "Documentation archive", "Report generation"],
    color: "from-primary to-secondary",
    features: ["Analytics dashboard", "Report generation", "Performance tracking"]
  }
]

function WorkflowStep({ step, index }: { step: typeof workflowSteps[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.2 + Math.floor(index / 2) * 0.1 }}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
            <step.icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {step.title}
              </h3>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Step {index + 1}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          {step.details.map((detail, detailIndex) => (
            <div key={detailIndex} className="flex items-center text-sm">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
              <span className="text-foreground/90">{detail}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {step.features.map((feature, featureIndex) => (
              <span 
                key={featureIndex}
                className="px-3 py-1 bg-secondary/50 text-xs font-medium rounded-full border border-border text-foreground/80"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Attachment Support */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span>Supported Files:</span>
            </div>
            <div className="flex space-x-1">
              {['PDF', 'IMG', 'XLS', 'DOC'].map((type) => (
                <span 
                  key={type}
                  className="px-2 py-1 bg-background border border-border rounded text-xs font-medium text-foreground/70"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Line (for visual connection) */}
        {index < workflowSteps.length - 1 && (
          <div className="hidden lg:block absolute -bottom-4 -right-4 w-8 h-8 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-4 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Complete Workflow Process
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            End-to-end complaint resolution workflow from registration to completion with full transparency
          </p>
        </motion.div>

        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {workflowSteps.map((step, index) => (
            <WorkflowStep key={step.title} step={step} index={index} />
          ))}
        </div>

               {/* Workflow Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 max-w-6xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl p-8 lg:p-10">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-10">
              Workflow Progress Tracking
            </h3>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="flex justify-between mb-6">
                {workflowSteps.slice(0, 4).map((step, index) => (
                  <div key={step.title} className="flex flex-col items-center text-center flex-1">
                    <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}>
                      <step.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <span className="text-sm lg:text-base font-semibold text-foreground px-2">
                      {step.title.split(' ')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 hidden lg:block">
                      {step.title.split(' ').slice(1).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Progress Line */}
              <div className="absolute top-7 lg:top-8 left-4 right-4 h-2 bg-border/50 rounded-full -z-10">
                <motion.div 
                  className="h-2 bg-gradient-to-r from-primary via-primary to-primary rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  whileInView={{ width: "calc(100% - 2rem)" }}
                  transition={{ duration: 2, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[
                { label: 'Avg. Resolution Time', value: '24-48 Hours', icon: Clock },
                { label: 'Success Rate', value: '98.5%', icon: CheckCircle },
                { label: 'Active Tasks', value: '156', icon: Zap },
                { label: 'Customer Satisfaction', value: '4.9/5.0', icon: MessageCircle },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-secondary/20 rounded-xl border border-border hover:shadow-lg transition-all duration-300"
                >
                  <stat.icon className="w-10 h-10 lg:w-12 lg:h-12 text-primary mx-auto mb-3" />
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-sm lg:text-base text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Add the missing Clock icon import
const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
