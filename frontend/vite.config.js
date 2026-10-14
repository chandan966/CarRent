import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
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
export default defineConfig({
  plugins: [react(), authApiMiddleware(), bookingsApiMiddleware()],
})
