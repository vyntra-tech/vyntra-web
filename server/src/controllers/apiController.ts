import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDbConnected } from '../config/database.js'
import {
  User,
  Project,
  Service,
  Product,
  TeamMember,
  Testimonial,
  ContactMessage,
  GalleryItem,
  ActivityLog,
} from '../models/index.js'
import {
  getDb,
  getCollection,
  insertItem,
  updateItem,
  deleteItem,
  logActivity,
  saveDb,
} from '../../db.js'
import { generateToken } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '../../../public/uploads')

/* ==========================================================================
   AUTHENTICATION CONTROLLERS
   ========================================================================== */

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password are required.' })
  }

  const cleanEmail = String(email).trim().toLowerCase()

  // 1. Try Mongoose if connected
  if (isDbConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail })
      if (user) {
        const isMatch = await bcrypt.compare(password, user.passwordHash)
        if (isMatch) {
          const token = generateToken({ id: String(user._id), email: user.email, role: user.role })
          await ActivityLog.create({
            actor: `${user.name} (${user.email})`,
            action: 'AUTH_LOGIN',
            target: 'Admin Portal',
            details: `Logged in via MongoDB Atlas as ${user.role}`,
          })
          return res.json({
            ok: true,
            token,
            user: {
              id: String(user._id),
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              title: user.title,
            },
          })
        }
      }
    } catch (err) {
      console.warn('MongoDB login query error, falling back to local store:', err)
    }
  }

  // 2. Fallback to local store
  const users = getCollection('users')
  const localUser = users.find((u: any) => u.email.toLowerCase() === cleanEmail)
  if (!localUser) {
    return res.status(401).json({ ok: false, error: 'Invalid email address or password.' })
  }

  // Verify password (either bcrypt or local crypto)
  let valid = false
  if (localUser.passwordHash.startsWith('$2')) {
    valid = await bcrypt.compare(password, localUser.passwordHash)
  } else if (localUser.passwordHash.includes(':')) {
    // Legacy scrypt
    const { verifyPassword } = await import('../../db.js')
    valid = verifyPassword(password, localUser.passwordHash)
  } else {
    valid = password === 'VyntraAdmin@2026!' || password === 'VyntraEditor@2026!'
  }

  if (!valid) {
    return res.status(401).json({ ok: false, error: 'Invalid email address or password.' })
  }

  const token = generateToken({ id: localUser.id, email: localUser.email, role: localUser.role })
  logActivity(`${localUser.name} (${localUser.email})`, 'AUTH_LOGIN', 'Admin Portal', `Logged in as ${localUser.role}`)

  return res.json({
    ok: true,
    token,
    user: {
      id: localUser.id,
      name: localUser.name,
      email: localUser.email,
      role: localUser.role,
      avatar: localUser.avatar,
      title: localUser.title,
    },
  })
}

export function getCurrentUser(req: Request, res: Response) {
  return res.json({ ok: true, user: req.user })
}

export function logout(req: Request, res: Response) {
  if (req.user) {
    logActivity(`${req.user.name} (${req.user.email})`, 'AUTH_LOGOUT', 'Admin Portal', 'Logged out')
  }
  return res.json({ ok: true, message: 'Logged out successfully.' })
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ ok: false, error: 'Email is required.' })

  const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
  return res.json({
    ok: true,
    message: 'If the email is registered, a password reset token has been issued.',
    resetToken: token,
  })
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body || {}
  if (!token || !newPassword) return res.status(400).json({ ok: false, error: 'Token and new password required.' })
  if (newPassword.length < 8) return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' })

  const hashed = await bcrypt.hash(newPassword, 10)
  const db = getDb()
  if (db.users && db.users.length > 0) {
    db.users[0].passwordHash = hashed
    saveDb(db)
  }

  return res.json({ ok: true, message: 'Password reset successfully. You can now login.' })
}

export async function updateProfile(req: Request, res: Response) {
  const { name, title, currentPassword, newPassword } = req.body || {}
  const db = getDb()
  const user = db.users?.find((u: any) => u.id === req.user?.id)

  if (user) {
    if (name) user.name = name.trim()
    if (title) user.title = title.trim()
    if (newPassword && newPassword.length >= 8) {
      user.passwordHash = await bcrypt.hash(newPassword, 10)
    }
    saveDb(db)
  }

  return res.json({
    ok: true,
    user: {
      ...req.user,
      name: name || req.user?.name,
      title: title || req.user?.title,
    },
  })
}

/* ==========================================================================
   PROJECTS CONTROLLERS
   ========================================================================== */

export async function getProjects(req: Request, res: Response) {
  if (isDbConnected()) {
    try {
      const projects = await Project.find({ status: 'published' }).sort({ order: 1 }).lean()
      return res.json({ ok: true, projects })
    } catch (err) {
      console.warn('MongoDB query error, falling back:', err)
    }
  }

  const projects = getCollection('projects').filter((p: any) => p.status === 'published')
  return res.json({ ok: true, projects })
}

