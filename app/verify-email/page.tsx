"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useCustomerAuth } from "@/contexts/CustomerAuthContext"

type VerifyStatus = "idle" | "loading" | "pending" | "rejected" | "not_found" | "error"

function VerifyEmailContent() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<VerifyStatus>("idle")
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshCustomerUser } = useCustomerAuth()

  // Where to send the user once their email is verified as "approved".
  const nextPath = searchParams.get("next") || "/complaint-module"

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage(null)

    try {
      const response = await fetch("/api/customer/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.status === "approved") {
        await refreshCustomerUser()
        router.push(nextPath)
        return
      }

      setStatus(data.status || "error")
      setMessage(data.message || "Something went wrong. Please try again.")
    } catch (error) {
      setStatus("error")
      setMessage("Failed to verify your email. Please check your connection and try again.")
    }
  }

  const handleGoToRegister = () => {
    router.push("/?openRegister=true")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/40 via-blue-50 to-accent/15 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-border">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/30">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              Enter the email address you used during registration to continue to the Complaint module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={status === "loading" || !email}>
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </form>

            {status === "pending" && message && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Awaiting Admin Approval</p>
                    <p className="mt-1 text-sm text-amber-800">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {status === "rejected" && message && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Registration Rejected</p>
                    <p className="mt-1 text-sm text-red-800">{message}</p>
                    <p className="mt-2 text-xs text-red-700">
                      You may contact the Administrator, or submit a new registration if applicable.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleGoToRegister}
                    >
                      Submit a New Registration
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "not_found" && message && (
              <div className="mt-5 rounded-lg border border-primary/25 bg-accent/15 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">No Account Found</p>
                    <p className="mt-1 text-sm text-secondary">{message}</p>
                    <Button size="sm" className="mt-3" onClick={handleGoToRegister}>
                      Create an Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && message && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-sm text-red-800">{message}</p>
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={handleGoToRegister}
                className="font-medium text-primary hover:text-primary transition-colors"
              >
                Register from the homepage
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
