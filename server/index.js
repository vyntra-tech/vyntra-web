import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  getDb,
  getCollection,
  insertItem,
  updateItem,
  deleteItem,
  logActivity,
  saveDb
} from './db.js'
import {
  authenticateToken,
  requireRole,
  handleLogin,
  handleGetCurrentUser,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
  handleUpdateProfile
} from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8787
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM, CLIENT_ORIGIN } = process.env

// Ensure public uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: CLIENT_ORIGIN || true }))
// Increased limit for base64 media uploads
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded media
app.use('/uploads', express.static(uploadsDir))

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(150).optional().default(''),
  type: z.enum(['Software or website', 'AI or automation', 'SaaS product', 'Not sure yet']),
  budget: z.string().trim().max(100).optional().default(''),
  description: z.string().trim().min(10).max(5000),
  website: z.string().optional().default('') // honeypot
})

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please try again later.' }
})

const configured = SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_TO && CONTACT_FROM
const transport = configured ? nodemailer.createTransport({
  host: SMTP_HOST, port: Number(SMTP_PORT) || 587, secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
}) : null

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

app.get('/api/health', (_req, res) => {
  const db = getDb()
  res.json({
    ok: true,
    mailConfigured: Boolean(configured),
    dbLoaded: Boolean(db),
    counts: {
      projects: (db.projects || []).length,
      services: (db.services || []).length,
      team: (db.team || []).length,
      testimonials: (db.testimonials || []).length
    }
  })
})

// Public site content & settings
app.get('/api/settings', (_req, res) => {
  const db = getDb()
  res.json({ ok: true, settings: db.settings })
})

app.get('/api/content', (_req, res) => {
  const db = getDb()
  res.json({ ok: true, content: db.content })
})

app.get('/api/projects', (_req, res) => {
  const projects = getCollection('projects')
  const published = projects.filter((p) => p.status === 'published')
  res.json({ ok: true, projects: published })
})

app.get('/api/services', (_req, res) => {
  const services = getCollection('services')
  const published = services.filter((s) => s.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, services: published })
})

app.get('/api/team', (_req, res) => {
  const team = getCollection('team')
  const published = team.filter((t) => t.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, team: published })
})

app.get('/api/testimonials', (_req, res) => {
  const testimonials = getCollection('testimonials')
  const published = testimonials.filter((t) => t.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, testimonials: published })
})

app.get('/api/products', (_req, res) => {
  const products = getCollection('products')
  const publicProducts = products.filter((p) => p.isPublic !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, products: publicProducts })
})

app.get('/api/gallery', (_req, res) => {
  const gallery = getCollection('gallery')
  res.json({ ok: true, gallery })
})

// Public contact endpoint: stores message in database AND sends email if configured
app.post('/api/contact', limiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Please check the form fields.', fields: parsed.error.flatten().fieldErrors })
  }
  const d = parsed.data
  if (d.website) return res.json({ ok: true }) // bot honeypot

  // 1. Store in admin inbox
  const newMsg = insertItem('messages', {
    name: d.name,
    email: d.email,
    company: d.company,
    type: d.type,
    budget: d.budget,
    description: d.description,
    status: 'unread'
  })

  logActivity(
    `Visitor (${d.email})`,
    'CONTACT_FORM_SUBMISSION',
    `Inquiry: ${d.type}`,
    `Budget: ${d.budget || 'N/A'}, Company: ${d.company || 'N/A'}`
  )

  // 2. Send email notification if SMTP is configured
  if (transport) {
    try {
      await transport.sendMail({
        from: CONTACT_FROM,
        to: CONTACT_TO,
        replyTo: d.email,
        subject: `New inquiry: ${d.type} from ${d.name}`,
        text: `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company}\nType: ${d.type}\nBudget: ${d.budget}\n\n${d.description}`,
        html: `<p><b>Name:</b> ${esc(d.name)}<br><b>Email:</b> ${esc(d.email)}<br><b>Company:</b> ${esc(d.company)}<br><b>Type:</b> ${esc(d.type)}<br><b>Budget:</b> ${esc(d.budget)}</p><p>${esc(d.description).replace(/\n/g, '<br>')}</p>`
      })
    } catch (e) {
      console.error('Mail delivery warning:', e.message)
      // Return ok anyway because inquiry was safely recorded in admin messages database
    }
  }

  res.json({ ok: true, message: 'Thank you! Your message has been received.', messageId: newMsg.id })
})

/* ==========================================================================
   ADMIN AUTHENTICATION ENDPOINTS
   ========================================================================== */

