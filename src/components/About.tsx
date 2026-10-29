import { useState, useRef, useEffect } from 'react'
import { ArrowRight, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { getImageUrl } from '../lib/image'
import vyntraLogo from '../assets/vyntra-logo.png'


export default function About() {
  const { content } = useContent()
  const about = content?.about

  const label = about?.label || 'ABOUT VYNTRA'
  const heading = about?.heading || 'We Build Digital Products That Matter.'
  const description =
    about?.description ||
    'VYNTRA Solutions helps startups and enterprises build modern web applications, scalable cloud solutions, and AI-powered software through thoughtful design and reliable engineering.'
  const stats = about?.stats || []
  const ctaText = about?.ctaText || "Let's Talk"
  const ctaHref = about?.ctaHref || '#contact'
  const videoSrc = getImageUrl(about?.video?.src) || '/uploads/about-vedeio.mp4'
  const videoPoster = getImageUrl(about?.video?.poster)
  const videoCaption = about?.video?.caption || 'Meet VYNTRA'

  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {
        // Fallback if browser requires interaction
        setIsPlaying(false)
      })
    }
  }, [videoSrc])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!videoRef.current) return
    const nextMuted = !videoRef.current.muted
    videoRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!videoRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      videoRef.current.requestFullscreen().catch(() => {})
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
                {videoSrc ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      poster={videoPoster || undefined}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="about-native-video"
                      onClick={togglePlay}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      Your browser does not support the video tag.
                    </video>

                    {/* Ambient Glow */}
                    <div className="about-video-glow" aria-hidden="true" />

                    {/* Logo & Brand Emblem (Top-Left) */}
                    <div className="about-video-brand-wrap" aria-hidden="true">
                      <div className="about-video-emblem" style={{ background: 'transparent', border: 'none' }}>
                        <img
                          src={vyntraLogo}
                          alt="VYNTRA"
                          style={{
                            width: '38px',
                            height: '38px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 14px rgba(124, 58, 237, 0.6))',
                          }}
                        />
                      </div>
                      <span className="about-video-wordmark">VYNTRA</span>
                    </div>

                    {/* Centered Pause/Play overlay when paused */}
                    {!isPlaying && (
                      <div
                        className="about-video-paused-indicator"
                        onClick={togglePlay}
                        role="button"
                        tabIndex={0}
                        aria-label="Resume video"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            togglePlay()
                          }
                        }}
                      >
                        <div className="about-play-button">
                          <Play size={24} fill="currentColor" className="about-play-icon" aria-hidden="true" />
                        </div>
                      </div>
                    )}

                    {/* Video Caption at Bottom-Left */}
                    <div className="about-video-caption">
                      <span className="caption-dot" aria-hidden="true" />
                      <span>{videoCaption}</span>
                    </div>

                    {/* Interactive Controls at Bottom-Right */}
                    <div className="about-video-controls">
                      <button
                        type="button"
                        className="about-ctrl-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlay()
                        }}
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                      </button>
                      <button
                        type="button"
                        className="about-ctrl-btn"
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <button
                        type="button"
                        className="about-ctrl-btn"
                        onClick={toggleFullscreen}
                        aria-label="Toggle fullscreen"
                        title="Fullscreen"
                      >
                        <Maximize2 size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="about-video-poster">
                    <div className="about-video-glow" aria-hidden="true" />
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
                    <div className="about-video-hint" role="status" aria-live="polite">
                      <span>Video source configurable in Admin Content CMS</span>
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
