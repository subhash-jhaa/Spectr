'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Avatar, AvatarFallback, AvatarImage,
} from '@/components/ui/avatar';
import {
  TrashIcon,
  FolderIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon
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

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Delete this project and all its data? This cannot be undone.')) return;
    setDeletingId(projectId);
    const res = await fetch(`/api/project/${projectId}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 selection:bg-[#3ba6f1]/20 dark:selection:bg-zinc-800 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back Link & Theme Toggle Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white bg-white dark:bg-zinc-950 border border-[#e8e6e5] dark:border-zinc-800 hover:border-[#3ba6f1]/50 dark:hover:border-zinc-700 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back to Projects Hub</span>
          </Link>
          <ThemeToggle />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#0c0a09] dark:text-white tracking-tight">Account & Profile</h1>
          <p className="text-xs text-[#78716c] dark:text-zinc-400 font-mono mt-1">Manage your account credentials and project associations</p>
        </div>

        {/* Profile section */}
        <Card className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md shadow-sm">
          <CardHeader className="pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80">
            <CardTitle className="text-base font-bold font-mono text-[#0c0a09] dark:text-white tracking-tight">Personal Details</CardTitle>
            <CardDescription className="text-xs font-mono text-[#78716c] dark:text-zinc-500">Your public identity on Spectr</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 border border-[#e8e6e5] dark:border-zinc-800">
                <AvatarImage src={user.image} />
                <AvatarFallback className="bg-[#f5f5f4] dark:bg-zinc-900 text-[#0c0a09] dark:text-white font-mono text-base font-bold">
                  {user.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold font-mono text-[#0c0a09] dark:text-white">{user.name || 'Anonymous User'}</p>
                <p className="text-xs font-mono text-[#78716c] dark:text-zinc-400">{user.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#78716c] dark:text-zinc-400 font-semibold">Display Name</label>
              <input
                className="w-full rounded-xl border border-[#e8e6e5] dark:border-zinc-800 bg-[#fafaf9] dark:bg-zinc-900/60 px-3 py-2 text-xs font-mono text-[#0c0a09] dark:text-white outline-none focus:border-[#3ba6f1] focus:ring-1 focus:ring-[#3ba6f1] transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#78716c] dark:text-zinc-400 font-semibold">Email Address</label>
              <input
                className="w-full rounded-xl border border-[#e8e6e5] dark:border-zinc-800/60 bg-[#f5f5f4] dark:bg-zinc-950 px-3 py-2 text-xs font-mono text-[#78716c] dark:text-zinc-500 outline-none cursor-not-allowed"
                value={user.email}
                disabled
              />
              <p className="text-[11px] font-mono text-[#a8a29e] dark:text-zinc-600">
                Email is synced with your authentication provider and cannot be modified directly.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving || name.trim() === user.name}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3ba6f1] hover:bg-[#3398e1] dark:bg-white px-4 py-2 text-xs font-bold font-mono text-white dark:text-zinc-950 disabled:opacity-40 transition cursor-pointer shadow-sm"
              >
                {saving ? (
                  'Saving...'
                ) : saved ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-white dark:text-emerald-600" />
                    Saved Changes
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Projects section */}
        <Card className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md shadow-sm">
          <CardHeader className="pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-mono text-[#0c0a09] dark:text-white tracking-tight">Active Projects</CardTitle>
                <CardDescription className="text-xs font-mono text-[#78716c] dark:text-zinc-500">
                  {projects.length} project{projects.length !== 1 ? 's' : ''} under your management
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {projects.length === 0 ? (
              <p className="text-xs font-mono text-[#78716c] dark:text-zinc-500 py-6 text-center">
                No active projects found. Create one from the Projects Hub.
              </p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-xl border border-[#e8e6e5] dark:border-zinc-800/80 bg-[#fafaf9] dark:bg-zinc-900/40 px-4 py-3 hover:border-[#3ba6f1]/40 dark:hover:border-zinc-700/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f4] dark:bg-zinc-800 flex items-center justify-center text-[#78716c] dark:text-zinc-400">
                      <FolderIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold font-mono text-[#0c0a09] dark:text-white">{project.name}</p>
                      <p className="text-[11px] font-mono text-[#78716c] dark:text-zinc-500">
                        ID: {project.id} · Created {new Date(project.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deletingId === project.id}
                    title="Delete project"
                    className="p-1.5 text-[#78716c] dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-[#f5f5f4] dark:hover:bg-zinc-800/80 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Account section */}
        <Card className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md shadow-sm">
          <CardHeader className="pb-4 border-b border-[#e8e6e5] dark:border-zinc-900/80">
            <CardTitle className="text-base font-bold font-mono text-[#0c0a09] dark:text-white tracking-tight">Session & Security</CardTitle>
            <CardDescription className="text-xs font-mono text-[#78716c] dark:text-zinc-500">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long', year: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <button
              onClick={() => signOut({ callbackUrl: '/auth' })}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-2 text-xs font-mono font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Sign Out of Spectr
            </button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
