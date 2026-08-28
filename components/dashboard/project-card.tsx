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
      className="group relative flex flex-col justify-between bg-zinc-950/80 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md hover:shadow-black/50"
    >
      <div>
        {/* Card Header: Title, Live Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:border-zinc-700 group-hover:text-white transition-colors">
              <GlobeAltIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono tracking-tight group-hover:text-zinc-100 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Created on {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </div>
        </div>

        {/* Project ID Tag */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900/90 border border-zinc-800/80 px-2 py-0.5 rounded truncate max-w-[240px]">
            ID: {project.id}
          </span>
        </div>
      </div>

      {/* Card Footer: Quick Actions & Navigation Indicator */}
      <div className="pt-3 border-t border-zinc-900 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySnippet}
            title="Copy tracking script"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
              hasCopied
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {hasCopied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
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
            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded transition-colors cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
          <span>Analytics</span>
          <ArrowUpRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
