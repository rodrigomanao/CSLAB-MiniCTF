'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageCard, { type PageItem } from './PageCard'
import SiteNav from '../components/SiteNav'

type ApiPage = {
  id: number
  title: string
  excerpt: string // HTML bruto (coluna "html" na BD)
  author: string
  published: string
  image: string
}

type Status = 'loading' | 'ready' | 'error'

export default function PagesPage() {
  const [pages, setPages] = useState<PageItem[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get('query') ?? '')
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/pages', { cache: 'no-store', signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<ApiPage[]>) : Promise.reject(new Error(String(response.status)))))
      .then((data) => {
        setPages(
          data.map((page) => ({
            id: `page-${page.id}`,
            title: page.title,
            html: page.excerpt,
            author: page.author,
            date: page.published,
            coverUrl: page.image || undefined,
          }))
        )
        setStatus('ready')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        console.error('Failed to load pages:', error)
        setStatus('error')
      })

    return () => controller.abort()
  }, [])

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query
      ? pages.filter((page) => `${page.title} ${page.html} ${page.author}`.toLowerCase().includes(query))
      : pages
  }, [pages, search])

  return (
    <div className="page">
      <SiteNav
        search={search}
        onSearch={setSearch}
        onSearchSubmit={(query) => router.push(query ? `/Pages?query=${encodeURIComponent(query)}` : '/Pages')}
      />
      <main className="main">
        <h1 className="page-title">Pages</h1>

        {status === 'loading' && <p className="empty-state">Loading pages…</p>}
        {status === 'error' && <p className="empty-state">Could not load pages. Try again later.</p>}

        {status === 'ready' && (
          <div className="article-grid article-grid-news">
            {filteredPages.length ? (
              filteredPages.map((page) => <PageCard key={page.id} page={page} />)
            ) : (
              <p className="empty-state">
                {search.trim() ? <>No pages match “{search}”.</> : 'No pages yet.'}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}