#!/usr/bin/env node
//
// Creates the Appwrite database, collections, and attributes for EV Master JO.
//
// Usage:
//   1. Create a project at cloud.appwrite.io
//   2. Create an API key with Database + Auth permissions
//   3. Run:
//      APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
//      APPWRITE_PROJECT_ID=your-project-id \
//      APPWRITE_API_KEY=your-api-key \
//      node scripts/appwrite-setup.js
//
// This script is idempotent — safe to run again if it fails partway through.

import { Client, Databases, ID } from 'node-appwrite'

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID
const API_KEY = process.env.APPWRITE_API_KEY
const DB_ID = process.env.APPWRITE_DB_ID || 'evmaster'

if (!PROJECT_ID || !API_KEY) {
  console.error('Set APPWRITE_PROJECT_ID and APPWRITE_API_KEY env vars.')
  process.exit(1)
}

const client = new Client()
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
const db = new Databases(client)

async function ensureDb() {
  try {
    await db.get(DB_ID)
    console.log(`Database "${DB_ID}" already exists.`)
  } catch {
    await db.create(DB_ID, 'EV Master')
    console.log(`Database "${DB_ID}" created.`)
  }
}

async function ensureCollection(colId, name, attrs, indexes = []) {
  try {
    await db.getCollection(DB_ID, colId)
    console.log(`  Collection "${colId}" already exists.`)
  } catch {
    // documentSecurity=true so document-level permissions are enforced
    await db.createCollection(DB_ID, colId, name, undefined, true)
    console.log(`  Collection "${colId}" created.`)
  }

  for (const attr of attrs) {
    try {
      if (attr.type === 'string') {
        await db.createStringAttribute(DB_ID, colId, attr.key, attr.size || 255, attr.required ?? false, attr.default ?? null)
      } else if (attr.type === 'integer') {
        await db.createIntegerAttribute(DB_ID, colId, attr.key, attr.required ?? false, attr.min ?? null, attr.max ?? null, attr.default ?? null)
      } else if (attr.type === 'float') {
        await db.createFloatAttribute(DB_ID, colId, attr.key, attr.required ?? false, attr.min ?? null, attr.max ?? null, attr.default ?? null)
      } else if (attr.type === 'boolean') {
        await db.createBooleanAttribute(DB_ID, colId, attr.key, attr.required ?? false, attr.default ?? null)
      }
      console.log(`    Attribute "${attr.key}" created.`)
    } catch (e) {
      if (e.code === 409) {
        console.log(`    Attribute "${attr.key}" already exists.`)
      } else {
        console.error(`    Failed "${attr.key}":`, e.message)
      }
    }
  }

  for (const idx of indexes) {
    try {
      await db.createIndex(DB_ID, colId, idx.key, idx.type, idx.attributes, idx.orders)
      console.log(`    Index "${idx.key}" created.`)
    } catch (e) {
      if (e.code === 409) {
        console.log(`    Index "${idx.key}" already exists.`)
      } else {
        console.error(`    Index "${idx.key}" failed:`, e.message)
      }
    }
  }
}

async function main() {
  await ensureDb()

  // ── requests ──
  await ensureCollection('requests', 'Service Requests', [
    { key: 'type', type: 'string', size: 30, required: true },        // 'booking' | 'remote-programming'
    { key: 'name', type: 'string', size: 200, required: true },
    { key: 'email', type: 'string', size: 200, required: true },
    { key: 'phone', type: 'string', size: 30, required: true },
    { key: 'carMake', type: 'string', size: 100, required: true },
    { key: 'carModel', type: 'string', size: 100, required: true },
    { key: 'carYear', type: 'string', size: 10 },
    { key: 'vin', type: 'string', size: 20 },
    { key: 'notes', type: 'string', size: 2000 },
    { key: 'preferredDate', type: 'string', size: 20 },
    { key: 'status', type: 'string', size: 30, required: true },      // STATUS_PIPELINE value
    { key: 'userId', type: 'string', size: 50 },                      // Appwrite user ID
  ], [
    { key: 'idx_userId', type: 'key', attributes: ['userId'], orders: ['ASC'] },
    { key: 'idx_status', type: 'key', attributes: ['status'], orders: ['ASC'] },
    { key: 'idx_createdAt', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
  ])

  // ── quotations ──
  await ensureCollection('quotations', 'Quotations', [
    { key: 'requestId', type: 'string', size: 50, required: true },
    { key: 'status', type: 'string', size: 20, required: true },      // 'pending' | 'approved' | 'rejected'
    { key: 'mode', type: 'string', size: 20, required: true },        // 'simple' | 'detailed'
    { key: 'total', type: 'float', required: true },
    { key: 'description', type: 'string', size: 2000 },
    { key: 'estimatedTime', type: 'string', size: 100 },
    { key: 'laborCost', type: 'float' },
    { key: 'taxPercent', type: 'float' },
    { key: 'subtotal', type: 'float' },
    { key: 'itemsJson', type: 'string', size: 10000 },                // JSON array of line items
    { key: 'respondedAt', type: 'string', size: 30 },
  ], [
    { key: 'idx_requestId', type: 'key', attributes: ['requestId'], orders: ['ASC'] },
  ])

  // ── profiles (extra user data Appwrite auth doesn't store — phone) ──
  await ensureCollection('profiles', 'Customer Profiles', [
    { key: 'name', type: 'string', size: 200, required: true },
    { key: 'email', type: 'string', size: 200, required: true },
    { key: 'phone', type: 'string', size: 30, required: true },
  ])

  console.log('\nDone! Add these to your .env:\n')
  console.log(`VITE_APPWRITE_ENDPOINT=${ENDPOINT}`)
  console.log(`VITE_APPWRITE_PROJECT_ID=${PROJECT_ID}`)
  console.log(`VITE_APPWRITE_DB_ID=${DB_ID}`)
  console.log('VITE_ADMIN_EMAIL=your-admin@email.com')
  console.log('\nThen label your admin user in the Appwrite console:')
  console.log('  Users → select user → Labels → add "admin"')
}

main().catch((err) => { console.error(err); process.exit(1) })
