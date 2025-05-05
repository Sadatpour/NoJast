'use client'

import React, { createContext, useContext, useState } from 'react'
import { Locale, translations } from '@/lib/i18n'
import { setCookie } from '@/lib/utils'

type LanguageContextType = {
  locale: Locale
  changeLocale: (locale: Locale) => void
  t: (key: keyof typeof translations.fa) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  defaultLocale = 'fa'
}: {
  children: React.ReactNode
  defaultLocale: Locale
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    setCookie('locale', newLocale, 365)
    // Refresh the page to apply new direction and font
    window.location.reload()
  }

  const t = (key: keyof typeof translations.fa): string => {
    return translations[locale][key] || key
  }

  return (
    <LanguageContext.Provider value={{ locale, changeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 