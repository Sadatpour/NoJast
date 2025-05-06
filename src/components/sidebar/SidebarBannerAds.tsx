"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/LanguageProvider"
import { Megaphone } from "lucide-react"

type SidebarType = "main-left" | "main-right" | "product"

interface SidebarBannerAdsProps {
  sidebar: SidebarType
  className?: string
}

interface BannerAd {
  id: string
  title: string
  image_url: string
  link: string
  priority: number
  start_date: string
  end_date: string
}

const PAGE_SIZE = 5

export const SidebarBannerAds = ({ sidebar, className }: SidebarBannerAdsProps) => {
  const supabase = createClient()
  const { locale } = useLanguage()
  const [ads, setAds] = useState<BannerAd[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const fetchAds = useCallback(async (pageNum: number) => {
    setLoading(true)
    const { data, error } = await supabase
      .from("banner_ads")
      .select("id, title, image_url, link, priority, start_date, end_date")
      .eq("sidebar", sidebar)
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)
    if (error) {
      console.error('Banner fetch error:', error);
    }
    if (data && data.length === 0) {
      console.warn('No banners found for sidebar:', sidebar);
    }
    if (!error) {
      setAds(prev => [...prev, ...(data || [])])
      setHasMore((data?.length || 0) === PAGE_SIZE)
    }
    setLoading(false)
  }, [sidebar, supabase])

  useEffect(() => {
    setAds([])
    setPage(1)
    setHasMore(true)
  }, [sidebar])

  useEffect(() => {
    fetchAds(page)
  }, [fetchAds, page])

  // Helper to shuffle and pick 3 random ads
  function getRandomAds(adList: BannerAd[], count: number) {
    const shuffled = [...adList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(p => p + 1)
        }
      },
      { threshold: 1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [hasMore, loading])

  return (
    <aside className={cn("flex flex-col gap-4", className)}>
      <div className="font-semibold text-center text-xs text-gray-600 dark:text-gray-300 mb-2 flex items-center justify-center gap-2 border-b border-gray-300 dark:border-zinc-700 pb-2">
        <Megaphone className="w-6 h-6 inline-block mb-0.5" style={{ color: '#F99E32' }} />
        <span>بنرگاه</span>
        <span className="text-[.95em] text-gray-500 dark:text-zinc-400">(با شما زنده ایم!)</span>
        <span className="inline-block w-16 h-6">
          <svg viewBox="0 0 64 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path id="heartbeat-path" d="M2,12 H12 L16,22 L24,2 L32,22 L36,12 H48 L54,6 L62,12" className="stroke-gray-400 dark:stroke-zinc-300" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            <circle r="2.5" fill="#ef4444">
              <animateMotion dur="2s" repeatCount="indefinite">
                <mpath href="#heartbeat-path" />
              </animateMotion>
            </circle>
          </svg>
        </span>
      </div>
      {getRandomAds(ads, 3).map(ad => (
        <a
          key={ad.id}
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden border bg-white dark:bg-gray-900 shadow hover:shadow-lg transition-all"
          aria-label={ad.title}
          tabIndex={0}
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-32 object-contain bg-gray-50 dark:bg-gray-800"
            loading="lazy"
          />
        </a>
      ))}
      {loading && <div className="text-center py-2 text-xs text-gray-500">در حال بارگذاری...</div>}
      <div ref={loaderRef} />
    </aside>
  )
} 