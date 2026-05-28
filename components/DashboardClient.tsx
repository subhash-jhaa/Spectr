'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import React, { useState, useEffect, useCallback } from 'react'
import {
  ChartBarIcon,
  EyeIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { LogoMark } from './landing/Logo'
import { Dashboard } from '@/components/components/dashboard'

// Custom Hooks
import { useProjects, Project } from './hooks/useProjects'
import { useRealtimeStats } from './hooks/useRealtimeStats'

// Sub-components
import { ProjectSelector } from './ProjectSelector'
import { NewProjectModal } from './NewProjectModal'
import { DeleteProjectModal } from './DeleteProjectModal'

interface DashboardClientProps {
  session: Session
}

interface DailyStats {
  date: string
  visitors: number
}

interface CountryStats {
  country: string
  visitors: number
}

interface ReferrerStats {
  referrer: string
  visitors: number
}

interface PageStats {
  pageUrl: string
  visitors: number
  pageViews: number
}

interface BrowserStats {
  browser: string
  visitors: number
  share: number
}

interface DeviceStats {
  device: string
  visitors: number
  share: number
}

const DashboardClient = ({ session }: DashboardClientProps) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug('Dashboard session active for:', session.user?.email);
  }
  const [activeTab, setActiveTab] = useState('overview')
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [countryStats, setCountryStats] = useState<CountryStats[]>([])
  const [referrerStats, setReferrerStats] = useState<ReferrerStats[]>([])
  const [pageStats, setPageStats] = useState<PageStats[]>([])
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([])
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCopyingScript, setIsCopyingScript] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)
  const [loading, setLoading] = useState(true)

  // Use Custom Hooks
  const {
    projects,
    selectedProject,
    setSelectedProject,
    loading: projectsLoading,
    isCreatingProject,
    isDeletingProject,
    createProject,
    deleteProject
  } = useProjects()

  const {
    realtimeStats,
    isConnecting,
    realtimeConnected,
    reconnectionAttempts,
    maxReconnectionAttempts,
    retryConnection
  } = useRealtimeStats(selectedProject?.id)

  const fetchStats = useCallback(async () => {
    if (!selectedProject) return
    setDataFetched(false)
    try {
      const fetchWithCheck = async (url: string) => {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 10_000)
        try {
          const res = await fetch(url, { signal: controller.signal })
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(errorData.error || `HTTP ${res.status}`)
          }
          return res.json()
        } finally {
          clearTimeout(timer)
        }
      }

      const [dailyData, countriesData, referrersData, pagesData, browsersData, devicesData] = await Promise.all([
        fetchWithCheck(`/api/stats/project/${selectedProject.id}/7days`),
        fetchWithCheck(`/api/stats/project/${selectedProject.id}/countries`),
        fetchWithCheck(`/api/stats/project/${selectedProject.id}/referrers`),
        fetchWithCheck(`/api/stats/project/${selectedProject.id}/pages`),
        fetchWithCheck(`/api/stats/project/${selectedProject.id}/browsers`),
        fetchWithCheck(`/api/stats/project/${selectedProject.id}/devices`)
      ])

      setDailyStats(dailyData)
      setCountryStats(countriesData)
      setReferrerStats(referrersData)
      setPageStats(Array.isArray(pagesData) ? pagesData : [])
      setBrowserStats(Array.isArray(browsersData) ? browsersData : [])
      setDeviceStats(Array.isArray(devicesData) ? devicesData : [])
      setDataFetched(true)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Stats fetch timed out, will retry on next project selection.')
      } else {
        console.error('Error fetching stats:', error)
      }
      setDataFetched(true) // allow UI to recover
    }
  }, [selectedProject])

  // Sync loading state
  useEffect(() => {
    if (projectsLoading) {
      setLoading(true)
    } else if (projects.length === 0) {
      setLoading(false)
    } else if (dataFetched && realtimeConnected) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [projectsLoading, projects.length, dataFetched, realtimeConnected])

  useEffect(() => {
    if (selectedProject) {
      fetchStats()
    }
  }, [selectedProject, fetchStats])

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setLoading(true)
    setDataFetched(false)
  }

  const getTrackingScript = (projectId: string) => {
    const baseUrl = 'https://spectr.subhashjha.me'
    return `<script src="${baseUrl}/track.js" data-site="${projectId}"></script>`
  }

  const copyToClipboard = async (text: string) => {
    setIsCopyingScript(true)
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    } finally {
      setIsCopyingScript(false)
    }
  }

  // Function to extract page name from URL
  const getPageName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname

      if (path === '/' || path === '') {
        return 'Home'
      }

      const parts = path.split('/').filter(part => part.length > 0)
      if (parts.length === 0) {
        return 'Home'
      }

      const lastPart = parts[parts.length - 1]
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/[-_]/g, ' ')
    } catch {
      return 'Unknown Page'
    }
  }

  // Function to get domain from URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return 'Unknown'
    }
  }

  // Show welcome/empty state when no projects exist yet
  if (!projectsLoading && projects.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white font-mono mb-4">Welcome to spectr!</h2>
            <p className="text-zinc-400 font-mono mb-6">
              Create your first project to start tracking visitors in real-time. It only takes a few seconds to set up.
            </p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded hover:bg-zinc-200 transition font-mono font-bold mx-auto cursor-pointer"
            >
              Create Your First Project
            </button>
            <Link 
              href="/" 
              className="block mt-6 text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-sm underline underline-offset-4"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onCreate={createProject}
          isCreating={isCreatingProject}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-black/80 border-r border-zinc-900 backdrop-blur-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <LogoMark size={28} />
              <span className="font-bold text-lg text-white font-mono">spectr</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition cursor-pointer ${activeTab === 'overview'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <ChartBarIcon className="h-5 w-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition cursor-pointer ${activeTab === 'live'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <EyeIcon className="h-5 w-5" />
              Live Feed
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition cursor-pointer ${activeTab === 'setup'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <CogIcon className="h-5 w-5" />
              Setup
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-900 space-y-1">
          <Link
            href="/dashboard/profile"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded transition font-mono"
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-red-400 hover:bg-zinc-900 rounded transition font-mono cursor-pointer"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top Bar */}
        <div className="bg-black/80 border-b border-zinc-900 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-zinc-400 hover:text-white cursor-pointer"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <ProjectSelector
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={handleProjectSelect}
                onCreateProjectClick={() => setShowNewProjectModal(true)}
              />
            </div>

            {/* Real-time connection indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${realtimeConnected
                  ? 'bg-zinc-100'
                  : isConnecting
                    ? 'bg-blue-400 animate-pulse'
                    : reconnectionAttempts > 0
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-red-400 animate-pulse'
                }`}></div>
              <span className="text-xs text-zinc-400 font-mono">
                {realtimeConnected
                  ? 'Live'
                  : isConnecting
                    ? 'Connecting...'
                    : reconnectionAttempts > 0
                      ? `Reconnecting... (${reconnectionAttempts}/${maxReconnectionAttempts})`
                      : 'Disconnected'
                }
              </span>
              {!realtimeConnected && !isConnecting && reconnectionAttempts >= maxReconnectionAttempts && (
                <button
                  onClick={retryConnection}
                  className="text-xs text-white hover:text-zinc-200 transition cursor-pointer font-mono"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {loading && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-black rounded-xl border border-zinc-900 w-fit mx-auto">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-white font-mono text-sm">Fetching project data...</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <Dashboard 
              dailyStats={dailyStats} 
              realtimeStats={realtimeStats} 
              countryStats={countryStats} 
              referrerStats={referrerStats} 
              pageStats={pageStats}
              browserStats={browserStats}
              deviceStats={deviceStats}
            />
          )}

          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="bg-black p-6 rounded-xl border border-zinc-900">
                <div className="flex items-center gap-3 mb-4">
                  <EyeIcon className="h-6 w-6 text-zinc-100" />
                  <h2 className="text-xl font-bold text-zinc-100 font-mono">Live Feed</h2>
                  <span className="text-sm text-zinc-400 font-mono">
                    {realtimeStats.count} active visitors
                  </span>
                </div>

                {realtimeStats.visitors.length > 0 ? (
                  <div className="space-y-3">
                    {realtimeStats.visitors.map((visitor) => (
                      <div key={visitor.id} className="bg-black p-4 rounded border border-zinc-900">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-zinc-100 rounded-full animate-pulse"></div>
                            <span className="text-sm text-white font-mono font-semibold">
                              {visitor.country}, {visitor.city}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 font-mono">
                            {new Date(visitor.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Page Information */}
                        <div className="bg-black p-3 rounded mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-zinc-500 font-mono">🌐</span>
                            <span className="text-xs text-zinc-400 font-mono">{getDomain(visitor.pageUrl)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 font-mono">📄</span>
                            <span className="text-sm text-white font-mono font-semibold">
                              {getPageName(visitor.pageUrl)}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-zinc-600 font-mono break-all">
                              {visitor.pageUrl}
                            </span>
                          </div>
                        </div>

                        {/* Referrer Information */}
                        {visitor.referrer && visitor.referrer !== '' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 font-mono">🔗</span>
                            <span className="text-xs text-zinc-400 font-mono">
                              From: {visitor.referrer}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <EyeIcon className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 font-mono">No active visitors right now</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'setup' && selectedProject && (
            <div className="space-y-6">
              <div className="bg-black p-6 rounded-xl border border-zinc-900">
                <h2 className="text-xl font-bold text-zinc-100 mb-4 font-mono">Setup Instructions</h2>
                <p className="text-zinc-400 mb-4 font-mono">
                  Add this script to your website&apos;s <code className="bg-black p-1 rounded text-white">&lt;head&gt;</code> to start tracking visitors:
                </p>

                <div className="bg-black p-4 rounded border border-zinc-900 mb-4">
                  <code className="text-white font-mono text-sm select-all">
                    {getTrackingScript(selectedProject.id)}
                  </code>
                </div>

                <button
                  onClick={() => copyToClipboard(getTrackingScript(selectedProject.id))}
                  disabled={isCopyingScript}
                  className="px-4 py-2 bg-white text-zinc-950 rounded hover:bg-zinc-200 transition font-mono cursor-pointer disabled:bg-white/50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCopyingScript ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-950"></div>
                      Copying...
                    </>
                  ) : (
                    'Copy Script'
                  )}
                </button>
              </div>

              <div className="bg-black p-6 rounded-xl border border-zinc-900">
                <h3 className="text-zinc-100 font-semibold mb-4 font-mono">Project Details</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                     <span className="text-zinc-400">Project ID:</span>
                     <span className="text-white">{selectedProject.id}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-zinc-400">Created:</span>
                     <span className="text-white">
                       {new Date(selectedProject.createdAt).toLocaleDateString()}
                     </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-900/20 p-6 rounded-xl border border-red-500/30">
                <h3 className="text-red-400 font-semibold mb-2 font-mono">Danger Zone</h3>
                <p className="text-zinc-400 text-sm mb-4 font-mono">
                  Deleting a project is irreversible. It will permanently remove the project and all associated event data.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition font-mono cursor-pointer"
                >
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={createProject}
        isCreating={isCreatingProject}
      />

      {selectedProject && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteProject}
          projectName={selectedProject.name}
          isDeleting={isDeletingProject}
        />
      )}
    </div>
  )
}

export default DashboardClient