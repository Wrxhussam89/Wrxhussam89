import { Client, Account, Databases, ID, Query } from 'appwrite'

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID || 'evmaster'

const COL = {
  requests: import.meta.env.VITE_APPWRITE_COL_REQUESTS || 'requests',
  quotations: import.meta.env.VITE_APPWRITE_COL_QUOTATIONS || 'quotations',
  profiles: import.meta.env.VITE_APPWRITE_COL_PROFILES || 'profiles',
}

const client = new Client()
if (PROJECT_ID) {
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID)
}

export const account = new Account(client)
export const databases = new Databases(client)
export { client, DB_ID, COL, ID, Query, PROJECT_ID }
