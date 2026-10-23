import { useState, type FormEvent } from 'react'
import {
  MessageSquare,
  Code2,
  MapPin,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  FormErrorMessage,
  Button,
} from './ChakraUI'

const API = import.meta.env.VITE_API_URL ?? '/api/contact'
const CONFIGURED_PHONE = (
  import.meta.env.VITE_WHATSAPP_NUMBER ||
  import.meta.env.VITE_COMPANY_PHONE ||
  ''
).trim()

export const SERVICE_OPTIONS = [
  'Website Development',
  'Web Application Development',
  'SaaS Platform Development',
  'MERN Stack Development',
  'AI Solutions & Integrations',
  'UI/UX Design',
  'E-commerce Development',
  'Mobile App Development',
  'Cloud & DevOps Solutions',
  'Maintenance & Support',
  'Other',
] as const

export const BUDGET_OPTIONS = [
  'Under ₹10,000',
  '₹10,000–₹25,000',
  '₹25,000–₹50,000',
  '₹50,000–₹1,00,000',
  '₹1,00,000+',
  'Not Decided Yet',
] as const

const SERVICE_TYPE_MAP: Record<
  string,
  'Software or website' | 'AI or automation' | 'SaaS product' | 'Not sure yet'
> = {
  'Website Development': 'Software or website',
  'Web Application Development': 'Software or website',
  'SaaS Platform Development': 'SaaS product',
  'MERN Stack Development': 'Software or website',
  'AI Solutions & Integrations': 'AI or automation',
  'UI/UX Design': 'Software or website',
  'E-commerce Development': 'Software or website',
  'Mobile App Development': 'Software or website',
  'Cloud & DevOps Solutions': 'Software or website',
  'Maintenance & Support': 'Software or website',
  Other: 'Not sure yet',
}

export interface ContactFormData {
  name: string
  email: string
  mobile: string
  service: string
  budget: string
  message: string
  website: string // honeypot
}

export type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>
export type FormStatus = {
  kind: 'idle' | 'sending' | 'ok' | 'error'
  text?: string
}

function Split({ children }: { children: string }) {
  return (
    <h2 className="split">
      {children.split(' ').map((w, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
            marginRight: '.25em',
          }}
        >
          <span className="w" style={{ display: 'inline-block' }}>
            {w}
          </span>
        </span>
      ))}
    </h2>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.031 2c-5.514 0-9.999 4.486-9.999 10 0 1.765.46 3.486 1.332 5.006l-1.417 5.178 5.305-1.391c1.464.798 3.114 1.218 4.779 1.218 5.515 0 10.001-4.486 10.001-10 0-5.514-4.486-10-10.001-10zm0 18.283c-1.503 0-2.983-.404-4.281-1.169l-.307-.182-3.178.833.848-3.097-.2-.317c-.839-1.334-1.282-2.884-1.282-4.471 0-4.565 3.714-8.28 8.28-8.28 4.566 0 8.28 3.715 8.28 8.28 0 4.566-3.714 8.28-8.28 8.28zm4.536-6.196c-.249-.125-1.472-.726-1.7-.809-.228-.083-.394-.125-.56.125-.166.249-.643.809-.788.975-.145.166-.29.187-.539.062s-1.05-.387-2.001-1.235c-.74-.66-1.24-1.475-1.385-1.724-.145-.249-.015-.384.109-.508.112-.112.249-.29.373-.435.125-.145.166-.249.249-.415.083-.166.042-.311-.021-.435-.062-.125-.56-1.349-.768-1.847-.202-.486-.407-.419-.56-.427l-.477-.008c-.166 0-.435.062-.663.311-.228.249-.871.851-.871 2.075 0 1.224.892 2.407 1.016 2.573.125.166 1.756 2.681 4.254 3.759.594.257 1.058.411 1.42.526.597.19 1.14.163 1.569.099.479-.071 1.472-.601 1.68-1.182.207-.581.207-1.079.145-1.183-.062-.104-.228-.166-.477-.291z" />
    </svg>
  )
}

function getWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message)
  if (CONFIGURED_PHONE) {
    const cleanNumber = CONFIGURED_PHONE.replace(/[^\d]/g, '')
    return `https://wa.me/${cleanNumber}?text=${text}`
  }
  return `https://api.whatsapp.com/send?text=${text}`
}

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Vijay+Nagar,+Indore,+Madhya+Pradesh,+India'

