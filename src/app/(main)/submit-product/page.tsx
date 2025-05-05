"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const categories = [
  { id: "tools", name: "ابزارها" },
  { id: "games", name: "بازی‌ها" },
  { id: "ai", name: "هوش مصنوعی" },
  { id: "productivity", name: "بهره‌وری" },
  { id: "education", name: "آموزش" },
  { id: "design", name: "طراحی" },
  { id: "development", name: "توسعه" },
  { id: "marketing", name: "بازاریابی" },
  { id: "finance", name: "مالی" },
]

const formSchema = z.object({
  title: z.string().min(3, {
    message: "عنوان باید حداقل ۳ کاراکتر باشد",
  }).max(100, {
    message: "عنوان نمی‌تواند بیش از ۱۰۰ کاراکتر باشد",
  }),
  description: z.string().min(20, {
    message: "توضیحات باید حداقل ۲۰ کاراکتر باشد",
  }).max(2000, {
    message: "توضیحات نمی‌تواند بیش از ۲۰۰۰ کاراکتر باشد",
  }),
  websiteUrl: z.string().url({
    message: "آدرس وب‌سایت نامعتبر است",
  }),
  thumbnailUrl: z.string().url({
    message: "آدرس تصویر نامعتبر است",
  }).optional(),
  category: z.string({
    required_error: "لطفاً یک دسته‌بندی انتخاب کنید",
  }),
})

export default function SubmitProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      websiteUrl: "",
      thumbnailUrl: "",
      category: "",
    },
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "لطفاً وارد حساب کاربری خود شوید",
          description: "برای ثبت محصول باید ابتدا وارد حساب کاربری خود شوید.",
        })
        router.push("/login?redirectTo=/submit-product")
        return
      }
      
      setUser(session.user)
    }
    
    checkAuth()
  }, [router, supabase])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }
    
    const file = event.target.files[0]
    setIsUploading(true)
    
    try {
      // Create a preview URL for display
      const previewUrl = URL.createObjectURL(file)
      setThumbnailPreview(previewUrl)
      
      // Check if the bucket exists and create it if it doesn't
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('product-images');
        
        if (bucketError && bucketError.message.includes('bucket not found')) {
          const { error: createBucketError } = await supabase.storage.createBucket('product-images', {
            public: true // Make it public so images can be accessed without authentication
          });
          
          if (createBucketError) {
            throw new Error('Error creating storage bucket: ' + createBucketError.message);
          }
          
          toast({
            title: "باکت ایجاد شد",
            description: "فضای آپلود تصاویر ایجاد شد",
          });
        }
      } catch (bucketCheckError) {
        console.error('Error checking bucket:', bucketCheckError);
      }
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(`public/${fileName}`, file)
      
      if (error) throw error
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(`public/${fileName}`)
      
      form.setValue("thumbnailUrl", publicUrlData.publicUrl)
      
      toast({
        title: "تصویر با موفقیت آپلود شد",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در آپلود تصویر",
        description: error.message || "مشکلی در فرآیند آپلود تصویر پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return
    
    setIsSubmitting(true)
    
    try {
      // Generate a slug from the title
      const slug = slugify(values.title)
      
      // Check if slug already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .single()
      
      if (existingProduct) {
        toast({
          variant: "destructive",
          title: "این عنوان قبلاً ثبت شده است",
          description: "لطفاً عنوان دیگری انتخاب کنید.",
        })
        setIsSubmitting(false)
        return
      }
      
      // Insert the new product
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: values.title,
          description: values.description,
          website_url: values.websiteUrl,
          thumbnail_url: values.thumbnailUrl || "https://placehold.co/600x400/png",
          category_id: values.category,
          slug,
          user_id: user.id,
        })
        .select()
      
      if (error) throw error
      
      toast({
        title: "محصول با موفقیت ثبت شد",
        description: "محصول شما با موفقیت در نوجَست ثبت شد و پس از تأیید نمایش داده خواهد شد.",
      })
      
      // Redirect to the product page
      router.push(`/products/${slug}`)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا در ثبت محصول",
        description: error.message || "مشکلی در فرآیند ثبت محصول پیش آمده است. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>در حال بررسی وضعیت ورود...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ثبت محصول جدید</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            محصول یا خدمت خود را ثبت کنید تا هزاران کاربر آن را ببینند و امتیاز دهند.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات محصول</CardTitle>
            <CardDescription>
              اطلاعات محصول خود را با دقت وارد کنید. تمامی فیلدهای زیر الزامی هستند.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان محصول</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: ابزار مدیریت زمان" {...field} />
                      </FormControl>
                      <FormDescription>
                        عنوان محصول باید گویا و مختصر باشد.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>توضیحات</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="در مورد محصول خود، ویژگی‌ها و مزایای آن توضیح دهید..."
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        توضیحات کامل و جامعی در مورد محصول خود بنویسید.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>آدرس وب‌سایت</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          آدرس وب‌سایت یا صفحه محصول را وارد کنید.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>دسته‌بندی</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          دسته‌بندی مناسب برای محصول خود را انتخاب کنید.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تصویر محصول</FormLabel>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="neumorphic"
                            disabled={isUploading}
                            onClick={() => document.getElementById('thumbnail')?.click()}
                          >
                            {isUploading ? "در حال آپلود..." : "انتخاب تصویر"}
                          </Button>
                          <FormControl>
                            <Input
                              id="thumbnail"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                          </FormControl>
                          <Input
                            placeholder="یا آدرس تصویر را وارد کنید"
                            {...field}
                            className="flex-1"
                          />
                        </div>
                        
                        {(thumbnailPreview || field.value) && (
                          <div className="relative h-48 w-full overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                            <img
                              src={thumbnailPreview || field.value}
                              alt="پیش‌نمایش تصویر"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        تصویری با نسبت ۱۶:۹ و حداقل عرض ۶۰۰ پیکسل توصیه می‌شود.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                    variant="neumorphic"
                  >
                    {isSubmitting ? "در حال ثبت..." : "ثبت محصول"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 