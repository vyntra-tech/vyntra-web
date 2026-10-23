import mongoose, { Schema, Document, Model } from 'mongoose'

/* ==========================================================================
   USER MODEL
   ========================================================================== */
export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'editor'
  avatar?: string
  title?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
    avatar: { type: String, default: '' },
    title: { type: String, default: 'Team Lead' },
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

/* ==========================================================================
   PROJECT MODEL
   ========================================================================== */
export interface IProject extends Document {
  name: string
  slug: string
  category: string
  description: string
  tech: string[]
  features: string[]
  image?: string
  url?: string
  githubUrl?: string
  status: 'draft' | 'published' | 'archived'
  completionDate?: string
  featured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tech: { type: [String], default: [] },
    features: { type: [String], default: [] },
    image: { type: String, default: '' },
    url: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    completionDate: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

/* ==========================================================================
   SERVICE MODEL
   ========================================================================== */
export interface IService extends Document {
  title: string
  slug: string
  category: string
  icon: string
  description: string
  capabilities: string[]
  technologies: string[]
  status: 'published' | 'draft'
  order: number
  createdAt: Date
  updatedAt: Date
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, default: 'Web and Software Development' },
    icon: { type: String, default: 'Code2' },
    description: { type: String, required: true },
    capabilities: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema)

/* ==========================================================================
   PRODUCT MODEL
   ========================================================================== */
export interface IProduct extends Document {
  name: string
  slug: string
  category: string
  status: 'Planned' | 'In Development' | 'Live' | 'Beta'
  previewType: string
  description: string
  tech: string[]
  url?: string
  isPublic: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, default: 'Digital Products' },
    status: { type: String, enum: ['Planned', 'In Development', 'Live', 'Beta'], default: 'In Development' },
    previewType: { type: String, default: 'cloud' },
    description: { type: String, required: true },
    tech: { type: [String], default: [] },
    url: { type: String, default: '' },
    isPublic: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

/* ==========================================================================
   TEAM MEMBER MODEL
   ========================================================================== */
export interface ITeamMember extends Document {
  name: string
  role: string
  initials: string
  image: string
  imagePosition?: string
  specialty?: string
  bio?: string
  skills: string[]
  linkedin?: string
  github?: string
  portfolio?: string
  size: 'large' | 'medium' | 'small'
  status: 'published' | 'hidden'
  order: number
  createdAt: Date
  updatedAt: Date
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    initials: { type: String, required: true },
    image: { type: String, default: '' },
    imagePosition: { type: String, default: 'center 20%' },
    specialty: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    size: { type: String, enum: ['large', 'medium', 'small'], default: 'medium' },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const TeamMember: Model<ITeamMember> = mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema)

/* ==========================================================================
   TESTIMONIAL MODEL
   ========================================================================== */
export interface ITestimonial extends Document {
  name: string
  role: string
  company: string
  initials: string
  rating: number
  review: string
  project: string
  tag: string
  avatar?: string
  status: 'published' | 'draft'
  order: number
  createdAt: Date
  updatedAt: Date
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: 'Client' },
    company: { type: String, default: '' },
    initials: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    review: { type: String, required: true },
    project: { type: String, default: '' },
    tag: { type: String, default: 'Client Feedback' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Testimonial: Model<ITestimonial> = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema)

/* ==========================================================================
   CONTACT MESSAGE MODEL
   ========================================================================== */
export interface IContactMessage extends Document {
  name: string
  email: string
  company?: string
  type: string
  budget?: string
  description: string
  status: 'unread' | 'read' | 'archived'
  createdAt: Date
  updatedAt: Date
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, default: '' },
    type: { type: String, default: 'Software or website' },
    budget: { type: String, default: '' },
    description: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread' },
  },
  { timestamps: true }
)

export const ContactMessage: Model<IContactMessage> = mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema)

/* ==========================================================================
   GALLERY ITEM MODEL
   ========================================================================== */
export interface IGalleryItem extends Document {
  title: string
  subtitle?: string
  category: 'story' | 'celebration' | 'mentorship' | 'stat' | 'community'
  type: 'image' | 'video' | 'stat'
  image?: string
  videoUrl?: string
  tag?: string
  caption?: string
  statNumber?: string
  statUnit?: string
  statLabel?: string
  alt: string
  createdAt: Date
  updatedAt: Date
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    category: { type: String, enum: ['story', 'celebration', 'mentorship', 'stat', 'community'], default: 'story' },
    type: { type: String, enum: ['image', 'video', 'stat'], default: 'image' },
    image: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    tag: { type: String, default: 'VYNTRA' },
    caption: { type: String, default: '' },
    statNumber: { type: String, default: '' },
    statUnit: { type: String, default: '' },
    statLabel: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  { timestamps: true }
)

export const GalleryItem: Model<IGalleryItem> = mongoose.models.GalleryItem || mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema)

/* ==========================================================================
   ACTIVITY LOG MODEL
   ========================================================================== */
export interface IActivityLog extends Document {
  actor: string
  action: string
  target: string
  details?: string
  timestamp: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    actor: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)
