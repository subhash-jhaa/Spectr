import { requireAppSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ProjectsHubClient from '@/components/dashboard/projects-hub-client'
import { ProjectQueries } from '@/queries'
import React from 'react'
import type { Session } from 'next-auth'

export const dynamic = 'force-dynamic'

const Dashboard = async () => {
  let user
  try {
    user = await requireAppSession()
  } catch {
    redirect('/auth')
  }

  // Fetch projects directly from database on server
  const projectsResult = await ProjectQueries.findByUserId(user.id)
  const projects = (projectsResult.success && projectsResult.data ? projectsResult.data : []).map(p => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
  }))

  // Build a Session-compatible shape for ProjectsHubClient
  const session = {
    user: { id: user.id, email: user.email, name: user.name, image: user.image },
    expires: '',
  }

  return (
    <ProjectsHubClient
      session={session as unknown as Session}
      initialProjects={projects}
    />
  )
}

export default Dashboard