app.post('/api/admin/login', handleLogin)
app.post('/api/admin/logout', handleLogout)
app.post('/api/admin/forgot-password', handleForgotPassword)
app.post('/api/admin/reset-password', handleResetPassword)
app.get('/api/admin/me', authenticateToken, handleGetCurrentUser)
app.put('/api/admin/profile', authenticateToken, handleUpdateProfile)

/* ==========================================================================
   ADMIN STATS & OVERVIEW
   ========================================================================== */

app.get('/api/admin/stats', authenticateToken, (_req, res) => {
  const db = getDb()
  const projects = db.projects || []
  const services = db.services || []
  const team = db.team || []
  const testimonials = db.testimonials || []
  const products = db.products || []
  const messages = db.messages || []
  const activity = db.activity || []

  const publishedProjects = projects.filter((p) => p.status === 'published').length
  const draftProjects = projects.filter((p) => p.status === 'draft').length
  const unreadMessages = messages.filter((m) => m.status === 'unread').length

  // Monthly project additions
  const monthlyProjects = [
    { month: 'Oct', count: 1 },
    { month: 'Nov', count: 2 },
    { month: 'Dec', count: 1 },
    { month: 'Jan', count: 3 },
    { month: 'Feb', count: projects.length }
  ]

  // Category distribution
  const categoryCounts = {}
  projects.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  })

  res.json({
    ok: true,
    stats: {
      totalProjects: projects.length,
      publishedProjects,
      draftProjects,
      totalServices: services.length,
      totalTeam: team.length,
      totalTestimonials: testimonials.length,
      totalProducts: products.length,
      unreadMessages,
      totalMessages: messages.length,
      monthlyProjects,
      categoryDistribution: Object.entries(categoryCounts).map(([cat, count]) => ({ category: cat, count })),
      recentActivity: activity.slice(0, 10)
    }
  })
})

/* ==========================================================================
   ADMIN PROJECT MANAGEMENT
   ========================================================================== */

app.get('/api/admin/projects', authenticateToken, (_req, res) => {
  const projects = getCollection('projects')
  res.json({ ok: true, projects })
})

app.post('/api/admin/projects', authenticateToken, (req, res) => {
  const { name, category, description, tech, features, url, githubUrl, image, status, completionDate, featured } = req.body || {}
  if (!name || !description || !category) {
    return res.status(400).json({ ok: false, error: 'Name, category, and description are required.' })
  }

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const project = insertItem('projects', {
    name: name.trim(),
    slug,
    category: category.trim(),
    description: description.trim(),
    tech: Array.isArray(tech) ? tech : [],
    features: Array.isArray(features) ? features : [],
    url: url || '',
    githubUrl: githubUrl || '',
    image: image || '',
    status: status || 'draft',
    completionDate: completionDate || new Date().toISOString().slice(0, 10),
    featured: Boolean(featured),
    order: Date.now()
  })

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'PROJECT_CREATED',
    `Project: ${project.name}`,
    `Created with status: ${project.status}`
  )

  res.json({ ok: true, project })
})

app.put('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const updated = updateItem('projects', req.params.id, req.body)
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Project not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'PROJECT_UPDATED',
    `Project: ${updated.name}`,
    `Updated status: ${updated.status}`
  )

  res.json({ ok: true, project: updated })
})

app.delete('/api/admin/projects/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const deleted = deleteItem('projects', req.params.id)
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Project not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'PROJECT_DELETED',
    `Project: ${deleted.name}`,
    'Deleted permanently'
  )

  res.json({ ok: true, message: 'Project deleted successfully.', project: deleted })
})

/* ==========================================================================
   ADMIN SERVICES MANAGEMENT
   ========================================================================== */

app.get('/api/admin/services', authenticateToken, (_req, res) => {
  const services = getCollection('services').sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, services })
})

app.post('/api/admin/services', authenticateToken, (req, res) => {
  const { title, description, category, capabilities, technologies, icon, status, order } = req.body || {}
  if (!title || !description) {
    return res.status(400).json({ ok: false, error: 'Title and description are required.' })
  }

  const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const service = insertItem('services', {
    title: title.trim(),
    slug,
    category: category || 'Web and Software Development',
    icon: icon || 'Code2',
    description: description.trim(),
    capabilities: Array.isArray(capabilities) ? capabilities : [],
    technologies: Array.isArray(technologies) ? technologies : [],
    status: status || 'published',
    order: Number(order) || Date.now()
  })

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'SERVICE_CREATED',
    `Service: ${service.title}`,
    'Created new service offering'
  )

  res.json({ ok: true, service })
})

