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
    <div className="flex flex-wrap gap-2 my-4">
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={cat.id === category ? "default" : "outline"}
          className={cn(
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