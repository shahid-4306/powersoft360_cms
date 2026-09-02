// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Eye, EyeOff, Shield, User, Sparkles } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [credentials, setCredentials] = useState({ username: "", password: "" })
//   const [isLoading, setIsLoading] = useState(false)
//   const [isCleaningUp, setIsCleaningUp] = useState(true)

//   const { toast } = useToast()

//   // Clear any stale admin session cookie/local state before showing the
//   // login form, so a previous session can never bleed into this one.
//   useEffect(() => {
//     const cleanupSession = () => {
//       try {
//         localStorage.clear()
//         sessionStorage.clear()

//         const cookiesToClear = ["token", "sidebar_state"]
//         cookiesToClear.forEach((name) => {
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/login;`
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/dashboard;`
//         })
//       } catch (error) {
//         console.error("❌ Cleanup error:", error)
//       } finally {
//         setIsCleaningUp(false)
//       }
//     }

//     cleanupSession()
//   }, [])

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

//       const response = await fetch("/api/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(credentials),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed")
//       }

//       toast({
//         title: "Welcome to TaskFlow! 🎉",
//         description: `Hello ${data.user.username}! You have successfully logged in.`,
//         duration: 1500,
//       })

//       // Force hard navigation to clear any cached state
//       window.location.href = "/dashboard"
//     } catch (error: any) {
//       console.error("❌ Login error:", error)
//       toast({
//         title: "Login Failed ❌",
//         description: error.message || "Please check your credentials.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (isCleaningUp) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Preparing secure login...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%23000%22 fillOpacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>

//       <Card className="w-full max-w-sm shadow-2xl border-0 bg-background/80 backdrop-blur-xl animate-scale-in relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>

//         <CardHeader className=" text-center relative">
//           {/* <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl flex items-center justify-center shadow-xl relative">
//             <Shield className="w-10 h-10 text-primary-foreground" />
//             <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
//               <Sparkles className="w-3 h-3 text-white" />
//             </div>
//           </div> */}
//           <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-xl relative">
//   <Shield className="w-7 h-7 text-primary-foreground" />
//   <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
//     <Sparkles className="w-2.5 h-2.5 text-white" />
//   </div>
// </div>
//           <div>
//             <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
//               PowerSoft360
//             </CardTitle>
//             <CardDescription className="text-muted-foreground mt-2 text-sm">

//             {/* <CardDescription className="text-muted-foreground mt-3 text-base"> */}
//               Sign in to access your <span className="font-bold text-primary/70">TaskFlow</span> dashboard
//             </CardDescription>
//           </div>
//         </CardHeader>

//         <CardContent className="relative">
//           <form onSubmit={handleLogin} className="space-y-6">
//             <div className="space-y-2">
//               {/* <Label htmlFor="username" className="text-sm font-medium"> */}
//               <Label htmlFor="username" className="text-xs font-medium">

//                 Username
//               </Label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/80" />

//                 <Input
//                   id="username"
//                   type="text"
//                   placeholder="Enter your username"
//                   value={credentials.username}
//                   onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
//                   className="pl-11 h-10 text-sm border-border/50focus:border-primary/50 focus:ring-primary/20 bg-background/50 backdrop-blur-sm transition-all-smooth"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               {/* <Label htmlFor="password" className="text-sm font-medium"> */}
//               <Label htmlFor="username" className="text-xs font-medium">

//                 Password
//               </Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={credentials.password}
//                   onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
//                   className="pl-10 h-10 text-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 bg-background/50 backdrop-blur-sm transition-all-smooth"
//                   required
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-muted-foreground" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-muted-foreground" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <Button
//               type="submit"
//               className="w-full h-10 text-sm bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-primary-foreground font-medium rounded-xl shadow-lg hover:shadow-xl transition-all-smooth transform hover:scale-[1.02]"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
//                   Signing in...
//                 </div>
//               ) : (
//                 "Sign In to TaskFlow"
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Shield, User, Sparkles, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(true)

  const { toast } = useToast()

  // Clear any stale admin session cookie/local state before showing the
  // login form, so a previous session can never bleed into this one.
  useEffect(() => {
    const cleanupSession = () => {
      try {
        localStorage.clear()
        sessionStorage.clear()

        const cookiesToClear = ["token", "sidebar_state"]
        cookiesToClear.forEach((name) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/login;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/dashboard;`
        })
      } catch (error) {
        console.error("❌ Cleanup error:", error)
      } finally {
        setIsCleaningUp(false)
      }
    }

    cleanupSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      toast({
        title: "Welcome to TaskFlow! 🎉",
        description: `Hello ${data.user.username}! You have successfully logged in.`,
        duration: 1500,
      })

      // Force hard navigation to clear any cached state
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("❌ Login error:", error)
      toast({
        title: "Login Failed ❌",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCleaningUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing secure login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%23000%22 fillOpacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>

      <Card className="w-full max-w-sm shadow-2xl border-0 bg-background/80 backdrop-blur-xl animate-scale-in relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>

        <CardHeader className=" text-center relative">
          {/* <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl flex items-center justify-center shadow-xl relative">
            <Shield className="w-10 h-10 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div> */}
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-xl relative">
  <Shield className="w-7 h-7 text-primary-foreground" />
  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
    <Sparkles className="w-2.5 h-2.5 text-white" />
  </div>
</div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              PowerSoft360
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-sm">

            {/* <CardDescription className="text-muted-foreground mt-3 text-base"> */}
              Sign in to access your <span className="font-bold text-primary/70">TaskFlow</span> dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              {/* <Label htmlFor="username" className="text-sm font-medium"> */}
              <Label htmlFor="username" className="text-xs font-medium">

                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  className="pl-11 h-10 text-sm border-border/50focus:border-primary/50 focus:ring-primary/20 bg-background/50 backdrop-blur-sm transition-all-smooth"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              {/* <Label htmlFor="password" className="text-sm font-medium"> */}
              <Label htmlFor="username" className="text-xs font-medium">

                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-11 h-10 text-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 bg-background/50 backdrop-blur-sm transition-all-smooth"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-primary-foreground font-medium rounded-xl shadow-lg hover:shadow-xl transition-all-smooth transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In to TaskFlow"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}