app.put('/api/admin/services/:id', authenticateToken, (req, res) => {
  const updated = updateItem('services', req.params.id, req.body)
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Service not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'SERVICE_UPDATED',
    `Service: ${updated.title}`,
    'Modified service details'
  )

  res.json({ ok: true, service: updated })
})

app.put('/api/admin/services-reorder', authenticateToken, (req, res) => {
  const { orderedIds } = req.body || {}
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ ok: false, error: 'orderedIds array required' })
  }

  const db = getDb()
  const services = db.services || []
  services.forEach((s) => {
    const idx = orderedIds.indexOf(s.id)
    if (idx !== -1) s.order = idx + 1
  })
  saveDb(db)

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'SERVICES_REORDERED',
    'Services Display Order',
    'Updated display arrangement'
  )

  res.json({ ok: true, services: services.sort((a, b) => a.order - b.order) })
})

app.delete('/api/admin/services/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const deleted = deleteItem('services', req.params.id)
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Service not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'SERVICE_DELETED',
    `Service: ${deleted.title}`,
    'Service removed'
  )

  res.json({ ok: true, message: 'Service deleted successfully.' })
})

/* ==========================================================================
   ADMIN TEAM MANAGEMENT
   ========================================================================== */

app.get('/api/admin/team', authenticateToken, (_req, res) => {
  const team = getCollection('team').sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, team })
})

app.post('/api/admin/team', authenticateToken, (req, res) => {
  const { name, role, specialty, bio, skills, linkedin, github, portfolio, image, size, status, order } = req.body || {}
  if (!name || !role) {
    return res.status(400).json({ ok: false, error: 'Name and role are required.' })
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join('')

  const member = insertItem('team', {
    name: name.trim(),
    role: role.trim(),
    initials,
    specialty: specialty || '',
    bio: bio || '',
    skills: Array.isArray(skills) ? skills : [],
    linkedin: linkedin || '',
    github: github || '',
    portfolio: portfolio || '',
    image: image || '',
    size: size || 'medium',
    status: status || 'published',
    order: Number(order) || Date.now()
  })

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'TEAM_MEMBER_ADDED',
    `Team: ${member.name}`,
    `Role: ${member.role}`
  )

  res.json({ ok: true, member })
})

app.put('/api/admin/team/:id', authenticateToken, (req, res) => {
  const updated = updateItem('team', req.params.id, req.body)
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Team member not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'TEAM_MEMBER_UPDATED',
    `Team: ${updated.name}`,
    'Updated profile & details'
  )

  res.json({ ok: true, member: updated })
})

app.delete('/api/admin/team/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const deleted = deleteItem('team', req.params.id)
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Team member not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'TEAM_MEMBER_DELETED',
    `Team: ${deleted.name}`,
    'Removed member'
  )

  res.json({ ok: true, message: 'Team member deleted successfully.' })
})

/* ==========================================================================
   ADMIN TESTIMONIALS MANAGEMENT
   ========================================================================== */

app.get('/api/admin/testimonials', authenticateToken, (_req, res) => {
  const testimonials = getCollection('testimonials').sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, testimonials })
})

app.post('/api/admin/testimonials', authenticateToken, (req, res) => {
  const { name, role, company, review, rating, project, tag, avatar, status } = req.body || {}
  if (!name || !review) {
    return res.status(400).json({ ok: false, error: 'Author name and testimonial text are required.' })
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join('')

  const testimonial = insertItem('testimonials', {
    name: name.trim(),
    role: role || 'Client',
    company: company || '',
    initials,
    review: review.trim(),
    rating: Number(rating) || 5,
    project: project || '',
    tag: tag || 'Client Feedback',
    avatar: avatar || '',
    status: status || 'published',
    order: Date.now()
  })

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'TESTIMONIAL_CREATED',
    `Testimonial: ${testimonial.name}`,
    `Company: ${testimonial.company}`
  )

  res.json({ ok: true, testimonial })
})

app.put('/api/admin/testimonials/:id', authenticateToken, (req, res) => {
  const updated = updateItem('testimonials', req.params.id, req.body)
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Testimonial not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'TESTIMONIAL_UPDATED',
    `Testimonial: ${updated.name}`,
    'Updated client review'
  )

  res.json({ ok: true, testimonial: updated })
})

app.delete('/api/admin/testimonials/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const deleted = deleteItem('testimonials', req.params.id)
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Testimonial not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'TESTIMONIAL_DELETED',
    `Testimonial: ${deleted.name}`,
    'Removed review'
  )

  res.json({ ok: true, message: 'Testimonial deleted successfully.' })
})

