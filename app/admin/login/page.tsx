'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.error || 'Невірний пароль')
      }
    } catch {
      setError('Помилка мережі')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-logo">ОЛІЙНИК</div>
        <div className="admin-login-title">Вхід до адмін-панелі</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              placeholder="Введіть пароль..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <button
            type="submit"
            className="form-submit"
            disabled={loading}
            style={{ marginTop: '.5rem' }}
          >
            {loading ? 'Вхід...' : 'Увійти →'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/" style={{ color: 'var(--text-dim)', fontSize: '.8rem', textDecoration: 'none' }}>
            ← На сайт
          </a>
        </div>
      </div>
    </div>
  )
}
