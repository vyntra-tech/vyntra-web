import React from 'react'

/**
 * Resolves an image URL into a valid, production-ready URL.
 * Handles:
 * - Absolute URLs (https://, http://, data:, blob:)
 * - Public uploads (/uploads/...)
 * - Legacy source asset paths (/src/assets/...)
 * - Relative URLs with environment-specific API hosts
 */
export function getImageUrl(path?: string | null): string {
  if (!path || typeof path !== 'string') return ''
  const trimmed = path.trim()
  if (!trimmed) return ''

  // Already absolute or data URL
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed
  }

  // Normalize legacy /src/assets paths to /uploads
  let normalized = trimmed
  if (normalized.startsWith('/src/assets/gallery/')) {
    normalized = `/uploads/${normalized.slice('/src/assets/gallery/'.length)}`
  } else if (normalized.startsWith('/src/assets/')) {
    normalized = `/uploads/${normalized.slice('/src/assets/'.length)}`
  } else if (normalized.startsWith('src/assets/')) {
    normalized = `/uploads/${normalized.slice('src/assets/'.length)}`
  }

  // If VITE_API_URL is configured as a remote origin (e.g. https://api.vyntra.tech/api or http://ec2-xx:5000)
  // and the image is served from /uploads, attach the remote origin.
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl && typeof apiUrl === 'string' && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
    try {
      const urlObj = new URL(apiUrl)
      const origin = urlObj.origin
      if (normalized.startsWith('/uploads/')) {
        return `${origin}${normalized}`
      }
    } catch {
      // ignore
    }
  }

  return normalized
}

/**
 * Fallback handler for <img> onError to prevent broken icon flash without replacing content with fake placeholders
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc?: string
) {
  const target = e.currentTarget
  if (fallbackSrc && target.src !== fallbackSrc) {
    target.src = fallbackSrc
  } else {
    target.style.opacity = '0.5'
  }
}
