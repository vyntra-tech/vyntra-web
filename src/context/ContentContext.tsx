import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { contentApi, settingsApi } from '../services/api'
import type { WebsiteContent, SiteSettings } from '../types'

interface ContentContextValue {
  content: WebsiteContent | null
  settings: SiteSettings | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const ContentContext = createContext<ContentContextValue>({
  content: null,
  settings: null,
  loading: true,
  error: null,
  refresh: async () => {},
})

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<WebsiteContent | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCMS = useCallback(async () => {
    try {
      const [contentData, settingsData] = await Promise.all([
        contentApi.get().catch(() => null),
        settingsApi.get().catch(() => null),
      ])
      if (contentData) setContent(contentData)
      if (settingsData) setSettings(settingsData)
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Failed to load website content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCMS()
  }, [fetchCMS])

  return (
    <ContentContext.Provider value={{ content, settings, loading, error, refresh: fetchCMS }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  return useContext(ContentContext)
}
