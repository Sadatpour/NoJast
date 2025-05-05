"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", name: "همه" },
  { id: "tools", name: "ابزارها" },
  { id: "games", name: "بازی‌ها" },
  { id: "ai", name: "هوش مصنوعی" },
  { id: "productivity", name: "بهره‌وری" },
  { id: "education", name: "آموزش" },
  { id: "design", name: "طراحی" },
  { id: "development", name: "توسعه" },
  { id: "marketing", name: "بازاریابی" },
  { id: "finance", name: "مالی" },
  { id: "services", name: "خدمات" },
  { id: "others", name: "سایر" },
]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
    <div className="flex flex-nowrap gap-1 overflow-x-auto my-4 scrollbar-none">
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={cat.id === category ? "default" : "outline"}
          className={cn(
            "whitespace-nowrap px-2 py-1 text-xs",
            "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
            cat.id === category 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent hover:bg-primary/90"
          )}
          onClick={() => handleCategoryChange(cat.id)}
        >
          {cat.name}
        </Badge>
      ))}
    </div>
  )
} 
