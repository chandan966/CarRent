import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleAuthRequest } from './api/_lib/auth.js'
import { handleBookingsRequest } from './api/_lib/bookings.js'

function authApiMiddleware() {
  const attach = (server) => {
    server.middlewares.use('/api/auth', (request, response, next) => {
      handleAuthRequest(request, response).catch(next)
    })
  }

  return {
    name: 'carrent-auth-api',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

function bookingsApiMiddleware() {
  const attach = (server) => {
    server.middlewares.use('/api/bookings', (request, response, next) => {
      handleBookingsRequest(request, response).catch(next)
    })
  }

  return {
    name: 'carrent-bookings-api',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite exposes .env values to client code, but server-side API middleware
  // reads process.env directly. Load private API settings for local requests.
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of [
    'DATABASE_URL',
    'DATABASE_SSL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
  ]) {
    if (!process.env[key] && env[key]) {
      process.env[key] = env[key]
    }
  }

  return {
    plugins: [react(), authApiMiddleware(), bookingsApiMiddleware()],
  }
})
