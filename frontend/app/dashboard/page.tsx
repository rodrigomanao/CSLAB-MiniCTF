'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav'
import { AuthSession, clearAuthSession, getAuthSession } from '../components/auth-session'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    const currentSession = getAuthSession()
    if (!currentSession) {
      router.replace('/login')
      return
    }
    if (currentSession.role === 'admin') {
      router.replace('/admin-panel')
      return
    }
    
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user?id=${currentSession.id}`, {
          headers: { Authorization: `Bearer ${currentSession.accessToken}` },
        })

        if (!response.ok) {
          router.replace('/login')
          return
        }

        const userData = await response.json()
        setSession({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          accessToken: userData.access_token,
        })
      } catch (error) {
        console.error('Erro ao carregar dados do utilizador', error)
      }
    }
    fetchUserData()
  }, [router])

  function handleLogout() {
    clearAuthSession()
    router.replace('/login')
  }

  if (!session) return null

  return (
    <div className="page">
      <SiteNav showSearch={false} />
      <main className="workspace-main">
        <section className="workspace-heading">
          <div>
            <p className="eyebrow">User dashboard</p>
            <h1 className="workspace-title">Your laboratory profile.</h1>
            <p className="workspace-intro">A private space for your CS-Lab training account.</p>
          </div>
          <button className="workspace-logout" type="button" onClick={handleLogout}>Log out</button>
        </section>

        <section className="profile-card" aria-labelledby="profile-title">
          <div className="profile-card-heading">
            <p className="eyebrow">Account details</p>
            <span className="role-badge">{session.role}</span>
          </div>
          <h2 id="profile-title">Welcome, {session.username}.</h2>
          <dl className="profile-details">
            <div>
              <dt>Username:</dt>
              <dd>{session.username}</dd>
            </div>
            <div>
              <dt>Email:</dt>
              <dd>{session.email}</dd>
            </div>
            <div>
              <dt>Account ID:</dt>
              <dd>{session.id}</dd>
            </div>
          </dl>
        </section>

        <section className="workspace-links" aria-label="Training links">
          <div>
            <p className="eyebrow">Continue exploring</p>
            <h2>Read the latest CS-Lab work.</h2>
          </div>
          <Link href="/News" className="workspace-link">Open News <span aria-hidden="true">↗</span></Link>
        </section>
      </main>
    </div>
  )
}
