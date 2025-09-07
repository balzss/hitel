"use client"

import { useEffect } from 'react'
import { type Language, getTranslation } from '@/lib/i18n'

export function usePageMetadata(language: Language) {
  useEffect(() => {
    const t = getTranslation(language)
    
    // Update document title
    document.title = t.pageTitle
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', t.pageDescription)
    } else {
      // Create meta description if it doesn't exist
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = t.pageDescription
      document.head.appendChild(meta)
    }
    
    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', t.pageTitle)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:title')
      meta.content = t.pageTitle
      document.head.appendChild(meta)
    }
    
    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', t.pageDescription)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:description')
      meta.content = t.pageDescription
      document.head.appendChild(meta)
    }
    
    // Update language attribute on html element
    document.documentElement.lang = language
    
  }, [language])
}
