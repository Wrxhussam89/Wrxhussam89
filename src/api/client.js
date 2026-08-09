import { account, databases, DB_ID, COL, ID, Query, PROJECT_ID } from './appwrite'

// When VITE_APPWRITE_PROJECT_ID is set, all data flows through Appwrite.
// Without it, the site runs in demo mode with localStorage — fully clickable
// and testable without any backend.

export const isDemoMode = !PROJECT_ID

// ── Demo-mode helpers (localStorage) ───────────────────────────────

const REQUESTS_KEY = 'demo_service_requests'
const SESSION_KEY = 'demo_portal_session'
const CUSTOMERS_KEY = 'demo_customers'
const ADMIN_SESSION_KEY = 'demo_admin_session'
const QUOTATIONS_KEY = 'demo_quotations'
const ADMIN_DEMO_CODE = import.meta.env.VITE_ADMIN_DEMO_CODE || 'evmaster-admin'

function demoDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 350))
}
function readStore(key) { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }
function writeStore(key, data) { localStorage.setItem(key, JSON.stringify(data)) }

// ── Session ────────────────────────────────────────────────────────

const AW_SESSION_KEY = 'aw_session'

function saveAwSession(data) {
  localStorage.setItem(AW_SESSION_KEY, JSON.stringify(data))
}
function clearAwSession() {
  localStorage.removeItem(AW_SESSION_KEY)
}

export function getSession() {
  if (isDemoMode) {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  }
  try { return JSON.parse(localStorage.getItem(AW_SESSION_KEY)) } catch { return null }
}

export function logout() {
  if (isDemoMode) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  clearAwSession()
  account.deleteSession('current').catch(() => {})
}

export async function login(email, password) {
  if (isDemoMode) {
    const session = { token: 'demo-token', email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return demoDelay(session)
  }
  await account.createEmailPasswordSession(email, password)
  const user = await account.get()
  const session = { id: user.$id, email: user.email, name: user.name, token: 'aw' }
  saveAwSession(session)
  return session
}

export async function register({ name, email, phone, password }) {
  if (isDemoMode) {
    const customers = readStore(CUSTOMERS_KEY)
    if (customers.some((c) => c.email === email)) throw new Error('An account with that email already exists.')
    customers.push({ name, email, phone, createdAt: new Date().toISOString() })
    writeStore(CUSTOMERS_KEY, customers)
    const session = { token: 'demo-token', email, name }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return demoDelay(session)
  }
  await account.create(ID.unique(), email, password, name)
  await account.createEmailPasswordSession(email, password)
  const user = await account.get()
  // Store profile with phone number
  await databases.createDocument(DB_ID, COL.profiles, user.$id, { name, email, phone })
  const session = { id: user.$id, email: user.email, name: user.name, token: 'aw' }
  saveAwSession(session)
  return session
}

// ── Service Requests ───────────────────────────────────────────────

export async function submitServiceRequest(payload) {
  if (isDemoMode) {
    const list = readStore(REQUESTS_KEY)
    const record = { id: crypto.randomUUID(), status: 'Received', createdAt: new Date().toISOString(), ...payload }
    list.unshift(record)
    writeStore(REQUESTS_KEY, list)
    return demoDelay(record)
  }
  const session = getSession()
  const doc = await databases.createDocument(DB_ID, COL.requests, ID.unique(), {
    ...payload,
    userId: session?.id || null,
    status: 'Received',
  })
  return mapRequest(doc)
}

export async function getMyRequests() {
  if (isDemoMode) {
    const session = getSession()
    return demoDelay(readStore(REQUESTS_KEY).filter((r) => r.email === session?.email))
  }
  const session = getSession()
  if (!session?.id) return []
  const res = await databases.listDocuments(DB_ID, COL.requests, [
    Query.equal('userId', session.id),
    Query.orderDesc('$createdAt'),
    Query.limit(100),
  ])
  return res.documents.map(mapRequest)
}

export async function getQuotation(requestId) {
  if (isDemoMode) {
    const q = readStore(QUOTATIONS_KEY).find((q) => q.requestId === requestId)
    return demoDelay(q || null)
  }
  const res = await databases.listDocuments(DB_ID, COL.quotations, [
    Query.equal('requestId', requestId),
    Query.limit(1),
  ])
  return res.documents.length ? mapQuotation(res.documents[0]) : null
}

export async function respondToQuotation(requestId, action) {
  if (isDemoMode) {
    const quotations = readStore(QUOTATIONS_KEY)
    const idx = quotations.findIndex((q) => q.requestId === requestId)
    if (idx === -1) throw new Error('Quotation not found.')
    quotations[idx] = { ...quotations[idx], status: action, respondedAt: new Date().toISOString() }
    writeStore(QUOTATIONS_KEY, quotations)
    const requests = readStore(REQUESTS_KEY)
    const ri = requests.findIndex((r) => r.id === requestId)
    if (ri !== -1) {
      requests[ri] = { ...requests[ri], status: action === 'approved' ? 'Approved' : 'Cancelled' }
      writeStore(REQUESTS_KEY, requests)
    }
    return demoDelay(quotations[idx])
  }
  const res = await databases.listDocuments(DB_ID, COL.quotations, [
    Query.equal('requestId', requestId),
    Query.limit(1),
  ])
  if (!res.documents.length) throw new Error('Quotation not found.')
  const doc = res.documents[0]
  await databases.updateDocument(DB_ID, COL.quotations, doc.$id, {
    status: action,
    respondedAt: new Date().toISOString(),
  })
  // Update request status
  await databases.updateDocument(DB_ID, COL.requests, requestId, {
    status: action === 'approved' ? 'Approved' : 'Cancelled',
  })
  return { ...mapQuotation(doc), status: action }
}

// ── Admin ──────────────────────────────────────────────────────────

const ADMIN_LABEL = 'admin'

export function getAdminSession() {
  if (isDemoMode) {
    try { return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY)) } catch { return null }
  }
  try {
    const s = JSON.parse(localStorage.getItem(AW_SESSION_KEY))
    return s?.isAdmin ? s : null
  } catch { return null }
}

