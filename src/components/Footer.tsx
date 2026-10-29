import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap'
import {
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Twitter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import vyntraLogo from '../assets/vyntra-logo.png'
import { useContent } from '../context/ContentContext'

export default function Footer() {
  const { settings, content } = useContent()
  const footerRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  // Interactive Cursor Spotlight Glow Effect (Sheryians style: jaha cursor jata hai waha color aata hai)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!textContainerRef.current) return
    const rect = textContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Smooth GSAP interpolation for color position and reveal opacity
    gsap.to(textContainerRef.current, {
      '--x': `${x}px`,
      '--y': `${y}px`,
      '--opacity': 1,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x,
        y,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handlePointerLeave = () => {
    if (textContainerRef.current) {
      gsap.to(textContainerRef.current, {
        '--opacity': 0,
        duration: 0.45,
        ease: 'power2.out',
      })
    }
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
      })
    }
  }

  useGSAP(() => {
    if (prefersReducedMotion()) return

    // 1. Huge centered outlined brand text with smooth parallax & scale scrub
    if (trackRef.current && footerRef.current) {
      gsap.fromTo(
        trackRef.current,
        { yPercent: 20, scale: 0.94, opacity: 0.7 },
        {
          yPercent: -8,
          scale: 1.02,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        }
      )
    }

    // 2. Footer content staggered reveal
    ScrollTrigger.batch('.footer-reveal', {
      start: 'top 88%',
      once: true,
      onEnter: (elements) =>
        gsap.from(elements, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'all',
        }),
    })
  }, { scope: footerRef })

  return (
    <footer ref={footerRef} className="sheryians-footer">
      {/* 1. Huge Outlined Text with Sheryians Cursor Follow Color Reveal */}
      <div
        ref={textContainerRef}
        className="footer-huge-outline-wrap"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Ambient Radial Cursor Glow Aura */}
        <div ref={glowRef} className="footer-cursor-glow" aria-hidden="true" />

        <div ref={trackRef} className="footer-huge-outline-track" aria-hidden="true">
          <div className="footer-text-spotlight-container">
            {/* Base Outlined Text */}
            <span className="footer-huge-outline-text">VYNTRA</span>

            {/* Dynamic Spotlight Fill: Colors light up wherever the cursor moves */}
            <span className="footer-huge-spotlight-fill" aria-hidden="true">
              VYNTRA
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Grid */}
      <div className="wrap">
        <div className="footer-main-grid">
          {/* Column 1: Brand Info & Social Media Icons */}
          <div className="footer-brand-col footer-reveal">
            <a className="footer-logo" href="#home" aria-label="VYNTRA Solutions home">
              <img
                src={vyntraLogo}
                alt="VYNTRA Solutions"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 10px rgba(124, 58, 237, 0.45))',
                }}
              />
              <span>VYNTRA Solutions</span>
            </a>

            <p className="footer-brand-desc">
              Building custom software, AI-powered systems, cloud infrastructure, and scalable SaaS platforms designed around modern business ambition. Build. Deploy. Scale.
            </p>

            {/* Social Media Icons (Like Sheryians Footer) */}
            <div className="footer-social-row">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/shubham-uprade"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="X (Twitter)"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: ABOUT */}
          <div className="footer-col footer-reveal">
            <h3 className="footer-col-title">ABOUT</h3>
            <ul className="footer-links-list">
              <li><a href="#about" className="footer-link">About Us</a></li>
              <li><a href="#services" className="footer-link">What We Do</a></li>
              <li><a href="#vision" className="footer-link">Technology Vision</a></li>
              <li><a href="#work" className="footer-link">Selected Work</a></li>
              <li><a href="#products" className="footer-link">Future Products</a></li>
              <li><a href="#process" className="footer-link">How We Work</a></li>
              <li><a href="#gallery" className="footer-link">Moments &amp; Gallery</a></li>
              <li><a href="#team" className="footer-link">Our Developers</a></li>
            </ul>
          </div>

          {/* Column 3: COMPANY & SAAS */}
          <div className="footer-col footer-reveal">
            <h3 className="footer-col-title">COMPANY</h3>
            <ul className="footer-links-list">
              <li>
                <a href="https://unibillpro.devforge.in/" target="_blank" rel="noopener noreferrer" className="footer-link">
                  <span>UniBill Pro</span>
                  <ArrowUpRight size={13} className="footer-link-arrow" />
                </a>
              </li>
              <li>
                <a href="https://hangry-frontend-seven.vercel.app/" target="_blank" rel="noopener noreferrer" className="footer-link">
                  <span>Hangry Platform</span>
                  <ArrowUpRight size={13} className="footer-link-arrow" />
                </a>
              </li>
              <li>
                <a href="https://puruliatravelsfinal.netlify.app/" target="_blank" rel="noopener noreferrer" className="footer-link">
                  <span>Purulia Travels</span>
                  <ArrowUpRight size={13} className="footer-link-arrow" />
                </a>
              </li>
              <li>
                <a href="https://namatecafe.web.app/" target="_blank" rel="noopener noreferrer" className="footer-link">
                  <span>Namaste Cafe</span>
                  <ArrowUpRight size={13} className="footer-link-arrow" />
                </a>
              </li>
              <li><a href="#reviews" className="footer-link">Client Reviews</a></li>
              <li><a href="#contact" className="footer-link">Submit Requirements</a></li>
            </ul>
          </div>

          {/* Column 4: CONTACT */}
          <div className="footer-col footer-reveal">
            <h3 className="footer-col-title">CONTACT</h3>
            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <span className="footer-contact-label">Direct Helpline:</span>
                <a href={`tel:${(settings?.phone || '+919977413362').replace(/\s+/g, '')}`} className="footer-contact-value footer-link-highlight">
                  {settings?.phone || '+91 99774 13362'}
                </a>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-label">Direct Email:</span>
                <a href={`mailto:${settings?.contactEmail || 'hellow.vyntra@gmail.com'}`} className="footer-contact-value footer-link-highlight">
                  {settings?.contactEmail || 'hellow.vyntra@gmail.com'}
                </a>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-label">Location:</span>
                <span className="footer-contact-value">{settings?.address || 'India · Indore Madhya Pradesh'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Copyright & Credits Bar */}
        <div className="footer-bottom-bar footer-reveal">
          <p className="footer-copyright">
            © {new Date().getFullYear()} VYNTRA Solutions. All rights reserved. ·{' '}
            <a href="/admin/dashboard" style={{ color: '#06B6D4', textDecoration: 'none' }}>
              Admin Portal
            </a>
          </p>
          <div className="footer-bottom-tag">
            <Sparkles size={13} className="footer-tag-sparkle" />
            <span>Built with High-Scale Engineering &amp; Design Precision</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
