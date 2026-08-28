'use client'

import React, { useState } from 'react'
import {
  CheckIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  SignalIcon,
  GlobeAltIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'

interface SnippetGeneratorProps {
  projectId: string
  projectName: string
  isConnected: boolean
  activeVisitorsCount: number
}

type FrameworkKey = 'html' | 'nextjs' | 'react' | 'nuxt'

export const SnippetGenerator = ({
  projectId,
  projectName,
  isConnected,
  activeVisitorsCount
}: SnippetGeneratorProps) => {
  const [activeTab, setActiveTab] = useState<FrameworkKey>('html')
  const [hasCopied, setHasCopied] = useState(false)

  const baseUrl = 'https://spectr.subhashjha.me'

  const snippets: Record<FrameworkKey, { title: string; filename: string; code: string; note: string }> = {
    html: {
      title: 'HTML / Universal',
      filename: 'index.html',
      code: `<script defer src="${baseUrl}/track.js" data-site="${projectId}"></script>`,
      note: 'Paste this tag inside the <head> section of any website (WordPress, Webflow, Shopify, Framer, static HTML).'
    },
    nextjs: {
      title: 'Next.js (App Router)',
      filename: 'app/layout.tsx',
      code: `import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="${baseUrl}/track.js"
          data-site="${projectId}"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}`,
      note: 'Add the Script component to your root app/layout.tsx inside the <head> tag.'
    },
    react: {
      title: 'React / Vite',
      filename: 'index.html',
      code: `<!-- Add to public/index.html or index.html inside <head> -->
<script defer src="${baseUrl}/track.js" data-site="${projectId}"></script>`,
      note: 'Place inside the <head> of your public/index.html (Vite or Create React App).'
    },
    nuxt: {
      title: 'Nuxt 3 / Vue',
      filename: 'nuxt.config.ts',
      code: `export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: '${baseUrl}/track.js',
          'data-site': '${projectId}',
          defer: true
        }
      ]
    }
  }
})`,
      note: 'Add to the app.head.script array in your nuxt.config.ts.'
    }
  }

  const currentSnippet = snippets[activeTab]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet.code)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy snippet', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Verification Banner */}
      <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-xl p-5 backdrop-blur-md shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              activeVisitorsCount > 0
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400'
                : isConnected
                  ? 'bg-blue-950/40 border-blue-500/30 text-blue-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}>
              <SignalIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">Telemetry Status:</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    activeVisitorsCount > 0
                      ? 'bg-emerald-400 animate-pulse'
                      : isConnected
                        ? 'bg-blue-400 animate-pulse'
                        : 'bg-amber-400 animate-pulse'
                  }`}></span>
                  <span className={activeVisitorsCount > 0 ? 'text-emerald-400' : isConnected ? 'text-blue-400' : 'text-amber-400'}>
                    {activeVisitorsCount > 0
                      ? `${activeVisitorsCount} Active Visitor${activeVisitorsCount > 1 ? 's' : ''}`
                      : isConnected
                        ? 'Connected (Listening)'
                        : 'Waiting for Telemetry'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {activeVisitorsCount > 0
                  ? `Spectr is actively tracking live visitors for "${projectName}".`
                  : 'Embed the snippet below and open your website in a new tab to verify telemetry.'}
              </p>
            </div>
          </div>

          <a
            href={baseUrl + '/track.js'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors w-fit"
          >
            <GlobeAltIcon className="w-3.5 h-3.5" />
            Inspect track.js
          </a>
        </div>
      </div>

      {/* Snippet Code Generator */}
      <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-xl overflow-hidden backdrop-blur-md shadow-sm">
        {/* Framework Selector Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-900/80 px-4 pt-3 pb-2.5 bg-zinc-950/40">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {(Object.keys(snippets) as FrameworkKey[]).map((key) => {
              const tab = snippets[key]
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key)
                    setHasCopied(false)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <CodeBracketIcon className="w-3.5 h-3.5" />
                  {tab.title}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleCopy}
            disabled={hasCopied}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
              hasCopied
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {hasCopied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                Copy Code
              </>
            )}
          </button>
        </div>

        {/* Code Content Area */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
            <span>File: {currentSnippet.filename}</span>
            <span className="text-[11px] text-zinc-600">Site ID: {projectId}</span>
          </div>

          <div className="relative bg-black/90 rounded-xl border border-zinc-900 p-4 overflow-x-auto font-mono text-xs text-zinc-200 selection:bg-zinc-800">
            <pre className="leading-relaxed">
              <code>{currentSnippet.code}</code>
            </pre>
          </div>

          <div className="mt-3.5 flex items-start gap-2 text-xs font-mono text-zinc-400">
            <SparklesIcon className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <p>{currentSnippet.note}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
