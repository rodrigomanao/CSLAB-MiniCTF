'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import ArticleCard, { type Article } from '../components/ArticleCard'
import SiteNav from '../components/SiteNav'

const defaultArticles: Article[] = [
  {
    id: 'article-1',
    title: "CTF Shift APPens'26",
    excerpt: "CSLab hosted the CTF Shift APPens'26 challenge for the DEI community. The event encouraged interest in cybersecurity, strengthened logical reasoning, and offered participants a hands-on experience in a dynamic and collaborative environment.",
    author: 'João R. Campos',
    date: 'May, 2026',
    coverUrl: '/articles/ctf.png',
    authorPhotoUrl: '/articles/authors/Jcampos.png',
  },
  {
    id: 'article-2',
    title: 'CTF Trial Challenge for ShiftAppens',
    excerpt: 'We hosted a Capture The Flag (CTF) Trial Challenge as a warm-up event for the main competition at ShiftAppens. The challenge helped us test the resilience and security of the infrastructure. Although it featured fewer challenges than the main event, it still gave participants an opportunity to practise their hacking skills in a controlled environment.',
    author: 'João R. Campos',
    date: '2025',
    coverUrl: '/articles/trialshift25.png',
    authorPhotoUrl: '/articles/authors/Jcampos.png',
  },
  {
    id: 'article-3',
    title: "CTF Shift APPens'25",
    excerpt: 'As part of our training and event initiatives, we organized a CTF competition at ShiftAppens, a 48-hour programming and entrepreneurship event where teams collaborated on innovative technology projects. The competition challenged participants with cybersecurity scenarios that strengthened their ethical hacking, vulnerability analysis, and security problem-solving skills. It included challenges for beginners and experienced participants, as well as a dedicated training environment with guided challenges and step-by-step tutorials.',
    author: 'João R. Campos',
    date: '2025',
    coverUrl: '/articles/shiftappens25.png',
    authorPhotoUrl: '/articles/authors/Jcampos.png',
  },
]

type ApiPost = {
  id: number
  title: string
  excerpt: string
  author: string
  published: string
  image: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>(defaultArticles)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get('query') ?? '')
  }, [])

  useEffect(() => {
    fetch('/api/posts')
      .then((response) => response.ok ? response.json() as Promise<ApiPost[]> : Promise.reject())
      .then((posts) => setArticles(posts.map((post) => ({
        id: `article-${post.id}`,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        date: post.published,
        coverUrl: post.image,
        authorPhotoUrl: '/articles/authors/Jcampos.png',
      }))))
      .catch(() => undefined)
  }, [])

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? articles.filter((article) => `${article.title} ${article.excerpt} ${article.author}`.toLowerCase().includes(query)) : articles
  }, [articles, search])

  return (
    <div className="page">
      <SiteNav
        search={search}
        onSearch={setSearch}
        onSearchSubmit={(query) => router.push(query ? `/News?query=${encodeURIComponent(query)}` : '/News')}
      />
      <main className="main">
        <h1 className="page-title">News</h1>
        <div className="article-grid article-grid-news">
          {filteredArticles.length ? filteredArticles.map((article) => <ArticleCard key={article.id} article={article} />) : <p className="empty-state">No articles match “{search}”.</p>}
        </div>
      </main>
    </div>
  )
}
