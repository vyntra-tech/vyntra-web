import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type {
  AdminStats,
  AdminUser,
  ActivityLog,
  ClientReview,
  ContactMessage,
  GalleryItem,
  Offering,
  Showcase,
  SiteSettings,
  TeamMember,
  WebsiteContent,
  MediaUploadResult,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
})

// Request Interceptor: inject Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('vyntra_admin_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: handle 401 and errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ ok?: boolean; error?: string }>) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginEndpoint) {
      // Clear expired credentials if on admin routes
      const path = window.location.pathname
      if (path.startsWith('/admin') && path !== '/admin/login') {
        localStorage.removeItem('vyntra_admin_token')
        localStorage.removeItem('vyntra_admin_user')
        window.location.href = '/admin/login'
      }
    }
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: AdminUser }> => {
    const res = await apiClient.post('/auth/login', { email, password })
    return res.data
  },
  getCurrentUser: async (): Promise<{ user: AdminUser }> => {
    const res = await apiClient.get('/auth/me')
    return res.data
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
  forgotPassword: async (email: string): Promise<{ message: string; resetToken?: string }> => {
    const res = await apiClient.post('/auth/forgot-password', { email })
    return res.data
  },
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/reset-password', { token, newPassword })
    return res.data
  },
  updateProfile: async (data: { name?: string; title?: string; currentPassword?: string; newPassword?: string }): Promise<{ user: AdminUser }> => {
    const res = await apiClient.put('/auth/profile', data)
    return res.data
  },
}

/* ==========================================================================
   DASHBOARD STATS & AUDIT LOG API
   ========================================================================== */
export const statsApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get('/admin/stats')
    return res.data.stats
  },
  getActivity: async (): Promise<ActivityLog[]> => {
    const res = await apiClient.get('/admin/activity')
    return res.data.activity
  },
}

/* ==========================================================================
   PROJECTS API
   ========================================================================== */
export const projectsApi = {
  getPublic: async (): Promise<Showcase[]> => {
    const res = await apiClient.get('/projects')
    return res.data.projects
  },
  getAllAdmin: async (): Promise<Showcase[]> => {
    const res = await apiClient.get('/admin/projects')
    return res.data.projects
  },
  create: async (data: Partial<Showcase>): Promise<Showcase> => {
    const res = await apiClient.post('/admin/projects', data)
    return res.data.project
  },
  update: async (id: string, data: Partial<Showcase>): Promise<Showcase> => {
    const res = await apiClient.put(`/admin/projects/${id}`, data)
    return res.data.project
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/projects/${id}`)
  },
}

/* ==========================================================================
   SERVICES API
   ========================================================================== */
export const servicesApi = {
  getPublic: async (): Promise<Offering[]> => {
    const res = await apiClient.get('/services')
    return res.data.services
  },
  getAllAdmin: async (): Promise<Offering[]> => {
    const res = await apiClient.get('/admin/services')
    return res.data.services
  },
  create: async (data: Partial<Offering>): Promise<Offering> => {
    const res = await apiClient.post('/admin/services', data)
    return res.data.service
  },
  update: async (id: string, data: Partial<Offering>): Promise<Offering> => {
    const res = await apiClient.put(`/admin/services/${id}`, data)
    return res.data.service
  },
  reorder: async (orderedIds: string[]): Promise<Offering[]> => {
    const res = await apiClient.put('/admin/services-reorder', { orderedIds })
    return res.data.services
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/services/${id}`)
  },
}

/* ==========================================================================
   PRODUCTS API
   ========================================================================== */
