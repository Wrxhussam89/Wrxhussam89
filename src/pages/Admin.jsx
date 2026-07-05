import { useEffect, useState } from 'react'
import {
  getAdminSession, adminLogin, adminLogout,
  getAllRequests, updateRequestStatus, isDemoMode,
} from '../api/client'

const STATUSES = ['Received', 'In Progress', 'Completed', 'Cancelled']

function AdminLogin({ onIn }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!code.trim()) { setError('Enter the access code.'); return }
    setLoading(true)
    try {
      await adminLogin(code.trim())
      onIn()
    } catch (err) {
      setError(err.message || 'Access denied.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="section-head">
        <h1>Staff Dashboard</h1>
        <p className="muted">Enter the access code to view all service requests.</p>
      </div>
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {isDemoMode && (
          <div className="notice">
            <strong>Demo mode:</strong> the default access code is <code>evmaster-admin</code>.
          </div>
        )}
        <div className="form-row">
          <label htmlFor="admin-code">Access Code</label>
          <input id="admin-code" type="password" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Verifying...' : 'Enter'}
        </button>
      </form>
    </div>
  )
}

function AdminDashboard({ onOut }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getAllRequests()
      .then((data) => { if (!cancelled) setRequests(data) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load requests.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const newCount = requests.filter((r) => r.status === 'Received').length

  async function handleStatusChange(id, status) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    try {
      await updateRequestStatus(id, status)
    } catch {
      const fresh = await getAllRequests()
      setRequests(fresh)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ marginBottom: 0 }}>All Requests</h2>
          {newCount > 0 && <span className="badge">{newCount} new</span>}
        </div>
        <button className="btn btn-outline" onClick={onOut}>Sign Out</button>
      </div>

      {isDemoMode && (
        <div className="notice">
          <strong>Demo mode:</strong> showing requests from this browser's local storage.
          Real-time push notifications to your phone require the backend — this badge count is
          the client-side equivalent.
        </div>
      )}

      {loading && <p className="muted">Loading requests...</p>}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && requests.length === 0 && (
        <div className="card text-center">
          <p className="muted">No requests yet.</p>
        </div>
      )}

      <div className="request-list">
        {requests.map((r) => (
          <div className="request-item" key={r.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ marginBottom: 0 }}>
                {r.type === 'remote-programming' ? 'Remote Programming' : 'Service Booking'} — {r.carMake} {r.carModel}
              </h3>
              <select
                value={r.status}
                onChange={(e) => handleStatusChange(r.id, e.target.value)}
                style={{ minWidth: 140 }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="request-item-meta muted">
              <strong>Name:</strong> {r.name} · <strong>Phone:</strong> {r.phone} · <strong>Email:</strong> {r.email}<br />
              <strong>VIN:</strong> {r.vin || 'N/A'} · <strong>Year:</strong> {r.carYear || 'N/A'} · Submitted {new Date(r.createdAt).toLocaleDateString()}
              {r.notes && <><br /><strong>Notes:</strong> {r.notes}</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Admin() {
  const [session, setSession] = useState(() => getAdminSession())

  function handleLogout() {
    adminLogout()
    setSession(null)
  }

  return (
    <div className="page">
      <section className="block">
        {session ? (
          <AdminDashboard onOut={handleLogout} />
        ) : (
          <AdminLogin onIn={() => setSession(getAdminSession())} />
        )}
      </section>
    </div>
  )
}

export default Admin
