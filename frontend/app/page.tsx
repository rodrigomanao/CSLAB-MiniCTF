'use client'

import { useEffect, useMemo, useState } from 'react'

type Article = {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  coverUrl?: string
}

const defaultArticles: Article[] = Array.from({ length: 6 }, (_, index) => ({
  id: `article-${index + 1}`,
  title: "CTF Shift APPens'26",
  excerpt: 'CSLab (Cybersecurity Lab) is excited to announce a Capture The Flag (CTF) challenge for the DEI community. This event is designed to spark interest in cybersecurity, stimulate logical reasoning and provide a hands-on experience in a dynamic and collaborative environment.',
  author: 'João R. Campos',
  date: 'May, 2026',
}))

type ApiPost = {
  id: number
  title: string
  excerpt: string
  author: string
  published: string
}

function PhotoPlaceholderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" />
      <path d="M4 17l5-5 3 3 4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NavBar({ search, onSearch }: { search: string; onSearch: (value: string) => void }) {
  return (
    <header className="navbar">
      <a className="logo" href="/" aria-label="CISUC Cybersecurity Transversal Laboratory home">
        <span className="logo-mark" aria-hidden="true"><span /><span /><span /><span /></span>
        <span>CISUC<span className="logo-subtitle">CYBERSECURITY TRANSVERSAL LABORATORY</span></span>
      </a>
      <label className="search">
        <SearchIcon />
        <span className="sr-only">Search recent news</span>
        <input value={search} onChange={(event) => onSearch(event.target.value)} type="search" placeholder="search..." />
      </label>
      <nav className="nav-links" aria-label="Main navigation">
        <a href="#top" className="active">Home</a>
        <a href="#recent">Pages</a>
        <a href="#recent">Recent</a>
      </nav>
    </header>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="article-card">
      {article.coverUrl ? <div className="article-cover" style={{ backgroundImage: `url(${article.coverUrl})` }} /> : <div className="article-cover"><PhotoPlaceholderIcon /></div>}
      <div className="article-body">
        <div className="article-meta">
          <div className="author"><div className="avatar" /><span className="author-name">{article.author}</span></div>
          <span className="article-date">{article.date}</span>
        </div>
        <h2 className="article-title">{article.title}</h2>
        <p className="article-excerpt">{article.excerpt}</p>
        <button className="read-more" type="button" onClick={() => window.location.hash = article.id}>
          <span>Read More</span><ChevronRightIcon />
        </button>
      </div>
    </article>
  )
}

export default function RecentNewsPage() {
  const [articles, setArticles] = useState<Article[]>(defaultArticles)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/posts')
      .then((response) => response.ok ? response.json() as Promise<ApiPost[]> : Promise.reject())
      .then((posts) => setArticles(posts.map((post) => ({ id: `article-${post.id}`, title: post.title, excerpt: post.excerpt, author: post.author, date: post.published }))))
      .catch(() => undefined)
  }, [])

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? articles.filter((article) => `${article.title} ${article.excerpt} ${article.author}`.toLowerCase().includes(query)) : articles
  }, [articles, search])

  return (
    <div className="page" id="top">
      <NavBar search={search} onSearch={setSearch} />
      <main className="main" id="recent">
        <h1 className="page-title">Recent News</h1>
        <div className="article-grid">
          {filteredArticles.length ? filteredArticles.map((article) => <ArticleCard key={article.id} article={article} />) : <p className="empty-state">No articles match “{search}”.</p>}
        </div>
      </main>
      <div className="scroll-indicator" aria-hidden="true"><div className="scroll-track"><div className="scroll-thumb" /></div></div>
    </div>
  )
}
