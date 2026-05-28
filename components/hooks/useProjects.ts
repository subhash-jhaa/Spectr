import { useState, useCallback, useEffect } from 'react'

export interface Project {
  id: string
  name: string
  createdAt: string
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/project')
      const data = await response.json()
      setProjects(data)
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setLoading(false)
    }
  }, [selectedProject])

  const createProject = useCallback(async (name: string) => {
    if (!name.trim()) return null

    setIsCreatingProject(true)
    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      const newProject = await response.json()
      setProjects((prev) => [newProject, ...prev])
      setSelectedProject(newProject)
      return newProject
    } catch (error) {
      console.error('Error creating project:', error)
      return null
    } finally {
      setIsCreatingProject(false)
    }
  }, [])

  const deleteProject = useCallback(async (confirmName: string) => {
    if (!selectedProject || selectedProject.name !== confirmName) {
      console.error('Confirmation name does not match')
      return false
    }

    setIsDeletingProject(true)
    try {
      await fetch(`/api/project/${selectedProject.id}`, { method: 'DELETE' })
      setSelectedProject(null)
      await fetchProjects()
      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    } finally {
      setIsDeletingProject(false)
    }
  }, [selectedProject, fetchProjects])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects]) // run once on mount

  return {
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    setLoading,
    isCreatingProject,
    isDeletingProject,
    fetchProjects,
    createProject,
    deleteProject
  }
}
