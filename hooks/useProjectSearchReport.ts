"use client"

import { useState, useEffect, useCallback } from 'react'

interface Project {
  _id?: string
  companyCode: string
  companyName: string
  city: string
  projectName: string
  projectPath: string
  dbName: string
  dbLocation: string
  rProjectName: string
  rProjectPath: string
  createdAt?: string
}

export function useProjectSearchReport() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Load projects from API
  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data)
      setFilteredProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Search projects
  const searchProjects = useCallback((term: string) => {
    if (!term.trim()) {
      setFilteredProjects(projects)
      return
    }

    const lowercasedTerm = term.toLowerCase()
    const filtered = projects.filter(project =>
      project.projectName.toLowerCase().includes(lowercasedTerm) ||
      project.companyName.toLowerCase().includes(lowercasedTerm) ||
      project.companyCode.toLowerCase().includes(lowercasedTerm)
    )
    
    setFilteredProjects(filtered)
  }, [projects])

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    searchProjects(searchTerm)
  }, [searchTerm, searchProjects])

  return {
    projects: filteredProjects,
    isLoading,
    searchTerm,
    setSearchTerm
  }
}