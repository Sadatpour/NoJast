"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "نام باید حداقل ۲ کاراکتر باشد",
  }),
  email: z.string().email({
    message: "ایمیل نامعتبر است",
  }),
  password: z.string().min(6, {
    message: "رمز عبور باید حداقل ۶ کاراکتر باشد",
  }),
})

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          },
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "ثبت‌نام با موفقیت انجام شد",
        description: "لطفاً ایمیل خود را برای تأیید حساب کاربری بررسی کنید.",
      })
      
      router.push("/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در ثبت‌نام",
        description: error.message || "مشکلی در فرآیند ثبت‌نام پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold">ثبت‌نام در نوجَست</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          حساب کاربری خود را بسازید و به جامعه نوجَست بپیوندید
        </p>
      </div>

      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        onClick={handleGoogleSignup}
        disabled={isLoading}
      >
        <FcGoogle className="w-5 h-5" />
        <span>ادامه با گوگل</span>
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            یا با ایمیل ثبت‌نام کنید
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام</FormLabel>
                <FormControl>
                  <Input placeholder="نام شما" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ایمیل</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@example.com" autoComplete="email" {...field} />
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
                <FormLabel>رمز عبور</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" autoComplete="new-password" {...field} />
                </FormControl>
                <FormDescription>
                  رمز عبور باید حداقل ۶ کاراکتر باشد
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "در حال پردازش..." : "ثبت‌نام"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm mt-4">
        <p className="text-gray-500 dark:text-gray-400">
          حساب کاربری دارید؟{" "}
          <a 
            href="/login" 
            className="text-primary hover:underline font-medium"
          >
            ورود
          </a>
        </p>
      </div>
    </div>
  )
} 