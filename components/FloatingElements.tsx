"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function FloatingElements() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute rounded-full opacity-20",
            i % 3 === 0 ? "bg-primary w-4 h-4" :
            i % 3 === 1 ? "bg-accent w-6 h-6" :
            "bg-secondary w-3 h-3"
          )}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            y: [null, -30, 0],
            x: [null, 20, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            repeatType: "reverse" as const,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}