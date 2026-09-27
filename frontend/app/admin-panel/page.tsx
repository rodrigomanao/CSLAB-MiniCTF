'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav'
import { AuthSession, clearAuthSession, getAuthSession } from '../components/auth-session'

export default function AdminPanelPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    const currentSession = getAuthSession()
    if (!currentSession) {
      router.replace('/login')
      return
    }
    if (currentSession.role !== 'admin') {
      router.replace('/dashboard')
      return
    }
    setSession(currentSession)
  }, [router])

  function handleLogout() {
    clearAuthSession()
    router.replace('/login')
  }

  if (!session) return null

  return (
    <div className="page">
      <SiteNav showSearch={false} />
      <main className="workspace-main admin-main">
        <section className="workspace-heading">
          <div>
            <p className="eyebrow">Restricted workspace</p>
            <h1 className="workspace-title">Admin panel.</h1>
            <p className="workspace-intro">Manage the controlled CS-Lab training environment.</p>
          </div>
          <button className="workspace-logout" type="button" onClick={handleLogout}>Log out</button>
        </section>

        <section className="admin-grid" aria-label="Administrative tools">
          <article className="admin-feature admin-feature-primary">
            <p className="eyebrow">Authenticated as</p>
            <h2>{session.username}</h2>
            <p>Administrator account with access to the restricted training features.</p>
            <dl className="profile-details admin-details">
              <div>
                <dt>Email:</dt>
                <dd>{session.email}</dd>
              </div>
              <div>
                <dt>User ID:</dt>
                <dd>{session.id}</dd>
              </div>
            </dl>
          </article>

          <article className="admin-feature">
            <p className="eyebrow">Next operation</p>
            <h2>Create a new page.</h2>
            <p>This area will connect to the controlled page-creation challenge.</p>
            <button className="workspace-action" type="button" disabled>Open page editor</button>
          </article>

          <article className="admin-feature">
            <p className="eyebrow">Training status</p>
            <h2>Environment ready.</h2>
            <p>Use fictional data only while building and testing the CTF scenario.</p>
            <Link href="/AboutUs" className="workspace-link">About CS-Lab <span aria-hidden="true">↗</span></Link>
          </article>
        </section>
      </main>
    </div>
  )
}
