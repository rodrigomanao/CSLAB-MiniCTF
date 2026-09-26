'use client'

import { useEffect, useState } from 'react'

export type Article = {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  coverUrl?: string
  authorPhotoUrl?: string
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

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ArticleCard({ article }: { article: Article }) {
  const [isOpen, setIsOpen] = useState(false)

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
      <article className="article-card">
      <div className="article-cover">
        {article.coverUrl ? <img src={article.coverUrl} alt="" /> : <PhotoPlaceholderIcon />}
      </div>
      <div className="article-body">
        <div className="article-meta">
          <div className="author">
            {article.authorPhotoUrl ? <img className="avatar" src={article.authorPhotoUrl} alt="" /> : <div className="avatar" />}
            <span className="author-name">{article.author}</span>
          </div>
          <span className="article-date">{article.date}</span>
        </div>
        <h2 className="article-title">{article.title}</h2>
        <p className="article-excerpt">{article.excerpt}</p>
        <button className="read-more" type="button" onClick={() => setIsOpen(true)}>
          <span>Read More</span><ChevronRightIcon />
        </button>
      </div>
      </article>
      {isOpen && (
        <div className="article-modal-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="article-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${article.id}-title`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close article">×</button>
            <div className="modal-kicker">Article</div>
            <h2 id={`${article.id}-title`}>{article.title}</h2>
            <div className="modal-meta">
              <span>{article.author}</span>
              <span>{article.date}</span>
            </div>
            <p>{article.excerpt}</p>
          </section>
        </div>
      )}
    </>
  )
}