function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) {
    return 'Full name is required.'
  }
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters.'
  }
  return null
}

function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) {
    return 'Email address is required.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Please enter a valid email address.'
  }
  return null
}

function validateIndianMobile(mobile: string): string | null {
  const trimmed = mobile.trim()
  if (!trimmed) {
    return 'Mobile number is required.'
  }
  // Strip whitespace, hyphens, parentheses, and dots
  const clean = trimmed.replace(/[\s\-\(\)\.]/g, '')
  // Normalize if user enters +91, 91, or leading 0
  const normalized = clean.replace(/^(?:\+91|91|0)/, '')
  // Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    return 'Enter a valid 10-digit Indian mobile number.'
  }
  return null
}

function validateService(service: string): string | null {
  if (!service) {
    return 'Please select a service.'
  }
  return null
}

function validateMessage(message: string): string | null {
  const trimmed = message.trim()
  if (!trimmed) {
    return 'Project requirements are required.'
  }
  if (trimmed.length < 10) {
    return 'Please enter at least 10 characters.'
  }
  return null
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    mobile: '',
    service: '',
    budget: '',
    message: '',
    website: '',
  })

  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })

  const validate = (): boolean => {
    const errs: ContactFormErrors = {}

    const nameErr = validateName(formData.name)
    if (nameErr) errs.name = nameErr

    const emailErr = validateEmail(formData.email)
    if (emailErr) errs.email = emailErr

    const mobileErr = validateIndianMobile(formData.mobile)
    if (mobileErr) errs.mobile = mobileErr

    const serviceErr = validateService(formData.service)
    if (serviceErr) errs.service = serviceErr

    const messageErr = validateMessage(formData.message)
    if (messageErr) errs.message = messageErr

    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0] as keyof ContactFormData
      document.getElementById(firstKey)?.focus()
      return false
    }

    return true
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    if (status.kind === 'error') {
      setStatus({ kind: 'idle' })
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setStatus({ kind: 'sending' })

    const structuredDescription = [
      `[Mobile: ${formData.mobile.trim()}]`,
      `[Service: ${formData.service}]`,
      formData.budget ? `[Budget: ${formData.budget}]` : null,
      '',
      '--- Project Requirements ---',
      formData.message.trim(),
    ]
      .filter(Boolean)
      .join('\n')

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: '',
      type: SERVICE_TYPE_MAP[formData.service] || 'Software or website',
      budget: formData.budget || undefined,
      description: structuredDescription,
      website: formData.website,
    }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok || json.ok === false) {
        throw new Error(
          json.error || 'Your message could not be sent. Please try again.'
        )
      }

      // Success confirmed by backend
      setStatus({
        kind: 'ok',
        text: 'Thank you! Your message has been sent successfully. Our team will contact you within 24 hours.',
      })

      // Reset form on confirmed success
      setFormData({
        name: '',
        email: '',
        mobile: '',
        service: '',
        budget: '',
        message: '',
        website: '',
      })
      setErrors({})
    } catch (err) {
      // Preserve entered values on failure
      setStatus({
        kind: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Your message could not be sent. Please check your network and try again.',
      })
    }
  }

  return (
    <section id="contact" className="contact-sec">
      <div className="wrap">
        <div className="contact-grid">
          {/* Left Column: Heading, Description & Contact Cards (Preserved UI) */}
          <div className="contact-info-col">
            <div className="contact-head">
              <p className="lab contact-eyebrow">
                <Clock size={14} className="eyebrow-clock" aria-hidden="true" />
                <span>RESPONSE WITHIN 24H · NO COMMITMENT REQUIRED</span>
              </p>
              <Split>Let's Build Something Remarkable</Split>
              <p className="lead rv contact-lead">
                Got an idea, a problem to solve, or a project ready to go? We respond
                within 24 hours — no commitment, no sales pitch.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="contact-cards-stack">
              {/* Card 1: General & Booking */}
              <article className="contact-card rv">
                <div className="contact-card-icon" aria-hidden="true">
                  <MessageSquare size={20} />
                </div>
                <div className="contact-card-body">
                  <h3 className="contact-card-title">General &amp; Booking</h3>
                  <p className="contact-card-desc">
                    General inquiries, project discussions, and bookings.
                  </p>
                  <a
                    href={getWhatsAppUrl(
                      'Hi VYNTRA team, I would like to make a general inquiry and discuss a project booking.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card-btn whatsapp-btn"
                  >
                    <WhatsAppIcon />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </article>

              {/* Card 2: Software Development */}
              <article className="contact-card rv">
                <div className="contact-card-icon" aria-hidden="true">
                  <Code2 size={20} />
                </div>
                <div className="contact-card-body">
                  <h3 className="contact-card-title">Software Development</h3>
                  <p className="contact-card-desc">
                    Web Apps • SaaS • Cloud • AI
                  </p>
                  <a
                    href={getWhatsAppUrl(
                      'Hi VYNTRA team, I am interested in Software Development services (Web Apps, SaaS, Cloud & AI).'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card-btn whatsapp-btn"
                  >
                    <WhatsAppIcon />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </article>

              {/* Card 3: Our Location */}
              <article className="contact-card rv">
                <div className="contact-card-icon" aria-hidden="true">
                  <MapPin size={20} />
                </div>
                <div className="contact-card-body">
                  <h3 className="contact-card-title">Our Location</h3>
                  <p className="contact-card-desc">
                    Vijay Nagar, Indore
                    <br />
                    <span className="contact-region">Madhya Pradesh, India</span>
                  </p>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card-btn location-btn"
                  >
                    <span>View Location</span>
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>
          </div>

          {/* Right Column: Clean, Simple & Professional Contact Form */}
          <div className="contact-form-col rv">
            <div className="contact-form-card">
              <div className="contact-form-header">
                <h3 className="form-title">Let's Discuss Your Project</h3>
                <p className="form-sub">
                  Tell us a little about your project, and our team will get back to
                  you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="contact-form">
                {/* 1. Full Name * */}
                <FormControl
                  id="name"
                  isRequired
                  isInvalid={!!errors.name}
                  className="f-full"
                >
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                {/* Row: Email Address & Mobile Number */}
                <div className="form-row-2">
                  {/* 2. Email Address * */}
                  <FormControl id="email" isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  {/* 3. Mobile Number * */}
                  <FormControl id="mobile" isRequired isInvalid={!!errors.mobile}>
                    <FormLabel>Mobile Number</FormLabel>
                    <Input
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter your mobile number"
                      autoComplete="tel"
                    />
                    <FormErrorMessage>{errors.mobile}</FormErrorMessage>
                  </FormControl>
                </div>

                {/* Row: Service & Project Budget */}
                <div className="form-row-2">
                  {/* 4. Service * */}
                  <FormControl id="service" isRequired isInvalid={!!errors.service}>
                    <FormLabel>Service</FormLabel>
                    <Select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      placeholder="Select a service"
                    >
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.service}</FormErrorMessage>
                  </FormControl>

                  {/* 5. Project Budget (Optional) */}
                  <FormControl id="budget" isInvalid={!!errors.budget}>
                    <FormLabel>Project Budget</FormLabel>
                    <Select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="Select your project budget"
                    >
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.budget}</FormErrorMessage>
                  </FormControl>
                </div>

                {/* 6. Message / Project Requirements * */}
                <FormControl
                  id="message"
                  isRequired
                  isInvalid={!!errors.message}
                  className="f-full"
                >
                  <FormLabel>Message / Project Requirements</FormLabel>
                  <Textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project, requirements, or ideas..."
                  />
                  <FormErrorMessage>{errors.message}</FormErrorMessage>
                </FormControl>

                {/* Honeypot field for bot spam prevention */}
                <input
                  className="hp"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* 7. Submit Button */}
                <div className="form-submit-wrap">
                  <Button
                    type="submit"
                    className="btn p contact-submit-btn"
                    isLoading={status.kind === 'sending'}
                    loadingText="Sending Message..."
                  >
                    <span>Send Message</span>
                    <Send size={16} aria-hidden="true" />
                  </Button>

                  <p className="submit-subtext">
                    No commitment required · Your project details stay private
                  </p>
                </div>

                {/* Status Feedback Banner */}
                {status.text && (
                  <div
                    className={`contact-status-banner ${status.kind}`}
                    role="status"
                    aria-live="polite"
                  >
                    {status.kind === 'ok' ? (
                      <CheckCircle2
                        size={18}
                        className="status-icon"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        size={18}
                        className="status-icon"
                        aria-hidden="true"
                      />
                    )}
                    <span>{status.text}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
