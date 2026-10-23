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
const uploadsDir = path.join(__dirname, '../../../public/uploads')
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
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Serve uploaded media files
app.use('/uploads', express.static(uploadsDir))

// API routes
app.use('/api', apiRoutes)

// Serve the built frontend in production
const dist = path.join(__dirname, '../../../dist')
app.use(express.static(dist))
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next()
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
