import mongoose from 'mongoose'
import { ENV } from './env.js'

let isConnected = false
let usingLocalFallback = false

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) return true

  if (!ENV.MONGODB_URI) {
    console.log('ℹ️  No MONGODB_URI configured in environment. Using robust local persistent store mode.')
    usingLocalFallback = true
    return false
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...')
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    isConnected = conn.connection.readyState === 1
    console.log(`✅ Successfully connected to MongoDB Atlas: ${conn.connection.host}`)

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Atlas connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Atlas disconnected.')
      isConnected = false
    })

    return true
  } catch (error: any) {
    console.warn(`⚠️  Could not connect to MongoDB Atlas (${error.message}). Operating with local persistent database fallback.`)
    usingLocalFallback = true
    return false
  }
}

export function isDbConnected(): boolean {
  return isConnected
}

export function isUsingFallback(): boolean {
  return usingLocalFallback
}
