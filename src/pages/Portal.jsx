import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSession, login, register, logout, getMyRequests, getQuotation, respondToQuotation, isDemoMode } from '../api/client'
import { STATUS_PIPELINE } from '../carBrands'

function StatusTimeline({ currentStatus }) {
  const pipeline = STATUS_PIPELINE.filter((s) => s !== 'Cancelled')
  const currentIdx = pipeline.indexOf(currentStatus)
  const isCancelled = currentStatus === 'Cancelled'

  if (isCancelled) {
    return (
      <div className="status-timeline">
        <div className="timeline-step cancelled">
          <div className="timeline-dot" />
          <span className="timeline-label">Cancelled</span>
        </div>
      </div>
    )
  }

  return (
    <div className="status-timeline">
      {pipeline.map((step, i) => {
        let state = 'upcoming'
        if (i < currentIdx) state = 'done'
        else if (i === currentIdx) state = 'current'
        return (
          <div key={step} className={`timeline-step ${state}`}>
            <div className="timeline-dot">
              {state === 'done' && (
                <svg viewBox="0 0 16 16" width="10" height="10"><path d="M3 8l3 3 7-7" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </div>
            {i < pipeline.length - 1 && <div className="timeline-line" />}
            <span className="timeline-label">{step}</span>
          </div>
        )
      })}
    </div>
  )
}

function QuotationCard({ requestId }) {
  const [quotation, setQuotation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    getQuotation(requestId)
      .then(setQuotation)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [requestId])

  if (loading || !quotation) return null

  async function handleRespond(action) {
    setResponding(true)
    try {
      await respondToQuotation(requestId, action)
      setQuotation((q) => ({ ...q, status: action, respondedAt: new Date().toISOString() }))
    } catch {
    } finally {
      setResponding(false)
    }
  }

  const isDetailed = quotation.mode === 'detailed'
  const isPending = quotation.status === 'pending'

  return (
    <div className="quotation-card">
      <div className="quotation-header">
        <h4>Quotation</h4>
        <span className={`badge ${quotation.status === 'approved' ? '' : quotation.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
          {quotation.status === 'pending' ? 'Awaiting Response' : quotation.status === 'approved' ? 'Approved' : 'Rejected'}
        </span>
      </div>

      {isDetailed ? (
        <>
          <table className="quotation-table">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              {(quotation.items || []).map((item, i) => (
                <tr key={i}>
                  <td>{item.description}</td>
                  <td>{item.qty}</td>
                  <td>{item.price} JOD</td>
                  <td>{(item.qty * item.price).toFixed(2)} JOD</td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotation.laborCost > 0 && (
            <div className="quotation-line">
              <span>Labor</span><span>{quotation.laborCost} JOD</span>
            </div>
          )}
          {quotation.taxPercent > 0 && (
            <div className="quotation-line">
              <span>Tax ({quotation.taxPercent}%)</span>
              <span>{((quotation.subtotal || 0) * quotation.taxPercent / 100).toFixed(2)} JOD</span>
            </div>
          )}
          <div className="quotation-line quotation-total">
            <span>Total</span><span>{quotation.total} JOD</span>
          </div>
        </>
      ) : (
        <>
          <div className="quotation-line quotation-total">
            <span>Total</span><span>{quotation.total} JOD</span>
          </div>
          {quotation.description && <p className="muted" style={{ marginTop: 8 }}>{quotation.description}</p>}
        </>
      )}

      {quotation.estimatedTime && (
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
          Estimated time: {quotation.estimatedTime}
        </p>
      )}

      {isPending && (
        <div className="quotation-actions">
          <button className="btn btn-primary" disabled={responding} onClick={() => handleRespond('approved')}>
            {responding ? '...' : 'Approve'}
          </button>
          <button className="btn btn-outline btn-danger-outline" disabled={responding} onClick={() => handleRespond('rejected')}>
            {responding ? '...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  )
}

function RequestDetail({ request, onBack }) {
  return (
    <div className="request-detail">
      <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: 20 }}>
        Back to Requests
      </button>
      <div className="request-detail-header">
        <div>
          <h2 style={{ marginBottom: 4 }}>
            {request.type === 'remote-programming' ? 'Remote Programming' : 'Service Booking'}
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            {request.carMake} {request.carModel} {request.carYear && `(${request.carYear})`}
          </p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            VIN: {request.vin || 'N/A'} · Submitted {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Service Progress</h3>
        <StatusTimeline currentStatus={request.status} />
      </div>

      <QuotationCard requestId={request.id} />

      {request.notes && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8 }}>Notes</h4>
          <p className="muted">{request.notes}</p>
        </div>
      )}
    </div>
  )
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
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false
    getMyRequests()
      .then((data) => { if (!cancelled) setRequests(data) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load your requests.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (selected) {
    return (
      <div className="container" style={{ maxWidth: 800 }}>
        <RequestDetail request={selected} onBack={() => setSelected(null)} />
      </div>
    )
  }

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
          <button
            className="request-item request-item-btn"
            key={r.id}
            onClick={() => setSelected(r)}
          >
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ marginBottom: 4 }}>
                {r.type === 'remote-programming' ? 'Remote Programming' : 'Service Booking'} — {r.carMake} {r.carModel}
              </h3>
              <div className="request-item-meta muted">
                VIN: {r.vin || 'N/A'} · Submitted {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className={`badge ${r.status === 'Cancelled' ? 'badge-danger' : ''}`}>{r.status}</span>
          </button>
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
