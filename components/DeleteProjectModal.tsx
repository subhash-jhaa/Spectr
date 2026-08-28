'use client'

import React, { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (confirmName: string) => Promise<boolean>
  projectName: string
  isDeleting: boolean
}

export const DeleteProjectModal = ({ isOpen, onClose, onDelete, projectName, isDeleting }: DeleteProjectModalProps) => {
  const [confirmationName, setConfirmationName] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (confirmationName !== projectName) return
    const success = await onDelete(confirmationName)
    if (success) {
      setConfirmationName('')
      onClose()
    }
  }

  const handleCancel = () => {
    setConfirmationName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <ExclamationTriangleIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-400 font-mono tracking-tight">Delete Project</h3>
              <p className="text-xs text-zinc-500 font-mono">Irreversible destructive action</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            This will permanently delete the <strong className="text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{projectName}</strong> project, its tracking script configuration, and all recorded analytics telemetry.
          </p>
          
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400">
              Type <span className="text-white font-semibold">{projectName}</span> to confirm:
            </label>
            <input
              type="text"
              placeholder={projectName}
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 transition"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition font-mono text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={confirmationName !== projectName || isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-mono text-xs font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/40 border-t-white"></div>
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
