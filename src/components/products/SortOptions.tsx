"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "trending", label: "داغ‌ترین" },
]

export function SortOptions() {
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

  const handleSortChange = (value: string) => {
    router.push(`/products?${createQueryString("sort", value)}`)
  }

  return (
    <div className="w-auto min-w-[120px] ml-2">
      <Select
        value={sort}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-full border border-gray-300 dark:border-silver bg-background">
          <SelectValue placeholder="انتخاب نحوه نمایش" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
} 