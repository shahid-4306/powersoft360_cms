// hooks/useTask.ts
"use client"

import { useState, useEffect } from 'react'
import { ITask } from '@/models/Task'

export function useTasks() {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      
      const data = await response.json()
      setTasks(data)
    } catch (error: any) {
      console.error('Failed to load tasks:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const createTask = async (taskData: Omit<ITask, '_id'>): Promise<ITask> => {
    try {
      const formData = new FormData()
      
      // Append all task data
      Object.entries(taskData).forEach(([key, value]) => {
        if (key === 'TasksAttachment' && Array.isArray(value)) {
          formData.append('TasksAttachmentCount', value.length.toString())
          value.forEach((file, index) => {
            formData.append(`TasksAttachment_${index}`, file)
          })
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value as string)
        }
      })

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      const newTask = await response.json()
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create task')
    }
  }

  const updateTask = async (taskId: string, taskData: Partial<ITask>): Promise<ITask> => {
    try {
      const formData = new FormData()
      
      // Append all task data
      Object.entries(taskData).forEach(([key, value]) => {
        if (key === 'newAttachments' && Array.isArray(value)) {
          formData.append('newAttachmentsCount', value.length.toString())
          value.forEach((file, index) => {
            formData.append(`newAttachments_${index}`, file)
          })
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value as string)
        }
      })

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update task')
      }

      const updatedTask = await response.json()
      setTasks(prev => prev.map(task => task._id === taskId ? updatedTask : task))
      return updatedTask
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update task')
    }
  }

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete task')
      }

      setTasks(prev => prev.filter(task => task._id !== taskId))
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete task')
    }
  }

  const refetch = () => {
    loadTasks()
  }

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch
  }
}