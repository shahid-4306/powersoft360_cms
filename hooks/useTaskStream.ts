"use client"

import { useState, useEffect } from 'react'
import { useTasks } from './useTasks'

export function useTaskStream() {
  const { tasks, refetch } = useTasks()
  const [streamTasks, setStreamTasks] = useState<any[]>([])

  useEffect(() => {
    setStreamTasks(tasks)
  }, [tasks])

  // Set up SSE connection for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connectToStream = () => {
      try {
        eventSource = new EventSource("/api/tasks/stream")

        eventSource.onopen = () => {
          console.log("Connected to task stream")
          reconnectAttempts = 0
        }

        eventSource.onmessage = (event) => {
          try {
            // Ignore heartbeat messages
            if (event.data.trim() === ": heartbeat") return
            
            const tasksData = JSON.parse(event.data)
            setStreamTasks(tasksData)
          } catch (err) {
            console.error("Error parsing stream data:", err)
          }
        }

        eventSource.onerror = (err) => {
          console.error("EventSource error:", err)
          eventSource?.close()
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            setTimeout(connectToStream, 1000 * reconnectAttempts)
          }
        }
      } catch (error) {
        console.error("Failed to connect to task stream:", error)
      }
    }

    connectToStream()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  return streamTasks
}