/* ==========================================================================
   ADMIN PRODUCTS MANAGEMENT
   ========================================================================== */

app.get('/api/admin/products', authenticateToken, (_req, res) => {
  const products = getCollection('products').sort((a, b) => (a.order || 0) - (b.order || 0))
  res.json({ ok: true, products })
})

app.post('/api/admin/products', authenticateToken, (req, res) => {
  const { name, category, status, previewType, description, tech, url, isPublic, order } = req.body || {}
  if (!name || !description) {
    return res.status(400).json({ ok: false, error: 'Product name and description are required.' })
  }

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const product = insertItem('products', {
    name: name.trim(),
    slug,
    category: category || 'Digital Products',
    status: status || 'Planned',
    previewType: previewType || 'cloud',
    description: description.trim(),
    tech: Array.isArray(tech) ? tech : [],
    url: url || '',
    isPublic: isPublic !== false,
    order: Number(order) || Date.now()
  })

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'PRODUCT_CREATED',
    `Product: ${product.name}`,
    `Status: ${product.status}`
  )

  res.json({ ok: true, product })
})

app.put('/api/admin/products/:id', authenticateToken, (req, res) => {
  const updated = updateItem('products', req.params.id, req.body)
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Product not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'PRODUCT_UPDATED',
    `Product: ${updated.name}`,
    `Status: ${updated.status}`
  )

  res.json({ ok: true, product: updated })
})

app.delete('/api/admin/products/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const deleted = deleteItem('products', req.params.id)
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Product not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'PRODUCT_DELETED',
    `Product: ${deleted.name}`,
    'Deleted product'
  )

  res.json({ ok: true, message: 'Product deleted successfully.' })
})

/* ==========================================================================
   ADMIN GALLERY & MEDIA LIBRARY
   ========================================================================== */

app.get('/api/admin/gallery', authenticateToken, (_req, res) => {
  const gallery = getCollection('gallery')
  res.json({ ok: true, gallery })
})

app.post('/api/admin/gallery', authenticateToken, (req, res) => {
  const { title, subtitle, category, type, image, videoUrl, tag, caption, alt } = req.body || {}
  if (!title) {
    return res.status(400).json({ ok: false, error: 'Title is required.' })
  }

  const item = insertItem('gallery', {
    title: title.trim(),
    subtitle: subtitle || '',
    category: category || 'story',
    type: type || 'image',
    image: image || '',
    videoUrl: videoUrl || '',
    tag: tag || 'VYNTRA',
    caption: caption || '',
    alt: alt || title,
    uploadedAt: new Date().toISOString()
  })

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'GALLERY_ITEM_ADDED',
    `Media: ${item.title}`,
    `Category: ${item.category}`
  )

  res.json({ ok: true, item })
})

app.delete('/api/admin/gallery/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const deleted = deleteItem('gallery', req.params.id)
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Media item not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'GALLERY_ITEM_DELETED',
    `Media: ${deleted.title}`,
    'Deleted from library'
  )

  res.json({ ok: true, message: 'Item deleted.' })
})

// File upload endpoint (supports base64 data URLs)
app.post('/api/admin/media/upload', authenticateToken, (req, res) => {
  const { name, data, type } = req.body || {}
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ ok: false, error: 'No image data provided.' })
  }

  try {
    let mimeType = 'image/png'
    let base64Data = data.trim()

    // Handle data URL scheme (e.g. data:image/png;base64,.... or data:image/svg+xml;charset=utf-8;base64,....)
    if (base64Data.startsWith('data:')) {
      const commaIdx = base64Data.indexOf(',')
      if (commaIdx !== -1) {
        const header = base64Data.slice(5, commaIdx)
        const semiIdx = header.indexOf(';')
        if (semiIdx !== -1) {
          mimeType = header.slice(0, semiIdx).toLowerCase().trim()
        } else {
          mimeType = header.toLowerCase().trim()
        }
        base64Data = base64Data.slice(commaIdx + 1)
      }
    }

    // Strip any whitespace or line breaks
    base64Data = base64Data.replace(/[\r\n\s]+/g, '')
    if (!base64Data) {
      return res.status(400).json({ ok: false, error: 'Empty base64 data.' })
    }

    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length === 0) {
      return res.status(400).json({ ok: false, error: 'Failed to decode image data.' })
    }

    // Validation: 25MB max
    if (buffer.length > 25 * 1024 * 1024) {
      return res.status(400).json({ ok: false, error: 'File size exceeds maximum 25MB limit.' })
    }

    // Determine extension
    const originalExt = path.extname(name || '').toLowerCase()
    let ext = originalExt
    if (!ext || ext.length < 2) {
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg'
      else if (mimeType.includes('webp')) ext = '.webp'
      else if (mimeType.includes('svg')) ext = '.svg'
      else if (mimeType.includes('gif')) ext = '.gif'
      else if (mimeType.includes('avif')) ext = '.avif'
      else if (mimeType.includes('png')) ext = '.png'
      else ext = '.png'
    }

    const rawBaseName = originalExt ? path.basename(name || 'upload', originalExt) : (name || 'upload')
    const cleanBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'upload'
    const fileName = `${Date.now()}-${cleanBaseName}${ext}`
    const filePath = path.join(uploadsDir, fileName)

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    fs.writeFileSync(filePath, buffer)
    const url = `/uploads/${fileName}`

    logActivity(
      req.user?.name ? `${req.user.name} (${req.user.email})` : 'Admin',
      'MEDIA_UPLOADED',
      `File: ${fileName}`,
      `Size: ${(buffer.length / 1024).toFixed(1)} KB`
    )

    res.json({
      ok: true,
      url,
      fileName,
      sizeBytes: buffer.length,
      mimeType,
      uploadedAt: new Date().toISOString()
    })
  } catch (err) {
    console.error('Upload failure:', err)
    res.status(500).json({ ok: false, error: 'Upload processing failed: ' + err.message })
  }
})

