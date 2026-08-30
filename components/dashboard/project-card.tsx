'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Project } from '@/components/hooks/useProjects'
import {
  CodeBracketIcon,
  TrashIcon,
  ArrowUpRightIcon,
  GlobeAltIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface ProjectCardProps {
  project: Project
  onDeleteClick: (project: Project) => void
}

export const ProjectCard = ({ project, onDeleteClick }: ProjectCardProps) => {
  const [hasCopied, setHasCopied] = useState(false)

  const trackingSnippet = `<script defer src="https://spectr.subhashjha.me/track.js" data-site="${project.id}"></script>`

  const handleCopySnippet = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(trackingSnippet)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy tracking snippet', err)
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
      className="group relative flex flex-col justify-between bg-white dark:bg-zinc-950/80 hover:bg-[#fafaf9] dark:hover:bg-zinc-900/80 border border-[#e8e6e5] dark:border-zinc-800/80 hover:border-[#3ba6f1]/40 dark:hover:border-zinc-700/80 rounded-2xl p-5 transition-all duration-200 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-md"
    >
      <div>
        {/* Card Header: Title, Live Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 flex items-center justify-center text-[#78716c] dark:text-zinc-300 group-hover:border-[#3ba6f1]/50 group-hover:text-[#3ba6f1] transition-colors">
              <GlobeAltIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0c0a09] dark:text-white font-mono tracking-tight group-hover:text-[#3ba6f1] dark:group-hover:text-zinc-100 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-[#78716c] dark:text-zinc-500 font-mono">
                Created on {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            Active
          </div>
        </div>

        {/* Project ID Tag */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#78716c] dark:text-zinc-500 bg-[#fafaf9] dark:bg-zinc-900/90 border border-[#e8e6e5] dark:border-zinc-800/80 px-2 py-0.5 rounded truncate max-w-[240px]">
            ID: {project.id}
          </span>
        </div>
      </div>

      {/* Card Footer: Quick Actions & Navigation Indicator */}
      <div className="pt-3 border-t border-[#e8e6e5] dark:border-zinc-900 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySnippet}
            title="Copy tracking script"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
              hasCopied
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-[#fafaf9] dark:bg-zinc-900 border-[#e8e6e5] dark:border-zinc-800 text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white hover:bg-[#f5f5f4] dark:hover:bg-zinc-800'
            }`}
          >
            {hasCopied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <CodeBracketIcon className="w-3.5 h-3.5" />
                Snippet
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Delete project"
            className="p-1 text-[#78716c] dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-[#f5f5f4] dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-[#78716c] dark:text-zinc-400 group-hover:text-[#0c0a09] dark:group-hover:text-white transition-colors font-medium">
          <span>Analytics</span>
          <ArrowUpRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
