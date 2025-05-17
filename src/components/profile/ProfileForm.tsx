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
              <AvatarFallback className="flex items-center justify-center p-0 bg-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                  <path fill="#ff861b" d="M5.88450545,12.7673223 C7.32107647,12.6441193 8.76545208,12.6441193 10.2020231,12.7673223 C10.9876051,12.819974 11.7678606,12.9347129 12.5355802,13.1104786 C14.1961639,13.4448359 15.2799133,14.1047518 15.7343888,15.0726283 C16.0974922,15.8767717 16.08789,16.80158 15.7081691,17.5979063 C15.2449536,18.5657829 14.1612043,19.2256987 12.4744008,19.568855 C11.7092951,19.7410988 10.9319902,19.8528915 10.1495836,19.9032123 C9.2843321,20 8.5501793,20 7.86846599,20 L7.59752865,20 C7.21132744,19.9581349 6.91855939,19.6299512 6.91855939,19.2388971 C6.91855939,18.8478429 7.21132744,18.5196592 7.59752865,18.4777941 L7.59752865,18.4777941 L8.19552997,18.4776566 C8.7948969,18.470645 9.39795098,18.4425986 10.0010051,18.3898053 C10.7124372,18.3432116 11.4194216,18.2432131 12.1160643,18.0906435 C13.3134326,17.8266771 14.0650652,17.4483254 14.3010429,16.9467893 C14.484604,16.5631348 14.484604,16.1161987 14.3010429,15.7325442 C14.0650652,15.2222093 13.3134326,14.8262598 12.1422841,14.5886901 C11.4348379,14.4289038 10.7159053,14.3259265 9.99226515,14.2807293 C8.64034215,14.1575279 7.28012802,14.1575279 5.92820502,14.2807293 C5.21388459,14.3273105 4.50399397,14.4273069 3.80440586,14.5798912 C2.6070376,14.8438575 1.86414489,15.2222093 1.61942729,15.7237453 C1.53272302,15.9142245 1.48799947,16.1213408 1.48832858,16.3308679 C1.48783807,16.5432444 1.53254045,16.7532629 1.61942729,16.9467893 C2.03541113,17.5187562 2.66831687,17.8915039 3.36741014,17.9762581 L3.36741014,17.9762581 L3.46883074,18.003768 C3.69882672,18.0836728 3.87936538,18.2709306 3.94969781,18.5098707 C4.03007773,18.7829451 3.95322349,19.0783682 3.75020277,19.2767179 C3.54718205,19.4750675 3.25156561,19.5435453 2.98285392,19.4544696 C1.85607336,19.2695203 0.86780853,18.5933528 0.282220408,17.6067052 C-0.0940734694,16.8075691 -0.0940734694,15.8805633 0.282220408,15.0814272 C0.745435864,14.087154 1.82918523,13.4448359 3.49850886,13.1016797 C4.28445329,12.9305221 5.08200812,12.8187582 5.88450545,12.7673223 Z M5.96471469,0.407206951 C7.95471011,-0.421671419 10.2447427,0.0383955276 11.7663081,1.57274551 C13.2878734,3.1070955 13.7410933,5.41333076 12.9145002,7.41538679 C12.0879072,9.41744281 10.1444105,10.7207439 7.99082479,10.717191 C5.05464341,10.7123299 2.67695692,8.31466134 2.67695692,5.35866706 L2.67695692,5.35866706 L2.68189526,5.12722783 C2.77053718,3.05238043 4.04579053,1.20648252 5.96471469,0.407206951 Z M7.99082479,1.53114502 C6.98099466,1.52881803 6.01172919,1.93104061 5.29685022,2.6490918 C4.58197126,3.367143 4.18021208,4.34202145 4.18021208,5.35866706 C4.17668538,6.91110569 5.10286315,8.31266199 6.52650415,8.90922336 C7.95014515,9.50578474 9.59058472,9.17974169 10.6822224,8.08325997 C11.77386,6.98677826 12.1014841,5.3360245 11.512191,3.90141287 C10.9228979,2.46680125 9.53286415,1.53114502 7.99082479,1.53114502 Z" transform="translate(4 2)"/>
                </svg>
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
                    <Input placeholder="نام کامل" autoComplete="name" {...field} />
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
                    <Input placeholder="نام کاربری" autoComplete="username" {...field} />
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
                  <Input placeholder="وب‌سایت" autoComplete="url" {...field} />
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