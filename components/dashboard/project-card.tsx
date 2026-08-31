'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Project } from '@/components/hooks/useProjects'
import {
  CodeBracketIcon,
  TrashIcon,
  ArrowUpRightIcon,
  GlobeAltIcon,
  CheckIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'

interface ProjectCardProps {
  project: Project
  onDeleteClick: (project: Project) => void
}

export const ProjectCard = ({ project, onDeleteClick }: ProjectCardProps) => {
  const [hasCopiedSnippet, setHasCopiedSnippet] = useState(false)
  const [hasCopiedId, setHasCopiedId] = useState(false)

  const trackingSnippet = `<script defer src="https://spectr.subhashjha.me/track.js" data-site="${project.id}"></script>`

  const handleCopySnippet = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(trackingSnippet)
      setHasCopiedSnippet(true)
      setTimeout(() => setHasCopiedSnippet(false), 2000)
    } catch (err) {
      console.error('Failed to copy tracking snippet', err)
    }
  }

  const handleCopyId = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(project.id)
      setHasCopiedId(true)
      setTimeout(() => setHasCopiedId(false), 1800)
    } catch (err) {
      console.error('Failed to copy ID', err)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDeleteClick(project)
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Link
      href={`/dashboard/${project.id}`}
      className="group block h-full select-none"
    >
      <div className="relative h-full rounded-2xl bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#3ba6f1]/50 dark:hover:border-zinc-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-hidden">
        
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3ba6f1]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div>
          {/* Header: Icon, Name, Date, Status */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 flex items-center justify-center text-[#3ba6f1] group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-roobert text-base sm:text-lg font-semibold text-[#0c0a09] dark:text-white tracking-tight truncate group-hover:text-[#3ba6f1] transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-[#78716c] dark:text-zinc-400 font-sans mt-0.5">
                  Added on {formattedDate}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium shrink-0 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          {/* Project ID Chip with Quick Copy */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy Project ID"
              className="group/id inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#fafaf9] dark:bg-zinc-900/60 border border-[#e8e6e5] dark:border-zinc-800/80 text-[11px] font-mono text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white hover:border-[#3ba6f1]/40 transition-all max-w-full cursor-pointer"
            >
              <span className="text-[#a8a29e] dark:text-zinc-500 font-sans text-[10px] uppercase font-semibold">ID:</span>
              <span className="truncate font-mono">{project.id}</span>
              {hasCopiedId ? (
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <DocumentDuplicateIcon className="w-3.5 h-3.5 opacity-50 group-hover/id:opacity-100 transition-opacity shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#e8e6e5]/80 dark:border-zinc-900 flex items-center justify-between mt-auto relative z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySnippet}
              title="Copy snippet script tag"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                hasCopiedSnippet
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'bg-[#fafaf9] dark:bg-zinc-900/80 border-[#e8e6e5] dark:border-zinc-800 text-[#78716c] dark:text-zinc-300 hover:text-[#0c0a09] dark:hover:text-white hover:bg-[#f5f5f4] dark:hover:bg-zinc-800 hover:border-[#3ba6f1]/40'
              }`}
            >
              {hasCopiedSnippet ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CodeBracketIcon className="w-3.5 h-3.5 text-[#3ba6f1]" />
                  <span>Snippet</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              title="Delete project"
              className="p-1.5 text-[#78716c] dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#78716c] dark:text-zinc-400 group-hover:text-[#0c0a09] dark:group-hover:text-white transition-colors">
            <span>Analytics</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#3ba6f1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

