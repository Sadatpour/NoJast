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
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">مرتب‌سازی:</span>
      <Select
        value={sort}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="انتخاب نحوه نمایش" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="newest">جدیدترین</SelectItem>
            <SelectItem value="popular">محبوب‌ترین</SelectItem>
            <SelectItem value="trending">داغ‌ترین</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
} 