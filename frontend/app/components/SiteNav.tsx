'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

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
  const pathname = usePathname().replace(/\/$/, '') || '/'
  const currentPage = pathname === '/News' ? 'News' : pathname === '/AboutUs' ? 'AboutUs' : 'Home'

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
      </nav>
    </header>
  )
}
