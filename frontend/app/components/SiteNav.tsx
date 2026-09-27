'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthSession, AUTH_SESSION_KEY, clearAuthSession } from './auth-session'

function SearchIcon() {
  return (
    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function SiteNav({ search, onSearch, onSearchSubmit, showSearch = true, showLogo = true }: {
  search?: string
  onSearch?: (value: string) => void
  onSearchSubmit?: (value: string) => void
  showSearch?: boolean
  showLogo?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname().replace(/\/$/, '') || '/'
  const currentPage = pathname === '/News' ? 'News' : pathname === '/AboutUs' ? 'AboutUs' : pathname === '/login' ? 'Login' : pathname === '/dashboard' ? 'Dashboard' : pathname === '/admin-panel' ? 'Admin' : 'Home'
  const [session, setSession] = useState<AuthSession | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    const readSession = () => {
      const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY)
      if (!rawSession) {
        setSession(null)
        return
      }

      try {
        setSession(JSON.parse(rawSession) as AuthSession)
      } catch {
        clearAuthSession()
        setSession(null)
      }
    }

    readSession()
    window.addEventListener('storage', readSession)
    return () => window.removeEventListener('storage', readSession)
  }, [])

  function handleLogout() {
    clearAuthSession()
    setSession(null)
    setAccountOpen(false)
    router.push('/Home')
  }

  return (
    <header className={`navbar${showSearch ? '' : ' navbar-without-search'}${showLogo ? '' : ' navbar-without-logo'}`}>
      {showLogo && (
        <Link className="logo" href="/Home" aria-label="CISUC Cybersecurity Transversal Laboratory home">
          <img className="logo-image" src="/logos/cisuc.png" alt="CISUC Cybersecurity Transversal Laboratory" />
        </Link>
      )}
      {showSearch && (
        <form className="search" onSubmit={(event) => {
          event.preventDefault()
          onSearchSubmit?.(search?.trim() ?? '')
        }}>
          <SearchIcon />
          <span className="sr-only">Search news</span>
          <input value={search ?? ''} onChange={(event) => onSearch?.(event.target.value)} type="search" placeholder="search..." />
        </form>
      )}
      <nav className="nav-links" aria-label="Main navigation">
        <Link href="/Home" className={currentPage === 'Home' ? 'active' : undefined}>Home</Link>
        <Link href="/News" className={currentPage === 'News' ? 'active' : undefined}>News</Link>
        <Link href="/AboutUs" className={currentPage === 'AboutUs' ? 'active' : undefined}>About us</Link>
        {session ? (
          <div className="account-menu">
            <button
              className="account-trigger"
              type="button"
              aria-expanded={accountOpen}
              aria-controls="account-menu-panel"
              onClick={() => setAccountOpen((isOpen) => !isOpen)}
            >
              {session.username}
              <span className={`account-chevron${accountOpen ? ' account-chevron-open' : ''}`} aria-hidden="true" />
            </button>
            {accountOpen && (
              <div className="account-menu-panel" id="account-menu-panel">
                <span className="account-role">{session.role}</span>
                <button className="account-logout" type="button" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className={`login-link${currentPage === 'Login' ? ' active' : ''}`}>Login</Link>
        )}
      </nav>
    </header>
  )
}
