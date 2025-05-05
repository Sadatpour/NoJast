"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { NotificationItem, type NotificationType } from "./NotificationItem"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  type: NotificationType
  message: string
  link_url: string
  is_read: boolean
  created_at: string
  user_id: string
}

interface DashboardNotificationsProps {
  userId: string
}

export function DashboardNotifications({ userId }: DashboardNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState("all")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      // Apply filters based on the selected tab
      if (currentTab === "unread") {
        query = query.eq('is_read', false)
      }
      
      const { data, error } = await query.limit(50)
      
      if (error) throw error
      
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        variant: "destructive",
        title: "خطا در بارگیری اعلان‌ها",
        description: "مشکلی در دریافت اعلان‌ها پیش آمده است. لطفا مجددا تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('notifications-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch on any change to the notifications table
          fetchNotifications()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, currentTab, supabase])

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
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        variant: "destructive",
        title: "خطا",
        description: "مشکلی در علامت‌گذاری اعلان پیش آمده است.",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
      
      setNotifications(notifications.filter(notification => notification.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast({
        variant: "destructive",
        title: "خطا",
        description: "مشکلی در حذف اعلان پیش آمده است.",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })))
      
      toast({
        title: "انجام شد",
        description: "تمامی اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند.",
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast({
        variant: "destructive",
        title: "خطا",
        description: "مشکلی در علامت‌گذاری اعلان‌ها پیش آمده است.",
      })
    }
  }

  const handleDeleteAll = async () => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
      
      setNotifications([])
      
      toast({
        title: "انجام شد",
        description: "تمامی اعلان‌ها حذف شدند.",
      })
    } catch (error) {
      console.error('Error deleting all notifications:', error)
      toast({
        variant: "destructive",
        title: "خطا",
        description: "مشکلی در حذف اعلان‌ها پیش آمده است.",
      })
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="all">همه اعلان‌ها ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">خوانده نشده ({unreadCount})</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button 
            variant="outline" 
            size="sm"
            className="text-sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            علامت همه به عنوان خوانده شده
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            className="text-sm"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            حذف همه
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 py-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification.id}>
              <NotificationItem
                id={notification.id}
                type={notification.type}
                message={notification.message}
                linkUrl={notification.link_url}
                isRead={notification.is_read}
                createdAt={notification.created_at}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
              <Separator />
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">هیچ اعلانی وجود ندارد</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {currentTab === "unread" 
                ? "شما هیچ اعلان خوانده نشده‌ای ندارید." 
                : "شما در حال حاضر هیچ اعلانی ندارید."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 