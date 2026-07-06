import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSession, login, register, logout, getMyRequests, isDemoMode } from '../api/client'

function statusClass(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('cancel') || s.includes('reject')) return 'badge badge-danger'
  return 'badge'
}

function LoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password)
      onLoggedIn()
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {isDemoMode && (
        <div className="notice">
          <strong>Demo mode:</strong> no backend connected yet — enter any email and password
          to preview the portal.
        </div>
      )}
      <div className="form-row">
        <label htmlFor="login-email">Email Address</label>
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

function SignUpForm({ onDone }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }
    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password })
      onDone()
    } catch (err) {
      setError(err.message || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {isDemoMode && (
        <div className="notice">
          <strong>Demo mode:</strong> no backend connected yet — accounts are stored in your
          browser only.
        </div>
      )}
      <div className="form-row">
        <label htmlFor="reg-name">Full Name</label>
        <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="reg-email">Email Address</label>
        <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="reg-phone">Phone Number</label>
        <input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="reg-password">Password</label>
        <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}

function AuthPanel({ onAuthed }) {
  const [tab, setTab] = useState('login')

  return (
    <>
      <div className="tabs">
        <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
          Sign In
        </button>
        <button className={`tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>
          Create Account
        </button>
      </div>
      {tab === 'login' ? (
        <LoginForm onLoggedIn={onAuthed} />
      ) : (
        <SignUpForm onDone={onAuthed} />
      )}
    </>
  )
}

function Dashboard({ session, onLogout }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getMyRequests()
      .then((data) => { if (!cancelled) setRequests(data) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load your requests.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
          <p className="muted" style={{ marginBottom: 0 }}>{session.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/remote-programming" className="btn btn-outline">New Remote Request</Link>
          <button className="btn btn-outline" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      {isDemoMode && (
        <div className="notice">
          <strong>Demo mode:</strong> this list reads from your browser's local storage, not a
          real ERP. Set <code>VITE_API_BASE_URL</code> to your backend to pull live data from
          your ERP system.
        </div>
      )}

      {loading && <p className="muted">Loading your requests...</p>}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && requests.length === 0 && (
        <div className="card text-center">
          <p className="muted">No service requests yet.</p>
          <Link to="/booking" className="btn btn-primary">Book a Service</Link>
        </div>
      )}

      <div className="request-list">
        {requests.map((r) => (
          <div className="request-item" key={r.id}>
            <div>
              <h3 style={{ marginBottom: 4 }}>
                {r.type === 'remote-programming' ? 'Remote Programming' : 'Service Booking'} - {r.carMake} {r.carModel}
              </h3>
              <div className="request-item-meta muted">
                VIN: {r.vin || 'N/A'} · Submitted {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className={statusClass(r.status)}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Portal() {
  const [session, setSession] = useState(() => getSession())

  function handleLogout() {
    logout()
    setSession(null)
  }

  return (
    <div className="page">
      <section className="block">
        {session ? (
          <Dashboard session={session} onLogout={handleLogout} />
        ) : (
          <div className="container">
            <div className="section-head">
              <h1>Customer Portal</h1>
              <p className="muted">Track your service and remote programming requests in one place.</p>
            </div>
            <AuthPanel onAuthed={() => setSession(getSession())} />
          </div>
        )}
      </section>
    </div>
  )
}

export default Portal
