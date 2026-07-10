import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/admin')
  }

  return (
    <div className="wrap" style={{ padding: '80px 28px', maxWidth: 400 }}>
      <h1 style={{ fontSize: '1.6rem', fontStyle: 'italic', marginBottom: 24 }}>Admin sign in</h1>
      <form onSubmit={handleSubmit}>
        <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <label className="eyebrow" style={{ display: 'block', margin: '16px 0 6px' }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <p className="eyebrow" style={{ color: 'var(--lacquer)', marginTop: 12 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ marginTop: 20 }}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--paper-dim)',
  borderRadius: 4,
  fontSize: '1rem',
}
