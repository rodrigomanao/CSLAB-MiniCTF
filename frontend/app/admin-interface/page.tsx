'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav'
import { AuthSession, clearAuthSession, getAuthSession, AUTH_SESSION_KEY } from '../components/auth-session'
import { getApiErrorMessage } from '../components/api-error'

export default function AdminPanelPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  
  // Estado para controlar se o painel está desbloqueado
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Se o utilizador já tiver uma sessão válida de admin guardada, entra direto
    const currentSession = getAuthSession()
    if (currentSession && currentSession.role === 'admin') {
      setSession(currentSession)
      setIsUnlocked(true)
    }
  }, [])

  async function handleAdminLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = event.currentTarget
    const formData = new FormData(form)

    const username = formData.get('username')
    const pin = formData.get('pin')

    try {
      // Chama o NOVO endpoint focado neste desafio de PIN e verificação de Role
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Credenciais inválidas ou acesso negado.'))
      }

      // Se o backend validou o PIN e o Role, guardamos a sessão e desbloqueamos a página
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

  // Ecrã de Autenticação do Admin (Brute Force Target)
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
              <input 
                id="admin-username" 
                name="username" 
                type="text" 
                required 
              />

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

  // Painel de Administração Real (após brute force bem-sucedido)
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
            <p>This area will connect to the controlled page-creation challenge.</p>
            <button className="workspace-action" type="button" disabled>Open page editor</button>
          </article>
          
          <article className="admin-feature">
            <p className="eyebrow">Training status</p>
            <h2>Environment ready.</h2>
            <p>Use fictional data only while building and testing the CTF scenario.</p>
            <Link href="/AboutUs" className="workspace-link">About CS-Lab <span aria-hidden="true"> </span></Link>
          </article>
        </section>
      </main>
    </div>
  )
}