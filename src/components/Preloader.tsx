'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/LanguageProvider'

export function Preloader() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const { locale } = useLanguage()

  useEffect(() => {
    // Start fade out animation after 1.2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1200)

    // Complete removal after fade out animation (500ms)
    const removeTimer = setTimeout(() => {
      setLoading(false)
    }, 1700)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!loading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
        "transition-opacity duration-500",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="relative">
        {/* Logo animation */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="h-24 w-24 relative animate-scale-up">
            <svg 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Spinning circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                fill="none" 
                stroke="#0d786b" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray="80 180" 
                strokeDashoffset="0" 
                className="animate-spin [animation-duration:2s]"
              />
              
              {/* Arrow/triangle shape */}
              <polygon 
                points="45,30 65,50 45,70" 
                fill="#0d786b" 
                className="animate-pulse"
              />
            </svg>
          </div>
          
          {/* Brand name with reveal effect */}
          <div className={cn(
            "absolute text-4xl font-bold text-secondary mt-36",
            locale === "fa" ? "font-kalameh" : ""
          )}>
            {locale === "fa" ? (
              <>
                <span className="inline-block animate-fade-in [animation-delay:100ms]">ن</span>
                <span className="inline-block animate-fade-in [animation-delay:200ms]">و</span>
                <span className="inline-block animate-fade-in [animation-delay:300ms]">ج</span>
                <span className="inline-block animate-fade-in [animation-delay:400ms]">َ</span>
                <span className="inline-block animate-fade-in [animation-delay:500ms]">س</span>
                <span className="inline-block animate-fade-in [animation-delay:600ms]">ت</span>
              </>
            ) : (
              <>
                <span className="inline-block animate-fade-in [animation-delay:100ms]">N</span>
                <span className="inline-block animate-fade-in [animation-delay:200ms]">O</span>
                <span className="inline-block animate-fade-in [animation-delay:300ms]">J</span>
                <span className="inline-block animate-fade-in [animation-delay:400ms]">A</span>
                <span className="inline-block animate-fade-in [animation-delay:500ms]">S</span>
                <span className="inline-block animate-fade-in [animation-delay:600ms]">T</span>
              </>
            )}
          </div>
        </div>
        
        {/* Loading message */}
        <p className={cn(
          "text-muted-foreground text-sm animate-pulse text-center",
          locale === "fa" ? "font-kalameh" : ""
        )}>
          {locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
        </p>
      </div>
    </div>
  )
} 
