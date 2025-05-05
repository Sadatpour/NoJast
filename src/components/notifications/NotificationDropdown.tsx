"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuFooter,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { NotificationItem, type NotificationType } from "./NotificationItem"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/components/LanguageProvider"

interface Notification {
  id: string
  type: NotificationType
  message: string
  link_url: string
  is_read: boolean
  created_at: string
  user_id: string
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Set up realtime subscription for new notifications
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return
      
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            // Update notifications when a new one is added
            setNotifications(prevNotifications => [
              payload.new as Notification,
              ...prevNotifications
            ].slice(0, 10))
            
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()
      
      return () => {
        supabase.removeChannel(channel)
      }
    }
    
    const cleanup = setupSubscription()
    
    return () => {
      cleanup.then(fn => fn && fn())
    }
  }, [supabase])

  const handleMarkAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true } 
          : notification
      ))
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
      
      const updatedNotifications = notifications.filter(
        notification => notification.id !== id
      )
      
      setNotifications(updatedNotifications)
      
      // Update unread count if the deleted notification was unread
      const wasUnread = notifications.find(n => n.id === id)?.is_read === false
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return
      
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false)
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })))
      
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const hasUnread = unreadCount > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">اعلان‌ها</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>اعلان‌ها</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto text-xs font-normal"
              onClick={handleMarkAllAsRead}
            >
              علامت همه به عنوان خوانده شده
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            در حال بارگذاری...
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="p-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  type={notification.type}
                  message={notification.message}
                  linkUrl={notification.link_url}
                  isRead={notification.is_read}
                  createdAt={notification.created_at}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            هیچ اعلانی وجود ندارد
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuFooter>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full h-auto text-sm"
          >
            <Link href="/dashboard/notifications">
              مشاهده همه اعلان‌ها
            </Link>
          </Button>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 