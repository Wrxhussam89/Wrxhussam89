import { useEffect, useState } from 'react'
import {
  getAdminSession, adminLogin, adminLogout,
  getAllRequests, updateRequestStatus, saveQuotation, getAdminQuotation, isDemoMode,
} from '../api/client'
import { STATUS_PIPELINE } from '../carBrands'

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

function QuotationBuilder({ requestId, onSent }) {
  const [mode, setMode] = useState('simple')
  const [total, setTotal] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [items, setItems] = useState([{ description: '', qty: 1, price: '' }])
  const [laborCost, setLaborCost] = useState('')
  const [taxPercent, setTaxPercent] = useState('16')
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState(null)

  useEffect(() => {
    getAdminQuotation(requestId).then((q) => {
      if (q) setExisting(q)
    }).catch(() => {})
  }, [requestId])

  function addItem() {
    setItems((prev) => [...prev, { description: '', qty: 1, price: '' }])
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx, field, value) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function calcSubtotal() {
    return items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0)
  }

  function calcTotal() {
    if (mode === 'simple') return Number(total) || 0
    const sub = calcSubtotal() + (Number(laborCost) || 0)
    return sub + sub * (Number(taxPercent) || 0) / 100
  }

  async function handleSend() {
    setSaving(true)
    try {
      const quotation = mode === 'simple'
        ? { mode, total: Number(total), description, estimatedTime }
        : {
            mode,
            items: items.map((it) => ({ ...it, qty: Number(it.qty), price: Number(it.price) })),
            laborCost: Number(laborCost) || 0,
            taxPercent: Number(taxPercent) || 0,
            subtotal: calcSubtotal() + (Number(laborCost) || 0),
            total: Math.round(calcTotal() * 100) / 100,
            estimatedTime,
          }
      await saveQuotation(requestId, quotation)
      onSent()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  if (existing) {
    return (
      <div className="quotation-card">
        <div className="quotation-header">
          <h4>Quotation Sent</h4>
          <span className={`badge ${existing.status === 'approved' ? '' : existing.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
            {existing.status === 'pending' ? 'Awaiting Response' : existing.status === 'approved' ? 'Approved' : 'Rejected'}
          </span>
        </div>
        <div className="quotation-line quotation-total">
          <span>Total</span><span>{existing.total} JOD</span>
        </div>
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setExisting(null)}>
          Send New Quotation
        </button>
      </div>
    )
  }

  return (
    <div className="quotation-builder">
      <h4 style={{ marginBottom: 12 }}>Send Quotation</h4>
      <div className="tabs" style={{ maxWidth: '100%', marginBottom: 16 }}>
        <button className={`tab ${mode === 'simple' ? 'active' : ''}`} onClick={() => setMode('simple')}>Simple</button>
        <button className={`tab ${mode === 'detailed' ? 'active' : ''}`} onClick={() => setMode('detailed')}>Detailed</button>
      </div>

      {mode === 'simple' ? (
        <>
          <div className="form-row">
            <label>Total (JOD)</label>
            <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work..." style={{ minHeight: 60 }} />
          </div>
        </>
      ) : (
        <>
          <div className="quotation-items-list">
            {items.map((item, i) => (
              <div key={i} className="quotation-item-row">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => updateItem(i, 'qty', e.target.value)}
                  style={{ width: 70 }}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(i, 'price', e.target.value)}
                  style={{ width: 90 }}
                />
                {items.length > 1 && (
                  <button type="button" className="btn btn-outline" onClick={() => removeItem(i)} style={{ padding: '8px 12px' }}>
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline" onClick={addItem} style={{ marginBottom: 12 }}>
            + Add Item
          </button>
          <div className="form-row-2">
            <div className="form-row">
              <label>Labor Cost (JOD)</label>
              <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} placeholder="0" />
            </div>
            <div className="form-row">
              <label>Tax %</label>
              <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} placeholder="16" />
            </div>
          </div>
          <div className="quotation-line quotation-total" style={{ marginBottom: 12 }}>
            <span>Calculated Total</span><span>{calcTotal().toFixed(2)} JOD</span>
          </div>
        </>
      )}

      <div className="form-row">
        <label>Estimated Time</label>
        <input type="text" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="e.g. 2-3 business days" />
      </div>

      <button className="btn btn-primary" onClick={handleSend} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Sending...' : 'Send Quotation to Customer'}
      </button>
    </div>
  )
}

function RequestDetailAdmin({ request, onBack, onStatusChange }) {
  const [showQuotation, setShowQuotation] = useState(false)

  return (
    <div className="request-detail">
      <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: 20 }}>
        Back to All Requests
      </button>

      <div className="request-detail-header">
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 4 }}>
            {request.type === 'remote-programming' ? 'Remote Programming' : 'Service Booking'}
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            {request.carMake} {request.carModel} {request.carYear && `(${request.carYear})`}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Customer Info</h3>
        <div className="detail-grid">
          <div><strong>Name:</strong> {request.name}</div>
          <div><strong>Phone:</strong> {request.phone}</div>
          <div><strong>Email:</strong> {request.email}</div>
          <div><strong>VIN:</strong> {request.vin || 'N/A'}</div>
          <div><strong>Year:</strong> {request.carYear || 'N/A'}</div>
          <div><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</div>
        </div>
        {request.notes && (
          <div style={{ marginTop: 12 }}>
            <strong>Notes:</strong>
            <p className="muted" style={{ marginTop: 4 }}>{request.notes}</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Update Status</h3>
        <div className="status-pipeline-admin">
          {STATUS_PIPELINE.map((s) => (
            <button
              key={s}
              className={`pipeline-btn ${request.status === s ? 'active' : ''} ${s === 'Cancelled' ? 'cancelled' : ''}`}
              onClick={() => onStatusChange(request.id, s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {!showQuotation ? (
          <button className="btn btn-primary" onClick={() => setShowQuotation(true)}>
            Manage Quotation
          </button>
        ) : (
          <QuotationBuilder
            requestId={request.id}
            onSent={() => {
              setShowQuotation(false)
              onStatusChange(request.id, 'Quotation Sent')
            }}
          />
        )}
      </div>
    </div>
  )
}

function AdminDashboard({ onOut }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

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
    setSelected((prev) => prev && prev.id === id ? { ...prev, status } : prev)
    try {
      await updateRequestStatus(id, status)
    } catch {
      const fresh = await getAllRequests()
      setRequests(fresh)
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  if (selected) {
    return (
      <div className="container" style={{ maxWidth: 960 }}>
        <RequestDetailAdmin
          request={selected}
          onBack={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      </div>
    )
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

      <div className="admin-filter-bar">
        <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({requests.length})
        </button>
        {STATUS_PIPELINE.map((s) => {
          const count = requests.filter((r) => r.status === s).length
          if (count === 0) return null
          return (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s} ({count})
            </button>
          )
        })}
      </div>

      {loading && <p className="muted">Loading requests...</p>}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-center">
          <p className="muted">No requests{filter !== 'all' ? ` with status "${filter}"` : ''} yet.</p>
        </div>
      )}

      <div className="request-list">
        {filtered.map((r) => (
          <button
            className="request-item request-item-btn"
            key={r.id}
            onClick={() => setSelected(r)}
          >
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h3 style={{ marginBottom: 4 }}>
                {r.type === 'remote-programming' ? 'Remote Programming' : 'Service Booking'} — {r.carMake} {r.carModel}
              </h3>
              <div className="request-item-meta muted">
                {r.name} · {r.phone} · Submitted {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${r.status === 'Cancelled' ? 'badge-danger' : r.status === 'Received' ? 'badge-new' : ''}`}>
                {r.status}
              </span>
              <span className="muted" style={{ fontSize: '1.2rem' }}>›</span>
            </div>
          </button>
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
