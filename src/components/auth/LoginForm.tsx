"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/LanguageProvider"
import { Github } from "lucide-react"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const { locale } = useLanguage()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const { toast } = useToast()
  const supabase = createClient()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })

        if (error) throw error

        toast({
          title: locale === 'fa' ? "ثبت نام با موفقیت انجام شد" : "Sign up successful",
          description: locale === 'fa' 
            ? "لطفاً ایمیل خود را برای تأیید حساب کاربری بررسی کنید" 
            : "Please check your email to verify your account",
        })
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: locale === 'fa' ? "ورود با موفقیت انجام شد" : "Sign in successful",
          description: locale === 'fa' 
            ? "به نوجست خوش آمدید" 
            : "Welcome to Nojast",
        })

        router.refresh()
        router.push("/")
      }
    } catch (error) {
      console.error(error)
      toast({
        title: locale === 'fa' ? "خطا" : "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGithub() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
    } catch (error) {
      console.error(error)
      toast({
        title: locale === 'fa' ? "خطا" : "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6" {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="fullName">
                {locale === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'}
              </Label>
              <Input
                id="fullName"
                placeholder={locale === 'fa' ? 'نام و نام خانوادگی خود را وارد کنید' : 'Enter your full name'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required={isSignUp}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">
              {locale === 'fa' ? 'ایمیل' : 'Email'}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={locale === 'fa' ? 'name@example.com' : 'name@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                {locale === 'fa' ? 'رمز عبور' : 'Password'}
              </Label>
              <Button 
                variant="link" 
                className="px-0 text-xs font-normal h-auto"
                onClick={() => router.push('/forgot-password')}
                type="button"
              >
                {locale === 'fa' ? 'فراموشی رمز عبور؟' : 'Forgot password?'}
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={locale === 'fa' ? '••••••••' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>
          <Button className="bg-secondary hover:bg-secondary/90" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'fa' ? 'درحال پردازش...' : 'Processing...'}
              </div>
            ) : isSignUp ? (
              locale === 'fa' ? 'ثبت نام' : 'Sign Up'
            ) : (
              locale === 'fa' ? 'ورود' : 'Sign In'
            )}
          </Button>
        </div>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {locale === 'fa' ? 'یا ادامه با' : 'Or continue with'}
          </span>
        </div>
      </div>
      
      <Button variant="outline" type="button" disabled={isLoading} onClick={signInWithGithub}>
        <Github className="mr-2 h-4 w-4" />
        {locale === 'fa' ? 'گیت‌هاب' : 'GitHub'}
      </Button>
      
      <div className="text-center">
        <Button 
          variant="link" 
          className="px-0 text-xs font-normal h-auto"
          onClick={() => setIsSignUp(!isSignUp)}
          type="button"
          disabled={isLoading}
        >
          {isSignUp 
            ? (locale === 'fa' ? 'قبلاً حساب کاربری دارید؟ ورود' : 'Already have an account? Sign In') 
            : (locale === 'fa' ? 'حساب کاربری ندارید؟ ثبت نام' : 'Don\'t have an account? Sign Up')}
        </Button>
      </div>
    </div>
  )
} 