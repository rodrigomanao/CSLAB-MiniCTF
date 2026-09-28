'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type PageItem = {
  id: string
  title: string
  html: string // HTML/CSS/JS bruto
  author: string
  date: string
  coverUrl?: string
}

/* ---------- Injeção de HTML com execução de scripts ---------- */

function RawHtml({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    root.innerHTML = html

    // innerHTML não executa <script>, por isso recriamos cada um
    root.querySelectorAll('script').forEach((old) => {
      const script = document.createElement('script')
      Array.from(old.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value))
      script.textContent = old.textContent
      old.replaceWith(script)
    })

    return () => {
      root.innerHTML = ''
    }
  }, [html])

  return <div ref={ref} className={className} />
}

/* ---------- Ícones ---------- */

function CodeIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------- Pré-visualização em texto simples (SSR-safe) ---------- */

function toPreview(html: string, max = 180) {
  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

/* ---------- Card ---------- */

export default function PageCard({ page, isolated = false }: { page: PageItem; isolated?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const preview = useMemo(() => toPreview(page.html), [page.html])

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  return (
    <>
      <article className="page-card">
        <div className="page-card-cover">
          {page.coverUrl ? <img src={page.coverUrl} alt="" /> : <CodeIcon />}
          <span className="page-card-badge">Page</span>
        </div>

        <div className="page-card-body">
          <h2 className="page-card-title">{page.title}</h2>
          <p className="page-card-preview">{preview || 'Sem pré-visualização.'}</p>

          <div className="page-card-footer">
            <div className="page-card-meta">
              <span className="page-card-author">{page.author}</span>
              <span className="page-card-date">{page.date}</span>
            </div>
            <button className="page-card-open" type="button" onClick={() => setIsOpen(true)}>
              Open <ArrowIcon />
            </button>
          </div>
        </div>
      </article>

      {isOpen && (
        <div className="page-modal-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="page-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${page.id}-title`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="page-modal-header">
              <div>
                <h2 id={`${page.id}-title`}>{page.title}</h2>
                <span className="page-modal-meta">{page.author} · {page.date}</span>
              </div>
              <button className="page-modal-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close page">×</button>
            </header>

            <div className="page-modal-content">
              {isolated ? (
                <iframe title={page.title} srcDoc={page.html} sandbox="allow-scripts" className="page-modal-frame" />
              ) : (
                <RawHtml html={page.html} />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}