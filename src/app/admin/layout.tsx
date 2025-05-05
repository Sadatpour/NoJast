"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/LanguageProvider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useLanguage()
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // بررسی کاربر لاگین شده
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          toast({
            variant: "destructive",
            title: locale === 'fa' ? "لطفاً وارد حساب کاربری شوید" : "Please sign in",
          })
          router.push('/login')
          return
        }
        
        // بررسی وضعیت ادمین بودن
        const { data } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        if (!data?.is_admin) {
          toast({
            variant: "destructive",
            title: locale === 'fa' ? "شما دسترسی به پنل ادمین ندارید" : "You don't have admin access",
          })
          // Redirect to the homepage instead of dashboard
          router.push('/')
          return
        }
        
        setIsAdmin(true)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAdminStatus()
  }, [router, supabase, locale])
  
  if (loading) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (isAdmin === false) {
    return null // Not rendering anything as we're redirecting
  }
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          <h2 className="text-xl font-bold mb-4">{locale === 'fa' ? "پنل مدیریت" : "Admin Panel"}</h2>
          
          <AdminNavLink href="/admin" exact>
            {locale === 'fa' ? "داشبورد" : "Dashboard"}
          </AdminNavLink>
          
          <AdminNavLink href="/admin/products">
            {locale === 'fa' ? "مدیریت محصولات" : "Manage Products"}
          </AdminNavLink>

          <AdminNavLink href="/admin/banner-ads">
            {locale === 'fa' ? "مدیریت تبلیغات" : "Banner Ads"}
          </AdminNavLink>
          
          <AdminNavLink href="/admin/direct-approve">
            {locale === 'fa' ? "تایید مستقیم محصولات" : "Direct Approve"}
          </AdminNavLink>
          
          <div className="pt-4">
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === 'fa' ? "← بازگشت به سایت" : "← Return to Site"}
            </Link>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-background border rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// کامپوننت لینک منو
function AdminNavLink({ 
  href, 
  exact = false, 
  children 
}: { 
  href: string; 
  exact?: boolean; 
  children: React.ReactNode 
}) {
  const [isActive, setIsActive] = useState(false)
  const { pathname } = typeof window !== 'undefined' 
    ? window.location 
    : { pathname: '' }
  
  useEffect(() => {
    if (exact) {
      setIsActive(pathname === href)
    } else {
      setIsActive(pathname.startsWith(href))
    }
  }, [pathname, href, exact])
  
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {children}
    </Link>
  )
} 