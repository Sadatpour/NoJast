'use client'

import { useLanguage } from "@/components/LanguageProvider"
import Link from "next/link"
import { Instagram, Twitter, Linkedin, MessageSquare, MessageCircle, Mail, Github } from "lucide-react"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link 
            href="/"
            className="flex items-center justify-center"
          >
            <span className="text-xl font-bold">نوجَست</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('footerTagline')}
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
        <p className="text-center text-sm text-muted-foreground">{t('footerLove')}</p>
      </div>
    </footer>
  )
} 