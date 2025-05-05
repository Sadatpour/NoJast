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
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  comment: z.string().min(2, {
    message: "نظر باید حداقل ۲ کاراکتر باشد",
  }).max(500, {
    message: "نظر نمی‌تواند بیش از ۵۰۰ کاراکتر باشد",
  }),
})

interface CommentFormProps {
  productId: string
  userId: string
  onCommentAdded: () => void
}

export function CommentForm({ productId, userId, onCommentAdded }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          product_id: productId,
          user_id: userId,
          text: values.comment,
        })

      if (error) throw error

      toast({
        title: "نظر ثبت شد",
        description: "نظر شما با موفقیت ثبت شد.",
      })
      
      form.reset()
      onCommentAdded()
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در ثبت نظر",
        description: error.message || "مشکلی در فرآیند ثبت نظر پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder="نظر خود را بنویسید..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "در حال ارسال..." : "ارسال نظر"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 