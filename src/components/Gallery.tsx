import { useState, useEffect, useCallback } from 'react'
import { galleryApi } from '../services/api'
import type { GalleryItem } from '../types'
import { ArrowUpRight, Play, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
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

function getBentoSizeClass(idx: number, count: number): string {
  // If 5 items (common layout for current database):
  if (count === 5) {
    if (idx === 0) return 'bento-hero-2x2' // Bada Featured Spotlight (2x2)
    if (idx === 1) return 'bento-wide-2x1' // Chota-wide (2x1)
    if (idx === 2) return 'bento-square-1x1' // Chota square (1x1)
    if (idx === 3) return 'bento-square-1x1' // Chota square (1x1)
    if (idx === 4) return 'bento-panoramic-4x1' // Bada Wide Panoramic (4x1)
  }

  // If 6 items:
  if (count === 6) {
    if (idx === 0) return 'bento-hero-2x2'
    if (idx === 1) return 'bento-wide-2x1'
    if (idx === 2) return 'bento-square-1x1'
    if (idx === 3) return 'bento-square-1x1'
    if (idx === 4) return 'bento-wide-2x1'
    if (idx === 5) return 'bento-wide-2x1'
  }

  // Repeating asymmetric rhythm for any number of items:
  const cycle = idx % 7
  switch (cycle) {
    case 0:
      return 'bento-hero-2x2' // Bada (2x2)
    case 1:
      return 'bento-wide-2x1' // Chota-wide (2x1)
    case 2:
      return 'bento-square-1x1' // Chota (1x1)
    case 3:
      return 'bento-square-1x1' // Chota (1x1)
    case 4:
      return 'bento-tall-1x2' // Bada tall (1x2)
    case 5:
      return 'bento-wide-2x1' // Chota-wide (2x1)
    case 6:
      return 'bento-panoramic-4x1' // Bada panoramic (4x1)
    default:
      return 'bento-square-1x1'
  }
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'story' | 'celebration' | 'community'>('all')
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    galleryApi
      .getPublic()
      .then((data) => {
        if (isMounted) {
          setItems(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load gallery')
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter((item) => item.category === activeTab || item.type === 'stat')

  const openLightbox = (item: GalleryItem) => {
    setActiveItem(item)
    if (item.type === 'video') {
      setPlayingVideoId(item.id)
    } else {
      setPlayingVideoId(null)
    }
  }

  const closeLightbox = () => {
    setActiveItem(null)
    setPlayingVideoId(null)
  }

  const navigateLightbox = useCallback((direction: 'next' | 'prev') => {
    if (!activeItem) return
    const currentIndex = items.findIndex((i) => i.id === activeItem.id)
    if (currentIndex === -1) return

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex >= items.length) nextIndex = 0
    if (nextIndex < 0) nextIndex = items.length - 1

    const nextItem = items[nextIndex]
    setActiveItem(nextItem)
    if (nextItem.type === 'video') {
      setPlayingVideoId(nextItem.id)
    } else {
      setPlayingVideoId(null)
    }
  }, [activeItem, items])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeItem) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') navigateLightbox('next')
      if (e.key === 'ArrowLeft') navigateLightbox('prev')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem, navigateLightbox])

  return (
    <section id="gallery" className="gallery-sec">
      <div className="wrap">
        {/* Header Section */}
        <div className="gallery-header rv">
          <div className="gallery-eyebrow">
            <Sparkles size={14} className="gallery-sparkle" />
            <span>MOMENTS & MILESTONES</span>
          </div>
          <Split>Life at VYNTRA — Stories, Wins & Celebrations</Split>
          <p className="lead" style={{ marginTop: '0.85rem' }}>
            From late-night code sprints and student career breakthroughs to sweet milestone celebrations. Here is a glimpse of our culture and community.
          </p>

          {/* Filter Categories */}
          <div className="gallery-filter-tabs">
            <button
              type="button"
              className={`gallery-filter-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Moments
            </button>
            <button
              type="button"
              className={`gallery-filter-btn ${activeTab === 'story' ? 'active' : ''}`}
              onClick={() => setActiveTab('story')}
            >
              Stories & Videos
            </button>
            <button
              type="button"
              className={`gallery-filter-btn ${activeTab === 'celebration' ? 'active' : ''}`}
              onClick={() => setActiveTab('celebration')}
            >
              Celebrations
            </button>
            <button
              type="button"
              className={`gallery-filter-btn ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              Community
            </button>
          </div>
        </div>

        {/* Master Asymmetric Bento Grid (kahi bada, kahi chota) */}
        {loading && items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-muted)' }}>
            Loading gallery media...
          </div>
        ) : error && items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-muted)' }}>
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-muted)' }}>
            No gallery items available in this category.
          </div>
        ) : (
          <div className={`gallery-bento-grid rv ${activeTab !== 'all' ? 'gallery-filtered-mode' : ''}`}>
            {filteredItems.map((item, index) => {
              const itemImg = getImageUrl(item.image)
              const bentoClass = getBentoSizeClass(index, filteredItems.length)

              // Stat Card
              if (item.type === 'stat') {
                return (
                  <div
                    key={item.id}
                    className={`gallery-card gallery-stat-card ${bentoClass} gallery-item-${item.id}`}
                    onClick={() => openLightbox(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={item.alt}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openLightbox(item)
                      }
                    }}
                  >
                    <div className="stat-card-grid-pattern" aria-hidden="true" />
                    <div className="stat-card-glow" aria-hidden="true" />
                    <div className="stat-card-content">
                      <span className="stat-card-badge">{item.tag || 'VYNTRA IMPACT'}</span>
                      <div className="stat-card-main-number">
                        <span className="stat-huge-number">{item.statNumber}</span>
                        <span className="stat-huge-unit">{item.statUnit}</span>
                      </div>
                      <p className="stat-card-label">{item.statLabel}</p>
                    </div>
                    <div className="gallery-corner-arrow" aria-label="View metric details">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                )
              }

              // Video Cards (Card 1 or Card 6)
              if (item.type === 'video') {
                return (
                  <div
                    key={item.id}
                    className={`gallery-card gallery-video-card ${bentoClass} gallery-item-${item.id}`}
                    onClick={() => openLightbox(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play video: ${item.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openLightbox(item)
                      }
                    }}
                  >
                    <div className="gallery-img-container">
                      <img
                        src={itemImg}
                        alt={item.alt}
                        loading="lazy"
                        className="gallery-img"
                        onError={handleImageError}
                      />
                      <div className="gallery-gradient-overlay" />
                    </div>

                    {/* Top Placement Badge like reference */}
                    {item.tag && (
                      <div className="gallery-badge-top">
                        <span className="gallery-badge-pill">{item.tag}</span>
                      </div>
                    )}

                    {/* Bottom / Subtitle Badge like "Maine College" */}
                    {item.captionBadge && (
                      <div className="gallery-caption-badge-bottom">
                        <span className="caption-badge-pill">{item.captionBadge}</span>
                      </div>
                    )}

                    {/* Frosted Circular Play Button */}
                    <div className="gallery-play-btn-wrapper" aria-hidden="true">
                      <div className="gallery-play-btn">
                        <Play size={20} className="gallery-play-icon" fill="white" />
                      </div>
                    </div>

                    {/* Card Title & Meta overlay */}
                    <div className="gallery-info-bottom">
                      <h3 className="gallery-card-title">{item.title}</h3>
                      {item.subtitle && <p className="gallery-card-subtitle">{item.subtitle}</p>}
                    </div>

                    {/* Top Right Arrow */}
                    <div className="gallery-corner-arrow" aria-hidden="true">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                )
              }

              // Image Cards (Card 2, Card 3, Card 5, Card 7)
              return (
                <div
                  key={item.id}
                  className={`gallery-card gallery-image-card ${bentoClass} gallery-item-${item.id}`}
                  onClick={() => openLightbox(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View photo: ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openLightbox(item)
                    }
                  }}
                >
                  <div className="gallery-img-container">
                    <img
                      src={itemImg}
                      alt={item.alt}
                      loading="lazy"
                      className="gallery-img"
                      onError={handleImageError}
                    />
                    <div className="gallery-gradient-overlay" />
                  </div>

                  {/* Top Right Circle Arrow Button matching screenshot */}
                  <div className="gallery-corner-arrow" aria-label="Expand image">
                    <ArrowUpRight size={18} />
                  </div>

                  {/* Bottom Overlay Title & Tag */}
                  <div className="gallery-info-bottom">
                    {item.tag && <span className="gallery-mini-tag">{item.tag}</span>}
                    <h3 className="gallery-card-title">{item.title}</h3>
                    {item.subtitle && <p className="gallery-card-subtitle">{item.subtitle}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Interactive Lightbox Modal */}
      {activeItem && (
        <div className="gallery-modal-backdrop" onClick={closeLightbox}>
          <div className="gallery-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              className="gallery-modal-close"
              onClick={closeLightbox}
              aria-label="Close preview"
            >
              <X size={22} />
            </button>

            {/* Navigation Arrows */}
            <button
              type="button"
              className="gallery-modal-nav gallery-nav-prev"
              onClick={() => navigateLightbox('prev')}
              aria-label="Previous item"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className="gallery-modal-nav gallery-nav-next"
              onClick={() => navigateLightbox('next')}
              aria-label="Next item"
            >
              <ChevronRight size={24} />
            </button>

            {/* Modal Body */}
            <div className="gallery-modal-content">
              <div className="gallery-modal-visual">
                {activeItem.type === 'stat' ? (
                  <div className="gallery-modal-stat-card">
                    <span className="stat-card-badge">{activeItem.tag}</span>
                    <div className="stat-card-main-number">
                      <span className="stat-huge-number">{activeItem.statNumber}</span>
                      <span className="stat-huge-unit">{activeItem.statUnit}</span>
                    </div>
                    <p className="stat-card-label" style={{ fontSize: '1.4rem' }}>{activeItem.statLabel}</p>
                    <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', maxWidth: '42ch', textAlign: 'center' }}>
                      Over one million developers, aspiring software engineers, and founders have learned, built, or shipped digital products with our open knowledge, workshops, and ecosystem.
                    </p>
                  </div>
                ) : activeItem.type === 'video' ? (
                  <div className="gallery-modal-video-box">
                    <img
                      src={getImageUrl(activeItem.image)}
                      alt={activeItem.alt}
                      className="gallery-modal-img"
                      onError={handleImageError}
                    />
                    <div className="gallery-modal-video-overlay">
                      <div className="gallery-modal-play-pulse">
                        <Play size={32} fill="white" />
                      </div>
                      <p className="gallery-modal-video-caption">
                        {activeItem.captionBadge || activeItem.tag}
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={getImageUrl(activeItem.image)}
                    alt={activeItem.alt}
                    className="gallery-modal-img"
                    onError={handleImageError}
                  />
                )}
              </div>

              {/* Modal Description Footer */}
              <div className="gallery-modal-details">
                <div className="gallery-modal-meta">
                  {activeItem.tag && <span className="gallery-modal-tag">{activeItem.tag}</span>}
                  <span className="gallery-modal-counter">
                    {items.findIndex((i: GalleryItem) => i.id === activeItem.id) + 1} / {items.length}
                  </span>
                </div>
                <h3 className="gallery-modal-title">{activeItem.title}</h3>
                {activeItem.subtitle && (
                  <p className="gallery-modal-subtitle">{activeItem.subtitle}</p>
                )}
                {activeItem.caption && (
                  <p className="gallery-modal-desc">{activeItem.caption}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
