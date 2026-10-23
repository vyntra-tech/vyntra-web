import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Password hashing utility using Node.js native crypto scrypt
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false
  const [salt, key] = storedHash.split(':')
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(keyBuffer, derivedKey)
}

// Generate secure random auth token
export function generateToken(payload = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url')
  const secret = process.env.JWT_SECRET || 'vyntra-super-secure-production-key-2026'
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts
  const secret = process.env.JWT_SECRET || 'vyntra-super-secure-production-key-2026'
  const expectedSignature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  
  if (signature !== expectedSignature) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

// Initial seed data representing real VYNTRA content
function getInitialSeedData() {
  const adminPasswordHash = hashPassword('VyntraAdmin@2026!')
  const editorPasswordHash = hashPassword('VyntraEditor@2026!')

  return {
    users: [
      {
        id: 'usr-admin-1',
        name: 'Chandrabhan Gadeshwar',
        email: 'admin@vyntra.tech',
        passwordHash: adminPasswordHash,
        role: 'admin',
        avatar: '/src/assets/chandrabhan.jpg',
        title: 'Founder & Chief Architect',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-editor-1',
        name: 'Editorial Team',
        email: 'editor@vyntra.tech',
        passwordHash: editorPasswordHash,
        role: 'editor',
        avatar: '/src/assets/shubham.jpg',
        title: 'Content & Design Lead',
        createdAt: new Date().toISOString()
      }
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Purulia Travels',
        slug: 'purulia-travels',
        category: 'Web Applications',
        description: 'Modern travel website featuring premium UI/UX, destination exploration, and a responsive browsing experience.',
        tech: ['React', 'JavaScript', 'CSS', 'Vite'],
        features: ['Interactive Destination Maps', 'Dynamic Booking Inquiries', 'Mobile-First Responsive Layout', 'Sub-second Load Times'],
        placeholder: false,
        image: '/src/assets/Purulia.png',
        url: 'https://puruliatravelsfinal.netlify.app/',
        githubUrl: 'https://github.com/vyntra-tech/purulia-travels',
        status: 'published',
        completionDate: '2026-02-15',
        featured: true,
        order: 1,
        createdAt: '2026-02-15T10:00:00.000Z',
        updatedAt: '2026-02-20T14:30:00.000Z'
      },
      {
        id: 'proj-2',
        name: 'Hangry',
        slug: 'hangry-delivery',
        category: 'Mobile Applications',
        description: 'Modern food delivery platform focused on convenient food ordering, responsive interfaces, and a smooth user experience.',
        tech: ['React', 'JavaScript', 'CSS', 'Redux'],
        features: ['Real-time Cart Management', 'Live Order Status Tracking', 'Restaurant Filtering & Search', 'Interactive Menu Cards'],
        placeholder: false,
        image: '/src/assets/Hangry.png',
        url: 'https://hangry-frontend-seven.vercel.app/',
        githubUrl: 'https://github.com/vyntra-tech/hangry-app',
        status: 'published',
        completionDate: '2026-01-20',
        featured: true,
        order: 2,
        createdAt: '2026-01-20T08:00:00.000Z',
        updatedAt: '2026-02-10T11:00:00.000Z'
      },
      {
        id: 'proj-3',
        name: 'UniBill Pro',
        slug: 'unibill-pro',
        category: 'SaaS Products',
        description: 'Smart billing and invoice management platform designed to simplify billing workflows for modern businesses and startups.',
        tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
        features: ['Automated GST & Tax Invoicing', 'Client Ledger Management', 'PDF Export & Emailing', 'Real-time Financial Telemetry'],
        placeholder: false,
        image: '/src/assets/UniBill-Photo.png',
        url: 'https://unibillpro.devforge.in/',
        githubUrl: 'https://github.com/vyntra-tech/unibill-pro',
        status: 'published',
        completionDate: '2025-12-10',
        featured: true,
        order: 3,
        createdAt: '2025-12-10T09:00:00.000Z',
        updatedAt: '2026-01-15T16:20:00.000Z'
      },
      {
        id: 'proj-4',
        name: 'Namaste Cafe',
        slug: 'namaste-cafe',
        category: 'Web Applications',
        description: 'Premium restaurant website with modern UI, smooth animations, responsive design, and a seamless food ordering experience.',
        tech: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        features: ['Digital QR Menu', 'Table Reservation Engine', 'Micro-interactions & Video Hero', 'Chef Specialties Showcase'],
        placeholder: false,
        image: '/src/assets/Namaste.png',
        url: 'https://namatecafe.web.app/',
        githubUrl: 'https://github.com/vyntra-tech/namaste-cafe',
        status: 'published',
        completionDate: '2025-11-28',
        featured: true,
        order: 4,
        createdAt: '2025-11-28T12:00:00.000Z',
        updatedAt: '2026-02-01T09:45:00.000Z'
      },
      {
        id: 'proj-5',
        name: 'CogniPulse AI Platform',
        slug: 'cognipulse-ai',
        category: 'AI Solutions',
        description: 'Autonomous document parsing and agentic reasoning workflow engine designed for high-throughput enterprise pipelines.',
        tech: ['Python', 'FastAPI', 'LangChain', 'React', 'Docker'],
        features: ['Multi-agent Coordination', 'Zero-shot Document Vectorization', 'Semantic Search', 'Audit Trail'],
        placeholder: false,
        image: '',
        url: '',
        githubUrl: '',
        status: 'draft',
        completionDate: '2026-03-30',
        featured: false,
        order: 5,
        createdAt: '2026-02-18T10:00:00.000Z',
        updatedAt: '2026-02-22T17:10:00.000Z'
      }
    ],
    services: [
      {
        id: 'srv-1',
        title: 'AI Solutions & AI Integration',
        slug: 'ai-solutions-integration',
        category: 'AI Solutions',
        icon: 'Bot',
        description: 'We engineer custom AI models, autonomous agents, and LLM-powered integrations that transform enterprise workflows into intelligent, automated systems.',
        capabilities: [
          'Custom AI Agents & Workflows',
          'LLM Integration & Fine-Tuning',
          'AI Chatbots & Assistants',
          'Intelligent Document Processing',
          'Predictive Analytics & ML Pipelines',
          'Enterprise AI Governance & Safety'
        ],
        technologies: ['OpenAI', 'LangChain', 'Python', 'FastAPI', 'PyTorch', 'Vector DBs'],
        status: 'published',
        order: 1,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'srv-2',
        title: 'Cloud Computing & Deployment',
        slug: 'cloud-computing-deployment',
        category: 'Cloud Infrastructure',
        icon: 'Cloud',
        description: 'Architecting resilient, secure, and auto-scaling cloud foundations across AWS, GCP, and modern edge networks designed for maximum uptime and cost efficiency.',
        capabilities: [
          'Cloud Architecture & Migration',
          'Multi-Region & Edge Deployments',
          'Container Orchestration (Docker & K8s)',
          'Serverless & Microservices',
          'Cloud Cost Optimization',
          'Disaster Recovery & High Availability'
        ],
        technologies: ['AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Cloudflare'],
        status: 'published',
        order: 2,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'srv-3',
        title: 'Software Development',
        slug: 'software-development',
        category: 'Web and Software Development',
        icon: 'Code2',
        description: 'Full-cycle custom software engineering delivering high-performance web applications, enterprise systems, and bespoke digital platforms built for scale.',
        capabilities: [
          'Enterprise Web Applications',
          'Full-Stack Engineering (React, Node, TypeScript)',
          'Modern REST & GraphQL APIs',
          'Database Architecture & Caching',
          'Performance & Core Web Vitals',
          'Legacy Codebase Modernization'
        ],
        technologies: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis'],
        status: 'published',
        order: 3,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'srv-4',
        title: 'Developer Tools & Automation',
        slug: 'developer-tools-automation',
        category: 'DevOps and Automation',
        icon: 'Terminal',
        description: 'Custom internal developer platforms, CLI utilities, code generators, and automated developer workflows that accelerate engineering velocity.',
        capabilities: [
          'Custom CLI Tools & Utilities',
          'Engineering Workflow Automation',
          'Code Generation & Scaffolding Tools',
          'Internal Engineering Portals',
          'Automated Testing Frameworks',
          'API Documentation & SDK Tooling'
        ],
        technologies: ['Node.js CLI', 'Go', 'Bash', 'GitHub Actions', 'Jest', 'Playwright'],
        status: 'published',
        order: 4,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'srv-5',
        title: 'DevOps & CI/CD Solutions',
        slug: 'devops-cicd-solutions',
        category: 'DevOps and Automation',
        icon: 'Cpu',
        description: 'Automating software delivery with rock-solid CI/CD pipelines, GitOps workflows, zero-downtime deployment strategies, and observability.',
        capabilities: [
          'Automated CI/CD Pipelines (GitHub Actions)',
          'Infrastructure as Code (Terraform)',
          'Zero-Downtime Blue/Green Deployments',
          'Real-Time Logging & Monitoring',
          'Automated Security Scanning',
          'Incident Response & Rollback Systems'
        ],
        technologies: ['GitHub Actions', 'ArgoCD', 'Prometheus', 'Grafana', 'Sentry'],
        status: 'published',
        order: 5,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'srv-6',
        title: 'SaaS Product Development',
        slug: 'saas-product-development',
        category: 'Web and Software Development',
        icon: 'Layers',
        description: 'Transforming ambitious product concepts into venture-ready SaaS platforms with modular multi-tenant architecture, billing integration, and rapid MVP iteration.',
        capabilities: [
          'Multi-Tenant SaaS Architecture',
          'Subscription & Billing Integration',
          'Role-Based Access Control (RBAC)',
          'Analytics & Telemetry Dashboards',
          'Rapid MVP Prototyping & Launch',
          'Scalable Cloud Backend Systems'
        ],
        technologies: ['Stripe', 'Supabase', 'PostgreSQL', 'React', 'Node.js', 'Tailwind'],
        status: 'published',
        order: 6,
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    team: [
      {
        id: 'chandrabhan-gadeshwar',
        name: 'Chandrabhan Gadeshwar',
        role: 'Founder & CEO',
        initials: 'CG',
        image: '/src/assets/chandrabhan.jpg',
        imagePosition: 'center 20%',
        specialty: 'Executive Leadership & Cloud Architecture',
        bio: 'Pioneering modern distributed web architectures, executive leadership, and cloud-native solutions with over 8 years of engineering leadership.',
        skills: ['Cloud Architecture', 'React', 'Node.js', 'AWS', 'Kubernetes'],
        linkedin: 'https://www.linkedin.com/in/chandu7a7/',
        github: 'https://github.com/chandu7a7',
        portfolio: '',
        size: 'large',
        status: 'published',
        order: 1
      },
      {
        id: 'shubham-uprade',
        name: 'Shubham Uprade',
        role: 'Co-Founder & CTO',
        initials: 'SU',
        image: '/src/assets/shubham.jpg',
        imagePosition: 'center 12%',
        specialty: 'Technology Strategy, Engineering & Systems Architecture',
        bio: 'Directing technology strategy, scalable frontend/backend systems, high-performance architecture, and pixel-perfect digital experiences.',
        skills: ['UI/UX Systems', 'Figma', 'React', 'TypeScript', 'Animation'],
        linkedin: 'https://www.linkedin.com/in/shubham-uprade-092542278/',
        github: 'https://github.com/shubham-uprade',
        portfolio: '',
        size: 'medium',
        status: 'published',
        order: 2
      },
      {
        id: 'sanjay-sende',
        name: 'Sanjay Sende',
        role: 'Full Stack Developer',
        initials: 'SS',
        image: '/src/assets/sanju.jpg',
        imagePosition: 'center 20%',
        specialty: 'Digital Products & SaaS Development',
        bio: 'Architecting end-to-end full stack web platforms, real-time database models, and modern SaaS products.',
        skills: ['Full Stack', 'Next.js', 'Express', 'MongoDB', 'Tailwind'],
        linkedin: 'https://www.linkedin.com/in/sanjay-sende-20a3b3278/',
        github: 'https://github.com/sanjay-sende',
        portfolio: '',
        size: 'small',
        status: 'published',
        order: 3
      },
      {
        id: 'nikhil-waghade',
        name: 'Nikhil Waghade',
        role: 'Backend Systems Engineer',
        initials: 'NW',
        image: '/src/assets/nikhil.jpg',
        imagePosition: 'center 15%',
        specialty: 'Backend Services & Database Architecture',
        bio: 'Specializing in resilient REST & GraphQL services, high-concurrency microservices, and secure API gateways.',
        skills: ['Go', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
        linkedin: 'https://www.linkedin.com/in/nikhil-waghade',
        github: 'https://github.com/nikhil-waghade',
        portfolio: '',
        size: 'medium',
        status: 'published',
        order: 4
      },
      {
        id: 'dharamchand-patle',
        name: 'Dharamchand Patle',
        role: 'AI Solutions Engineer',
        initials: 'DP',
        image: '/src/assets/dharam.png',
        imagePosition: 'center 18%',
        specialty: 'AI Solutions & Full Stack Systems',
        bio: 'Integrating LLM agents, vector databases, and cognitive workflow automation into enterprise digital products.',
        skills: ['Python', 'FastAPI', 'LangChain', 'PyTorch', 'React'],
        linkedin: 'https://www.linkedin.com/in/dharamchand-patle',
        github: 'https://github.com/dharamchand-patle',
        portfolio: '',
        size: 'medium',
        status: 'published',
        order: 5
      }
    ],
    testimonials: [
      {
        id: 'rev-1',
        name: 'Aarav Sharma',
        role: 'Founder',
        company: 'Namaste Cafe',
        initials: 'AS',
        rating: 5,
        review: 'VYNTRA transformed our brand into an extraordinary digital experience. Online orders surged by 45% within the first month.',
        project: 'Restaurant Digital Platform',
        tag: 'Web Architecture',
        avatar: '',
        status: 'published',
        order: 1
      },
      {
        id: 'rev-2',
        name: 'Priya Patel',
        role: 'Head of Product',
        company: 'UniBill Pro',
        initials: 'PP',
        rating: 5,
        review: 'They architected a scalable SaaS billing platform that easily handles tens of thousands of daily transactions with zero downtime.',
        project: 'Billing SaaS Platform',
        tag: 'SaaS Engineering',
        avatar: '',
        status: 'published',
        order: 2
      },
      {
        id: 'rev-3',
        name: 'Rohan Deshmukh',
        role: 'Managing Director',
        company: 'Purulia Travels',
        initials: 'RD',
        rating: 5,
        review: 'The team delivered a modern, lightning-fast UI that our travelers love. Punctual, responsive, and reliable execution throughout.',
        project: 'Travel & Tourism Portal',
        tag: 'UI/UX & Frontend',
        avatar: '',
        status: 'published',
        order: 3
      },
      {
        id: 'rev-4',
        name: 'Sneha Gupta',
        role: 'Co-Founder',
        company: 'Hangry Delivery',
        initials: 'SG',
        rating: 5,
        review: 'Engineered our MVP in record time with zero compromise on code quality. Their proactive approach gave us a real competitive edge.',
        project: 'Food Delivery Platform',
        tag: 'MVP Development',
        avatar: '',
        status: 'published',
        order: 4
      },
      {
        id: 'rev-5',
        name: 'Vikram Malhotra',
        role: 'CEO',
        company: 'NexaFlow AI',
        initials: 'VM',
        rating: 5,
        review: 'Rare engineers who understand both cutting-edge AI integrations and pixel-perfect design. They act as true product partners.',
        project: 'AI Workflow Automation',
        tag: 'AI Solutions',
        avatar: '',
        status: 'published',
        order: 5
      },
      {
        id: 'rev-6',
        name: 'Ananya Roy',
        role: 'VP of Technology',
        company: 'PayZenith',
        initials: 'AR',
        rating: 5,
        review: 'Elite engineering standards. From database optimization to fluid micro-animations, every single screen reflects excellence.',
        project: 'Fintech Portal',
        tag: 'Scalable Systems',
        avatar: '',
        status: 'published',
        order: 6
      }
    ],
    products: [
      {
        id: 'prod-1',
        name: 'VYNTRA Cloud',
        slug: 'vyntra-cloud',
        category: 'Cloud Platform & DevOps',
        status: 'In Development',
        previewType: 'cloud',
        description: 'An AI-assisted platform for application deployment, cloud management, real-time deployment logs, and intelligent troubleshooting.',
        tech: ['AI Diagnostics', 'Cloud Orchestration', 'Log Analytics', 'Kubernetes', 'Edge Runtime'],
        url: '',
        isPublic: true,
        order: 1
      },
      {
        id: 'prod-2',
        name: 'VYNTRA AI',
        slug: 'vyntra-ai',
        category: 'Intelligent Automation',
        status: 'Planned',
        previewType: 'ai',
        description: 'AI-powered productivity tools and intelligent automation designed to streamline operations, workflows, and enterprise cognitive tasks.',
        tech: ['Autonomous Agents', 'Neural Workflows', 'Task Automation', 'Python', 'FastAPI'],
        url: '',
        isPublic: true,
        order: 2
      },
      {
        id: 'prod-3',
        name: 'VYNTRA Studio',
        slug: 'vyntra-studio',
        category: 'Developer Ecosystem',
        status: 'Planned',
        previewType: 'studio',
        description: 'AI-assisted website and application development tools empowering engineers and creators with generative scaffolds, components, and live preview environments.',
        tech: ['Generative UI', 'Visual Builder', 'React', 'TypeScript', 'WebContainers'],
        url: '',
        isPublic: true,
        order: 3
      }
    ],
    gallery: [
      {
        id: 'placement-story',
        title: 'From Campus to Product Engineer',
        subtitle: 'Placement & Career Journey',
        category: 'story',
        type: 'video',
        image: '/src/assets/gallery/student_story.jpg',
        tag: 'ANOTHER PLACEMENT FROM VYNTRA',
        caption: 'Candid video interview sharing how hands-on coding transformed theoretical knowledge into production-ready software engineering.',
        alt: 'Placement success story of a young engineer at VYNTRA',
        uploadedAt: '2026-01-10T11:00:00.000Z'
      },
      {
        id: 'sprint-celebration',
        title: 'Celebrating Sprint Milestones',
        subtitle: 'Sweet moments with our developer cohort',
        category: 'celebration',
        type: 'image',
        image: '/src/assets/gallery/team_celebration.jpg',
        tag: 'MILESTONE CELEBRATIONS',
        caption: 'Festive treats and shared laughter following a successful multi-tenant SaaS delivery sprint.',
        alt: 'VYNTRA team celebrating sprint milestone with festive sweets in modern office',
        uploadedAt: '2026-01-18T16:30:00.000Z'
      },
      {
        id: 'founders-studio',
        title: 'Collaborative Innovation',
        subtitle: 'Lead Architects in the Studio',
        category: 'community',
        type: 'image',
        image: '/src/assets/gallery/founders_duo.jpg',
        tag: 'STUDIO LIFE',
        caption: 'Daily standup and architecture brainstorm session in the startup tech bay.',
        alt: 'VYNTRA engineers smiling in front of creative tech workspace',
        uploadedAt: '2026-01-22T09:15:00.000Z'
      },
      {
        id: 'mentorship-moment',
        title: 'Mentorship & Recognition',
        subtitle: 'Pair programming and mutual wins',
        category: 'mentorship',
        type: 'image',
        image: '/src/assets/gallery/mentorship_moment.jpg',
        tag: 'PEER MENTORSHIP',
        caption: 'Celebrating personal growth, code reviews, and project breakthroughs together.',
        alt: 'Engineers celebrating mentorship achievement with coffee and cake',
        uploadedAt: '2026-02-05T14:00:00.000Z'
      },
      {
        id: 'community-cohort',
        title: 'The VYNTRA Developer Family',
        subtitle: 'Builders, engineers, and creators united',
        category: 'community',
        type: 'image',
        image: '/src/assets/gallery/community_group.jpg',
        tag: 'COMMUNITY & COHORT',
        caption: 'A united collective of builders pushing boundaries and shipping modern software products together.',
        alt: 'VYNTRA engineering community cohort standing together smiling in office',
        uploadedAt: '2026-02-12T18:00:00.000Z'
      }
    ],
    content: {
      hero: {
        tagline: 'BUILD. DEPLOY. SCALE.',
        title: 'We turn ambitious ideas into digital reality.',
        subtitle: 'VYNTRA Technologies designs, engineers, and scales AI-powered software, cloud infrastructure, and modern digital platforms for forward-thinking enterprises.',
        primaryCtaLabel: 'Explore Services',
        primaryCtaUrl: '#services',
        secondaryCtaLabel: 'Get In Touch',
        secondaryCtaUrl: '#contact'
      },
      about: {
        label: 'ABOUT VYNTRA',
        heading: 'We Build Digital Products That Matter.',
        description: 'VYNTRA Technologies helps startups and enterprises build modern web applications, scalable cloud solutions, and AI-powered software through thoughtful design and reliable engineering.',
        stats: [
          { value: '20+', label: 'Projects Delivered' },
          { value: '15+', label: 'Startup Clients' },
          { value: '2026', label: 'Founded' }
        ],
        ctaText: "Let's Talk",
        ctaHref: '#contact',
        video: {
          src: '',
          poster: '',
          caption: 'Meet VYNTRA'
        }
      },
      vision: {
        heading: 'Engineered for Velocity. Built for Scale.',
        statement: 'Our mission is to eliminate technical friction, giving ambitious founders the architectural edge to innovate, deploy, and dominate their category.'
      },
      seo: {
        title: 'VYNTRA Technologies | Build. Deploy. Scale. | Software, AI & Cloud',
        description: 'VYNTRA Technologies builds AI-powered software, next-generation cloud solutions, and developer automation tools. Build. Deploy. Scale.',
        keywords: 'software development, AI solutions, cloud infrastructure, SaaS development, React, Node.js, VYNTRA',
        ogTitle: 'VYNTRA Technologies',
        ogDescription: 'Build. Deploy. Scale. We turn ambitious ideas into digital reality.',
        ogImage: '/og-image.png'
      }
    },
    messages: [
      {
        id: 'msg-seed-1',
        name: 'Aarav Mehta',
        email: 'aarav@fintechflow.io',
        company: 'FintechFlow Inc',
        type: 'AI or automation',
        budget: '₹50,000–₹1,00,000',
        description: 'We are looking to implement an AI copilot into our financial reconciliation system. Needs high security and low latency.',
        status: 'unread',
        createdAt: '2026-02-22T08:14:00.000Z'
      },
      {
        id: 'msg-seed-2',
        name: 'Kavita Joshi',
        email: 'kavita@healthlink.in',
        company: 'HealthLink Technologies',
        type: 'SaaS product',
        budget: '₹1,00,000+',
        description: 'Seeking a full-stack SaaS engineering partner to rebuild our multi-tenant clinic management system in React and Node.js.',
        status: 'read',
        createdAt: '2026-02-20T14:45:00.000Z'
      }
    ],
    activity: [
      {
        id: 'act-1',
        actor: 'Chandrabhan Gadeshwar (admin@vyntra.tech)',
        action: 'SYSTEM_INITIALIZED',
        target: 'VYNTRA Admin Engine',
        details: 'Initialized database and seeded starter modules',
        timestamp: new Date().toISOString()
      },
      {
        id: 'act-2',
        actor: 'Chandrabhan Gadeshwar (admin@vyntra.tech)',
        action: 'PROJECT_PUBLISHED',
        target: 'Purulia Travels',
        details: 'Published modern travel platform portfolio piece',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    settings: {
      siteName: 'VYNTRA Technologies',
      tagline: 'Build. Deploy. Scale.',
      contactEmail: 'contact@vyntra.tech',
      supportEmail: 'support@vyntra.tech',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      address: 'Nagpur & Pune, Maharashtra, India',
      socials: [
        { label: 'LinkedIn', url: 'https://linkedin.com/company/vyntra-tech' },
        { label: 'GitHub', url: 'https://github.com/vyntra-tech' },
        { label: 'Twitter / X', url: 'https://twitter.com/vyntra_tech' }
      ],
      privacyUrl: '/privacy',
      termsUrl: '/terms'
    }
  }
}

// In-memory cache + file sync
let dbCache = null

export function getDb() {
  if (dbCache) return dbCache
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8')
      dbCache = JSON.parse(raw)
      return dbCache
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial seed:', err)
  }

  const seed = getInitialSeedData()
  saveDb(seed)
  dbCache = seed
  return dbCache
}

export function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8')
    dbCache = data
    return true
  } catch (err) {
    console.error('Failed to save database file:', err)
    return false
  }
}

export function getCollection(name) {
  const db = getDb()
  return db[name] || []
}

export function saveCollection(name, items) {
  const db = getDb()
  db[name] = items
  saveDb(db)
  return items
}

export function insertItem(colName, item) {
  const db = getDb()
  if (!db[colName]) db[colName] = []
  
  const newItem = {
    ...item,
    id: item.id || `item-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  db[colName].unshift(newItem)
  saveDb(db)
  return newItem
}

export function updateItem(colName, id, updates) {
  const db = getDb()
  if (!db[colName]) return null
  const idx = db[colName].findIndex((x) => x.id === id)
  if (idx === -1) return null

  db[colName][idx] = {
    ...db[colName][idx],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  saveDb(db)
  return db[colName][idx]
}

export function deleteItem(colName, id) {
  const db = getDb()
  if (!db[colName]) return false
  const idx = db[colName].findIndex((x) => x.id === id)
  if (idx === -1) return false
  const deleted = db[colName].splice(idx, 1)[0]
  saveDb(db)
  return deleted
}

export function logActivity(actor, action, target, details = '') {
  const db = getDb()
  if (!db.activity) db.activity = []
  const entry = {
    id: `act-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    actor,
    action,
    target,
    details,
    timestamp: new Date().toISOString()
  }
  db.activity.unshift(entry)
  // Keep last 250 activities
  if (db.activity.length > 250) {
    db.activity = db.activity.slice(0, 250)
  }
  saveDb(db)
  return entry
}