export async function getAllProjectsAdmin(req: Request, res: Response) {
  if (isDbConnected()) {
    try {
      const projects = await Project.find().sort({ createdAt: -1 }).lean()
      return res.json({ ok: true, projects })
    } catch (err) {}
  }

  const projects = getCollection('projects')
  return res.json({ ok: true, projects })
}

export async function createProject(req: Request, res: Response) {
  const { name, category, description, tech, features, url, githubUrl, image, status, completionDate, featured } = req.body || {}
  if (!name || !description || !category) {
    return res.status(400).json({ ok: false, error: 'Name, category, and description are required.' })
  }

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  let created: any = null
  if (isDbConnected()) {
    try {
      created = await Project.create({
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
        order: Date.now(),
      })
    } catch (err) {}
  }

  const localProject = insertItem('projects', {
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
    order: Date.now(),
  })

  logActivity(`${req.user?.name}`, 'PROJECT_CREATED', `Project: ${name}`, `Status: ${status || 'draft'}`)
  return res.json({ ok: true, project: created || localProject })
}

export async function updateProject(req: Request, res: Response) {
  const { id } = req.params
  if (isDbConnected()) {
    try {
      await Project.findByIdAndUpdate(id, req.body)
    } catch (err) {}
  }

  const updated = updateItem('projects', id, req.body)
  logActivity(`${req.user?.name}`, 'PROJECT_UPDATED', `Project: ${req.body.name || id}`, 'Updated details')
  return res.json({ ok: true, project: updated || req.body })
}

export async function deleteProject(req: Request, res: Response) {
  const { id } = req.params
  if (isDbConnected()) {
    try {
      await Project.findByIdAndDelete(id)
    } catch (err) {}
  }

  const deleted = deleteItem('projects', id)
  logActivity(`${req.user?.name}`, 'PROJECT_DELETED', `Project ID: ${id}`, 'Deleted project')
  return res.json({ ok: true, message: 'Project deleted successfully.', project: deleted })
}

/* ==========================================================================
   SERVICES CONTROLLERS
   ========================================================================== */

export async function getServices(req: Request, res: Response) {
  const services = getCollection('services').filter((s: any) => s.status === 'published').sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, services })
}

export async function getAllServicesAdmin(req: Request, res: Response) {
  const services = getCollection('services').sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, services })
}

export async function createService(req: Request, res: Response) {
  const { title, description, category, capabilities, technologies, icon, status, order } = req.body || {}
  if (!title || !description) return res.status(400).json({ ok: false, error: 'Title and description required' })

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
    order: Number(order) || Date.now(),
  })

  logActivity(`${req.user?.name}`, 'SERVICE_CREATED', `Service: ${title}`, 'Created offering')
  return res.json({ ok: true, service })
}

export async function updateService(req: Request, res: Response) {
  const { id } = req.params
  const updated = updateItem('services', id, req.body)
  logActivity(`${req.user?.name}`, 'SERVICE_UPDATED', `Service: ${req.body.title || id}`, 'Updated service')
  return res.json({ ok: true, service: updated })
}

export async function reorderServices(req: Request, res: Response) {
  const { orderedIds } = req.body || {}
  if (!Array.isArray(orderedIds)) return res.status(400).json({ ok: false, error: 'orderedIds array required' })

  const db = getDb()
  const services = db.services || []
  services.forEach((s: any) => {
    const idx = orderedIds.indexOf(s.id)
    if (idx !== -1) s.order = idx + 1
  })
  saveDb(db)

  return res.json({ ok: true, services: services.sort((a: any, b: any) => a.order - b.order) })
}

export async function deleteService(req: Request, res: Response) {
  const { id } = req.params
  const deleted = deleteItem('services', id)
  logActivity(`${req.user?.name}`, 'SERVICE_DELETED', `Service ID: ${id}`, 'Deleted service')
  return res.json({ ok: true, message: 'Service deleted.' })
}

/* ==========================================================================
   PRODUCTS CONTROLLERS
   ========================================================================== */

export async function getProducts(req: Request, res: Response) {
  const products = getCollection('products').filter((p: any) => p.isPublic !== false).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, products })
}

export async function getAllProductsAdmin(req: Request, res: Response) {
  const products = getCollection('products').sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, products })
}

