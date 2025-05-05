"use client"

import { useState } from "react"
import { ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

interface ProductUpvoteButtonProps {
  productId: string
  initialUpvotes: number
  initialHasUpvoted: boolean
  size?: "sm" | "default"
  className?: string
}

export function ProductUpvoteButton({
  productId,
  initialUpvotes,
  initialHasUpvoted,
  size = "default",
  className,
}: ProductUpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpvote = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast({
        title: "لطفاً وارد حساب کاربری خود شوید",
        description: "برای رأی دادن به محصولات باید ابتدا وارد حساب کاربری خود شوید.",
        variant: "destructive",
      })
      router.push(`/login?redirectTo=/products`)
      return
    }

    setIsLoading(true)

    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('product_upvotes')
          .delete()
          .match({ 
            user_id: session.user.id,
            product_id: productId 
          })

        if (error) throw error

        setUpvotes(prev => prev - 1)
        setHasUpvoted(false)
      } else {
        // Add upvote
        const { error } = await supabase
          .from('product_upvotes')
          .insert({ 
            user_id: session.user.id,
            product_id: productId 
          })

        if (error) throw error

        setUpvotes(prev => prev + 1)
        setHasUpvoted(true)
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "خطا در ثبت رأی",
        description: error.message || "مشکلی در فرآیند ثبت رأی پیش آمده است. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpvote}
      disabled={isLoading}
      size={size}
      variant={hasUpvoted ? "default" : "outline"}
      className={cn(
        "gap-1 font-normal",
        hasUpvoted && "bg-primary text-primary-foreground",
        className
      )}
    >
      <ArrowUp className={cn(
        "h-4 w-4",
        hasUpvoted ? "fill-current" : ""
      )} />
      <span>{upvotes}</span>
    </Button>
  )
} 