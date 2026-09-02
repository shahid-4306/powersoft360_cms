"use client"

import { useState, useEffect } from 'react'
import { useProjects } from './useProjects'

export function useProjectStream() {
  const { projects, refetch } = useProjects()
  const [streamProjects, setStreamProjects] = useState<any[]>([])

  useEffect(() => {
    setStreamProjects(projects)
  }, [projects])

  // Optional: Set up real-time updates with WebSocket or polling
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 1500) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refetch])

  return streamProjects
}