import { useState, useCallback, useEffect } from 'react'

export interface Project {
  id: string
  name: string
  createdAt: string
}

export const useProjects = (initialProjectId?: string, initialProjects?: Project[]) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    if (initialProjects && initialProjects.length > 0) {
      if (initialProjectId) {
        return initialProjects.find((p) => p.id === initialProjectId) || initialProjects[0]
      }
      return initialProjects[0]
    }
    return null
  })
  const [loading, setLoading] = useState(!initialProjects || initialProjects.length === 0)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/project', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setProjects(data)
          if (data.length > 0) {
            setSelectedProject((prev) => {
              if (initialProjectId) {
                return data.find((p) => p.id === initialProjectId) || data[0]
              }
              return prev || data[0]
            })
          }
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setLoading(false)
    }
  }, [initialProjectId])

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

  const deleteProjectById = useCallback(async (projectId: string, confirmName: string) => {
    const targetProject = projects.find(p => p.id === projectId)
    if (!targetProject || targetProject.name !== confirmName) {
      console.error('Confirmation name does not match')
      return false
    }

    setIsDeletingProject(true)
    try {
      await fetch(`/api/project/${projectId}`, { method: 'DELETE' })
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
      }
      await fetchProjects()
      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    } finally {
      setIsDeletingProject(false)
    }
  }, [projects, selectedProject, fetchProjects])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

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
    deleteProject,
    deleteProjectById
  }
}
