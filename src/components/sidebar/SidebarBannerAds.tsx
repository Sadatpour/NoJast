"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
      {ads.map(ad => (
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
      {!hasMore && ads.length > 0 && (
        <div className="text-center text-xs text-gray-400 py-2">پایان تبلیغات</div>
      )}
    </aside>
  )
} 