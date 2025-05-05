"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/LanguageProvider"

const categories = [
  { id: "all", name: { fa: "همه", en: "All" } },
  { id: "tools", name: { fa: "ابزارها", en: "Tools" } },
  { id: "games", name: { fa: "بازی‌ها", en: "Games" } },
  { id: "ai", name: { fa: "هوش مصنوعی", en: "AI" } },
  { id: "productivity", name: { fa: "بهره‌وری", en: "Productivity" } },
  { id: "education", name: { fa: "آموزش", en: "Education" } },
  { id: "design", name: { fa: "طراحی", en: "Design" } },
  { id: "development", name: { fa: "توسعه", en: "Development" } },
  { id: "marketing", name: { fa: "بازاریابی", en: "Marketing" } },
  { id: "finance", name: { fa: "مالی", en: "Finance" } },
  { id: "services", name: { fa: "خدمات", en: "Services" } },
  { id: "others", name: { fa: "سایر", en: "Others" } },
]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLanguage()
  
  const category = searchParams.get("category") || "all"
  const sort = searchParams.get("sort") || "newest"

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleCategoryChange = (categoryId: string) => {
    router.push(`/products?${createQueryString("category", categoryId)}`)
  }

  return (
    <div className="flex flex-nowrap gap-0.5 my-2 w-full overflow-x-hidden justify-center">
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={cat.id === category ? "default" : "outline"}
          className={cn(
            "whitespace-nowrap px-1.5 py-0.5 text-xs",
            "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
            cat.id === category 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent hover:bg-primary/90"
          )}
          onClick={() => handleCategoryChange(cat.id)}
        >
          {cat.name[locale]}
        </Badge>
      ))}
    </div>
  )
} 
