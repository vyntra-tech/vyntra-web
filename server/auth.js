import {
  getCollection,
  verifyPassword,
  hashPassword,
  generateToken,
  verifyToken,
  logActivity,
  saveDb,
  getDb
} from './db.js'

// Auth Middleware: extracts token from Authorization: Bearer <token>
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Authentication required. No token provided.' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ ok: false, error: 'Session expired or invalid token. Please sign in again.' })
  }

  // Look up user in db to ensure active status
  const users = getCollection('users')
  const user = users.find((u) => u.id === payload.id)
  if (!user) {
    return res.status(401).json({ ok: false, error: 'User no longer exists.' })
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    title: user.title
  }

  next()
}

// Role-based Access Control Middleware
export function requireRole(allowedRoles = ['admin']) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Authentication required.' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: `Access denied. Role "${req.user.role}" is not authorized to perform this operation.`
      })
    }
    next()
  }
}

// In-memory store for password reset tokens (token -> { email, expiresAt })
const resetTokens = new Map()

export function handleLogin(req, res) {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password are required.' })
  }

  const users = getCollection('users')
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ ok: false, error: 'Invalid email address or password.' })
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role })
  
  logActivity(
    `${user.name} (${user.email})`,
    'AUTH_LOGIN',
    'Admin Portal',
    `Successful login as ${user.role}`
  )

  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      title: user.title
    }
  })
}

export function handleGetCurrentUser(req, res) {
  res.json({
    ok: true,
    user: req.user
  })
}

export function handleLogout(req, res) {
  if (req.user) {
    logActivity(
      `${req.user.name} (${req.user.email})`,
      'AUTH_LOGOUT',
      'Admin Portal',
      'Logged out successfully'
    )
  }
  res.json({ ok: true, message: 'Logged out successfully.' })
}

export function handleForgotPassword(req, res) {
  const { email } = req.body || {}
  if (!email) {
    return res.status(400).json({ ok: false, error: 'Email is required.' })
  }

  const users = getCollection('users')
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

  if (!user) {
    // Return generic success to prevent email enumeration
    return res.json({
      ok: true,
      message: 'If the email is registered, a password reset link has been dispatched.'
    })
  }

  const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
  resetTokens.set(token, {
    email: user.email,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 min expiry
  })

  logActivity(
    `${user.name} (${user.email})`,
    'AUTH_FORGOT_PASSWORD',
    'Account Security',
    'Requested password reset token'
  )

  // In production/dev mode, return token so admin can reset immediately if email transport isn't set
  res.json({
    ok: true,
    message: 'Password reset link generated. In test mode, you can use the reset code below.',
    resetToken: token
  })
}

export function handleResetPassword(req, res) {
  const { token, newPassword } = req.body || {}

  if (!token || !newPassword) {
    return res.status(400).json({ ok: false, error: 'Token and new password are required.' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters long.' })
  }

  const tokenData = resetTokens.get(token)
  if (!tokenData || Date.now() > tokenData.expiresAt) {
    return res.status(400).json({ ok: false, error: 'Invalid or expired password reset token.' })
  }

  const db = getDb()
  const user = db.users.find((u) => u.email.toLowerCase() === tokenData.email.toLowerCase())
  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found.' })
  }

  user.passwordHash = hashPassword(newPassword)
  user.updatedAt = new Date().toISOString()
  saveDb(db)
  resetTokens.delete(token)

  logActivity(
    `${user.name} (${user.email})`,
    'AUTH_PASSWORD_RESET',
    'Account Security',
    'Password was successfully updated'
  )

  res.json({ ok: true, message: 'Password has been successfully updated. You may now sign in.' })
}

export function handleUpdateProfile(req, res) {
  const { name, title, currentPassword, newPassword } = req.body || {}
  const db = getDb()
  const user = db.users.find((u) => u.id === req.user.id)

  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found.' })
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ ok: false, error: 'Current password is required to change password.' })
    }
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(400).json({ ok: false, error: 'Current password does not match.' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ ok: false, error: 'New password must be at least 8 characters long.' })
    }
    user.passwordHash = hashPassword(newPassword)
  }

  if (name) user.name = name.trim()
  if (title) user.title = title.trim()
  user.updatedAt = new Date().toISOString()
  saveDb(db)

  logActivity(
    `${user.name} (${user.email})`,
    'USER_PROFILE_UPDATED',
    'Account Settings',
    'Updated profile information'
  )

  res.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      title: user.title
    }
  })
}
