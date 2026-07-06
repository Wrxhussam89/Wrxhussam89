// Talks to YOUR backend, which in turn talks to your ERP system.
// Never call the ERP API directly from the browser - that would ship its
// credentials to every visitor. Point VITE_API_BASE_URL at your own backend
// (a small server you control) that holds the real ERP API key server-side
// and proxies these requests to it.
//
// Until VITE_API_BASE_URL is set, the client runs in demo mode: requests are
// stored in localStorage so the whole site (forms, portal, statuses) is
// still fully clickable/testable without a backend.

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
export const isDemoMode = !API_BASE

const REQUESTS_KEY = 'demo_service_requests'
const SESSION_KEY = 'demo_portal_session'
const CUSTOMERS_KEY = 'demo_customers'
const ADMIN_SESSION_KEY = 'demo_admin_session'
const QUOTATIONS_KEY = 'demo_quotations'
const ADMIN_DEMO_CODE = import.meta.env.VITE_ADMIN_DEMO_CODE || 'evmaster-admin'

function demoDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 350))
}

function readDemoRequests() {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY)) || []
  } catch {
    return []
  }
}

function writeDemoRequests(list) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(list))
}

function readDemoQuotations() {
  try {
    return JSON.parse(localStorage.getItem(QUOTATIONS_KEY)) || []
  } catch {
    return []
  }
}

function writeDemoQuotations(list) {
  localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(list))
}

function authHeaders() {
  const session = getSession()
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export async function login(email, password) {
  if (isDemoMode) {
    const session = { token: 'demo-token', email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return demoDelay(session)
  }
  const session = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function readDemoCustomers() {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [] } catch { return [] }
}
function writeDemoCustomers(list) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list))
}

export async function register({ name, email, phone, password }) {
  if (isDemoMode) {
    const customers = readDemoCustomers()
    if (customers.some((c) => c.email === email)) {
      throw new Error('An account with that email already exists.')
    }
    customers.push({ name, email, phone, createdAt: new Date().toISOString() })
    writeDemoCustomers(customers)
    const session = { token: 'demo-token', email, name }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return demoDelay(session)
  }
  const session = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
  })
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

// Submits a service request. `type` is 'booking' or 'remote-programming'.
export async function submitServiceRequest(payload) {
  if (isDemoMode) {
    const list = readDemoRequests()
    const record = {
      id: crypto.randomUUID(),
      status: 'Received',
      createdAt: new Date().toISOString(),
      ...payload,
    }
    list.unshift(record)
    writeDemoRequests(list)
    return demoDelay(record)
  }
  return request('/customer/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getMyRequests() {
  if (isDemoMode) {
    const session = getSession()
    const list = readDemoRequests().filter((r) => r.email === session?.email)
    return demoDelay(list)
  }
  return request('/customer/requests')
}

export async function getQuotation(requestId) {
  if (isDemoMode) {
    const quotations = readDemoQuotations()
    const q = quotations.find((q) => q.requestId === requestId)
    return demoDelay(q || null)
  }
  return request(`/customer/requests/${requestId}/quotation`)
}

export async function respondToQuotation(requestId, action) {
  if (isDemoMode) {
    const quotations = readDemoQuotations()
    const idx = quotations.findIndex((q) => q.requestId === requestId)
    if (idx === -1) throw new Error('Quotation not found.')
    quotations[idx] = { ...quotations[idx], status: action, respondedAt: new Date().toISOString() }
    writeDemoQuotations(quotations)
    const requests = readDemoRequests()
    const ri = requests.findIndex((r) => r.id === requestId)
    if (ri !== -1) {
      requests[ri] = { ...requests[ri], status: action === 'approved' ? 'Approved' : 'Cancelled' }
      writeDemoRequests(requests)
    }
    return demoDelay(quotations[idx])
  }
  return request(`/customer/requests/${requestId}/quotation`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
}

// --- Admin ---

export function getAdminSession() {
  try { return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY)) } catch { return null }
}
export function adminLogout() { localStorage.removeItem(ADMIN_SESSION_KEY) }

function adminAuthHeaders() {
  const s = getAdminSession()
  return s?.token ? { Authorization: `Bearer ${s.token}` } : {}
}

async function adminRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...adminAuthHeaders(), ...options.headers },
  })
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `Request failed (${res.status})`)
  return res.status === 204 ? null : res.json()
}

export async function adminLogin(code) {
  if (isDemoMode) {
    if (code !== ADMIN_DEMO_CODE) throw new Error('Incorrect access code.')
    const session = { token: 'demo-admin-token' }
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    return demoDelay(session)
  }
  const session = await request('/admin/login', { method: 'POST', body: JSON.stringify({ code }) })
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
  return session
}

export async function getAllRequests() {
  if (isDemoMode) return demoDelay(readDemoRequests())
  return adminRequest('/admin/requests')
}

export async function updateRequestStatus(id, status) {
  if (isDemoMode) {
    const list = readDemoRequests()
    const idx = list.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Request not found.')
    list[idx] = { ...list[idx], status }
    writeDemoRequests(list)
    return demoDelay(list[idx])
  }
  return adminRequest(`/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function saveQuotation(requestId, quotation) {
  if (isDemoMode) {
    const quotations = readDemoQuotations()
    const existing = quotations.findIndex((q) => q.requestId === requestId)
    const record = {
      id: existing >= 0 ? quotations[existing].id : crypto.randomUUID(),
      requestId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...quotation,
    }
    if (existing >= 0) {
      quotations[existing] = record
    } else {
      quotations.push(record)
    }
    writeDemoQuotations(quotations)
    const requests = readDemoRequests()
    const ri = requests.findIndex((r) => r.id === requestId)
    if (ri !== -1) {
      requests[ri] = { ...requests[ri], status: 'Quotation Sent' }
      writeDemoRequests(requests)
    }
    return demoDelay(record)
  }
  return adminRequest(`/admin/requests/${requestId}/quotation`, {
    method: 'POST',
    body: JSON.stringify(quotation),
  })
}

export async function getAdminQuotation(requestId) {
  if (isDemoMode) {
    const quotations = readDemoQuotations()
    return demoDelay(quotations.find((q) => q.requestId === requestId) || null)
  }
  return adminRequest(`/admin/requests/${requestId}/quotation`)
}
