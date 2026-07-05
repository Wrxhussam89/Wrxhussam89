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