export const productsApi = {
  getPublic: async (): Promise<Showcase[]> => {
    const res = await apiClient.get('/products')
    return res.data.products
  },
  getAllAdmin: async (): Promise<Showcase[]> => {
    const res = await apiClient.get('/admin/products')
    return res.data.products
  },
  create: async (data: Partial<Showcase>): Promise<Showcase> => {
    const res = await apiClient.post('/admin/products', data)
    return res.data.product
  },
  update: async (id: string, data: Partial<Showcase>): Promise<Showcase> => {
    const res = await apiClient.put(`/admin/products/${id}`, data)
    return res.data.product
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`)
  },
}

/* ==========================================================================
   TEAM MEMBERS API
   ========================================================================== */
export const teamApi = {
  getPublic: async (): Promise<TeamMember[]> => {
    const res = await apiClient.get('/team')
    return res.data.team
  },
  getAllAdmin: async (): Promise<TeamMember[]> => {
    const res = await apiClient.get('/admin/team')
    return res.data.team
  },
  create: async (data: Partial<TeamMember>): Promise<TeamMember> => {
    const res = await apiClient.post('/admin/team', data)
    return res.data.member
  },
  update: async (id: string, data: Partial<TeamMember>): Promise<TeamMember> => {
    const res = await apiClient.put(`/admin/team/${id}`, data)
    return res.data.member
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/team/${id}`)
  },
}

/* ==========================================================================
   TESTIMONIALS API
   ========================================================================== */
export const testimonialsApi = {
  getPublic: async (): Promise<ClientReview[]> => {
    const res = await apiClient.get('/testimonials')
    return res.data.testimonials
  },
  getAllAdmin: async (): Promise<ClientReview[]> => {
    const res = await apiClient.get('/admin/testimonials')
    return res.data.testimonials
  },
  create: async (data: Partial<ClientReview>): Promise<ClientReview> => {
    const res = await apiClient.post('/admin/testimonials', data)
    return res.data.testimonial
  },
  update: async (id: string, data: Partial<ClientReview>): Promise<ClientReview> => {
    const res = await apiClient.put(`/admin/testimonials/${id}`, data)
    return res.data.testimonial
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/testimonials/${id}`)
  },
}

/* ==========================================================================
   CONTACT INQUIRIES API
   ========================================================================== */
export const contactApi = {
  submit: async (data: {
    name: string
    email: string
    company?: string
    type: string
    budget?: string
    description: string
    website?: string
  }): Promise<{ message: string; messageId?: string }> => {
    const res = await apiClient.post('/contact', data)
    return res.data
  },
  getAllAdmin: async (): Promise<ContactMessage[]> => {
    const res = await apiClient.get('/admin/messages')
    return res.data.messages
  },
  markRead: async (id: string, status: 'read' | 'unread' = 'read'): Promise<ContactMessage> => {
    const res = await apiClient.put(`/admin/messages/${id}/read`, { status })
    return res.data.message
  },
  archive: async (id: string): Promise<ContactMessage> => {
    const res = await apiClient.put(`/admin/messages/${id}/archive`)
    return res.data.message
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/messages/${id}`)
  },
}

/* ==========================================================================
   GALLERY & MEDIA UPLOADS API
   ========================================================================== */
export const galleryApi = {
  getPublic: async (): Promise<GalleryItem[]> => {
    const res = await apiClient.get('/gallery')
    return res.data.gallery
  },
  getAllAdmin: async (): Promise<GalleryItem[]> => {
    const res = await apiClient.get('/admin/gallery')
    return res.data.gallery
  },
  create: async (data: Partial<GalleryItem>): Promise<GalleryItem> => {
    const res = await apiClient.post('/admin/gallery', data)
    return res.data.item
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/gallery/${id}`)
  },
  uploadMedia: async (name: string, dataUrl: string): Promise<MediaUploadResult> => {
    const res = await apiClient.post('/admin/media/upload', { name, data: dataUrl })
    return res.data
  },
}

/* ==========================================================================
   WEBSITE CONTENT CMS API
   ========================================================================== */
export const contentApi = {
  get: async (): Promise<WebsiteContent> => {
    const res = await apiClient.get('/content')
    return res.data.content
  },
  update: async (data: Partial<WebsiteContent>): Promise<WebsiteContent> => {
    const res = await apiClient.put('/admin/content', data)
    return res.data.content
  },
}

/* ==========================================================================
   SETTINGS API
   ========================================================================== */
export const settingsApi = {
  get: async (): Promise<SiteSettings> => {
    const res = await apiClient.get('/settings')
    return res.data.settings
  },
  update: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await apiClient.put('/admin/settings', data)
    return res.data.settings
  },
}
