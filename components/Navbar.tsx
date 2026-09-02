

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useCustomerAuth } from "@/contexts/CustomerAuthContext"
import RegisterPage from "./Register/RegisterPage"
import image from "./image.png"
import Image from "next/image"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showRegisterPage, setShowRegisterPage] = useState(false)

  const router = useRouter()
  const { user: sessionUser, logout } = useAuth()
  // Approved, email-verified customers (see /verify-email) — a session
  // parallel to the admin session above. Kept additive on purpose so the
  // existing admin/staff auth path is never touched.
  const { customerUser } = useCustomerAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (showRegisterPage) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showRegisterPage])

  // Auto-open the registration modal when arriving with ?openRegister=true
  // (used by /verify-email when no account is found, or a registration
  // was rejected and the user wants to submit a new one).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("openRegister") === "true") {
      setShowRegisterPage(true)
      const url = new URL(window.location.href)
      url.searchParams.delete("openRegister")
      window.history.replaceState({}, "", url.toString())
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  const userRegister = () => {
    setShowRegisterPage(true)
    setIsMobileMenuOpen(false)
  }

  // A verified, approved customer goes straight to the Complaint module.
  // Everyone else is sent through the email verification gate, which
  // checks their registration status before granting access.
  const handleRegisterComplaint = () => {
    if (customerUser) {
      router.push("/complaint-module")
    } else {
      router.push("/verify-email?next=/complaint-module")
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogin = () => {
    router.push("/login")
    setIsMobileMenuOpen(false)
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setIsMobileMenuOpen(false)

    try {
      await logout()
      window.location.replace("/")
    } catch (error) {
      console.error("❌ Navbar: Logout error:", error)
      window.location.replace("/")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300 mt-2
          ${isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg"
            : "bg-transparent"
          }
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[90px] ">
            {/* Logo + Title + Subtitle – side by side, subtitle wraps naturally */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Image
  src={image}
  alt="Power-CMS logo"
  width={175}
  height={70}
  className="w-[175px] h-auto"
  priority
/>
              <div className="flex flex-col min-w-0">
               <span className="text-2xl font-bold text-foreground whitespace-nowrap mt-5">

                Online Complaint Portal
                </span>
                <span className="text-xs text-muted-foreground">
                  From complaint registration to final resolution, every process is managed 
                  through<br></br> a structured, secure, and transparent workflow.
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
           
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Company Register — opens the registration modal. Submissions
                  are sent to the Administrator with a Pending status. */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Button
                  variant="outline"
                  className="font-medium gap-1.5 px-3 h-10"
                  onClick={userRegister}
                >
                
                  User Register
                </Button>
              </motion.div>

              {/* Complaint Register — routes through the email verification
                  gate before granting access to the Complaint module. */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  className="font-medium gap-1.5 px-3 h-10"
                  onClick={handleRegisterComplaint}
                >
                  
                  Complaint Register
                </Button>
              </motion.div>

              {/* Dashboard Button (admin/staff session) */}
              {sessionUser && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Button
                    variant="outline"
                    className="font-medium gap-1.5 px-3 h-10"
                    onClick={handleGoToDashboard}
                  >
                    
                    {sessionUser.username}
                  </Button>
                </motion.div>
              )}

              {/* Administrator Login/Logout Button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={sessionUser ? handleLogout : handleLogin}
                  disabled={isLoggingOut}
                  className="font-medium gap-1.5 px-3 h-10"
                >
                  {isLoggingOut ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Logging out...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      {sessionUser ? (
                        <>
                          
                          Logout
                        </>
                      ) : (
                        <>
                         
                          Administrator Login
                        </>
                      )}
                    </span>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-xl"
            >
              <div className="px-6 py-4 space-y-4">
                {['features', 'workflow', 'company'].map((section, index) => (
                  <motion.button
                    key={section}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    onClick={() => scrollToSection(section)}
                    className="block w-full text-left text-foreground/80 hover:text-foreground transition-colors py-2 font-medium capitalize"
                  >
                    {section === 'company' ? 'About Us' : section === 'workflow' ? 'How it Works' : section}
                  </motion.button>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 space-y-3 border-t border-border/50"
                >
                  <Button
                    variant="default"
                    className="w-full justify-center gap-1.5 font-medium h-10"
                    onClick={userRegister}
                  >
                    Company Register
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-center gap-1.5 font-medium h-10"
                    onClick={handleRegisterComplaint}
                  >
                    Complaint Register
                  </Button>

                  {sessionUser && (
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-1.5 font-medium h-10"
                      onClick={handleGoToDashboard}
                    >
                      {sessionUser.username}
                    </Button>
                  )}

                  <Button
                    className="w-full justify-center gap-1.5 font-medium h-10"
                    onClick={sessionUser ? handleLogout : handleLogin}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : sessionUser ? "Logout" : "Administrator Login"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Register Page Modal */}
      {showRegisterPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <div className="sticky top-0 bg-white rounded-t-lg p-4 border-b flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold text-foreground">User Registration</h2>
              <button
                onClick={() => setShowRegisterPage(false)}
                className="text-muted-foreground hover:text-foreground/80 transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <RegisterPage />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}