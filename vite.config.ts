import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
      'Content-Security-Policy': "default-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://unpkg.com https://*.google.com https://*.gstatic.com; script-src-elem 'self' 'unsafe-inline' http://localhost:* https://unpkg.com https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: http://localhost:* https:; connect-src 'self' http://localhost:* ws://localhost:* ws: http: https:; frame-src 'self' http://localhost:* https:;"
    },
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000'
    }
  },
  build: { chunkSizeWarningLimit: 900 }
})
