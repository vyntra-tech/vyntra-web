import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ENV } from './config/env.js'
import apiRoutes from './routes/apiRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Ensure public uploads directory exists
const uploadsDir = path.resolve(__dirname, '../../public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)
app.use(cors({ origin: ENV.CLIENT_ORIGIN || true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded media files
app.use('/uploads', express.static(uploadsDir))
const distUploads = path.resolve(__dirname, '../../dist/uploads')
if (fs.existsSync(distUploads)) {
  app.use('/uploads', express.static(distUploads))
}

// Backward-compatible fallback for legacy /src/assets paths
const assetsDir = path.resolve(__dirname, '../../src/assets')
if (fs.existsSync(assetsDir)) {
  app.use('/src/assets', express.static(assetsDir))
}
app.use('/src/assets', express.static(uploadsDir))

// API routes
app.use('/api', apiRoutes)

// Serve the built frontend in production
const dist = path.resolve(__dirname, '../../dist')
app.use(express.static(dist))
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/uploads') ||
    req.path.startsWith('/src/assets')
  ) {
    return res.status(404).json({ ok: false, error: 'Resource not found' })
  }
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) next()
  })
})

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Unhandled Error:', err)
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error occurred.',
  })
})

export default app
