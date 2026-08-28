'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
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
  ArrowLeftIcon,
  Squares2X2Icon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { LogoMark } from './landing/Logo'
import { Dashboard } from '@/components/dashboard/dashboard'
import { getCountryCode, getCountryName } from '@/lib/geo-utils'

// Custom Hooks
import { useProjects } from './hooks/useProjects'
import { useRealtimeStats } from './hooks/useRealtimeStats'

// Sub-components
import { DeleteProjectModal } from './DeleteProjectModal'
import { SnippetGenerator } from './dashboard/snippet-generator'

interface DashboardClientProps {
  session?: Session
  initialProjectId?: string
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

interface SourceStats {
  source: string
  visitors: number
  percentage?: number
}

const DashboardClient = ({ initialProjectId }: DashboardClientProps) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [countryStats, setCountryStats] = useState<CountryStats[]>([])
  const [referrerStats, setReferrerStats] = useState<ReferrerStats[]>([])
  const [pageStats, setPageStats] = useState<PageStats[]>([])
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([])
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)
  const [loading, setLoading] = useState(true)

  // Use Custom Hooks
  const {
    projects,
    selectedProject,
    loading: projectsLoading,
    isDeletingProject,
    deleteProject
  } = useProjects(initialProjectId)

  const {
    realtimeStats,
    isConnecting,
    realtimeConnected,
    isFallbackPolling,
    reconnectionAttempts,
    maxReconnectionAttempts,
    retryConnection
  } = useRealtimeStats(selectedProject?.id)

  const projectId = selectedProject?.id

  const fetchStats = useCallback(async () => {
    if (!projectId) return
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

      const [dailyData, countriesData, referrersData, pagesData, browsersData, devicesData, sourcesData] = await Promise.all([
        fetchWithCheck(`/api/stats/project/${projectId}/7days`),
        fetchWithCheck(`/api/stats/project/${projectId}/countries`),
        fetchWithCheck(`/api/stats/project/${projectId}/referrers`),
        fetchWithCheck(`/api/stats/project/${projectId}/pages`),
        fetchWithCheck(`/api/stats/project/${projectId}/browsers`),
        fetchWithCheck(`/api/stats/project/${projectId}/devices`),
        fetchWithCheck(`/api/stats/project/${projectId}/sources`)
      ])

      setDailyStats(dailyData)
      setCountryStats(countriesData)
      setReferrerStats(referrersData)
      setPageStats(Array.isArray(pagesData) ? pagesData : [])
      setBrowserStats(Array.isArray(browsersData) ? browsersData : [])
      setDeviceStats(Array.isArray(devicesData) ? devicesData : [])
      setSourceStats(Array.isArray(sourcesData) ? sourcesData : [])
      setDataFetched(true)
      setLoading(false)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Stats fetch timed out, will retry on next project selection.')
      } else {
        console.error('Error fetching stats:', error)
      }
      setDataFetched(true)
      setLoading(false)
    }
  }, [projectId])

  // Sync loading state
  useEffect(() => {
    if (projectsLoading) {
      setLoading(true)
    } else if (projects.length === 0 || dataFetched) {
      setLoading(false)
    }
  }, [projectsLoading, projects.length, dataFetched])

  useEffect(() => {
    if (projectId) {
      fetchStats()
    }
  }, [projectId, fetchStats])

  const handleDeleteProject = async (confirmName: string) => {
    const success = await deleteProject(confirmName)
    if (success) {
      router.push('/dashboard')
    }
    return success
  }

  const getPageName = (url: string) => {
    try {
      const pathname = new URL(url.startsWith('http') ? url : `https://${url}`).pathname
      if (!pathname || pathname === '/') return '/'
      return pathname
    } catch {
      return url || '/'
    }
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
    } catch {
      return 'Direct'
    }
  }

  // Show welcome/empty state when no projects exist yet
  if (!projectsLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 selection:bg-zinc-800 selection:text-white">
        <div className="text-center max-w-md mx-auto p-8 bg-zinc-950/70 border border-zinc-900 rounded-2xl backdrop-blur-md">
          <div className="h-14 w-14 bg-zinc-900 border border-zinc-800 rounded-2xl mx-auto mb-6 flex items-center justify-center text-zinc-400">
            <UserGroupIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white font-mono mb-2">No Projects Found</h2>
          <p className="text-zinc-400 font-mono text-xs mb-6 leading-relaxed">
            You don&apos;t have any active projects yet. Create a project to start tracking visitors in real-time.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-950 rounded-lg hover:bg-zinc-200 transition font-mono text-xs font-bold mx-auto cursor-pointer"
          >
            Go to Projects Hub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex selection:bg-zinc-800 selection:text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950/90 border-r border-zinc-900/80 backdrop-blur-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between`}>
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-6">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <LogoMark size={26} />
              <span className="font-bold text-base text-white font-mono tracking-tight">spectr</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <Squares2X2Icon className="h-4 w-4 text-zinc-400" />
              <span>All Projects</span>
            </Link>
          </div>

          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2 px-1 font-semibold">
            Analytics
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${activeTab === 'overview'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
            >
              <ChartBarIcon className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${activeTab === 'live'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
            >
              <div className="flex items-center gap-3">
                <EyeIcon className="h-4 w-4" />
                Live Feed
              </div>
              {realtimeStats.count > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {realtimeStats.count}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${activeTab === 'setup'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
            >
              <CogIcon className="h-4 w-4" />
              Setup & Config
            </button>
          </nav>
        </div>

        <div className="p-5 border-t border-zinc-900/80 space-y-1 bg-zinc-950/40">
          <Link
            href="/dashboard/profile"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-lg transition font-mono"
          >
            <UserIcon className="h-4 w-4" />
            Profile Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-900/60 rounded-lg transition font-mono cursor-pointer"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-zinc-950/80 border-b border-zinc-900/80 px-4 sm:px-6 py-3.5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-zinc-400 hover:text-white cursor-pointer"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 px-2.5 py-1 rounded-lg transition-colors"
                title="Back to All Projects"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                <span>Projects</span>
              </Link>

              <span className="text-zinc-700 font-mono">/</span>

              <span className="text-xs font-bold font-mono text-white tracking-tight truncate max-w-[180px] sm:max-w-[300px]">
                {selectedProject?.name || 'Analytics'}
              </span>
            </div>

            {/* Real-time connection indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <span className="relative flex h-2 w-2">
                {realtimeConnected || isFallbackPolling ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : isConnecting ? (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400 animate-pulse"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                )}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {realtimeConnected
                  ? 'Live Stream'
                  : isFallbackPolling
                    ? 'Live'
                    : isConnecting
                      ? 'Connecting...'
                      : reconnectionAttempts > 0
                        ? `Retrying (${reconnectionAttempts}/${maxReconnectionAttempts})`
                        : 'Disconnected'
                }
              </span>
              {!realtimeConnected && !isFallbackPolling && !isConnecting && reconnectionAttempts >= maxReconnectionAttempts && (
                <button
                  onClick={retryConnection}
                  className="text-[11px] text-white hover:underline transition cursor-pointer font-mono ml-1 font-semibold"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {loading && (
            <div className="flex items-center gap-2.5 mb-6 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl w-fit mx-auto shadow-lg backdrop-blur-md">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-600 border-t-white"></div>
              <span className="text-zinc-300 font-mono text-xs">Syncing project metrics...</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <Dashboard 
              projectId={projectId}
              dailyStats={dailyStats} 
              realtimeStats={realtimeStats} 
              countryStats={countryStats} 
              referrerStats={referrerStats} 
              sourceStats={sourceStats}
              pageStats={pageStats}
              browserStats={browserStats}
              deviceStats={deviceStats}
            />
          )}

          {activeTab === 'live' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-xl p-6 backdrop-blur-md shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-900/80 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                      <EyeIcon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white font-mono tracking-tight">Real-Time Visitor Feed</h2>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">Live stream of active user telemetry</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {realtimeStats.count} {realtimeStats.count === 1 ? 'active visitor' : 'active visitors'}
                  </div>
                </div>

                {realtimeStats.visitors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {realtimeStats.visitors.map((visitor) => (
                      <div
                        key={visitor.id}
                        className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              {visitor.country && visitor.country !== 'Unknown' && (
                                <NextImage
                                  src={`https://flag.vercel.app/s/${getCountryCode(visitor.country)}.svg`}
                                  alt={visitor.country}
                                  width={16}
                                  height={12}
                                  className="rounded-[2px] object-cover shrink-0"
                                  unoptimized
                                />
                              )}
                              <span className="text-xs font-bold font-mono text-white">
                                {getCountryName(visitor.country || 'Unknown')}{visitor.city && visitor.city !== 'Unknown' ? `, ${visitor.city}` : ''}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {new Date(visitor.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {/* Page Information */}
                          <div className="bg-zinc-950/60 border border-zinc-800/40 rounded-lg p-2.5 mb-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 truncate">
                              <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span className="font-semibold text-white truncate">
                                {getPageName(visitor.pageUrl)}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-600 font-mono truncate mt-1">
                              {visitor.pageUrl}
                            </div>
                          </div>
                        </div>

                        {/* Badges / Referrer */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/40 text-[11px] font-mono">
                          {visitor.referrer && visitor.referrer !== '' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-400 border border-zinc-700/40">
                              <span>Ref:</span>
                              <span className="text-zinc-200 truncate max-w-[120px]">{getDomain(visitor.referrer)}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300 border border-zinc-700/40">
                            {visitor.source || 'Direct'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4">
                    <EyeIcon className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold font-mono text-zinc-400">No active visitors right now</h3>
                    <p className="text-xs text-zinc-600 font-mono mt-1">Telemetry will show up immediately when a visitor loads your site.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'setup' && selectedProject && (
            <div className="space-y-6 max-w-4xl mx-auto code-section">
              <SnippetGenerator
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                isConnected={realtimeConnected}
                activeVisitorsCount={realtimeStats.count}
              />

              <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-xl p-6 backdrop-blur-md shadow-sm">
                <h3 className="text-sm font-bold font-mono text-white tracking-tight mb-4 uppercase tracking-wider text-zinc-400">Project Configuration</h3>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-900/80">
                     <span className="text-zinc-400">Project ID</span>
                     <span className="text-white font-mono bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800 select-all">{selectedProject.id}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-900/80">
                     <span className="text-zinc-400">Project Name</span>
                     <span className="text-white font-bold">{selectedProject.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                     <span className="text-zinc-400">Created Date</span>
                     <span className="text-zinc-300">
                       {new Date(selectedProject.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                     </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold font-mono text-red-400 tracking-tight mb-1.5">Danger Zone</h3>
                <p className="text-xs text-zinc-400 font-mono mb-4 leading-relaxed">
                  Permanently delete this project and all associated visitor event logs and analytics data. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition font-mono text-xs font-bold cursor-pointer"
                >
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedProject && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteProject}
          projectName={selectedProject.name}
          isDeleting={isDeletingProject}
        />
      )}
    </div>
  )
}

export default DashboardClient