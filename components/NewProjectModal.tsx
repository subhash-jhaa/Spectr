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
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-[#e8e6e5] dark:border-zinc-800/90 rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 flex items-center justify-center text-[#3ba6f1] dark:text-zinc-300">
              <PlusIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0c0a09] dark:text-white font-mono tracking-tight">Create New Project</h3>
              <p className="text-xs text-[#78716c] dark:text-zinc-500 font-mono">Add a new domain to track analytics</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isCreating}
            className="text-[#78716c] dark:text-zinc-500 hover:text-[#0c0a09] dark:hover:text-white p-1 rounded-lg hover:bg-[#f5f5f4] dark:hover:bg-zinc-900 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#78716c] dark:text-zinc-400 font-semibold">Project Name</label>
            <input
              type="text"
              placeholder="e.g. My SaaS Landing Page"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[#fafaf9] dark:bg-zinc-900/80 border border-[#e8e6e5] dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0c0a09] dark:text-white placeholder:text-[#a8a29e] dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#3ba6f1] focus:ring-1 focus:ring-[#3ba6f1] transition"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white hover:bg-[#ebeae8] dark:hover:bg-zinc-800 rounded-xl transition font-mono text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating || !projectName.trim()}
              className="flex-1 px-4 py-2.5 bg-[#3ba6f1] hover:bg-[#2f9ae6] active:scale-[0.98] text-white rounded-xl transition-all font-mono text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,166,241,0.3)] hover:shadow-[0_4px_16px_rgba(59,166,241,0.4)]"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/60 dark:border-zinc-600 border-t-white dark:border-t-zinc-950"></div>
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
