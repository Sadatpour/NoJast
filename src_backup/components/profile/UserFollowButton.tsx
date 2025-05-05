"use client"

import { useState } from "react"
import { UserPlus, UserMinus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface UserFollowButtonProps {
  userId: string
  targetUserId: string
  initialIsFollowing: boolean
}

export function UserFollowButton({
  userId,
  targetUserId,
  initialIsFollowing,
}: UserFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleFollow = async () => {
    setIsLoading(true)
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({
            follower_id: userId,
            following_id: targetUserId
          })
        
        if (error) throw error
        
        setIsFollowing(false)
        
        // Create notification for unfollow (optional, most platforms don't notify for unfollows)
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: userId,
            following_id: targetUserId
          })
        
        if (error) throw error
        
        setIsFollowing(true)
        
        // Create notification for new follower
        await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: 'follow',
            message: 'کاربری شما را دنبال کرد',
            link_url: `/u/${userId}`, // Link to the follower's profile
            is_read: false
          })
      }
      
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      variant={isFollowing ? "outline" : "default"}
      className="w-full"
      disabled={isLoading}
    >
      {isFollowing ? (
        <>
          <UserMinus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
          <span>دنبال شده</span>
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
          <span>دنبال کردن</span>
        </>
      )}
    </Button>
  )
} 