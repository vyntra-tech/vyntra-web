import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { ENV } from '../config/env.js'
import { getCollection } from '../../db.js'
import { isDbConnected } from '../config/database.js'
import { User } from '../models/index.js'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor'
  avatar?: string
  title?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function generateToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '24h' })
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Authentication required. No token provided.' })
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; email: string; role: 'admin' | 'editor' }
    
    // Look up user details
    let userDetails: AuthUser | null = null

    if (isDbConnected()) {
      try {
        let user: any = null
        if (decoded.id && mongoose.isValidObjectId(decoded.id)) {
          user = await User.findById(decoded.id).lean()
        }
        if (!user && decoded.email) {
          user = await User.findOne({ email: decoded.email.toLowerCase() }).lean()
        }
        if (user) {
          userDetails = {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            title: user.title,
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB user lookup failed in authenticateToken, falling back to local store:', dbErr)
      }
    }

    if (!userDetails) {
      // Check local store fallback
      const localUsers = getCollection('users')
      const localUser = localUsers.find(
        (u: any) =>
          u.id === decoded.id ||
          (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
      )
      if (localUser) {
        userDetails = {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role,
          avatar: localUser.avatar,
          title: localUser.title,
        }
      }
    }

    if (!userDetails) {
      return res.status(401).json({ ok: false, error: 'User no longer exists or session is invalid.' })
    }

    req.user = userDetails
    next()
  } catch (err: any) {
    return res.status(401).json({ ok: false, error: 'Session expired or invalid token. Please sign in again.' })
  }
}

export function requireRole(allowedRoles: ('admin' | 'editor')[] = ['admin']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Authentication required.' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: `Access denied. Role "${req.user.role}" is not authorized for this operation.`,
      })
    }
    next()
  }
}
