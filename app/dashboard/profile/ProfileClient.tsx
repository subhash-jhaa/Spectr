'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/components/ui/card';
import {
  Avatar, AvatarFallback, AvatarImage,
} from '@/components/components/ui/avatar';
import { TrashIcon, FolderIcon, LogOutIcon } from 'lucide-react';

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
  const [name, setName] = useState(user.name);
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
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">

      {/* Back */}
      <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </a>

      <h1 className="text-xl font-semibold">Profile</h1>

      {/* Profile section */}
      <Card className="dark:bg-transparent">
        <CardHeader>
          <CardTitle className="text-base">Your profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.image} />
              <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Display name</label>
            <input
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed"
              value={user.email}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email is managed by Google and cannot be changed here.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || name.trim() === user.name}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </CardContent>
      </Card>

      {/* Projects section */}
      <Card className="dark:bg-transparent">
        <CardHeader>
          <CardTitle className="text-base">Your projects</CardTitle>
          <CardDescription>
            {projects.length} project{projects.length !== 1 ? 's' : ''} tracked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No projects yet. Create one from the dashboard.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FolderIcon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(project.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  disabled={deletingId === project.id}
                  className="rounded-md p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Account section */}
      <Card className="dark:bg-transparent">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>
            Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'long', year: 'numeric',
            })}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => signOut({ callbackUrl: '/auth' })}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOutIcon className="size-4" />
            Sign out
          </button>
        </CardContent>
      </Card>

    </div>
  );
}
