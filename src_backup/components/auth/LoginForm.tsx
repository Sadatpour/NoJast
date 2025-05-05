"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/components/LanguageProvider"

const formSchema = z.object({
  email: z.string().email({
    message: "ایمیل نامعتبر است",
  }),
  password: z.string().min(1, {
    message: "رمز عبور الزامی است",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "ورود موفقیت‌آمیز",
        description: "به نوجَست خوش آمدید.",
      })
      
      router.push(redirectTo)
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در ورود",
        description: error.message || "ایمیل یا رمز عبور اشتباه است.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در ورود با گوگل",
        description: error.message || "مشکلی در فرآیند ورود پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    router.push("/forgot-password")
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('login')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {t('loginDescription')}
        </p>
      </div>

      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <FcGoogle className="w-5 h-5" />
        <span>{t('continueWithGoogle')}</span>
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            {t('emailLabel')} + {t('passwordLabel')}
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailLabel')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t('passwordLabel')}</FormLabel>
                  <Button 
                    variant="link" 
                    className="px-0 h-auto font-normal text-xs"
                    onClick={handleForgotPassword}
                    type="button"
                  >
                    {t('forgotPassword')}
                  </Button>
                </div>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "در حال پردازش..." : t('login')}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm mt-4">
        <p className="text-gray-500 dark:text-gray-400">
          {t('noAccount')}
          <a 
            href="/signup" 
            className="text-primary hover:underline font-medium"
          >
            {t('signup')}
          </a>
        </p>
      </div>
    </div>
  )
} 