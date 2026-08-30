import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// The API runs on localhost, or on the "api" container inside Docker Compose.
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // Vite forwards /api/... to the API, so the browser sees one single origin
    // and the session cookie is sent like any same-site cookie.
    host: true,
    proxy: {
      '/api': apiTarget,
    },
  },
})
