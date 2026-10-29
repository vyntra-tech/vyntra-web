import React, { useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from './lib/gsap'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import { About, Services, Vision, Work, FutureProducts, Process, Why } from './components/sections'
import Gallery from './components/Gallery'
import Reviews from './components/Reviews'
import Team from './components/Team'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { AdminRoutes } from './admin/AdminRoutes'
import { ContentProvider } from './context/ContentContext'

function PublicSite() {
  const root = useRef<HTMLDivElement>(null)

  // 1. Lenis Smooth Inertia Scrolling (public site only)
  useEffect(() => {
    if (prefersReducedMotion()) return

    const LenisClass = (window as any).Lenis
    if (!LenisClass) return

    const lenis = new LenisClass({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.8,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (target && target.hash && target.hash.startsWith('#')) {
        const el = document.querySelector(target.hash)
        if (el) {
          e.preventDefault()
          lenis.scrollTo(el, { offset: -60, duration: 1.2 })
        }
      }
    }
    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      gsap.ticker.remove(tickerFn)
      lenis.destroy()
    }
  }, [])

  // 2. GSAP Animations for Public Landing Page
  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>('.st')
      if (prefersReducedMotion()) {
        steps.forEach((s) => s.classList.add('on'))
        gsap.set('.pg', { scaleY: 1 })
        return
      }

      // Typography split reveal
      gsap.utils.toArray<HTMLElement>('.split').forEach((h) => {
        const words = h.querySelectorAll('.w')
        if (words.length > 0) {
          gsap.from(words, {
            yPercent: 105,
            duration: 0.8,
            stagger: 0.05,
            ease: 'power3.out',
            scrollTrigger: { trigger: h, start: 'top 85%', once: true },
          })
        }
      })

      // Batch element reveals
      ScrollTrigger.batch('.rv', {
        start: 'top 88%',
        once: true,
        onEnter: (b) => {
          if (b && b.length > 0) {
            gsap.from(b, {
              opacity: 0,
              y: 30,
              duration: 0.7,
              stagger: 0.12,
              ease: 'power2.out',
              clearProps: 'all',
            })
          }
        },
      })

      // Process timeline line scrub
      const tl = document.getElementById('tl')
      const pg = document.querySelector('.pg')
      if (tl && pg) {
        gsap.to(pg, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 70%', scrub: true },
        })
      }

      if (steps.length > 0) {
        steps.forEach((s) =>
          ScrollTrigger.create({
            trigger: s,
            start: 'top 65%',
            onEnter: () => s.classList.add('on'),
            onLeaveBack: () => s.classList.remove('on'),
          })
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: root }
  )

  return (
    <ContentProvider>
      <div ref={root}>
        <Navbar />
        <main>
          <Hero />
          <About />
          <Services />
          <Vision />
          <Work />
          <FutureProducts />
          <Process />
          <Gallery />
          <Why />
          <Reviews />
          <Team />
          <Contact />
        </main>
        <Footer />
      </div>
    </ContentProvider>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Admin Module */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Public Landing Website */}
      <Route path="*" element={<PublicSite />} />
    </Routes>
  )
}
