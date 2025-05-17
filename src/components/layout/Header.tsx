'use client'

import * as React from "react"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/LanguageProvider"
import { UserNav } from "@/components/layout/UserNav"
import { User } from "@supabase/supabase-js"
import { SearchBar } from "@/components/SearchBar"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Locale } from "@/lib/i18n"
import { LogIn } from "lucide-react"
import Image from "next/image"

/**
 * Props for the Header component
 * @interface HeaderProps
 * @property {User | null} user - The current user object from Supabase, or null if not logged in
 */
interface HeaderProps {
  user: User | null
}

/**
 * Header component that displays the main navigation bar
 * 
 * @component
 * @param {HeaderProps} props - The component props
 * @returns {JSX.Element} The rendered header component
 * 
 * @example
 * ```tsx
 * <Header user={currentUser} />
 * ```
 */
export function Header({ user }: HeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-300 dark:border-zinc-500">
      <div className="container flex h-20 items-center justify-between">
        <div className="mr-4 flex items-center space-x-2 rtl:space-x-reverse">
          <Link href="/" className="flex items-center">
            <Image src="/logos/logo-fa.png" alt="نوجست" width={180} height={60} className="h-12 w-auto" priority />
          </Link>
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            نو ( New ) + جَست ( Search )
          </span>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end rtl:space-x-reverse">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchBar />
          </div>
          
          <nav className="flex items-center space-x-2 rtl:space-x-reverse">
            <ModeToggle />
            <Link href="/contact">
              <Button variant="outline" size="sm" className="hidden md:inline-flex">
                ارتباط با ما
              </Button>
            </Link>
            <Link href="/submit-product">
              <Button 
                variant="default" 
                size="sm" 
                className="hidden md:inline-flex" 
                style={{ backgroundColor: '#EF9D38', paddingLeft: 12, paddingRight: 12 }}
              >
                ثبت محصول
              </Button>
            </Link>
            {user ? (
              <UserNav user={user} />
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    {t('signup')}
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 