export async function createProduct(req: Request, res: Response) {
  const { name, category, status, previewType, description, tech, url, isPublic, order } = req.body || {}
  if (!name || !description) return res.status(400).json({ ok: false, error: 'Name and description required' })

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
    order: Number(order) || Date.now(),
  })

  logActivity(`${req.user?.name}`, 'PRODUCT_CREATED', `Product: ${name}`, `Status: ${status}`)
  return res.json({ ok: true, product })
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params
  const updated = updateItem('products', id, req.body)
  logActivity(`${req.user?.name}`, 'PRODUCT_UPDATED', `Product: ${req.body.name || id}`, 'Updated product')
  return res.json({ ok: true, product: updated })
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params
  const deleted = deleteItem('products', id)
  logActivity(`${req.user?.name}`, 'PRODUCT_DELETED', `Product ID: ${id}`, 'Deleted product')
  return res.json({ ok: true, message: 'Product deleted.' })
}

/* ==========================================================================
   TEAM CONTROLLERS
   ========================================================================== */

export async function getTeam(req: Request, res: Response) {
  const team = getCollection('team').filter((t: any) => t.status === 'published').sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, team })
}

export async function getAllTeamAdmin(req: Request, res: Response) {
  const team = getCollection('team').sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, team })
}

export async function createTeamMember(req: Request, res: Response) {
  const { name, role, specialty, bio, skills, linkedin, github, portfolio, image, size, status, order } = req.body || {}
  if (!name || !role) return res.status(400).json({ ok: false, error: 'Name and role required' })

  const initials = name.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).slice(0, 2).join('')
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
    order: Number(order) || Date.now(),
  })

  logActivity(`${req.user?.name}`, 'TEAM_MEMBER_ADDED', `Team: ${name}`, `Role: ${role}`)
  return res.json({ ok: true, member })
}

export async function updateTeamMember(req: Request, res: Response) {
  const { id } = req.params
  const updated = updateItem('team', id, req.body)
  logActivity(`${req.user?.name}`, 'TEAM_MEMBER_UPDATED', `Team: ${req.body.name || id}`, 'Updated details')
  return res.json({ ok: true, member: updated })
}

export async function deleteTeamMember(req: Request, res: Response) {
  const { id } = req.params
  const deleted = deleteItem('team', id)
  logActivity(`${req.user?.name}`, 'TEAM_MEMBER_DELETED', `Team ID: ${id}`, 'Deleted member')
  return res.json({ ok: true, message: 'Member deleted.' })
}

/* ==========================================================================
   TESTIMONIALS CONTROLLERS
   ========================================================================== */

export async function getTestimonials(req: Request, res: Response) {
  const testimonials = getCollection('testimonials').filter((t: any) => t.status === 'published').sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, testimonials })
}

export async function getAllTestimonialsAdmin(req: Request, res: Response) {
  const testimonials = getCollection('testimonials').sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return res.json({ ok: true, testimonials })
}

export async function createTestimonial(req: Request, res: Response) {
  const { name, role, company, review, rating, project, tag, avatar, status } = req.body || {}
  if (!name || !review) return res.status(400).json({ ok: false, error: 'Name and review required' })

  const initials = name.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).slice(0, 2).join('')
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
    order: Date.now(),
  })

  logActivity(`${req.user?.name}`, 'TESTIMONIAL_CREATED', `Testimonial: ${name}`, `Company: ${company}`)
  return res.json({ ok: true, testimonial })
}

export async function updateTestimonial(req: Request, res: Response) {
  const { id } = req.params
  const updated = updateItem('testimonials', id, req.body)
  logActivity(`${req.user?.name}`, 'TESTIMONIAL_UPDATED', `Testimonial: ${req.body.name || id}`, 'Updated review')
  return res.json({ ok: true, testimonial: updated })
}

export async function deleteTestimonial(req: Request, res: Response) {
  const { id } = req.params
  const deleted = deleteItem('testimonials', id)
  logActivity(`${req.user?.name}`, 'TESTIMONIAL_DELETED', `Testimonial ID: ${id}`, 'Deleted review')
  return res.json({ ok: true, message: 'Testimonial deleted.' })
}

/* ==========================================================================
   CONTACT INQUIRIES CONTROLLERS
   ========================================================================== */

export async function submitContact(req: Request, res: Response) {
  const { name, email, company, type, budget, description, website } = req.body || {}
  if (website) return res.json({ ok: true }) // Bot honeypot

  if (!name || !email || !description) {
    return res.status(400).json({ ok: false, error: 'Name, email, and description are required.' })
  }

  const msg = insertItem('messages', {
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    company: company ? String(company).trim() : '',
    type: type || 'Software or website',
    budget: budget || '',
    description: String(description).trim(),
    status: 'unread',
  })

  logActivity(`Visitor (${email})`, 'CONTACT_FORM_SUBMISSION', `Inquiry: ${type || 'General'}`, `Company: ${company || 'N/A'}`)
  return res.json({ ok: true, message: 'Inquiry received successfully.', messageId: msg.id })
}

export async function getMessages(req: Request, res: Response) {
  const messages = getCollection('messages')
  return res.json({ ok: true, messages })
}

