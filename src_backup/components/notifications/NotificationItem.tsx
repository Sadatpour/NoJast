"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { formatDistanceToNow as formatDistanceToNowJalali } from "date-fns-jalali"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/components/LanguageProvider"

export type NotificationType = 
  | 'upvote'   // Someone upvoted your product
  | 'comment'  // Someone commented on your product
  | 'follow'   // Someone followed you
  | 'mention'  // Someone mentioned you in a comment
  | 'system'   // System notification

export interface NotificationProps {
  id: string
  type: NotificationType
  message: string
  linkUrl: string
  isRead: boolean
  createdAt: string
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({
  id,
  type,
  message,
  linkUrl,
  isRead,
  createdAt,
  onMarkAsRead,
  onDelete,
}: NotificationProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()
  const { locale } = useLanguage()
  
  const timeAgo = locale === 'fa'
    ? formatDistanceToNowJalali(new Date(createdAt), { addSuffix: true })
    : formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDeleting(true)
    await onDelete(id)
    setIsDeleting(false)
  }

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id)
    }
  }

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'upvote':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'comment':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'follow':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        )
      case 'mention':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'system':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        )
    }
  }

  return (
    <Link 
      href={linkUrl}
      onClick={handleClick}
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-colors",
        isRead 
          ? "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800" 
          : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
      )}
    >
      {getIcon()}
      
      <div className="flex-1">
        <p className={cn(
          "text-sm",
          !isRead && "font-medium"
        )}>
          {message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {timeAgo}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 flex-shrink-0 self-start opacity-70 hover:opacity-100"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">حذف اعلان</span>
      </Button>
    </Link>
  )
} 