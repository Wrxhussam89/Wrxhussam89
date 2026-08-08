import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSession, login, register, logout, getMyRequests, getQuotation, respondToQuotation, isDemoMode } from '../api/client'
import { STATUS_PIPELINE } from '../carBrands'
import { useT } from '../i18n'

function StatusTimeline({ currentStatus }) {
  const { t } = useT()
  const pipeline = STATUS_PIPELINE.filter((s) => s !== 'Cancelled')
  const currentIdx = pipeline.indexOf(currentStatus)
  const isCancelled = currentStatus === 'Cancelled'

  if (isCancelled) {
    return (
      <div className="status-timeline">
        <div className="timeline-step cancelled">
          <div className="timeline-dot" />
          <span className="timeline-label">{t('status.Cancelled')}</span>
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
            <span className="timeline-label">{t(`status.${step}`)}</span>
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
  const { t } = useT()

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
  const jod = t('quotation.jod')

  return (
    <div className="quotation-card">
      <div className="quotation-header">
        <h4>{t('quotation.heading')}</h4>
        <span className={`badge ${quotation.status === 'approved' ? '' : quotation.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
          {quotation.status === 'pending' ? t('quotation.awaitingResponse') : quotation.status === 'approved' ? t('quotation.approved') : t('quotation.rejected')}
        </span>
      </div>

      {isDetailed ? (
        <>
          <table className="quotation-table">
            <thead>
              <tr><th>{t('quotation.item')}</th><th>{t('quotation.qty')}</th><th>{t('quotation.price')}</th><th>{t('quotation.total')}</th></tr>
            </thead>
            <tbody>
              {(quotation.items || []).map((item, i) => (
                <tr key={i}>
                  <td>{item.description}</td>
                  <td>{item.qty}</td>
                  <td>{item.price} {jod}</td>
                  <td>{(item.qty * item.price).toFixed(2)} {jod}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotation.laborCost > 0 && (
            <div className="quotation-line">
              <span>{t('quotation.labor')}</span><span>{quotation.laborCost} {jod}</span>
            </div>
          )}
          {quotation.taxPercent > 0 && (
            <div className="quotation-line">
              <span>{t('quotation.tax', { percent: quotation.taxPercent })}</span>
              <span>{((quotation.subtotal || 0) * quotation.taxPercent / 100).toFixed(2)} {jod}</span>
            </div>
          )}
          <div className="quotation-line quotation-total">
            <span>{t('quotation.total')}</span><span>{quotation.total} {jod}</span>
          </div>
        </>
      ) : (
        <>
          <div className="quotation-line quotation-total">
            <span>{t('quotation.total')}</span><span>{quotation.total} {jod}</span>
          </div>
          {quotation.description && <p className="muted" style={{ marginTop: 8 }}>{quotation.description}</p>}
        </>
      )}

      {quotation.estimatedTime && (
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
          {t('quotation.estimatedTime', { time: quotation.estimatedTime })}
        </p>
      )}

      {isPending && (
        <div className="quotation-actions">
          <button className="btn btn-primary" disabled={responding} onClick={() => handleRespond('approved')}>
            {responding ? '...' : t('quotation.approve')}
          </button>
          <button className="btn btn-outline btn-danger-outline" disabled={responding} onClick={() => handleRespond('rejected')}>
            {responding ? '...' : t('quotation.reject')}
          </button>
        </div>
      )}
    </div>
  )
}

function RequestDetail({ request, onBack }) {
  const { t, lang } = useT()

  return (
    <div className="request-detail">
      <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: 20 }}>
        {t('portal.backToRequests')}
      </button>
      <div className="request-detail-header">
        <div>
          <h2 style={{ marginBottom: 4 }}>
            {request.type === 'remote-programming' ? t('portal.remoteProgramming') : t('portal.serviceBooking')}
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            {request.carMake} {request.carModel} {request.carYear && `(${request.carYear})`}
          </p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            {t('common.vin')} {request.vin || t('common.na')} · {t('common.submitted')} {new Date(request.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>{t('portal.serviceProgress')}</h3>
        <StatusTimeline currentStatus={request.status} />
      </div>

      <QuotationCard requestId={request.id} />

      {request.notes && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8 }}>{t('portal.notes')}</h4>
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
  const { t } = useT()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError(t('portal.errLoginFields'))
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password)
      onLoggedIn()
    } catch (err) {
      setError(err.message || t('portal.errLogin'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {isDemoMode && (
        <div className="notice">
          <strong>{t('common.demoMode')}</strong> {t('portal.demoLogin')}
        </div>
      )}
      <div className="form-row">
        <label htmlFor="login-email">{t('portal.emailLabel')}</label>
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="login-password">{t('portal.passwordLabel')}</label>
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? t('portal.signingIn') : t('portal.signIn')}
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
  const { t } = useT()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError(t('portal.errSignupFields'))
      return
    }
    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password })
      onDone()
    } catch (err) {
      setError(err.message || t('portal.errSignup'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {isDemoMode && (
        <div className="notice">
          <strong>{t('common.demoMode')}</strong> {t('portal.demoSignup')}
        </div>
      )}
      <div className="form-row">
        <label htmlFor="reg-name">{t('portal.nameLabel')}</label>
        <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="reg-email">{t('portal.emailLabel')}</label>
        <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="reg-phone">{t('portal.phoneLabel')}</label>
        <input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="reg-password">{t('portal.passwordLabel')}</label>
        <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? t('portal.creatingAccount') : t('portal.createAccount')}
      </button>
    </form>
  )
}

function AuthPanel({ onAuthed }) {
  const [tab, setTab] = useState('login')
  const { t } = useT()

  return (
    <>
      <div className="tabs">
        <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
          {t('portal.signIn')}
        </button>
        <button className={`tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>
          {t('portal.createAccount')}
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
  const { t, lang } = useT()

  useEffect(() => {
    let cancelled = false
    getMyRequests()
      .then((data) => { if (!cancelled) setRequests(data) })
      .catch((err) => { if (!cancelled) setError(err.message || t('portal.errLoadRequests')) })
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
          <h2 style={{ marginBottom: 4 }}>{t('portal.welcomeBack')}</h2>
          <p className="muted" style={{ marginBottom: 0 }}>{session.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/remote-programming" className="btn btn-outline">{t('portal.newRemote')}</Link>
          <button className="btn btn-outline" onClick={onLogout}>{t('portal.signOut')}</button>
        </div>
      </div>

      {isDemoMode && (
        <div className="notice">
          <strong>{t('common.demoMode')}</strong> {t('portal.demoList', { code: 'VITE_API_BASE_URL' })}
        </div>
      )}

      {loading && <p className="muted">{t('portal.loadingRequests')}</p>}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && requests.length === 0 && (
        <div className="card text-center">
          <p className="muted">{t('portal.noRequests')}</p>
          <Link to="/booking" className="btn btn-primary">{t('common.bookService')}</Link>
        </div>
      )}

      <div className="request-list">
        {requests.map((r) => (
          <button
            className="request-item request-item-btn"
            key={r.id}
            onClick={() => setSelected(r)}
          >
            <div>
              <h3 style={{ marginBottom: 4 }}>
                {r.type === 'remote-programming' ? t('portal.remoteProgramming') : t('portal.serviceBooking')} — {r.carMake} {r.carModel}
              </h3>
              <div className="request-item-meta muted">
                {t('common.vin')} {r.vin || t('common.na')} · {t('common.submitted')} {new Date(r.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}
              </div>
            </div>
            <span className={`badge ${r.status === 'Cancelled' ? 'badge-danger' : ''}`}>{t(`status.${r.status}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Portal() {
  const [session, setSession] = useState(() => getSession())
  const { t } = useT()

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
              <h1>{t('portal.heading')}</h1>
              <p className="muted">{t('portal.sub')}</p>
            </div>
            <AuthPanel onAuthed={() => setSession(getSession())} />
          </div>
        )}
      </section>
    </div>
  )
}

export default Portal
