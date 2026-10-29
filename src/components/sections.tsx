import { useState, useEffect, useRef, type ReactNode } from 'react'
import type { Offering, Showcase } from '../types'
import { Clock } from 'lucide-react'
import { projectsApi, servicesApi, productsApi } from '../services/api'
import { useContent } from '../context/ContentContext'
import { getImageUrl, handleImageError } from '../lib/image'
import { steps, why } from '../data/content'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'

/** Splits a heading into words so GSAP can animate them (see App.tsx). */
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

const Head = ({ label, title }: { label: string; title: string }) => (
  <>
    <p className="lab">{label}</p>
    <Split>{title}</Split>
  </>
)

const Sec = ({ id, bg, children }: { id: string; bg?: boolean; children: ReactNode }) => (
  <section id={id} style={bg ? { background: 'var(--bg2)' } : undefined}>
    {children}
  </section>
)

export { default as About } from './About'

export function Services() {
  const [serviceList, setServiceList] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const calm = prefersReducedMotion()

  useEffect(() => {
    let isMounted = true
    servicesApi
      .getPublic()
      .then((data) => {
        if (isMounted) {
          setServiceList(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load services')
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  useGSAP(
    () => {
      if (calm || serviceList.length === 0 || !containerRef.current) return
      const cards = containerRef.current.querySelectorAll('.sc')
      if (cards.length === 0) return

      gsap.from(cards, {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%', once: true },
        clearProps: 'all',
      })
    },
    { scope: containerRef, dependencies: [serviceList.length] }
  )

  return (
    <Sec id="services" bg>
      <div className="wrap">
        <Head label="What we do" title="Technology built around your ambition." />
        {loading && serviceList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading engineering services...
          </div>
        ) : error && serviceList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            {error}
          </div>
        ) : serviceList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No services currently published.
          </div>
        ) : (
          <div className="sv" ref={containerRef}>
            {serviceList.map((s, i) => (
              <article
                key={s.id || s.title}
                className="sc"
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  e.currentTarget.style.setProperty('--x', e.clientX - r.left + 'px')
                  e.currentTarget.style.setProperty('--y', e.clientY - r.top + 'px')
                }}
              >
                <span className="no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
                {s.capabilities && s.capabilities.length > 0 && (
                  <ul>
                    {s.capabilities.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </Sec>
  )
}

/**
 * Our Technology Vision section
 * Uses CMS backend content for heading & mission statement.
 */
export function Vision() {
  const { content } = useContent()
  const vision = content?.vision

  const heading = vision?.heading || 'Engineering intelligence, cloud resilience, and developer velocity.'
  const statement = vision?.statement || 'At VYNTRA Solutions, we believe the next era of digital systems must be autonomous, cloud-native, and developer-empowered. We focus our core engineering on three transformative pillars:'

  return (
    <Sec id="vision">
      <div className="wrap">
        <Head label="Our Technology Vision" title={heading} />
        <p className="lead rv" style={{ marginTop: '1.25rem' }}>
          {statement}
        </p>

        <div className="vision-grid">
          <div className="vision-card rv">
            <div className="vision-badge">01 · ARTIFICIAL INTELLIGENCE</div>
            <h3>AI-Powered Software</h3>
            <p>
              We integrate autonomous intelligence, domain-tuned LLMs, and cognitive automation directly into product workflows, turning static systems into adaptive, intelligent platforms.
            </p>
            <ul className="vision-list">
              <li>Autonomous Multi-Agent Workflows</li>
              <li>Enterprise Cognitive Automation</li>
              <li>Domain-Specific LLM Integrations</li>
            </ul>
          </div>

          <div className="vision-card rv">
            <div className="vision-badge">02 · CLOUD ARCHITECTURE</div>
            <h3>Cloud Solutions &amp; Scale</h3>
            <p>
              We architect resilient, auto-scaling cloud foundations and multi-region microservices that guarantee high availability, zero-downtime deployments, and global low-latency execution.
            </p>
            <ul className="vision-list">
              <li>Auto-Scaling Cloud Infrastructure</li>
              <li>Zero-Downtime Blue/Green Deployments</li>
              <li>Distributed Edge &amp; Microservices</li>
            </ul>
          </div>

          <div className="vision-card rv">
            <div className="vision-badge">03 · ENGINEERING VELOCITY</div>
            <h3>Developer Tools &amp; Automation</h3>
            <p>
              We build specialized developer toolchains, CLI utilities, and automated CI/CD diagnostics that eliminate operational drag and empower builders to ship with uncompromising speed.
            </p>
            <ul className="vision-list">
              <li>Next-Gen Internal Developer Platforms</li>
              <li>Automated CI/CD &amp; Deployment Diagnostics</li>
              <li>Generative Scaffolding &amp; Micro-Tools</li>
            </ul>
          </div>
        </div>

        {/* Tagline Banner */}
        <div className="vision-banner rv">
          <div className="vision-banner-tagline">
            <span>BUILD.</span>
            <span className="dot">·</span>
            <span>DEPLOY.</span>
            <span className="dot">·</span>
            <span>SCALE.</span>
          </div>
          <p className="vision-banner-sub">
            The core engineering philosophy driving every solution and product we build at VYNTRA Solutions.
          </p>
        </div>
      </div>
    </Sec>
  )
}

function Card({ item, cta }: { item: Showcase; cta: string }) {
  const imageUrl = getImageUrl(item.image)

  return (
    <article className="card rv">
      <div className="pv">
        {item.category && (
          <span className="card-cat-badge">{item.category}</span>
        )}
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-label={`Open ${item.name} live demo`}
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                loading="lazy"
                onError={handleImageError}
              />
            ) : (
              <div className="mock"><b /><b /><b /></div>
            )}
          </a>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="mock"><b /><b /><b /></div>
        )}
      </div>
      <div className="cb">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="tg">
          {(item.tech || []).slice(0, 4).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {item.url && (
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="card-cta-link">
              <span>{cta}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </article>
  )
}

export function Work() {
  const [projectList, setProjectList] = useState<Showcase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    projectsApi
      .getPublic()
      .then((data) => {
        if (isMounted) {
          setProjectList(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load projects')
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Sec id="work">
      <div className="wrap">
        <Head label="Selected work" title="Real projects. Thoughtful solutions." />
        {loading && projectList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading portfolio projects...
          </div>
        ) : error && projectList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            {error}
          </div>
        ) : projectList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No projects published yet.
          </div>
        ) : (
          <div className="cards">
            {projectList.map((p, i) => (
              <Card key={p.id || p.name || i} item={p} cta="View live product" />
            ))}
          </div>
        )}
      </div>
    </Sec>
  )
}

/**
 * Future Products Section
 * Showcases in-house innovations dynamically from the backend products API.
 */
export function FutureProducts() {
  const [productList, setProductList] = useState<Showcase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    productsApi
      .getPublic()
      .then((data) => {
        if (isMounted) {
          setProductList(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setProductList([])
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (!loading && productList.length === 0) {
    return null
  }

  return (
    <Sec id="products" bg>
      <div className="wrap">
        <Head label="In-house Innovations" title="Future Products in the Pipeline." />
        <p className="lead rv" style={{ marginTop: '1.25rem' }}>
          Proprietary cloud platforms, AI productivity engines, and developer tools currently engineered in-house by VYNTRA Solutions. Currently in active development and planned testing phases.
        </p>

        {loading && productList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading product innovations...
          </div>
        ) : (
          <div className="future-cards">
            {productList.map((prod) => (
              <article key={prod.id || prod.name} className="future-card rv">
                {/* Interactive terminal preview graphic */}
                <div className="product-preview" aria-hidden="true">
                  <div className="preview-terminal">
                    <div className="terminal-header">
                      <span className="term-dot red" />
                      <span className="term-dot yellow" />
                      <span className="term-dot green" />
                      <span className="term-title">
                        {prod.previewType === 'cloud'
                          ? 'vyntra-cloud ~ deploy-monitor'
                          : prod.previewType === 'ai'
                          ? 'vyntra-ai ~ workflow-engine'
                          : 'vyntra-studio ~ dev-workspace'}
                      </span>
                    </div>
                    <div className="terminal-body">
                      {prod.previewType === 'cloud' ? (
                        <>
                          <p className="term-line success">✓ [AI Engine] Cluster auto-configured (us-east-1)</p>
                          <p className="term-line info">ℹ [Telemetry] Real-time deployment logs streaming</p>
                          <p className="term-line active">▶ [Status] AI diagnostics &amp; health: OPTIMAL</p>
                        </>
                      ) : prod.previewType === 'ai' ? (
                        <>
                          <p className="term-line success">✓ [Agent Mesh] Autonomous workflows active</p>
                          <p className="term-line info">ℹ [Intelligence] Enterprise context graph indexed</p>
                          <p className="term-line active">▶ [Automation] Routine tasks optimized by 80%</p>
                        </>
                      ) : (
                        <>
                          <p className="term-line success">✓ [Scaffolding] Component schema verified</p>
                          <p className="term-line info">ℹ [Live Preview] WebContainer instance booted</p>
                          <p className="term-line active">▶ [Generation] UI scaffold ready for export</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="future-card-body">
                  <div className="future-card-meta">
                    <span className="product-cat">{prod.category}</span>
                    <span
                      className={`product-status-pill ${
                        prod.status === 'Planned' ? 'planned' : 'in-dev'
                      }`}
                    >
                      <span className={`status-dot ${prod.status !== 'Planned' ? 'pulsing' : ''}`} />
                      {prod.status}
                    </span>
                  </div>

                  <h3>{prod.name}</h3>
                  <p>{prod.description}</p>

                  {prod.tech && prod.tech.length > 0 && (
                    <div className="tg" style={{ marginBottom: '1.25rem' }}>
                      {prod.tech.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="product-stage-note">
                    <Clock size={13} aria-hidden="true" />
                    <span>
                      {prod.status === 'Planned'
                        ? 'Architecture & Specification Phase'
                        : 'Active Engineering · Closed Beta Testing'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Sec>
  )
}

export const Process = () => (
  <Sec id="process">
    <div className="wrap">
      <Head label="How we work" title="From first idea to final launch." />
      <div className="tl" id="tl">
        <div className="pg" />
        {steps.map((s, i) => (
          <div className="st" key={s.title}>
            <h3>
              <span>0{i + 1}</span>
              {s.title}
            </h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  </Sec>
)

export const Why = () => (
  <Sec id="why" bg>
    <div className="wrap">
      <Split>Creative thinking. Solid engineering.</Split>
      <div className="wg">
        {why.map(({ icon: Icon, title, text }) => (
          <div className="rv" key={title}>
            <Icon aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  </Sec>
)