/* ==========================================================================
   ADMIN WEBSITE CONTENT MANAGEMENT
   ========================================================================== */

app.get('/api/admin/content', authenticateToken, (_req, res) => {
  const db = getDb()
  res.json({ ok: true, content: db.content })
})

app.put('/api/admin/content', authenticateToken, (req, res) => {
  const db = getDb()
  db.content = {
    ...db.content,
    ...req.body
  }
  saveDb(db)

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'CONTENT_UPDATED',
    'Website Sections',
    'Updated hero, about, or SEO content'
  )

  res.json({ ok: true, content: db.content })
})

/* ==========================================================================
   ADMIN CONTACT MESSAGES INBOX
   ========================================================================== */

app.get('/api/admin/messages', authenticateToken, (_req, res) => {
  const messages = getCollection('messages')
  res.json({ ok: true, messages })
})

app.put('/api/admin/messages/:id/read', authenticateToken, (req, res) => {
  const updated = updateItem('messages', req.params.id, { status: req.body.status || 'read' })
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Message not found.' })
  }
  res.json({ ok: true, message: updated })
})

app.put('/api/admin/messages/:id/archive', authenticateToken, (req, res) => {
  const updated = updateItem('messages', req.params.id, { status: 'archived' })
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Message not found.' })
  }
  res.json({ ok: true, message: updated })
})

app.delete('/api/admin/messages/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const deleted = deleteItem('messages', req.params.id)
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Message not found.' })
  }

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'MESSAGE_DELETED',
    `Message from: ${deleted.name}`,
    'Permanently deleted inquiry'
  )

  res.json({ ok: true, message: 'Message removed.' })
})

/* ==========================================================================
   ADMIN AUDIT LOG & SETTINGS
   ========================================================================== */

app.get('/api/admin/activity', authenticateToken, (_req, res) => {
  const activity = getCollection('activity')
  res.json({ ok: true, activity })
})

app.get('/api/admin/settings', authenticateToken, (_req, res) => {
  const db = getDb()
  res.json({ ok: true, settings: db.settings })
})

app.put('/api/admin/settings', authenticateToken, requireRole(['admin']), (req, res) => {
  const db = getDb()
  db.settings = {
    ...db.settings,
    ...req.body
  }
  saveDb(db)

  logActivity(
    `${req.user.name} (${req.user.email})`,
    'SETTINGS_UPDATED',
    'Global System Settings',
    'Updated company metadata and configuration'
  )

  res.json({ ok: true, settings: db.settings })
})

/* ==========================================================================
   STATIC PRODUCTION SERVING & SPA FALLBACK
   ========================================================================== */

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))

// Backward-compatible fallback for legacy /src/assets paths
const assetsDir = path.join(__dirname, '..', 'src', 'assets')
if (fs.existsSync(assetsDir)) {
  app.use('/src/assets', express.static(assetsDir))
}
app.use('/src/assets', express.static(uploadsDir))

app.get('*', (req, res, next) => {
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

app.listen(PORT, () => {
  console.log(`🚀 VYNTRA API & Admin Engine listening on http://localhost:${PORT}`)
  console.log(`📡 Mail status: ${configured ? 'Configured' : 'Local Mock Mode'}`)
})
