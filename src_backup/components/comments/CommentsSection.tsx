"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { CommentForm } from "./CommentForm"
import { CommentItem } from "./CommentItem"

interface Comment {
  id: string
  text: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

interface CommentsProps {
  productId: string
}

export function CommentsSection({ productId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          text,
          created_at,
          user_id,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setComments(commentsData || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
  }

  useEffect(() => {
    fetchUser()
    fetchComments()
  }, [productId])

  const handleCommentAdded = () => {
    fetchComments()
  }

  const handleCommentDeleted = () => {
    fetchComments()
  }

  const handleLogin = () => {
    router.push(`/login?redirectTo=/products/${productId}`)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">نظرات</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        </div>

        {user ? (
          <CommentForm 
            productId={productId} 
            userId={user.id} 
            onCommentAdded={handleCommentAdded} 
          />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              برای ارسال نظر باید وارد حساب کاربری خود شوید
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleLogin}>
                ورود به حساب کاربری
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">ثبت‌نام</Link>
              </Button>
            </div>
          </div>
        )}

        {comments.length > 0 || isLoading ? (
          <div className="mt-8">
            <Separator className="my-4" />
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map(comment => (
                  <div key={comment.id}>
                    <CommentItem
                      id={comment.id}
                      text={comment.text}
                      createdAt={comment.created_at}
                      userId={comment.user_id}
                      userName={comment.profiles.full_name}
                      userAvatarUrl={comment.profiles.avatar_url}
                      currentUserId={user?.id || null}
                      onCommentDeleted={handleCommentDeleted}
                    />
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 mt-6">
            <p className="text-gray-500 dark:text-gray-400">
              هنوز نظری برای این محصول ثبت نشده است. اولین نفری باشید که نظر می‌دهد.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 