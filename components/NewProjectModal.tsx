import React, { useState } from 'react'
import { Project } from './hooks/useProjects'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<Project | null>
  isCreating: boolean
}

export const NewProjectModal = ({ isOpen, onClose, onCreate, isCreating }: NewProjectModalProps) => {
  const [projectName, setProjectName] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!projectName.trim()) return
    const success = await onCreate(projectName)
    if (success) {
      setProjectName('')
      onClose()
    }
  }

  const handleCancel = () => {
    setProjectName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black p-6 rounded-xl border border-zinc-900 w-96">
        <h3 className="text-xl font-bold text-zinc-100 mb-4 font-mono">Create New Project</h3>
        <input
          type="text"
          placeholder="Project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white font-mono mb-4"
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-white text-zinc-950 rounded hover:bg-zinc-200 transition font-mono cursor-pointer disabled:bg-white/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-950"></div>
                Creating...
              </>
            ) : (
              'Create'
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition font-mono cursor-pointer disabled:bg-zinc-700/50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
