'use client'

import { createContext, useContext, ReactNode } from 'react'

interface LanguageContextType {
  t: (key: string) => string
  locale: string
}

const LanguageContext = createContext<LanguageContextType>({
  t: (key: string) => key,
  locale: 'fa'
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageContext.Provider
      value={{
        t: (key: string) => key,
        locale: 'fa'
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 