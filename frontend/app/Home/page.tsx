'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ArticleCard, { type Article } from '../components/ArticleCard'
import SiteNav from '../components/SiteNav'

const featuredArticles: Article[] = [
  {
    id: 'article-1',
    title: "CTF Shift APPens'26",
    excerpt: 'A Capture The Flag challenge hosted by CS-Lab for the DEI community, designed to build cybersecurity skills through a practical and collaborative experience.',
    author: 'João R. Campos',
    date: 'May, 2026',
    coverUrl: '/articles/ctf.png',
    authorPhotoUrl: '/articles/authors/Jcampos.png',
  },
  {
    id: 'article-3',
    title: "CTF Shift APPens'25",
    excerpt: 'A competition featuring cybersecurity scenarios, guided training, and challenges for beginners and experienced participants.',
    author: 'João R. Campos',
    date: 'May, 2026',
    coverUrl: '/articles/shiftappens25.png',
    authorPhotoUrl: '/articles/authors/Jcampos.png',
  },
]

export default function HomePage() {
  const [articles, setArticles] = useState(featuredArticles)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/posts')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((posts: Array<{ id: number; title: string; excerpt: string; author: string; published: string; image: string }>) => {
        setArticles(posts.filter((post) => post.id === 1 || post.id === 3).map((post) => ({
          id: `article-${post.id}`,
          title: post.title,
          excerpt: post.excerpt,
          author: post.author,
          date: post.published,
          coverUrl: post.image,
          authorPhotoUrl: '/articles/authors/Jcampos.png',
        })))
      })
      .catch(() => undefined)
  }, [])

  return (
    <div className="page">
      <SiteNav
        search={search}
        onSearch={setSearch}
        onSearchSubmit={(query) => router.push(query ? `/News?query=${encodeURIComponent(query)}` : '/News')}
      />
      <main className="main home-main">
        <section className="home-events" aria-labelledby="events-title">
          <p className="eyebrow">CS-Lab calendar</p>
          <h1 id="events-title" className="home-title">Upcoming events</h1>
          <div className="event-item">
            <span className="event-date">2026</span>
            <div>
              <h2>Mini-CTF Challenge</h2>
              <p>A hands-on experience in cybersecurity, logic, and collaboration.</p>
            </div>
          </div>
        </section>
        <section className="home-news" aria-labelledby="featured-title">
          <div className="section-heading">
            <p className="eyebrow">From the laboratory</p>
            <h2 id="featured-title" className="home-title">Latest news</h2>
          </div>
          <div className="home-article-list">
            {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>
        </section>
      </main>
    </div>
  )
}
