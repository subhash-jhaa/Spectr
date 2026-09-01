'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  ExclamationTriangleIcon,
  TrashIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import { LogoMark } from './landing/Logo'
import { Dashboard } from '@/components/dashboard/dashboard'
import { getCountryCode, getCountryName, getCountryCoordinates } from '@/lib/geo-utils'
import { GlobeAnalytics, type AnalyticsMarker } from '@/components/ui/cobe-globe-analytics'
import { useTheme } from 'next-themes'
import { OverviewMetrics as OverviewMetricsType } from '@/interfaces/database'

// Custom Hooks
import { useProjects } from './hooks/useProjects'
import { useRealtimeStats } from './hooks/useRealtimeStats'

// Sub-components
import { DeleteProjectModal } from './DeleteProjectModal'
import { SnippetGenerator } from './dashboard/snippet-generator'

interface DashboardClientProps {
  session?: Session
  initialProjectId?: string
  initialProjects?: Array<{ id: string; name: string; createdAt: string }>
}

interface DailyStats {
  date: string
  visitors: number
  pageViews: number
  bounceRate?: number
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

interface AudienceMixStats {
  newVisitors: number
  returningVisitors: number
  newShare: number
  returningShare: number
}

const DashboardClient = ({ initialProjectId, initialProjects }: DashboardClientProps) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [countryStats, setCountryStats] = useState<CountryStats[]>([])
  const [referrerStats, setReferrerStats] = useState<ReferrerStats[]>([])
  const [pageStats, setPageStats] = useState<PageStats[]>([])
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([])
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([])
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetricsType | undefined>()
  const [audienceMix, setAudienceMix] = useState<AudienceMixStats>({
    newVisitors: 0,
    returningVisitors: 0,
    newShare: 0,
    returningShare: 0
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasCopiedConfigId, setHasCopiedConfigId] = useState(false)

  // Use Custom Hooks
  const {
    projects,
    selectedProject,
    loading: projectsLoading,
    isDeletingProject,
    deleteProject
  } = useProjects(initialProjectId, initialProjects)

  const projectId = selectedProject?.id || initialProjectId

  const {
    realtimeStats,
    isConnecting,
    realtimeConnected,
    hasError,
    errorMessage,
    isFallbackPolling,
    reconnectionAttempts,
    maxReconnectionAttempts,
    retryConnection
  } = useRealtimeStats(projectId)

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

      const [dailyData, countriesData, referrersData, pagesData, browsersData, devicesData, sourcesData, audienceData, overviewData] = await Promise.all([
        fetchWithCheck(`/api/stats/project/${projectId}/7days`),
        fetchWithCheck(`/api/stats/project/${projectId}/countries`),
        fetchWithCheck(`/api/stats/project/${projectId}/referrers`),
        fetchWithCheck(`/api/stats/project/${projectId}/pages`),
        fetchWithCheck(`/api/stats/project/${projectId}/browsers`),
        fetchWithCheck(`/api/stats/project/${projectId}/devices`),
        fetchWithCheck(`/api/stats/project/${projectId}/sources`),
        fetchWithCheck(`/api/stats/project/${projectId}/audience`).catch(() => ({
          newVisitors: 0,
          returningVisitors: 0,
          newShare: 0,
          returningShare: 0
        })),
        fetchWithCheck(`/api/stats/project/${projectId}/overview`).catch(() => undefined)
      ])

      setDailyStats(dailyData)
      setCountryStats(countriesData)
      setReferrerStats(referrersData)
      setPageStats(Array.isArray(pagesData) ? pagesData : [])
      setBrowserStats(Array.isArray(browsersData) ? browsersData : [])
      setDeviceStats(Array.isArray(devicesData) ? devicesData : [])
      setSourceStats(Array.isArray(sourcesData) ? sourcesData : [])
      if (audienceData) setAudienceMix(audienceData)
      if (overviewData) setOverviewMetrics(overviewData)
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

  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  // Map real-time / active visitors to 3D Globe Coordinates
  const globeMarkers = useMemo<AnalyticsMarker[]>(() => {
    if (realtimeStats.visitors.length > 0) {
      return realtimeStats.visitors.map((v, i) => {
        const country = v.country || 'Unknown';
        const coords = getCountryCoordinates(country);
        return {
          id: `live-${v.id || i}`,
          location: coords,
          visitors: 1,
          trend: 12,
          label: getCountryName(country),
        };
      });
    }

    if (countryStats.length > 0) {
      return countryStats.slice(0, 8).map((c, i) => {
        const coords = getCountryCoordinates(c.country);
        return {
          id: `country-${i}`,
          location: coords,
          visitors: c.visitors,
          trend: 8,
          label: getCountryName(c.country),
        };
      });
    }

    return [
      { id: "vis-1", location: [40.71, -74.01], visitors: 847, trend: 12, label: "New York" },
      { id: "vis-2", location: [51.51, -0.13], visitors: 623, trend: -3, label: "London" },
      { id: "vis-3", location: [35.68, 139.65], visitors: 412, trend: 8, label: "Tokyo" },
      { id: "vis-4", location: [48.86, 2.35], visitors: 385, trend: 5, label: "Paris" },
      { id: "vis-5", location: [28.61, 77.20], visitors: 540, trend: 22, label: "New Delhi" },
      { id: "vis-6", location: [-33.87, 151.21], visitors: 201, trend: 15, label: "Sydney" },
    ];
  }, [realtimeStats.visitors, countryStats]);

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
    <div className="h-screen w-full bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 flex overflow-hidden selection:bg-[#3ba6f1]/20 dark:selection:bg-zinc-800 selection:text-white transition-colors duration-300">
      {/* Sidebar - Fixed to screen height, fits viewport */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 h-full shrink-0 bg-white dark:bg-zinc-950/90 border-r border-[#e8e6e5] dark:border-zinc-900/80 backdrop-blur-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between overflow-hidden`}>
        <div className="p-5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between gap-2 mb-6 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
              <LogoMark size={28} />
              <span className="font-bold text-lg text-[#0c0a09] dark:text-white font-roobert tracking-tight">Spectr</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-[#78716c] dark:text-zinc-300 hover:text-[#0c0a09] dark:hover:text-white bg-[#f5f5f4] dark:bg-zinc-900/60 border border-[#e8e6e5] dark:border-zinc-800/80 hover:border-[#3ba6f1]/40 dark:hover:border-zinc-700 rounded-xl transition-colors"
            >
              <Squares2X2Icon className="h-4.5 w-4.5 text-[#3ba6f1] dark:text-zinc-400" />
              <span>All Projects</span>
            </Link>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-[#78716c] dark:text-zinc-400 mb-3 px-1">
            Analytics
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${activeTab === 'overview'
                  ? 'bg-[#3ba6f1] text-white dark:bg-zinc-800 dark:text-white font-semibold shadow-sm'
                  : 'text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white hover:bg-[#f5f5f4] dark:hover:bg-zinc-900/60'
                }`}
            >
              <ChartBarIcon className="h-4.5 w-4.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${activeTab === 'live'
                  ? 'bg-[#3ba6f1] text-white dark:bg-zinc-800 dark:text-white font-semibold shadow-sm'
                  : 'text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white hover:bg-[#f5f5f4] dark:hover:bg-zinc-900/60'
                }`}
            >
              <div className="flex items-center gap-3">
                <EyeIcon className="h-4.5 w-4.5" />
                Live Feed
              </div>
              {realtimeStats.count > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                  {realtimeStats.count}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${activeTab === 'setup'
                  ? 'bg-[#3ba6f1] text-white dark:bg-zinc-800 dark:text-white font-semibold shadow-sm'
                  : 'text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white hover:bg-[#f5f5f4] dark:hover:bg-zinc-900/60'
                }`}
            >
              <CogIcon className="h-4.5 w-4.5" />
              Setup & Config
            </button>
          </nav>
        </div>

        <div className="p-5 border-t border-[#e8e6e5] dark:border-zinc-900/80 space-y-1 bg-[#fafaf9] dark:bg-zinc-950/40">
          <Link
            href="/dashboard/profile"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white hover:bg-[#f5f5f4] dark:hover:bg-zinc-900/60 rounded-xl transition font-medium"
          >
            <UserIcon className="h-4.5 w-4.5" />
            Profile Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-[#78716c] dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-zinc-900/60 rounded-xl transition font-medium cursor-pointer"
          >
            <ArrowRightOnRectangleIcon className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area - Center dashboard scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar - Stays fixed at top */}
        <header className="shrink-0 z-30 bg-white/80 dark:bg-zinc-950/80 border-b border-[#e8e6e5] dark:border-zinc-900/80 px-4 sm:px-6 py-3.5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white cursor-pointer"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              <span className="text-sm sm:text-base font-bold text-[#0c0a09] dark:text-white tracking-tight truncate max-w-[220px] sm:max-w-[350px]">
                {selectedProject?.name || 'Analytics'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Real-time connection indicator */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900/60 border border-[#e8e6e5] dark:border-zinc-800/80">
                <span className="relative flex h-2.5 w-2.5">
                  {hasError ? (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  ) : realtimeConnected || isFallbackPolling ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </>
                  ) : isConnecting ? (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400 animate-pulse"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-500"></span>
                  )}
                </span>
                <span className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-300 font-medium" title={errorMessage || undefined}>
                  {hasError
                    ? 'Live data issue'
                    : realtimeConnected
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
                {hasError && (
                  <button
                    onClick={retryConnection}
                    className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline transition cursor-pointer font-mono ml-1 font-semibold"
                    title="Retry live telemetry fetch"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Smooth scrollable middle tracking area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {loading && (
            <div className="flex items-center gap-2.5 mb-6 p-3 bg-white dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800/80 rounded-xl w-fit mx-auto shadow-sm backdrop-blur-md">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#3ba6f1] border-t-transparent"></div>
              <span className="text-[#0c0a09] dark:text-zinc-300 font-mono text-xs">Syncing project metrics...</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <Dashboard 
              projectId={projectId}
              overviewMetrics={overviewMetrics}
              dailyStats={dailyStats} 
              realtimeStats={realtimeStats} 
              countryStats={countryStats} 
              referrerStats={referrerStats} 
              sourceStats={sourceStats}
              pageStats={pageStats}
              browserStats={browserStats}
              deviceStats={deviceStats}
              audienceMix={audienceMix}
            />
          )}

          {activeTab === 'live' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              {/* ── 3D Globe Interactive Visualization (No Card, Large Scale) ── */}
              <div className="flex flex-col items-center justify-center relative pt-2">
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#3ba6f1]">Live Visitor Telemetry</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#0c0a09] dark:text-white font-roobert tracking-tight">
                      Global Real-Time Presence
                    </h2>
                    <p className="text-sm text-[#78716c] dark:text-zinc-400 mt-1">
                      Interactive 3D globe tracking active sessions worldwide. Click and drag to rotate.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                      <span>{realtimeStats.count} {realtimeStats.count === 1 ? 'Live Visitor' : 'Live Visitors'}</span>
                    </div>
                  </div>
                </div>

                {/* Large 3D Cobe Globe */}
                <div className="w-full max-w-[580px] sm:max-w-[680px] lg:max-w-[760px] aspect-square mx-auto my-2 sm:my-6 relative flex items-center justify-center">
                  <GlobeAnalytics
                    markers={globeMarkers}
                    speed={0.0035}
                    dark={isDarkMode ? 1 : 0}
                    baseColor={isDarkMode ? [0.12, 0.12, 0.15] : [0.95, 0.95, 0.97]}
                    markerColor={[0.23, 0.65, 0.95]}
                    glowColor={isDarkMode ? [0.08, 0.18, 0.32] : [0.86, 0.92, 0.98]}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* ── Real-Time Visitor Feed Stream ── */}
              <div className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl p-6 backdrop-blur-md shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      <EyeIcon className="h-4 w-4 text-[#3ba6f1] dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0c0a09] dark:text-white font-roobert tracking-tight">Active Sessions Stream</h3>
                      <p className="text-xs text-[#78716c] dark:text-zinc-400 font-mono mt-0.5">Real-time breakdown of connected visitors</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-[#78716c] dark:text-zinc-400 bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 px-2.5 py-1 rounded-lg">
                    Streaming live
                  </div>
                </div>

                {realtimeStats.visitors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {realtimeStats.visitors.map((visitor) => (
                      <div
                        key={visitor.id}
                        className="bg-[#fafaf9] dark:bg-zinc-900/40 border border-[#e8e6e5] dark:border-zinc-800/60 rounded-xl p-4 hover:border-[#3ba6f1]/40 dark:hover:border-zinc-700/60 transition-colors flex flex-col justify-between"
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
                              <span className="text-xs font-bold font-mono text-[#0c0a09] dark:text-white">
                                {getCountryName(visitor.country || 'Unknown')}{visitor.city && visitor.city !== 'Unknown' ? `, ${visitor.city}` : ''}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#78716c] dark:text-zinc-500 font-mono">
                              {new Date(visitor.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {/* Page Information */}
                          <div className="bg-white dark:bg-zinc-950/60 border border-[#e8e6e5] dark:border-zinc-800/40 rounded-lg p-2.5 mb-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-mono text-[#0c0a09] dark:text-zinc-300 truncate">
                              <DocumentTextIcon className="w-3.5 h-3.5 text-[#78716c] dark:text-zinc-500 shrink-0" />
                              <span className="font-semibold text-[#0c0a09] dark:text-white truncate">
                                {getPageName(visitor.pageUrl)}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#78716c] dark:text-zinc-600 font-mono truncate mt-1">
                              {visitor.pageUrl}
                            </div>
                          </div>
                        </div>

                        {/* Badges / Referrer */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#e8e6e5] dark:border-zinc-800/40 text-[11px] font-mono">
                          {visitor.referrer && visitor.referrer !== '' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f5f5f4] dark:bg-zinc-800/60 text-[#78716c] dark:text-zinc-400 border border-[#e8e6e5] dark:border-zinc-700/40">
                              <span>Ref:</span>
                              <span className="text-[#0c0a09] dark:text-zinc-200 truncate max-w-[120px]">{getDomain(visitor.referrer)}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#f5f5f4] dark:bg-zinc-800/60 text-[#0c0a09] dark:text-zinc-300 border border-[#e8e6e5] dark:border-zinc-700/40">
                            {visitor.source || 'Direct'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <EyeIcon className="h-10 w-10 text-[#d6d3d1] dark:text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold font-mono text-[#78716c] dark:text-zinc-400">No active visitors right now</h3>
                    <p className="text-xs text-[#a8a29e] dark:text-zinc-600 font-mono mt-1">Telemetry markers and sessions will stream in as visitors browse your site.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'setup' && selectedProject && (
            <div className="space-y-6 max-w-4xl mx-auto code-section pb-12">
              {/* ── Top Navigation Bar: Back to Dashboard ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-800 hover:border-[#3ba6f1]/50 dark:hover:border-zinc-700 rounded-xl transition-all shadow-xs cursor-pointer w-fit group"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5 text-[#3ba6f1] group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Analytics Dashboard</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-[#78716c] dark:text-zinc-500">
                  <span className="font-semibold text-[#0c0a09] dark:text-zinc-300">{selectedProject.name}</span>
                  <span>/</span>
                  <span className="text-[#3ba6f1] font-medium">Settings & Setup</span>
                </div>
              </div>

              <SnippetGenerator
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                isConnected={realtimeConnected}
                activeVisitorsCount={realtimeStats.count}
              />

              {/* ── Project Configuration Card ── */}
              <div className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl p-6 backdrop-blur-md shadow-sm">
                <div className="pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80 mb-5">
                  <h3 className="text-base font-semibold font-roobert text-[#0c0a09] dark:text-white tracking-tight">
                    Project Configuration
                  </h3>
                  <p className="text-xs text-[#78716c] dark:text-zinc-400 font-sans mt-0.5">
                    Core identifiers and deployment parameters
                  </p>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-[#e8e6e5]/80 dark:border-zinc-900">
                    <span className="text-[#78716c] dark:text-zinc-400 font-sans text-xs">Project ID</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(selectedProject.id)
                          setHasCopiedConfigId(true)
                          setTimeout(() => setHasCopiedConfigId(false), 1800)
                        } catch (e) {}
                      }}
                      title="Click to copy Project ID"
                      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fafaf9] dark:bg-zinc-900/80 border border-[#e8e6e5] dark:border-zinc-800 text-xs font-mono text-[#0c0a09] dark:text-zinc-200 hover:border-[#3ba6f1]/50 transition-all cursor-pointer w-fit"
                    >
                      <span>{selectedProject.id}</span>
                      {hasCopiedConfigId ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <DocumentDuplicateIcon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[#e8e6e5]/80 dark:border-zinc-900">
                    <span className="text-[#78716c] dark:text-zinc-400 font-sans text-xs">Project Name</span>
                    <span className="text-[#0c0a09] dark:text-white font-semibold font-mono bg-[#f5f5f4] dark:bg-zinc-900/60 border border-[#e8e6e5] dark:border-zinc-800 px-2.5 py-1 rounded-lg">
                      {selectedProject.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#78716c] dark:text-zinc-400 font-sans text-xs">Created Date</span>
                    <span className="text-[#0c0a09] dark:text-zinc-300 font-mono">
                      {new Date(selectedProject.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Danger Zone Card ── */}
              <div className="bg-white dark:bg-zinc-950/70 border border-red-500/20 dark:border-red-500/25 rounded-2xl p-6 backdrop-blur-md shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold font-roobert text-red-600 dark:text-red-400 tracking-tight">
                        Danger Zone
                      </h3>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                        Destructive
                      </span>
                    </div>
                    <p className="text-xs text-[#78716c] dark:text-zinc-400 font-sans mt-1 leading-relaxed max-w-xl">
                      Permanently delete this project and all associated visitor event logs and analytics data. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-500/15 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white border border-red-500/30 hover:border-red-600 rounded-xl transition-all font-mono text-xs font-semibold cursor-pointer shadow-xs active:scale-[0.98] shrink-0 self-start sm:self-auto"
                  >
                    <span>Delete Project</span>
                  </button>
                </div>
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