"use client"

import { useState, useEffect } from 'react'

interface Project {
  _id?: string
  companyCode: string
  companyName: string
  city: string
  address: string
  projectName: string
  projectPath: string
  dbName: string
  dbLocation: string
  rProjectName: string
  rProjectPath: string
  createdAt?: string
  createdBy?: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load projects from API
  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data)
    } catch (error: any) {
      console.error('Failed to load projects:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const createProject = async (projectData: Omit<Project, '_id'>): Promise<void> => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      const newProject = await response.json()
      setProjects(prev => [newProject, ...prev])
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create project')
    }
  }

  const updateProject = async (projectId: string, projectData: Partial<Project>): Promise<void> => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update project')
      }

      const updatedProject = await response.json()
      setProjects(prev => 
        prev.map(project => 
          project._id === projectId 
            ? { ...project, ...updatedProject }
            : project
        )
      )
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update project')
    }
  }

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete project')
      }

      setProjects(prev => prev.filter(project => project._id !== projectId))
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete project')
    }
  }

  const refetch = () => {
    loadProjects()
  }

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch
  }
}