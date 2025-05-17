import { Loader2 } from "lucide-react"

export function Loading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="mr-2 text-lg">در حال بارگذاری...</span>
    </div>
  )
} 