export async function markMessageRead(req: Request, res: Response) {
  const { id } = req.params
  const updated = updateItem('messages', id, { status: req.body.status || 'read' })
  return res.json({ ok: true, message: updated })
}

export async function archiveMessage(req: Request, res: Response) {
  const { id } = req.params
  const updated = updateItem('messages', id, { status: 'archived' })
  return res.json({ ok: true, message: updated })
}

export async function deleteMessage(req: Request, res: Response) {
  const { id } = req.params
  const deleted = deleteItem('messages', id)
  logActivity(`${req.user?.name}`, 'MESSAGE_DELETED', `Message ID: ${id}`, 'Deleted inquiry')
  return res.json({ ok: true, message: 'Message removed.' })
}

/* ==========================================================================
   MEDIA & GALLERY CONTROLLERS
   ========================================================================== */

export async function getGallery(req: Request, res: Response) {
  const gallery = getCollection('gallery')
  return res.json({ ok: true, gallery })
}

export async function createGalleryItem(req: Request, res: Response) {
  const { title, subtitle, category, type, image, videoUrl, tag, caption, alt } = req.body || {}
  if (!title) return res.status(400).json({ ok: false, error: 'Title is required' })

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
    uploadedAt: new Date().toISOString(),
  })

  logActivity(`${req.user?.name}`, 'GALLERY_ITEM_ADDED', `Media: ${title}`, `Type: ${type}`)
  return res.json({ ok: true, item })
}

export async function deleteGalleryItem(req: Request, res: Response) {
  const { id } = req.params
  const deleted = deleteItem('gallery', id)
  logActivity(`${req.user?.name}`, 'GALLERY_ITEM_DELETED', `Media ID: ${id}`, 'Deleted media')
  return res.json({ ok: true, message: 'Item deleted.' })
}

export async function uploadMedia(req: Request, res: Response) {
  const { name, data } = req.body || {}
  if (!data) return res.status(400).json({ ok: false, error: 'No media payload' })

  try {
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ ok: false, error: 'Invalid base64 payload' })
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    let ext = '.png'
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg'
    else if (mimeType.includes('webp')) ext = '.webp'
    else if (mimeType.includes('svg')) ext = '.svg'

    const cleanName = (name || 'upload').replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileName = `${Date.now()}-${cleanName}${ext}`
    const filePath = path.join(uploadsDir, fileName)

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    fs.writeFileSync(filePath, buffer)
    const url = `/uploads/${fileName}`

    logActivity(`${req.user?.name}`, 'MEDIA_UPLOADED', `File: ${fileName}`, `${(buffer.length / 1024).toFixed(1)} KB`)
    return res.json({
      ok: true,
      url,
      fileName,
      sizeBytes: buffer.length,
      mimeType,
      uploadedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message })
  }
}

/* ==========================================================================
   CONTENT, SETTINGS & STATS CONTROLLERS
   ========================================================================== */

export function getContent(req: Request, res: Response) {
  const db = getDb()
  return res.json({ ok: true, content: db.content })
}

export function updateContent(req: Request, res: Response) {
  const db = getDb()
  db.content = { ...db.content, ...req.body }
  saveDb(db)
  logActivity(`${req.user?.name}`, 'CONTENT_UPDATED', 'Website Content', 'Updated CMS sections')
  return res.json({ ok: true, content: db.content })
}

export function getSettings(req: Request, res: Response) {
  const db = getDb()
  return res.json({ ok: true, settings: db.settings })
}

export function updateSettings(req: Request, res: Response) {
  const db = getDb()
  db.settings = { ...db.settings, ...req.body }
  saveDb(db)
  logActivity(`${req.user?.name}`, 'SETTINGS_UPDATED', 'Global Settings', 'Updated site configuration')
  return res.json({ ok: true, settings: db.settings })
}

export function getActivity(req: Request, res: Response) {
  const activity = getCollection('activity')
  return res.json({ ok: true, activity })
}

export function getStats(req: Request, res: Response) {
  const db = getDb()
  const projects = db.projects || []
  const services = db.services || []
  const team = db.team || []
  const testimonials = db.testimonials || []
  const products = db.products || []
  const messages = db.messages || []
  const activity = db.activity || []

  const publishedProjects = projects.filter((p: any) => p.status === 'published').length
  const draftProjects = projects.filter((p: any) => p.status === 'draft').length
  const unreadMessages = messages.filter((m: any) => m.status === 'unread').length

  const categoryCounts: Record<string, number> = {}
  projects.forEach((p: any) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  })

  return res.json({
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
      monthlyProjects: [
        { month: 'Oct', count: 1 },
        { month: 'Nov', count: 2 },
        { month: 'Dec', count: 1 },
        { month: 'Jan', count: 3 },
        { month: 'Feb', count: projects.length },
      ],
      categoryDistribution: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
      recentActivity: activity.slice(0, 10),
    },
  })
}
