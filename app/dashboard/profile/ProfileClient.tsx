'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogoMark } from '@/components/landing/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Avatar, AvatarFallback, AvatarImage,
} from '@/components/ui/avatar';
import {
  TrashIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon,
  ArrowUpRightIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string;
  };
  projects: {
    id: string;
    name: string;
    createdAt: string;
  }[];
}

export default function ProfileClient({ user, projects: initialProjects }: Props) {
  const [name, setName] = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this project and all its analytics data? This cannot be undone.')) return;
    setDeletingId(projectId);
    const res = await fetch(`/api/project/${projectId}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 flex flex-col selection:bg-[#3ba6f1]/20 dark:selection:bg-white/20 transition-colors duration-300 relative">
      
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50 dark:opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-gradient-to-b from-[#3ba6f1]/10 via-blue-500/[0.03] to-transparent blur-[5rem] pointer-events-none rounded-full" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 border-b border-[#e8e6e5] dark:border-zinc-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
              <LogoMark size={28} />
              <span className="font-bold text-lg text-[#0c0a09] dark:text-white font-mono tracking-tight">spectr</span>
            </Link>
            <div className="flex items-center gap-2 text-xs font-mono text-[#78716c] dark:text-zinc-400 border-l border-[#e8e6e5] dark:border-zinc-800/80 pl-4 sm:pl-5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 hover:border-[#3ba6f1]/40 text-[#0c0a09] dark:text-zinc-300 font-medium transition-colors"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5 text-[#3ba6f1]" />
                <span>Projects Hub</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
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

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-8">
        
        {/* Page Title */}
        <div>
          <h1 className="font-roobert text-3xl sm:text-4xl font-bold text-[#0c0a09] dark:text-white tracking-[-0.03em] leading-tight">
            Account & Profile
          </h1>
          <p className="text-sm text-[#78716c] dark:text-zinc-400 font-sans mt-1.5 leading-relaxed">
            Manage your account credentials, display identity, and associated projects.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80 p-6">
            <CardTitle className="text-base font-semibold font-roobert text-[#0c0a09] dark:text-white tracking-tight">Personal Details</CardTitle>
            <CardDescription className="text-xs text-[#78716c] dark:text-zinc-400 font-sans">Your public identity on Spectr</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 border border-[#e8e6e5] dark:border-zinc-800 shadow-xs">
                <AvatarImage src={user.image} />
                <AvatarFallback className="bg-[#f5f5f4] dark:bg-zinc-900 text-[#0c0a09] dark:text-white font-roobert text-lg font-bold">
                  {user.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold font-roobert text-[#0c0a09] dark:text-white">{user.name || 'Anonymous User'}</p>
                <p className="text-xs font-mono text-[#78716c] dark:text-zinc-400 mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#78716c] dark:text-zinc-400 font-medium">Display Name</label>
                <input
                  className="w-full rounded-xl border border-[#e8e6e5] dark:border-zinc-800 bg-[#fafaf9] dark:bg-zinc-900/60 px-3.5 py-2.5 text-sm text-[#0c0a09] dark:text-white outline-none focus:border-[#3ba6f1] focus:ring-2 focus:ring-[#3ba6f1]/20 transition-all shadow-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#78716c] dark:text-zinc-400 font-medium">Email Address</label>
                <input
                  className="w-full rounded-xl border border-[#e8e6e5]/80 dark:border-zinc-800/60 bg-[#f5f5f4] dark:bg-zinc-950 px-3.5 py-2.5 text-sm font-mono text-[#78716c] dark:text-zinc-500 outline-none cursor-not-allowed shadow-xs"
                  value={user.email}
                  disabled
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#e8e6e5]/80 dark:border-zinc-900">
              <p className="text-xs text-[#a8a29e] dark:text-zinc-500 font-sans">
                Email is synced with your authentication provider and cannot be changed here.
              </p>
              <button
                onClick={handleSave}
                disabled={saving || name.trim() === user.name}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3ba6f1] hover:bg-[#2f9ae6] active:scale-[0.98] px-5 py-2.5 text-xs font-semibold font-mono text-white disabled:opacity-40 transition-all cursor-pointer shadow-[0_2px_12px_rgba(59,166,241,0.35)] hover:shadow-[0_4px_20px_rgba(59,166,241,0.45)] self-start sm:self-auto shrink-0"
              >
                {saving ? (
                  'Saving...'
                ) : saved ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-white" />
                    <span>Saved Changes</span>
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects List */}
        <Card className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold font-roobert text-[#0c0a09] dark:text-white tracking-tight">Active Projects</CardTitle>
                <CardDescription className="text-xs text-[#78716c] dark:text-zinc-400 font-sans">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'} under your management
                </CardDescription>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#3ba6f1] hover:underline"
              >
                <Squares2X2Icon className="w-3.5 h-3.5" />
                <span>Manage in Hub</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {projects.length === 0 ? (
              <p className="text-xs text-[#78716c] dark:text-zinc-500 py-6 text-center font-sans">
                No active projects found. Create one from the Projects Hub.
              </p>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/${project.id}`}
                  className="group flex items-center justify-between rounded-xl border border-[#e8e6e5] dark:border-zinc-800/80 bg-[#fafaf9] dark:bg-zinc-900/40 px-4 py-3.5 hover:border-[#3ba6f1]/50 dark:hover:border-zinc-700 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-[#e8e6e5] dark:border-zinc-700 flex items-center justify-center text-[#3ba6f1] group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                      <GlobeAltIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold font-roobert text-[#0c0a09] dark:text-white group-hover:text-[#3ba6f1] transition-colors truncate">
                          {project.name}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-medium">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#78716c] dark:text-zinc-500 truncate mt-0.5">
                        ID: {project.id} · {new Date(project.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-[#78716c] dark:text-zinc-400 group-hover:text-[#0c0a09] dark:group-hover:text-white transition-colors mr-1">
                      <span>Analytics</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#3ba6f1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      disabled={deletingId === project.id}
                      title="Delete project"
                      className="p-2 text-[#78716c] dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Security & Sign Out Section */}
        <Card className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80 p-6">
            <CardTitle className="text-base font-semibold font-roobert text-[#0c0a09] dark:text-white tracking-tight">Session & Security</CardTitle>
            <CardDescription className="text-xs text-[#78716c] dark:text-zinc-400 font-sans">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long', year: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-[#78716c] dark:text-zinc-400 font-sans">
              Securely sign out of your current session on this device.
            </p>
            <button
              onClick={() => signOut({ callbackUrl: '/auth' })}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 text-xs font-mono font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sign Out of Spectr</span>
            </button>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

