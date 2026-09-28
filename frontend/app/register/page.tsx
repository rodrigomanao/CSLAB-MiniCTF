'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteNav from '../components/SiteNav'
import AuthLink from '../components/AuthLink'
import { getApiErrorMessage } from '../components/api-error'
import { AUTH_SESSION_KEY } from '../components/auth-session'

export default function RegisterPage() {
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'Registration failed.'))
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      }))
      router.push(data.role === 'admin' ? '/admin-interface' : '/dashboard')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Registration failed.')
    }
  }

  return (
    <div className="page">
      <SiteNav showSearch={false} />
      <main className="auth-main">
        <section className="auth-panel" aria-labelledby="register-title">
          <p className="eyebrow">New laboratory account</p>
          <h1 id="register-title" className="auth-title">Create your account.</h1>
          <p className="auth-intro">Register to save your place in the CS-Lab training environment.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="register-username">Username</label>
            <input id="register-username" name="username" type="text" autoComplete="username" required />

            <label htmlFor="register-email">Email</label>
            <input id="register-email" name="email" type="email" autoComplete="email" required />

            <label htmlFor="register-password">Password</label>
            <input id="register-password" name="password" type="password" autoComplete="new-password" required />

            <button className="auth-submit" type="submit">Register</button>
            {message && <p className="auth-note" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </form>

          <div className="auth-switch">
            <span>Already have an account?</span>
            <AuthLink href="/login">Login</AuthLink>
          </div>
        </section>
      </main>
    </div>
  )
}
