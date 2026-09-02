

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { HeroSection } from "@/components/HeroSection"
// import { FeaturesSection } from "@/components/FeaturesSection"
// import { WorkflowSection } from "@/components/WorkflowSection"
// import { CompanyDetailsSection } from "@/components/CompanyDetailsSection"
import { FloatingElements } from "@/components/FloatingElements"

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="min-h-screen bg-background"
      >
        <FloatingElements />
        <Navbar />
        <main>
          <div id="hero">
            <HeroSection />
          </div>
          
      
          {/* <div id="workflow">
            <WorkflowSection />
          </div> */}
          
          {/* <div id="company">
            <CompanyDetailsSection />
          </div> */}
        </main>
        
        <footer className="bg-card border-t border-border py-6">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; {currentYear} Power-CMS. Powered by Powersoft360. All rights reserved.</p> 
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  )
}