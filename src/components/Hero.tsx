import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion, hasWebGL } from '../lib/gsap'
import SceneFallback from './SceneFallback'
const HeroScene = lazy(() => import('./HeroScene'))

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [webgl] = useState(hasWebGL)
  const [visible, setVisible] = useState(true)
  const calm = prefersReducedMotion()

  useEffect(() => {
    if (!wrap.current) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(wrap.current); return () => io.disconnect()
  }, [])

  useGSAP(() => {
    if (calm) return
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('nav', { yPercent: -100, duration: 0.6 })
      .from('.pos', { opacity: 0, y: 12, duration: 0.5 }, '-=.2')
      .from('h1 .ln > span', { yPercent: 110, duration: 0.9, stagger: 0.12 }, '-=.3')
      .from('.hero-in p', { opacity: 0, y: 20, duration: 0.7 }, '-=.4')
      .from('.ctas .btn', { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=.4')
  }, { scope: root })

  return (
    <section id="home" ref={root}>
      <div id="cv" ref={wrap} aria-hidden="true">
        {webgl ? <Suspense fallback={<SceneFallback />}><HeroScene active={visible} calm={calm} /></Suspense> : <SceneFallback />}
      </div>
      <div className="wrap hero-in">
        <span className="pos">Build. Deploy. Scale. · AI, Cloud &amp; Software</span>
        <h1 aria-label="We turn ideas into digital experiences.">
          <span className="ln"><span>We turn ideas</span></span><span className="ln"><span>into digital</span></span><span className="ln"><span>experiences.</span></span>
        </h1>
        <p>From custom software, AI-powered solutions, and cloud architectures to scalable digital products, VYNTRA Solutions helps businesses transform ideas into meaningful technology.</p>
        <div className="ctas"><a className="btn p" href="#work">Explore Our Work</a><a className="btn" href="#contact">Start a Project</a></div>
      </div>
      <span className="scr" aria-hidden="true" />
    </section>
  )
}
