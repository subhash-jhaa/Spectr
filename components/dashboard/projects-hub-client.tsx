'use client';

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { LogoMark } from '@/components/landing/Logo'
import { useProjects, Project } from '@/components/hooks/useProjects'
import { ProjectCard } from './project-card'
import { NewProjectModal } from '@/components/NewProjectModal'
import { DeleteProjectModal } from '@/components/DeleteProjectModal'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  FolderIcon,
  Squares2X2Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ProjectsHubClientProps {
  session: Session
  initialProjects?: Project[]
}

export default function ProjectsHubClient({ session, initialProjects }: ProjectsHubClientProps) {
  const {
    projects,
    loading,
    isCreatingProject,
    isDeletingProject,
    createProject,
    deleteProjectById
  } = useProjects(undefined, initialProjects)

  const [searchQuery, setSearchQuery] = useState('')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const q = searchQuery.toLowerCase().trim()
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  }, [projects, searchQuery])

  const handleDeleteConfirm = async (confirmName: string) => {
    if (!projectToDelete) return false
    const success = await deleteProjectById(projectToDelete.id, confirmName)
    if (success) {
      setProjectToDelete(null)
    }
    return success
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 flex flex-col selection:bg-[#3ba6f1]/20 dark:selection:bg-white/20 transition-colors duration-300 relative">
      
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50 dark:opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-gradient-to-b from-[#3ba6f1]/10 via-blue-500/[0.03] to-transparent blur-[5rem] pointer-events-none rounded-full" />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 border-b border-[#e8e6e5] dark:border-zinc-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
              <LogoMark size={28} />
              <span className="font-bold text-lg text-[#0c0a09] dark:text-white font-mono tracking-tight">Spectr</span>
            </Link>
            <div className="flex items-center gap-2 text-xs font-mono text-[#78716c] dark:text-zinc-400 border-l border-[#e8e6e5] dark:border-zinc-800/80 pl-4 sm:pl-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 text-[#0c0a09] dark:text-zinc-300 font-medium">
                <Squares2X2Icon className="w-3.5 h-3.5 text-[#3ba6f1]" />
                Projects Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white bg-white dark:bg-zinc-950 border border-[#e8e6e5] dark:border-zinc-800 hover:border-[#3ba6f1]/50 dark:hover:border-zinc-700 rounded-full transition-colors shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#3ba6f1]" />
              <span className="hidden sm:inline font-sans">{session.user?.email || 'Profile'}</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Sign Out"
              className="p-2 text-[#78716c] dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-zinc-950 border border-[#e8e6e5] dark:border-zinc-800 hover:border-red-500/30 rounded-full transition-colors cursor-pointer shadow-xs"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Welcome & Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-xs font-mono text-[#78716c] dark:text-zinc-400 mb-3 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ba6f1] animate-pulse" />
              Workspace Console
            </div> */}
            <h1 className="font-roobert text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0c0a09] dark:text-white tracking-[-0.03em] leading-[1.15]">
              <span>Your Projects — </span>
              <span className="text-[#3ba6f1] font-semibold">live telemetry</span>
            </h1>
            <p className="text-sm sm:text-base text-[#78716c] dark:text-zinc-400 max-w-xl mt-2 leading-relaxed">
              Select a project to view real-time traffic, privacy-first analytics, and visitor telemetry.
            </p>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3ba6f1] hover:bg-[#2f9ae6] active:scale-[0.98] text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-[0_2px_12px_rgba(59,166,241,0.35)] hover:shadow-[0_4px_20px_rgba(59,166,241,0.45)] cursor-pointer w-full sm:w-auto shrink-0"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        {projects.length > 0 && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-4 h-4 text-[#78716c] dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#0c0a09] dark:text-white placeholder:text-[#a8a29e] dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#3ba6f1] focus:ring-2 focus:ring-[#3ba6f1]/20 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs text-[#78716c] dark:text-zinc-400 font-mono flex items-center gap-2 self-end sm:self-auto px-3.5 py-2 rounded-xl border border-[#e8e6e5] dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} active</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 p-6 h-52 flex flex-col justify-between animate-pulse"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 bg-[#f5f5f4] dark:bg-zinc-900 rounded-xl" />
                  <div className="w-3/4 h-4 bg-[#f5f5f4] dark:bg-zinc-900 rounded" />
                  <div className="w-1/2 h-3 bg-[#f5f5f4] dark:bg-zinc-900 rounded" />
                </div>
                <div className="w-full h-9 bg-[#f5f5f4] dark:bg-zinc-900 rounded-lg" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-6 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl max-w-2xl mx-auto my-8 shadow-sm">
            <div className="w-14 h-14 bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#3ba6f1]">
              <FolderIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-roobert font-semibold text-[#0c0a09] dark:text-white mb-2">No Projects Created Yet</h3>
            <p className="text-sm text-[#78716c] dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
              Create your first project to receive your unique tracking script and start viewing live analytics.
            </p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3ba6f1] hover:bg-[#2f9ae6] active:scale-[0.98] text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-[0_2px_12px_rgba(59,166,241,0.35)] hover:shadow-[0_4px_20px_rgba(59,166,241,0.45)] cursor-pointer"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Create Your First Project</span>
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Search No Match State */
          <div className="text-center py-16 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl shadow-sm">
            <p className="text-sm text-[#78716c] dark:text-zinc-400 font-mono">
              No projects found matching &ldquo;<span className="text-[#0c0a09] dark:text-white font-semibold">{searchQuery}</span>&rdquo;
            </p>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDeleteClick={(p) => setProjectToDelete(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={createProject}
        isCreating={isCreatingProject}
      />

      <DeleteProjectModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onDelete={handleDeleteConfirm}
        projectName={projectToDelete?.name || ''}
        isDeleting={isDeletingProject}
      />
    </div>
  )
}

