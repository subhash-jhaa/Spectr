'use client';

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { LogoMark } from '@/components/landing/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
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
  Squares2X2Icon
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
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 flex flex-col selection:bg-[#3ba6f1]/20 dark:selection:bg-zinc-800 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 border-b border-[#e8e6e5] dark:border-zinc-900 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <LogoMark size={28} />
              <span className="font-bold text-lg text-[#0c0a09] dark:text-white font-mono tracking-tight">spectr</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#78716c] dark:text-zinc-500 border-l border-[#e8e6e5] dark:border-zinc-800 pl-6">
              <Squares2X2Icon className="w-4 h-4 text-[#3ba6f1] dark:text-zinc-400" />
              <span className="text-[#0c0a09] dark:text-zinc-300 font-semibold">Projects Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white bg-[#fafaf9] dark:bg-zinc-950 border border-[#e8e6e5] dark:border-zinc-800 hover:border-[#3ba6f1]/50 dark:hover:border-zinc-700 rounded-lg transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{session.user?.email || 'Profile'}</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Sign Out"
              className="p-1.5 text-[#78716c] dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 bg-[#fafaf9] dark:bg-zinc-950 border border-[#e8e6e5] dark:border-zinc-800 hover:border-red-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome & Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#0c0a09] dark:text-white tracking-tight">
              Projects
            </h1>
            <p className="text-sm text-[#78716c] dark:text-zinc-400 font-mono mt-1">
              Select a project to view real-time traffic, analytics, and visitor telemetry.
            </p>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3ba6f1] hover:bg-[#3398e1] dark:bg-white text-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-mono text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            New Project
          </button>
        </div>

        {/* Filter & Search Bar */}
        {projects.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-4 h-4 text-[#78716c] dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-[#0c0a09] dark:text-white font-mono placeholder:text-[#a8a29e] dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#3ba6f1] focus:ring-1 focus:ring-[#3ba6f1] transition shadow-sm"
              />
            </div>
            <div className="text-xs text-[#78716c] dark:text-zinc-500 font-mono hidden sm:block">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-950 border border-[#e8e6e5] dark:border-zinc-900 rounded-2xl p-5 animate-pulse h-44 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-[#f5f5f4] dark:bg-zinc-900 rounded-xl"></div>
                  <div className="w-3/4 h-4 bg-[#f5f5f4] dark:bg-zinc-900 rounded"></div>
                  <div className="w-1/2 h-3 bg-[#f5f5f4] dark:bg-zinc-900 rounded"></div>
                </div>
                <div className="w-full h-8 bg-[#f5f5f4] dark:bg-zinc-900 rounded"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-950/40 border border-dashed border-[#e8e6e5] dark:border-zinc-800/80 rounded-2xl max-w-2xl mx-auto my-8 shadow-sm">
            <div className="w-14 h-14 bg-[#f5f5f4] dark:bg-zinc-900/80 border border-[#e8e6e5] dark:border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#3ba6f1] dark:text-zinc-400">
              <FolderIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#0c0a09] dark:text-white font-mono mb-2">No Projects Created Yet</h3>
            <p className="text-sm text-[#78716c] dark:text-zinc-400 font-mono mb-6 max-w-md mx-auto">
              Create your first project to receive your unique tracking script and start viewing live analytics.
            </p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3ba6f1] hover:bg-[#3398e1] dark:bg-white text-white dark:text-zinc-950 font-mono text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              Create Your First Project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Search No Match State */
          <div className="text-center py-12 bg-white dark:bg-zinc-950/40 border border-[#e8e6e5] dark:border-zinc-900 rounded-2xl shadow-sm">
            <p className="text-sm text-[#78716c] dark:text-zinc-400 font-mono">
              No projects found matching &ldquo;<span className="text-[#0c0a09] dark:text-white">{searchQuery}</span>&rdquo;
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
