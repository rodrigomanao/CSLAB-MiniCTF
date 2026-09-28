'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteNav from '../components/SiteNav'
import AuthLink from '../components/AuthLink'
import { saveAuthSession } from '../components/auth-session'
import { getApiErrorMessage } from '../components/api-error'

export default function LoginPage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: formData.get('identity'),
          password: formData.get('password'),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'Login failed.'))
      saveAuthSession({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        accessToken: data.access_token,
      })
      form.reset()
      router.push(data.role === 'admin' ? '/admin-panel' : '/dashboard')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Login failed.')
    }
  }

  return (
    <div className="page">
      <SiteNav showSearch={false} />
      <main className="auth-main">
        <section className="auth-panel" aria-labelledby="login-title">
          <p className="eyebrow">CS-Lab access</p>
          <h1 id="login-title" className="auth-title">Welcome back.</h1>
          <p className="auth-intro">Sign in to access your laboratory account and continue your work.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="login-identity">Username or email</label>
            <input id="login-identity" name="identity" type="text" autoComplete="username" required />

            <label htmlFor="login-password">Password</label>
            <input id="login-password" name="password" type="password" autoComplete="current-password" required />

            <button className="auth-submit" type="submit">Login</button>
            {message && <p className="auth-note" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </form>

          <div className="auth-switch">
            <span>Don't have an account?</span>
            <AuthLink href="/register">Register</AuthLink>
          </div>
        </section>
      </main>
    </div>
  )
}
