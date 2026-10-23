import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import * as Ctrl from '../controllers/apiController.js'

const router = Router()

// Rate limiter for contact form & login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  message: { ok: false, error: 'Too many requests. Please try again in a few minutes.' },
})

/* ==========================================================================
   PUBLIC ROUTES
   ========================================================================== */
router.get('/health', (_req, res) => res.json({ ok: true, status: 'online', timestamp: new Date() }))
router.get('/settings', Ctrl.getSettings)
router.get('/content', Ctrl.getContent)
router.get('/projects', Ctrl.getProjects)
router.get('/services', Ctrl.getServices)
router.get('/products', Ctrl.getProducts)
router.get('/team', Ctrl.getTeam)
router.get('/testimonials', Ctrl.getTestimonials)
router.get('/gallery', Ctrl.getGallery)
router.post('/contact', authLimiter, Ctrl.submitContact)

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */
router.post('/auth/login', authLimiter, Ctrl.login)
router.post('/auth/logout', Ctrl.logout)
router.get('/auth/me', authenticateToken, Ctrl.getCurrentUser)
router.post('/auth/forgot-password', Ctrl.forgotPassword)
router.post('/auth/reset-password', Ctrl.resetPassword)
router.put('/auth/profile', authenticateToken, Ctrl.updateProfile)

// Legacy alias for admin auth
router.post('/admin/login', authLimiter, Ctrl.login)
router.post('/admin/logout', Ctrl.logout)
router.get('/admin/me', authenticateToken, Ctrl.getCurrentUser)
router.post('/admin/forgot-password', Ctrl.forgotPassword)
router.post('/admin/reset-password', Ctrl.resetPassword)
router.put('/admin/profile', authenticateToken, Ctrl.updateProfile)

/* ==========================================================================
   PROTECTED ADMIN DASHBOARD ROUTES
   ========================================================================== */

// Dashboard Stats & Activity
router.get('/admin/stats', authenticateToken, Ctrl.getStats)
router.get('/admin/activity', authenticateToken, Ctrl.getActivity)

// Projects
router.get('/admin/projects', authenticateToken, Ctrl.getAllProjectsAdmin)
router.post('/admin/projects', authenticateToken, Ctrl.createProject)
router.put('/admin/projects/:id', authenticateToken, Ctrl.updateProject)
router.delete('/admin/projects/:id', authenticateToken, requireRole(['admin']), Ctrl.deleteProject)

// Services
router.get('/admin/services', authenticateToken, Ctrl.getAllServicesAdmin)
router.post('/admin/services', authenticateToken, Ctrl.createService)
router.put('/admin/services/:id', authenticateToken, Ctrl.updateService)
router.put('/admin/services-reorder', authenticateToken, Ctrl.reorderServices)
router.delete('/admin/services/:id', authenticateToken, requireRole(['admin']), Ctrl.deleteService)

// Products
router.get('/admin/products', authenticateToken, Ctrl.getAllProductsAdmin)
router.post('/admin/products', authenticateToken, Ctrl.createProduct)
router.put('/admin/products/:id', authenticateToken, Ctrl.updateProduct)
router.delete('/admin/products/:id', authenticateToken, requireRole(['admin']), Ctrl.deleteProduct)

// Team
router.get('/admin/team', authenticateToken, Ctrl.getAllTeamAdmin)
router.post('/admin/team', authenticateToken, Ctrl.createTeamMember)
router.put('/admin/team/:id', authenticateToken, Ctrl.updateTeamMember)
router.delete('/admin/team/:id', authenticateToken, requireRole(['admin']), Ctrl.deleteTeamMember)

// Testimonials
router.get('/admin/testimonials', authenticateToken, Ctrl.getAllTestimonialsAdmin)
router.post('/admin/testimonials', authenticateToken, Ctrl.createTestimonial)
router.put('/admin/testimonials/:id', authenticateToken, Ctrl.updateTestimonial)
router.delete('/admin/testimonials/:id', authenticateToken, requireRole(['admin']), Ctrl.deleteTestimonial)

// Contact Messages Inbox
router.get('/admin/messages', authenticateToken, Ctrl.getMessages)
router.put('/admin/messages/:id/read', authenticateToken, Ctrl.markMessageRead)
router.put('/admin/messages/:id/archive', authenticateToken, Ctrl.archiveMessage)
router.delete('/admin/messages/:id', authenticateToken, requireRole(['admin']), Ctrl.deleteMessage)

// Gallery & Media Uploads
router.get('/admin/gallery', authenticateToken, Ctrl.getGallery)
router.post('/admin/gallery', authenticateToken, Ctrl.createGalleryItem)
router.delete('/admin/gallery/:id', authenticateToken, requireRole(['admin']), Ctrl.deleteGalleryItem)
router.post('/admin/media/upload', authenticateToken, Ctrl.uploadMedia)

// Website Content CMS
router.get('/admin/content', authenticateToken, Ctrl.getContent)
router.put('/admin/content', authenticateToken, Ctrl.updateContent)

// Global Settings
router.get('/admin/settings', authenticateToken, Ctrl.getSettings)
router.put('/admin/settings', authenticateToken, requireRole(['admin']), Ctrl.updateSettings)

export default router
