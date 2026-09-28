'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav'
import { AuthSession, clearAuthSession, getAuthSession, AUTH_SESSION_KEY } from '../components/auth-session'
import { getApiErrorMessage } from '../components/api-error'

const emptyForm = {
  title: '',
  html: '',
  author: '',
  published: String(new Date().getFullYear()),
  image: '',
}

export default function AdminPanelPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState('')

  // Popup de nova página
  const [modalOpen, setModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const currentSession = getAuthSession()
    if (currentSession && currentSession.role === 'admin') {
      setSession(currentSession)
      setIsUnlocked(true)
    }
  }, [])

  // Escape fecha o popup e bloqueia o scroll do body enquanto estiver aberto
  useEffect(() => {
    if (!modalOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('modal-open')
    }
  }, [modalOpen])

  async function handleAdminLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const pin = formData.get('pin')

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Credenciais inválidas ou acesso negado.'))
      }

      const newSession = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      }

      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newSession))
      setSession(newSession)
      setIsUnlocked(true)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Erro ao processar o login.')
    }
  }

  function handleLogout() {
    clearAuthSession()
    setIsUnlocked(false)
    setSession(null)
    router.replace('/login')
  }

  function openModal() {
    setNotice('')
    setModalError('')
    setShowPreview(false)
    setForm((current) => ({ ...current, author: current.author || session?.username || '' }))
    setModalOpen(true)
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreatePage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setModalError('')
    setSaving(true)

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          html: form.html,
          author: form.author.trim(),
          published: form.published.trim(),
          image: form.image.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Não foi possível criar a página.'))
      }

      setNotice(`Página "${data.title}" criada com sucesso.`)
      setForm({ ...emptyForm, author: session?.username ?? '' })
      setModalOpen(false)
    } catch (submissionError) {
      setModalError(submissionError instanceof Error ? submissionError.message : 'Erro ao criar a página.')
    } finally {
      setSaving(false)
    }
  }

  if (!isUnlocked) {
    return (
      <div className="page">
        <SiteNav showSearch={false} />
        <main className="auth-main">
          <section className="auth-panel" aria-labelledby="admin-login-title">
            <p className="eyebrow">Restricted Area</p>
            <h1 id="admin-login-title" className="auth-title">Admin Gateway.</h1>
            <p className="auth-intro">Access requires an administrator username and a 4-digit security PIN.</p>

            <form className="auth-form" onSubmit={handleAdminLogin}>
              <label htmlFor="admin-username">Admin Username</label>
              <input id="admin-username" name="username" type="text" required />

              <label htmlFor="admin-pin">Security PIN (4 digits)</label>
              <input
                id="admin-pin"
                name="pin"
                type="password"
                pattern="\d{4}"
                maxLength={4}
                title="O PIN deve conter exatamente 4 números"
                required
              />

              <button className="auth-submit" type="submit">Unlock Panel</button>
              {error && <p className="auth-error" role="alert">{error}</p>}
            </form>
          </section>
        </main>
      </div>
    )
  }

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

        {notice && (
          <p className="page-notice" role="status">
            {notice} <Link href="/Pages">Ver em Pages</Link>
          </p>
        )}

        <section className="admin-grid" aria-label="Administrative tools">
          <article className="admin-feature admin-feature-primary">
            <p className="eyebrow">Authenticated as</p>
            <h2>{session?.username}</h2>
            <p>Administrator account with access to the restricted training features.</p>
            <dl className="profile-details admin-details">
              <div>
                <dt>Email:</dt>
                <dd>{session?.email}</dd>
              </div>
              <div>
                <dt>User ID:</dt>
                <dd>{session?.id}</dd>
              </div>
            </dl>
          </article>

          <article className="admin-feature">
            <p className="eyebrow">Next operation</p>
            <h2>Create a new page.</h2>
            <p>Write HTML, CSS and JavaScript and publish it to the Pages section.</p>
            <button className="workspace-action" type="button" onClick={openModal}>New page</button>
          </article>

          <article className="admin-feature">
            <p className="eyebrow">Training status</p>
            <h2>Environment ready.</h2>
            <p>Use fictional data only while building and testing the CTF scenario.</p>
            <Link href="/AboutUs" className="workspace-link">About CS-Lab <span aria-hidden="true"> </span></Link>
          </article>
        </section>
      </main>

      {modalOpen && (
        <div
          className="article-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            // só fecha se o clique for mesmo no fundo (evita perder texto ao selecionar)
            if (event.target === event.currentTarget) setModalOpen(false)
          }}
        >
          <section
            className="article-modal page-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-page-title"
          >
            <button className="modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close">×</button>
            <div className="modal-kicker">Admin</div>
            <h2 id="new-page-title">New page</h2>

            <form className="auth-form page-editor-form" onSubmit={handleCreatePage}>
              <label htmlFor="page-title">Title</label>
              <input
                id="page-title"
                type="text"
                maxLength={255}
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />

              <div className="page-editor-row">
                <div>
                  <label htmlFor="page-author">Author</label>
                  <input
                    id="page-author"
                    type="text"
                    maxLength={100}
                    value={form.author}
                    onChange={(e) => updateField('author', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="page-published">Published</label>
                  <input
                    id="page-published"
                    type="text"
                    maxLength={50}
                    value={form.published}
                    onChange={(e) => updateField('published', e.target.value)}
                    required
                  />
                </div>
              </div>

              <label htmlFor="page-image">Cover image URL (optional)</label>
              <input
                id="page-image"
                type="text"
                maxLength={500}
                placeholder="/articles/ctf.png"
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
              />

              <label htmlFor="page-html">Content (HTML / CSS / JS)</label>
              <textarea
                id="page-html"
                className="page-editor-textarea"
                spellCheck={false}
                rows={10}
                maxLength={200000}
                placeholder={'<style>...</style>\n<div>...</div>\n<script>...</script>'}
                value={form.html}
                onChange={(e) => updateField('html', e.target.value)}
                required
              />

              {showPreview && (
                <iframe
                  title="Page preview"
                  className="page-editor-preview"
                  srcDoc={form.html}
                  sandbox="allow-scripts"
                />
              )}

              {modalError && <p className="auth-error" role="alert">{modalError}</p>}

              <div className="page-editor-actions">
                <button className="auth-submit" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Create page'}
                </button>
                <button
                  className="workspace-action"
                  type="button"
                  onClick={() => setShowPreview((value) => !value)}
                  disabled={!form.html.trim()}
                >
                  {showPreview ? 'Hide preview' : 'Preview'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}