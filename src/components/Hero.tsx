import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion, hasWebGL } from '../lib/gsap'
import SceneFallback from './SceneFallback'
import { useContent } from '../context/ContentContext'
const HeroScene = lazy(() => import('./HeroScene'))

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [webgl] = useState(hasWebGL)
  const [visible, setVisible] = useState(true)
  const calm = prefersReducedMotion()
  const { content } = useContent()

  const hero = content?.hero
  const tagline = hero?.tagline || 'Build. Deploy. Scale. · AI, Cloud & Software'
  const title = hero?.title || 'We turn ideas into digital experiences.'
  const subtitle = hero?.subtitle || 'From custom software, AI-powered solutions, and cloud architectures to scalable digital products, VYNTRA Solutions helps businesses transform ideas into meaningful technology.'
  const primaryCtaLabel = hero?.primaryCtaLabel || 'Explore Our Work'
  const primaryCtaUrl = hero?.primaryCtaUrl || '#work'
  const secondaryCtaLabel = hero?.secondaryCtaLabel || 'Start a Project'
  const secondaryCtaUrl = hero?.secondaryCtaUrl || '#contact'

  // Split title into 3 lines:
  // Line 1: "We turn ideas"
  // Line 2: "into digital"
  // Line 3: "experiences."
  const getTitleLines = (rawTitle: string): string[] => {
    if (!rawTitle) return []
    if (rawTitle.includes('\n')) {
      return rawTitle.split('\n').map((s) => s.trim()).filter(Boolean)
    }

    const words = rawTitle.trim().split(/\s+/).filter(Boolean)
    // 6-word phrase: "We turn ideas into digital experiences."
    if (words.length === 6) {
      return [
        words.slice(0, 3).join(' '), // "We turn ideas"
        words.slice(3, 5).join(' '), // "into digital"
        words.slice(5).join(' '),    // "experiences."
      ]
    }

    const chunkSize = Math.ceil(words.length / 3)
    return [
      words.slice(0, chunkSize).join(' '),
      words.slice(chunkSize, chunkSize * 2).join(' '),
      words.slice(chunkSize * 2).join(' '),
    ].filter(Boolean)
  }

  const titleLines = getTitleLines(title)

  useEffect(() => {
    if (!wrap.current) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(wrap.current); return () => io.disconnect()
  }, [])

  useGSAP(() => {
    if (calm || !root.current) return
    const navEl = document.querySelector('nav')
    const pos = root.current.querySelector('.pos')
    const spans = root.current.querySelectorAll('h1 .ln > span')
    const desc = root.current.querySelector('.hero-in p')
    const btns = root.current.querySelectorAll('.ctas .btn')

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    if (navEl) {
      tl.fromTo(navEl, { yPercent: -100 }, { yPercent: 0, duration: 0.6, clearProps: 'transform' })
    }
    if (pos) {
      tl.fromTo(pos, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' }, navEl ? '-=.2' : 0)
    }
    if (spans.length > 0) {
      tl.fromTo(
        spans,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.12, clearProps: 'all' },
        '-=.3'
      )
    }
    if (desc) {
      tl.fromTo(desc, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, clearProps: 'all' }, '-=.4')
    }
    if (btns.length > 0) {
      tl.fromTo(btns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, clearProps: 'all' }, '-=.4')
    }
  }, { scope: root, dependencies: [title] })

  return (
    <section id="home" ref={root}>
      <div id="cv" ref={wrap} aria-hidden="true">
        {webgl ? <Suspense fallback={<SceneFallback />}><HeroScene active={visible} calm={calm} /></Suspense> : <SceneFallback />}
      </div>
      <div className="wrap hero-in">
        <span className="pos">{tagline}</span>
        <h1 aria-label={title}>
          {titleLines.map((line, idx) => (
            <span key={idx} className="ln">
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <p>{subtitle}</p>
        <div className="ctas">
          <a className="btn p" href={primaryCtaUrl}>{primaryCtaLabel}</a>
          <a className="btn" href={secondaryCtaUrl}>{secondaryCtaLabel}</a>
        </div>
      </div>
      <span className="scr" aria-hidden="true" />
    </section>
  )
}
