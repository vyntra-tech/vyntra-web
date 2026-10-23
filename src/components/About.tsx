import { useState, useRef } from 'react'
import { ArrowRight, Play } from 'lucide-react'
import { aboutContent } from '../data/about'
import vyntraLogo from '../assets/vyntra-logo.png'

export default function About() {
  const { label, heading, description, stats, ctaText, ctaHref, video } = aboutContent
  const [isPlaying, setIsPlaying] = useState(false)
  const [showConfigHint, setShowConfigHint] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayClick = () => {
    if (video.src) {
      setIsPlaying(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // Browser autoplay policy catch
          })
        }
      }, 50)
    } else {
      setShowConfigHint(true)
      setTimeout(() => setShowConfigHint(false), 4000)
    }
  }

  return (
    <section id="about" className="about-sec">
      <div className="wrap">
        <div className="about-bento-grid rv">
          {/* 1. Left Section — About VYNTRA */}
          <div className="about-left-col">
            <div className="about-eyebrow-pill">
              <span className="about-pill-dot" aria-hidden="true" />
              <span>{label}</span>
            </div>

            <h2 className="about-main-heading">{heading}</h2>

            <p className="about-desc">{description}</p>

            {/* Essential Statistics: 20+ Projects, 15+ Clients, 2026 Founded */}
            <div className="about-stats-container">
              {stats.map((stat, idx) => (
                <div key={idx} className="about-stat-box">
                  <span className="about-stat-number">{stat.value}</span>
                  <span className="about-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Button: Let's Talk → */}
            <div className="about-cta-wrapper">
              <a href={ctaHref} className="about-cta-btn">
                <span>{ctaText}</span>
                <ArrowRight size={16} className="about-cta-arrow" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* 2. Right Section — Video Showcase */}
          <div className="about-right-col">
            <div className="about-video-card">
              <div className="about-video-container">
                {isPlaying && video.src ? (
                  <video
                    ref={videoRef}
                    src={video.src}
                    poster={video.poster}
                    controls
                    autoPlay
                    playsInline
                    className="about-native-video"
                    onEnded={() => setIsPlaying(false)}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div
                    className="about-video-poster"
                    onClick={handlePlayClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Play company introduction video: Meet VYNTRA"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handlePlayClick()
                      }
                    }}
                  >
                    {/* Background Ambient Glow & Grid */}
                    <div className="about-video-glow" aria-hidden="true" />

                    {/* Logo & Brand Emblem */}
                    <div className="about-video-brand-wrap" aria-hidden="true">
                      <div className="about-video-emblem" style={{ background: 'transparent', border: 'none' }}>
                        <img
                          src={vyntraLogo}
                          alt="VYNTRA"
                          style={{
                            width: '42px',
                            height: '42px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 14px rgba(124, 58, 237, 0.6))',
                          }}
                        />
                      </div>
                      <span className="about-video-wordmark">VYNTRA</span>
                    </div>

                    {/* Centered Play Button */}
                    <button
                      type="button"
                      className="about-play-button"
                      aria-label="Play video"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayClick()
                      }}
                    >
                      <Play size={24} fill="currentColor" className="about-play-icon" aria-hidden="true" />
                    </button>

                    {/* Notification hint if video source is not yet configured */}
                    {showConfigHint && (
                      <div className="about-video-hint" role="status" aria-live="polite">
                        <span>Video source configurable in src/data/about.ts</span>
                      </div>
                    )}

                    {/* Video Caption at Bottom */}
                    <div className="about-video-caption">
                      <span className="caption-dot" aria-hidden="true" />
                      <span>{video.caption}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