export function adminLogout() {
  if (isDemoMode) { localStorage.removeItem(ADMIN_SESSION_KEY); return }
  clearAwSession()
  account.deleteSession('current').catch(() => {})
}

export async function adminLogin(code) {
  if (isDemoMode) {
    if (code !== ADMIN_DEMO_CODE) throw new Error('Incorrect access code.')
    const session = { token: 'demo-admin-token' }
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    return demoDelay(session)
  }
  // Admin logs in with email + password. The "code" field is the password;
  // the admin email is stored in VITE_ADMIN_EMAIL.
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  if (!adminEmail) throw new Error('Admin email not configured.')
  await account.createEmailPasswordSession(adminEmail, code)
  const user = await account.get()
  const hasAdminLabel = (user.labels || []).includes(ADMIN_LABEL)
  if (!hasAdminLabel) {
    await account.deleteSession('current')
    throw new Error('Access denied — not an admin account.')
  }
  const session = { id: user.$id, email: user.email, name: user.name, token: 'aw', isAdmin: true }
  saveAwSession(session)
  return session
}

export async function getAllRequests() {
  if (isDemoMode) return demoDelay(readStore(REQUESTS_KEY))
  const res = await databases.listDocuments(DB_ID, COL.requests, [
    Query.orderDesc('$createdAt'),
    Query.limit(200),
  ])
  return res.documents.map(mapRequest)
}

export async function updateRequestStatus(id, status) {
  if (isDemoMode) {
    const list = readStore(REQUESTS_KEY)
    const idx = list.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Request not found.')
    list[idx] = { ...list[idx], status }
    writeStore(REQUESTS_KEY, list)
    return demoDelay(list[idx])
  }
  const doc = await databases.updateDocument(DB_ID, COL.requests, id, { status })
  return mapRequest(doc)
}

export async function saveQuotation(requestId, quotation) {
  if (isDemoMode) {
    const quotations = readStore(QUOTATIONS_KEY)
    const existing = quotations.findIndex((q) => q.requestId === requestId)
    const record = {
      id: existing >= 0 ? quotations[existing].id : crypto.randomUUID(),
      requestId, status: 'pending', createdAt: new Date().toISOString(), ...quotation,
    }
    if (existing >= 0) quotations[existing] = record
    else quotations.push(record)
    writeStore(QUOTATIONS_KEY, quotations)
    const requests = readStore(REQUESTS_KEY)
    const ri = requests.findIndex((r) => r.id === requestId)
    if (ri !== -1) { requests[ri] = { ...requests[ri], status: 'Quotation Sent' }; writeStore(REQUESTS_KEY, requests) }
    return demoDelay(record)
  }
  // Serialize items array to JSON string for Appwrite storage
  const data = {
    requestId,
    status: 'pending',
    mode: quotation.mode,
    total: quotation.total,
    description: quotation.description || '',
    estimatedTime: quotation.estimatedTime || '',
    laborCost: quotation.laborCost || 0,
    taxPercent: quotation.taxPercent || 0,
    subtotal: quotation.subtotal || 0,
    itemsJson: quotation.items ? JSON.stringify(quotation.items) : '[]',
  }
  // Check for existing quotation
  const existing = await databases.listDocuments(DB_ID, COL.quotations, [
    Query.equal('requestId', requestId), Query.limit(1),
  ])
  let doc
  if (existing.documents.length) {
    doc = await databases.updateDocument(DB_ID, COL.quotations, existing.documents[0].$id, data)
  } else {
    doc = await databases.createDocument(DB_ID, COL.quotations, ID.unique(), data)
  }
  await databases.updateDocument(DB_ID, COL.requests, requestId, { status: 'Quotation Sent' })
  return mapQuotation(doc)
}

export async function getAdminQuotation(requestId) {
  if (isDemoMode) {
    return demoDelay(readStore(QUOTATIONS_KEY).find((q) => q.requestId === requestId) || null)
  }
  const res = await databases.listDocuments(DB_ID, COL.quotations, [
    Query.equal('requestId', requestId), Query.limit(1),
  ])
  return res.documents.length ? mapQuotation(res.documents[0]) : null
}

// ── Mappers ────────────────────────────────────────────────────────

function mapRequest(doc) {
  return {
    id: doc.$id,
    type: doc.type,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    carMake: doc.carMake,
    carModel: doc.carModel,
    carYear: doc.carYear || '',
    vin: doc.vin || '',
    notes: doc.notes || '',
    preferredDate: doc.preferredDate || '',
    status: doc.status,
    userId: doc.userId || null,
    createdAt: doc.$createdAt,
  }
}

function mapQuotation(doc) {
  return {
    id: doc.$id,
    requestId: doc.requestId,
    status: doc.status,
    mode: doc.mode,
    total: doc.total,
    description: doc.description || '',
    estimatedTime: doc.estimatedTime || '',
    laborCost: doc.laborCost || 0,
    taxPercent: doc.taxPercent || 0,
    subtotal: doc.subtotal || 0,
    items: doc.itemsJson ? JSON.parse(doc.itemsJson) : [],
    createdAt: doc.$createdAt,
    respondedAt: doc.respondedAt || null,
  }
}
