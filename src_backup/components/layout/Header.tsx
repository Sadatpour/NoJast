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

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  const { t, locale, changeLocale } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-4 flex items-center space-x-2 rtl:space-x-reverse">
          <span className="hidden font-bold sm:inline-block">
            نوجَست
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end rtl:space-x-reverse">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchBar />
          </div>
          
          <nav className="flex items-center space-x-2 rtl:space-x-reverse">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {locale === 'fa' ? 'فارسی' : 'English'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLocale('fa' as Locale)}>
                  فارسی
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale('en' as Locale)}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/submit-product">
                    {t('submit')}
                  </Link>
                </Button>
                <NotificationDropdown />
                <UserNav user={user} />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    {t('login')}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">
                    {t('signup')}
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 