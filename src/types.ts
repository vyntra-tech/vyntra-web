export interface Offering {
  id?: string
  title: string
  slug?: string
  category?: string
  icon?: string
  description: string
  capabilities: string[]
  technologies?: string[]
  status?: 'published' | 'draft'
  order?: number
  createdAt?: string
}

export interface Showcase {
  id?: string
  name: string
  slug?: string
  category: string
  description: string
  tech: string[]
  features?: string[]
  url?: string
  githubUrl?: string
  placeholder?: boolean
  image?: string
  status?: 'published' | 'draft' | 'archived' | 'In Development' | 'Planned' | string
  previewType?: 'cloud' | 'ai' | 'studio'
  completionDate?: string
  featured?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

export interface Step {
  title: string
  text: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
  image: string
  imagePosition?: string
  specialty?: string
  bio?: string
  skills?: string[]
  linkedin?: string
  github?: string
  portfolio?: string
  size?: 'large' | 'medium' | 'small'
  status?: 'published' | 'hidden'
  order?: number
}

export interface ClientReview {
  id: string
  name: string
  role: string
  company: string
  initials: string
  rating: number
  review: string
  project: string
  tag: string
  avatar?: string
  status?: 'published' | 'draft'
  order?: number
}

export interface GalleryItem {
  id: string
  title: string
  subtitle?: string
  category: 'story' | 'celebration' | 'mentorship' | 'stat' | 'community'
  type: 'image' | 'video' | 'stat'
  image?: string
  videoUrl?: string
  tag?: string
  captionBadge?: string
  caption?: string
  statNumber?: string
  statUnit?: string
  statLabel?: string
  alt: string
  uploadedAt?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor'
  avatar?: string
  title?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  company?: string
  type: string
  budget?: string
  description: string
  status: 'unread' | 'read' | 'archived'
  createdAt: string
}

export interface ActivityLog {
  id: string
  actor: string
  action: string
  target: string
  details?: string
  timestamp: string
}

export interface SiteSettings {
  siteName: string
  tagline: string
  contactEmail: string
  supportEmail: string
  phone: string
  whatsapp: string
  address: string
  socials: { label: string; url: string }[]
  privacyUrl: string
  termsUrl: string
}

export interface WebsiteContent {
  hero: {
    tagline: string
    title: string
    subtitle: string
    primaryCtaLabel: string
    primaryCtaUrl: string
    secondaryCtaLabel: string
    secondaryCtaUrl: string
  }
  about: {
    label: string
    heading: string
    description: string
    stats: { value: string; label: string }[]
    ctaText: string
    ctaHref: string
    video: {
      src: string
      poster?: string
      caption: string
    }
  }
  vision: {
    heading: string
    statement: string
  }
  seo: {
    title: string
    description: string
    keywords: string
    ogTitle: string
    ogDescription: string
    ogImage?: string
  }
}

export interface AdminStats {
  totalProjects: number
  publishedProjects: number
  draftProjects: number
  totalServices: number
  totalTeam: number
  totalTestimonials: number
  totalProducts: number
  unreadMessages: number
  totalMessages: number
  monthlyProjects: { month: string; count: number }[]
  categoryDistribution: { category: string; count: number }[]
  recentActivity: ActivityLog[]
}

export interface MediaUploadResult {
  ok: boolean
  url: string
  fileName: string
  sizeBytes: number
  mimeType: string
  uploadedAt: string
}
