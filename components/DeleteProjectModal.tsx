import React, { useState } from 'react'

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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-black p-6 rounded-xl border border-red-500/50 w-full max-w-md">
        <h3 className="text-xl font-bold text-red-400 mb-2 font-mono">Delete Project</h3>
        <p className="text-zinc-400 mb-4 text-sm font-mono">
          This action cannot be undone. This will permanently delete the <strong className="text-white">{projectName}</strong> project and all of its associated data.
        </p>
        <p className="text-zinc-400 mb-4 text-sm font-mono">
          Please type the project name to confirm:
        </p>
        <input
          type="text"
          placeholder={projectName}
          value={confirmationName}
          onChange={(e) => setConfirmationName(e.target.value)}
          className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white font-mono mb-4"
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={confirmationName !== projectName || isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded transition font-mono cursor-pointer disabled:bg-red-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              'Delete this project'
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition font-mono cursor-pointer disabled:bg-zinc-700/50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
