'use client'

import { useLanguage } from "@/components/LanguageProvider"
import Link from "next/link"
import { Instagram, Twitter, Linkedin, MessageSquare, MessageCircle, Mail, Github } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const { t, locale } = useLanguage()

  return (
    <footer className="w-full h-16 border-t border-gray-300 dark:border-zinc-500 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:fixed md:bottom-0 md:left-0 md:right-0 md:z-50">
      <div className="container flex flex-col items-center justify-between gap-2 h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link 
            href="/"
            className="flex items-center justify-center"
          >
            <Image src="/logos/logo-fa.png" alt="نوجست" width={120} height={40} className="h-8 w-auto" priority style={{height: 'auto'}} />
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            پلتفرمی برای کشف، رای دادن و بحث در مورد جدیدترین محصولات و استارتاپ‌های ایرانی
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
          <Link 
            href="https://instagram.com/sadatpour"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link 
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link 
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link 
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Telegram</span>
          </Link>
          <Link 
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">WhatsApp</span>
          </Link>
          <Link 
            href="mailto:sadatpour.web@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">Email</span>
          </Link>
          <Link 
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          ساخته شده با ❤️ توسط
          <Link 
            href="https://sadatpour.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mr-1 text-muted-foreground hover:underline"
          >
            مجتبا سادات‌پور
          </Link>
        </p>
      </div>
    </footer>
  )
} 