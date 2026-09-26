'use client'

import { FormEvent, useState } from 'react'
import SiteNav from '../components/SiteNav'
import AuthLink from '../components/AuthLink'

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
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
            {submitted && <p className="auth-note" role="status">The registration form is ready for the account API.</p>}
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
