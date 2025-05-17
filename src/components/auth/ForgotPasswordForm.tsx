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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  email: z.string().email({
    message: "ایمیل نامعتبر است",
  }),
})

export function ForgotPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (error) {
        throw error
      }

      setIsSuccess(true)

      toast({
        title: "درخواست بازیابی رمز عبور ارسال شد",
        description: "لطفاً ایمیل خود را برای بازیابی رمز عبور بررسی کنید.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در ارسال درخواست",
        description: error.message || "مشکلی در فرآیند بازیابی رمز عبور پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold">بازیابی رمز عبور</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isSuccess 
            ? "ایمیل بازیابی رمز عبور ارسال شد. لطفاً ایمیل خود را بررسی کنید."
            : "ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود."}
        </p>
      </div>

      {!isSuccess ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "در حال پردازش..." : "ارسال لینک بازیابی"}
            </Button>
          </form>
        </Form>
      ) : (
        <Button onClick={handleBackToLogin} className="w-full">
          بازگشت به صفحه ورود
        </Button>
      )}

      {!isSuccess && (
        <div className="text-center text-sm mt-4">
          <p className="text-gray-500 dark:text-gray-400">
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal"
              onClick={handleBackToLogin}
            >
              بازگشت به صفحه ورود
            </Button>
          </p>
        </div>
      )}
    </div>
  )
} 