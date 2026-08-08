import { useEffect, useState } from 'react'
import {
  getAdminSession, adminLogin, adminLogout,
  getAllRequests, updateRequestStatus, saveQuotation, getAdminQuotation, isDemoMode,
} from '../api/client'
import { STATUS_PIPELINE } from '../carBrands'
import { useT } from '../i18n'

function AdminLogin({ onIn }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useT()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!code.trim()) { setError(t('admin.errCode')); return }
    setLoading(true)
    try {
      await adminLogin(code.trim())
      onIn()
    } catch (err) {
      setError(err.message || t('admin.errAccess'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="section-head">
        <h1>{t('admin.heading')}</h1>
        <p className="muted">{t('admin.sub')}</p>
      </div>
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {isDemoMode && (
          <div className="notice">
            <strong>{t('common.demoMode')}</strong> {t('admin.demoCode', { code: 'evmaster-admin' })}
          </div>
        )}
        <div className="form-row">
          <label htmlFor="admin-code">{t('admin.accessCode')}</label>
          <input id="admin-code" type="password" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? t('admin.verifying') : t('admin.enter')}
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
  const { t } = useT()

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

  const jod = t('quotation.jod')

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
          <h4>{t('admin.quotationSent')}</h4>
          <span className={`badge ${existing.status === 'approved' ? '' : existing.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
            {existing.status === 'pending' ? t('quotation.awaitingResponse') : existing.status === 'approved' ? t('quotation.approved') : t('quotation.rejected')}
          </span>
        </div>
        <div className="quotation-line quotation-total">
          <span>{t('quotation.total')}</span><span>{existing.total} {jod}</span>
        </div>
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setExisting(null)}>
          {t('admin.sendNewQuotation')}
        </button>
      </div>
    )
  }

  return (
    <div className="quotation-builder">
      <h4 style={{ marginBottom: 12 }}>{t('admin.sendQuotation')}</h4>
      <div className="tabs" style={{ maxWidth: '100%', marginBottom: 16 }}>
        <button className={`tab ${mode === 'simple' ? 'active' : ''}`} onClick={() => setMode('simple')}>{t('admin.simple')}</button>
        <button className={`tab ${mode === 'detailed' ? 'active' : ''}`} onClick={() => setMode('detailed')}>{t('admin.detailed')}</button>
      </div>

      {mode === 'simple' ? (
        <>
          <div className="form-row">
            <label>{t('admin.totalJod')}</label>
            <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-row">
            <label>{t('admin.description')}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('admin.descPlaceholder')} style={{ minHeight: 60 }} />
          </div>
        </>
      ) : (
        <>
          <div className="quotation-items-list">
            {items.map((item, i) => (
              <div key={i} className="quotation-item-row">
                <input
                  type="text"
                  placeholder={t('admin.itemDesc')}
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  placeholder={t('quotation.qty')}
                  value={item.qty}
                  onChange={(e) => updateItem(i, 'qty', e.target.value)}
                  style={{ width: 70 }}
                />
                <input
                  type="number"
                  placeholder={t('quotation.price')}
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
            {t('admin.addItem')}
          </button>
          <div className="form-row-2">
            <div className="form-row">
              <label>{t('admin.laborCost')}</label>
              <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} placeholder="0" />
            </div>
            <div className="form-row">
              <label>{t('admin.taxPercent')}</label>
              <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} placeholder="16" />
            </div>
          </div>
          <div className="quotation-line quotation-total" style={{ marginBottom: 12 }}>
            <span>{t('admin.calculatedTotal')}</span><span>{calcTotal().toFixed(2)} {jod}</span>
          </div>
        </>
      )}

      <div className="form-row">
        <label>{t('admin.estimatedTime')}</label>
        <input type="text" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder={t('admin.estTimePlaceholder')} />
      </div>

      <button className="btn btn-primary" onClick={handleSend} disabled={saving} style={{ width: '100%' }}>
        {saving ? t('admin.sending') : t('admin.sendToCustomer')}
      </button>
    </div>
  )
}

function RequestDetailAdmin({ request, onBack, onStatusChange }) {
  const [showQuotation, setShowQuotation] = useState(false)
  const { t, lang } = useT()

  return (
    <div className="request-detail">
      <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: 20 }}>
        {t('admin.backToAll')}
      </button>

      <div className="request-detail-header">
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 4 }}>
            {request.type === 'remote-programming' ? t('portal.remoteProgramming') : t('portal.serviceBooking')}
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            {request.carMake} {request.carModel} {request.carYear && `(${request.carYear})`}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 12 }}>{t('admin.customerInfo')}</h3>
        <div className="detail-grid">
          <div><strong>{t('admin.name')}</strong> {request.name}</div>
          <div><strong>{t('admin.phone')}</strong> {request.phone}</div>
          <div><strong>{t('admin.email')}</strong> {request.email}</div>
          <div><strong>{t('admin.vin')}</strong> {request.vin || t('common.na')}</div>
          <div><strong>{t('admin.year')}</strong> {request.carYear || t('common.na')}</div>
          <div><strong>{t('admin.submitted')}</strong> {new Date(request.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}</div>
        </div>
        {request.notes && (
          <div style={{ marginTop: 12 }}>
            <strong>{t('admin.notesLabel')}</strong>
            <p className="muted" style={{ marginTop: 4 }}>{request.notes}</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>{t('admin.updateStatus')}</h3>
        <div className="status-pipeline-admin">
          {STATUS_PIPELINE.map((s) => (
            <button
              key={s}
              className={`pipeline-btn ${request.status === s ? 'active' : ''} ${s === 'Cancelled' ? 'cancelled' : ''}`}
              onClick={() => onStatusChange(request.id, s)}
            >
              {t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {!showQuotation ? (
          <button className="btn btn-primary" onClick={() => setShowQuotation(true)}>
            {t('admin.manageQuotation')}
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
  const { t, lang, dir } = useT()

  useEffect(() => {
    let cancelled = false
    getAllRequests()
      .then((data) => { if (!cancelled) setRequests(data) })
      .catch((err) => { if (!cancelled) setError(err.message || t('admin.errLoadRequests')) })
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
          <h2 style={{ marginBottom: 0 }}>{t('admin.allRequests')}</h2>
          {newCount > 0 && <span className="badge">{t('admin.new', { count: newCount })}</span>}
        </div>
        <button className="btn btn-outline" onClick={onOut}>{t('common.signOut')}</button>
      </div>

      {isDemoMode && (
        <div className="notice">
          <strong>{t('common.demoMode')}</strong> {t('admin.demoNotice')}
        </div>
      )}

      <div className="admin-filter-bar">
        <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          {t('admin.all')} ({requests.length})
        </button>
        {STATUS_PIPELINE.map((s) => {
          const count = requests.filter((r) => r.status === s).length
          if (count === 0) return null
          return (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {t(`status.${s}`)} ({count})
            </button>
          )
        })}
      </div>

      {loading && <p className="muted">{t('admin.loadingRequests')}</p>}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-center">
          <p className="muted">
            {filter !== 'all' ? t('admin.noRequestsFiltered', { status: t(`status.${filter}`) }) : t('admin.noRequests')}
          </p>
        </div>
      )}

      <div className="request-list">
        {filtered.map((r) => (
          <button
            className="request-item request-item-btn"
            key={r.id}
            onClick={() => setSelected(r)}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 4 }}>
                {r.type === 'remote-programming' ? t('portal.remoteProgramming') : t('portal.serviceBooking')} — {r.carMake} {r.carModel}
              </h3>
              <div className="request-item-meta muted">
                {r.name} · {r.phone} · {t('common.submitted')} {new Date(r.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${r.status === 'Cancelled' ? 'badge-danger' : r.status === 'Received' ? 'badge-new' : ''}`}>
                {t(`status.${r.status}`)}
              </span>
              <span className="muted request-arrow">{'›'}</span>
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
