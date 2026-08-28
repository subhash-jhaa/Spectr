'use client'

import React, { useState } from 'react'
import { Project } from './hooks/useProjects'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <PlusIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono tracking-tight">Create New Project</h3>
              <p className="text-xs text-zinc-500 font-mono">Add a new domain to track analytics</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isCreating}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-semibold">Project Name</label>
            <input
              type="text"
              placeholder="e.g. My SaaS Landing Page"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition font-mono text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating || !projectName.trim()}
              className="flex-1 px-4 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg transition font-mono text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-zinc-600 border-t-zinc-950"></div>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
