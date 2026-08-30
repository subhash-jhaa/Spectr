import { requireAppSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import { ProjectQueries } from '@/queries'
import React from 'react'
import type { Session } from 'next-auth'

export const dynamic = 'force-dynamic'

interface ProjectDashboardPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const { projectId } = await params
  let user
  try {
    user = await requireAppSession()
  } catch {
    redirect('/auth')
  }

  // Verify project exists and belongs to the authenticated user
  const projectResult = await ProjectQueries.findById(projectId)
  if (!projectResult.success || !projectResult.data || projectResult.data.userId !== user.id) {
    redirect('/dashboard')
  }

  // Fetch all user projects for the project switcher sidebar
  const userProjectsResult = await ProjectQueries.findByUserId(user.id)
  const initialProjects = (userProjectsResult.success && userProjectsResult.data ? userProjectsResult.data : []).map(p => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
  }))

  const session = {
    user: { id: user.id, email: user.email, name: user.name, image: user.image },
    expires: '',
  }

  return (
    <DashboardClient
      session={session as unknown as Session}
      initialProjectId={projectId}
      initialProjects={initialProjects}
    />
  )
}
