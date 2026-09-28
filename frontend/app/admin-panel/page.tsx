'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav'
import { AuthSession, clearAuthSession, getAuthSession } from '../components/auth-session'

export default function AdminPanelPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [flag, setFlag] = useState('')
  const [flagError, setFlagError] = useState('')
  const [isRevealing, setIsRevealing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const currentSession = getAuthSession()
    if (!currentSession) {
      router.replace('/login')
      return
    }

    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${currentSession.accessToken}` },
        })

        if (response.status === 403) {
          router.replace('/dashboard')
          return
        }

        if (!response.ok) {
          clearAuthSession()
          router.replace('/login')
          return
        }

        const adminData = await response.json()
        setSession({
          id: adminData.id,
          username: adminData.username,
          email: adminData.email,
          role: adminData.role,
          accessToken: adminData.access_token,
        })
      } catch (error) {
        console.error('Erro ao carregar dados de administrador', error)
        router.replace('/login')
      }
    }
    fetchAdminData()
  }, [router])

  async function handleRevealFlag() {
    if (!session || isRevealing || flag) return
    setFlagError('')
    setIsRevealing(true)
    try {
      const response = await fetch('/api/admin/flag', {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Flag request failed')
      const data = await response.json()
      setFlag(data.flag)
    } catch {
      setFlagError('Could not reveal the flag. Please try again.')
    } finally {
      setIsRevealing(false)
    }
  }

  async function handleCopyFlag() {
    if (!flag) return
    try {
      await navigator.clipboard.writeText(flag)
    } catch {
      return
    }
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1800)
  }

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

          <article className="admin-feature admin-feature-flag">
            <p className="eyebrow">Challenge completed</p>
            <h2>Claim your flag.</h2>
            <p>You reached the admin panel. Reveal your flag to complete the challenge.</p>
            <button
              className={`workspace-action${flag ? ' workspace-action-done' : ''}`}
              type="button"
              onClick={handleRevealFlag}
              disabled={isRevealing || Boolean(flag)}
            >
              <span className="workspace-action-glow" aria-hidden="true" />
              <span className="workspace-action-label">
                {flag ? 'Flag unlocked' : isRevealing ? 'Decrypting…' : 'Reveal flag'}
              </span>
              <span className="workspace-action-icon" aria-hidden="true">{flag ? '✓' : '⚿'}</span>
            </button>
            <div className="flag-output" aria-live="polite">
              {flag && (
                <>
                  <code className="flag-value">{flag}</code>
                  <button
                    className={`flag-copy${isCopied ? ' flag-copy-done' : ''}`}
                    type="button"
                    onClick={handleCopyFlag}
                  >
                    {isCopied ? 'Copied!' : 'Copy flag'}
                  </button>
                </>
              )}
              {flagError && <p className="flag-error">{flagError}</p>}
            </div>
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
