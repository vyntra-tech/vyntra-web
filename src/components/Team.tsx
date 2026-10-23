import { useState, useEffect } from 'react'
import { team as defaultTeam } from '../data/team'
import { teamApi } from '../services/api'
import { ExternalLink } from 'lucide-react'
import type { TeamMember } from '../types'

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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeam)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Fetch updated team members from backend if available (fallback to defaultTeam)
  useEffect(() => {
    let isMounted = true
    teamApi
      .getPublic()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTeamMembers(data)
        }
      })
      .catch(() => {
        // Silently use defaultTeam on network/backend offline
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

  return (
    <section id="team" className="team-sec">
      <div className="wrap">
        <p className="lab">Meet Our Team</p>
        <Split>The Developers Behind VYNTRA</Split>
        <p className="lead rv" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
          Our dedicated engineering team crafts modern web applications, scalable digital products, and intelligent AI solutions with precision and care.
        </p>

        {/* Responsive Team Container */}
        <div className="team-wave-container rv">
          <div className="team-wave-track">
            {teamMembers.map((m) => {
              const isHovered = hoveredId === m.id
              const sizeClass = sizeClasses[m.id] || 'wave-mid'

              return (
                <article
                  key={m.id || m.name}
                  className={`team-wave-card ${sizeClass} ${isHovered ? 'is-active' : ''}`}
                  onMouseEnter={() => setHoveredId(m.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* 1. Full Cover Image with Aspect Ratio & Vignette */}
                  <div className="team-wave-img-box">
                    <img
                      src={m.image}
                      alt={m.name}
                      loading="lazy"
                      className="team-wave-img"
                      style={{
                        objectPosition: m.imagePosition || 'center 20%',
                      }}
                    />
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
      </div>
    </section>
  )
}
