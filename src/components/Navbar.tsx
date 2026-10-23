import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
const LINKS: [string, string][] = [
  ['home', 'Home'],
  ['about', 'About'],
  ['services', 'Services'],
  ['work', 'Work'],
  ['products', 'Products'],
  ['team', 'Team'],
  ['gallery', 'Gallery'],
  ['contact', 'Contact'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState('home')
  const mag = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    LINKS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  useEffect(() => {
    const el = mag.current
    if (!el || !window.matchMedia('(min-width: 861px) and (hover: hover)').matches) return
    const move = (e: MouseEvent) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.25, duration: 0.3 }) }
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,.5)' })
    el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave)
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) }
  }, [])

  const close = () => setOpen(false)
  return (
    <nav className={solid ? 's' : ''}>
      <div className="wrap nb">
        <a className="logo" href="#home" aria-label="VYNTRA Technologies home">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 2 29 9.5v13L16 30 3 22.5v-13z" fill="none" stroke="#8B5CF6" strokeWidth="2" />
            <path d="M12 12l4 9 4-9" fill="none" stroke="#22D3EE" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          VYNTRA
        </a>
        <button className="burger" aria-expanded={open} aria-controls="lk" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}><span /><span /><span /></button>
        <div className={'links' + (open ? ' o' : '')} id="lk">
          {LINKS.map(([id, label]) => <a key={id} className={'l' + (active === id ? ' on' : '')} href={'#' + id} onClick={close}>{label}</a>)}
          <a ref={mag} className="btn p" href="#contact" onClick={close}>Let’s Talk</a>
        </div>
      </div>
    </nav>
  )
}
