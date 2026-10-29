import { useState, useEffect } from 'react'
import { teamApi } from '../services/api'
import { ExternalLink } from 'lucide-react'
import type { TeamMember } from '../types'
import { getImageUrl, handleImageError } from '../lib/image'

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

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    teamApi
      .getPublic()
      .then((data) => {
        if (isMounted) {
          setTeamMembers(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load team')
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Varied heights for the desktop wave skyline rhythm (compact & elegant)
  const sizeClasses: Record<string, string> = {
    'chandrabhan-gadeshwar': 'wave-big',    // ~340px
    'shubham-uprade': 'wave-hero',         // ~365px (Center Hero)
    'sanjay-sende': 'wave-small',          // ~305px
    'nikhil-waghade': 'wave-mid',          // ~325px
    'dharamchand-patle': 'wave-small',     // ~305px
  }

  if (!loading && teamMembers.length === 0) {
    return null
  }

  return (
    <section id="team" className="team-sec">
      <div className="wrap">
        <p className="lab">Meet Our Team</p>
        <Split>The Developers Behind VYNTRA</Split>
        <p className="lead rv" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
          Our dedicated engineering team crafts modern web applications, scalable digital products, and intelligent AI solutions with precision and care.
        </p>

        {loading && teamMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading team members...
          </div>
        ) : error && teamMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            {error}
          </div>
        ) : (
          /* Responsive Team Container */
          <div className="team-wave-container rv">
            <div className="team-wave-track">
              {teamMembers.map((m) => {
                const isHovered = hoveredId === m.id
                const sizeClass = sizeClasses[m.id] || (m.size === 'large' ? 'wave-big' : m.size === 'small' ? 'wave-small' : 'wave-mid')
                const imgUrl = getImageUrl(m.image)

                return (
                  <article
                    key={m.id || m.name}
                    className={`team-wave-card ${sizeClass} ${isHovered ? 'is-active' : ''}`}
                    onMouseEnter={() => setHoveredId(m.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* 1. Full Cover Image with Aspect Ratio & Vignette */}
                    <div className="team-wave-img-box">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={m.name}
                          loading="lazy"
                          className="team-wave-img"
                          onError={handleImageError}
                          style={{
                            objectPosition: m.imagePosition || 'center 20%',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: '#a78bfa',
                          }}
                        >
                          {m.initials || m.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="team-wave-vignette" aria-hidden="true" />
                    </div>

                    {/* 2. Top-Right LinkedIn Badge */}
                    {m.linkedin && (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="team-wave-in-badge"
                        aria-label={`Open ${m.name}'s LinkedIn profile`}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.88 0-1.6.72-1.6 1.6 0 .88.72 1.6 1.6 1.6.88 0 1.6-.72 1.6-1.6 0-.88-.72-1.6-1.6-1.6Z" />
                        </svg>
                      </a>
                    )}

                    {/* 3. Subtle Name Badge before hover (Desktop) */}
                    <div className="team-wave-peek" aria-hidden="true">
                      <span className="team-wave-peek-pill">
                        <span className="team-wave-dot" />
                        {m.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* 4. Full Interactive Overlay on Hover (Desktop & Large screens) */}
                    <div className="team-wave-overlay">
                      <div className="team-wave-overlay-content">
                        <h3 className="team-wave-name">{m.name}</h3>

                        <div className="team-wave-role">
                          <span className="role-cyan-dot" aria-hidden="true" />
                          <span>{m.role}</span>
                        </div>

                        {m.specialty && (
                          <p className="team-wave-spec">{m.specialty}</p>
                        )}

                        {m.linkedin && (
                          <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-wave-btn"
                            aria-label={`Connect with ${m.name} on LinkedIn`}
                          >
                            <span>Connect</span>
                            <ExternalLink size={11} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 5. Mobile Permanent Information Footer (Visible on tablets and phones) */}
                    <div className="team-mobile-footer">
                      <h3 className="team-mobile-name">{m.name}</h3>
                      <p className="team-mobile-role">{m.role}</p>
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="team-mobile-link"
                          aria-label={`LinkedIn for ${m.name}`}
                        >
                          <span>LinkedIn</span>
                          <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
