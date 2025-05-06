'use client'

import React, { createContext, useContext } from 'react'
import { translations } from '@/lib/i18n'

type LanguageContextType = {
  t: (key: keyof typeof translations.fa) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const t = (key: keyof typeof translations.fa): string => {
    return translations.fa[key] || key
  }

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 