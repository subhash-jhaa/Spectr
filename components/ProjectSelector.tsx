import React, { useState, useRef, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'

interface Project {
  id: string
  name: string
  createdAt: string
}

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (project: Project) => void
  onCreateProjectClick: () => void
}

export const ProjectSelector = ({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProjectClick
}: ProjectSelectorProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleSelect = (project: Project) => {
    onSelectProject(project)
    setDropdownOpen(false)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative min-w-[180px] w-56">
        <button
          onClick={() => setDropdownOpen((open) => !open)}
          className="w-full flex items-center justify-between px-4 py-2 bg-black border border-zinc-700 rounded text-white font-mono focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
        >
          {selectedProject?.name || 'Select Project'}
          <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {dropdownOpen && (
          <div ref={dropdownRef} className="absolute z-50 mt-2 w-full bg-black rounded-lg shadow-lg border border-zinc-900 overflow-hidden">
            <div className="px-4 py-2 text-xs text-zinc-400 font-mono">Personal account</div>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelect(project)}
                className={`w-full text-left px-4 py-2 font-mono text-sm flex items-center gap-2 transition-colors cursor-pointer ${selectedProject?.id === project.id ? 'bg-zinc-900 text-white' : 'text-zinc-200 hover:bg-zinc-700'}`}
              >
                {project.name}
                {selectedProject?.id === project.id && (
                  <svg className="w-4 h-4 ml-auto text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onCreateProjectClick}
        className="flex items-center gap-2 px-3 py-2 bg-white text-zinc-950 rounded hover:bg-zinc-200 transition font-mono text-sm cursor-pointer"
      >
        <PlusIcon className="h-4 w-4" />
        <span className="hidden sm:inline">New Project</span>
      </button>
    </div>
  )
}
