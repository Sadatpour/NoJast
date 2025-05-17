"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
  password: z.string().min(6, {
    message: "رمز عبور باید حداقل ۶ کاراکتر باشد",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن باید یکسان باشند",
  path: ["confirmPassword"],
})

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "رمز عبور با موفقیت تغییر یافت",
        description: "اکنون می‌توانید با رمز عبور جدید وارد شوید.",
      })
      
      router.push("/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در تغییر رمز عبور",
        description: error.message || "مشکلی در فرآیند تغییر رمز عبور پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold">تغییر رمز عبور</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          رمز عبور جدید خود را وارد کنید
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رمز عبور جدید</FormLabel>
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تکرار رمز عبور</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "در حال پردازش..." : "تغییر رمز عبور"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm mt-4">
        <p className="text-gray-500 dark:text-gray-400">
          <a 
            href="/login" 
            className="text-primary hover:underline font-medium"
          >
            بازگشت به صفحه ورود
          </a>
        </p>
      </div>
    </div>
  )
} 