import { requireAppSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ProjectsHubClient from '@/components/dashboard/projects-hub-client'
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

  // Build a Session-compatible shape for ProjectsHubClient
  const session = {
    user: { id: user.id, email: user.email, name: user.name, image: user.image },
    expires: '',
  }

  return <ProjectsHubClient session={session as unknown as Session} />
}

export default Dashboard
