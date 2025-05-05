"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { User } from "@supabase/supabase-js"

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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "نام باید حداقل ۲ کاراکتر باشد",
  }),
  username: z.string().min(3, {
    message: "نام کاربری باید حداقل ۳ کاراکتر باشد",
  }).regex(/^[a-zA-Z0-9_-]+$/, {
    message: "نام کاربری فقط می‌تواند شامل حروف، اعداد، خط تیره و زیرخط باشد",
  }),
  website: z.string().url({
    message: "آدرس وب‌سایت نامعتبر است",
  }).optional().or(z.literal('')),
  bio: z.string().max(200, {
    message: "بیوگرافی نمی‌تواند بیش از ۲۰۰ کاراکتر باشد",
  }).optional(),
})

type ProfileFormProps = {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      username: "",
      website: "",
      bio: "",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data) {
          form.reset({
            fullName: data.full_name || user.user_metadata?.full_name || "",
            username: data.username || "",
            website: data.website || "",
            bio: data.bio || "",
          })
          setAvatarUrl(data.avatar_url || null)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user, form, supabase])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: values.fullName,
          username: values.username,
          website: values.website || null,
          bio: values.bio || null,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "پروفایل با موفقیت به‌روزرسانی شد",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در به‌روزرسانی پروفایل",
        description: error.message || "مشکلی در فرآیند به‌روزرسانی پروفایل پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        return
      }
      
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
      
      if (updateError) throw updateError
      
      setAvatarUrl(data.publicUrl)
      
      toast({
        title: "تصویر پروفایل با موفقیت به‌روزرسانی شد",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در به‌روزرسانی تصویر پروفایل",
        description: error.message || "مشکلی در فرآیند به‌روزرسانی تصویر پروفایل پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary/25">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={user.user_metadata?.full_name || "Avatar"} />
            ) : (
              <AvatarFallback className="text-lg">
                {getInitials(form.getValues().fullName || user.user_metadata?.full_name || user.email || "")}
              </AvatarFallback>
            )}
          </Avatar>
          <label 
            htmlFor="avatar" 
            className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <input 
              id="avatar" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
              disabled={isLoading}
            />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.user_metadata?.full_name || user.email}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام کامل</FormLabel>
                  <FormControl>
                    <Input placeholder="نام و نام خانوادگی" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام کاربری</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormDescription>
                    آدرس پروفایل: nojast.com/u/{field.value || "username"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وب‌سایت</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>درباره من</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="چند جمله درباره خودتان بنویسید..." 
                    className="resize-none min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/200 کاراکتر
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 