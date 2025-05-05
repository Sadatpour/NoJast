"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { fa } from "date-fns/locale"
import { MoreHorizontal, Flag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

interface CommentItemProps {
  id: string
  text: string
  createdAt: string
  userId: string
  userName: string
  userAvatarUrl: string | null
  currentUserId: string | null
  onCommentDeleted: () => void
}

export function CommentItem({
  id,
  text,
  createdAt,
  userId,
  userName,
  userAvatarUrl,
  currentUserId,
  onCommentDeleted,
}: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), { 
    addSuffix: true,
    locale: fa,
  })
  
  const isOwnComment = currentUserId === userId
  
  const handleDeleteComment = async () => {
    if (!isOwnComment || !currentUserId) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId)
      
      if (error) throw error
      
      toast({
        title: "نظر حذف شد",
        description: "نظر شما با موفقیت حذف شد.",
      })
      
      onCommentDeleted()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در حذف نظر",
        description: error.message || "مشکلی در فرآیند حذف نظر پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleReportComment = async () => {
    toast({
      title: "گزارش ثبت شد",
      description: "گزارش شما ثبت شد و توسط تیم پشتیبانی بررسی خواهد شد.",
    })
  }

  return (
    <div className="flex gap-3 py-4">
      <div className="flex-shrink-0">
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
          {userAvatarUrl ? (
            <Image 
              src={userAvatarUrl} 
              alt={userName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-xs font-semibold">
              {userName.charAt(0)}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{userName}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">فهرست گزینه‌ها</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnComment ? (
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500"
                  onClick={handleDeleteComment}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{isDeleting ? "در حال حذف..." : "حذف نظر"}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleReportComment}>
                  <Flag className="mr-2 h-4 w-4" />
                  <span>گزارش نظر</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{text}</p>
      </div>
    </div>
  )
} 