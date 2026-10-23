import app from './app.js'
import { ENV } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { getDb } from '../db.js'

async function bootstrap() {
  console.log('🚀 Initializing VYNTRA Server & Admin Engine...')

  // Initialize and seed local database cache
  const db = getDb()
  console.log(`📦 Seed data verified: ${db.projects?.length || 0} projects, ${db.services?.length || 0} services.`)

  // Connect to MongoDB Atlas (or graceful local fallback)
  await connectDatabase()

  app.listen(ENV.PORT, () => {
    console.log(`\n======================================================`)
    console.log(`⚡ VYNTRA Backend active on http://localhost:${ENV.PORT}`)
    console.log(`🔐 Admin API: http://localhost:${ENV.PORT}/api/admin/me`)
    console.log(`🌐 Public API: http://localhost:${ENV.PORT}/api/projects`)
    console.log(`======================================================\n`)
  })
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err)
  process.exit(1)
})
