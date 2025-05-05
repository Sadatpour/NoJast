"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { getLocale } from "@/lib/i18n"
import { Settings, User, Box, MessageSquare, Heart } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardSidebar({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const locale = getLocale()
  
  const items = [
    {
      title: locale === 'fa' ? 'محصولات من' : 'My Products',
      href: "/dashboard?tab=products",
      icon: <Box className="mr-2 h-4 w-4" />
    },
    {
      title: locale === 'fa' ? 'پسندیده‌ها' : 'Upvoted',
      href: "/dashboard?tab=upvotes",
      icon: <Heart className="mr-2 h-4 w-4" />
    },
    {
      title: locale === 'fa' ? 'نظرات من' : 'My Comments',
      href: "/dashboard?tab=comments",
      icon: <MessageSquare className="mr-2 h-4 w-4" />
    },
    {
      title: locale === 'fa' ? 'پروفایل' : 'Profile',
      href: "/dashboard?tab=profile",
      icon: <User className="mr-2 h-4 w-4" />
    },
    {
      title: locale === 'fa' ? 'تنظیمات' : 'Settings',
      href: "/dashboard?tab=settings",
      icon: <Settings className="mr-2 h-4 w-4" />
    }
  ]

  return (
    <nav
      className={cn(
        "flex flex-col space-y-2",
        className
      )}
      {...props}
    >
      <div className="py-2">
        <h2 className="px-2 pb-2 text-lg font-semibold tracking-tight">
          {locale === 'fa' ? 'داشبورد' : 'Dashboard'}
        </h2>
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href ||
                  (pathname === "/dashboard" && 
                   ((item.href.includes("tab=products") && !pathname.includes("tab=")) ||
                    (pathname.includes(item.href.split("=")[1]))))
                  ? "bg-accent hover:bg-accent"
                  : "hover:bg-accent hover:bg-opacity-20",
                "justify-start w-full"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
} 