"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns-jalali"

const schema = z.object({
  title: z.string().min(2),
  image_url: z.string().url(),
  link: z.string().url(),
  sidebar: z.enum(["main-left", "main-right", "product"]),
  priority: z.coerce.number().default(0),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().default(true),
})

type BannerAdForm = z.infer<typeof schema>

export default function BannerAdsAdminPage() {
  const supabase = createClient()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const form = useForm<BannerAdForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      sidebar: "main-left",
      priority: 0,
      is_active: true,
    },
  })

  const fetchAds = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("banner_ads")
      .select("*")
      .order("priority", { ascending: false })
    if (!error) setAds(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAds()
    // اگر هیچ بنری وجود ندارد، بنرهای پیش‌فرض را اضافه کن
    supabase.from("banner_ads").select("id").then(({ data }) => {
      if (data && data.length === 0) {
        const now = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(now.getFullYear() + 1);
        const defaultBanners = [
          // main-left
          {
            title: "بنر تبلیغاتی چپ ۱",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
            link: "https://nojast.ir/left1",
            sidebar: "main-left",
            priority: 3,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          {
            title: "بنر تبلیغاتی چپ ۲",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
            link: "https://nojast.ir/left2",
            sidebar: "main-left",
            priority: 2,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          {
            title: "بنر تبلیغاتی چپ ۳",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055676.png",
            link: "https://nojast.ir/left3",
            sidebar: "main-left",
            priority: 1,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          // main-right
          {
            title: "بنر تبلیغاتی راست ۱",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
            link: "https://nojast.ir/right1",
            sidebar: "main-right",
            priority: 3,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          {
            title: "بنر تبلیغاتی راست ۲",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
            link: "https://nojast.ir/right2",
            sidebar: "main-right",
            priority: 2,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          {
            title: "بنر تبلیغاتی راست ۳",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055676.png",
            link: "https://nojast.ir/right3",
            sidebar: "main-right",
            priority: 1,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          // product
          {
            title: "بنر تبلیغاتی محصول ۱",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
            link: "https://nojast.ir/product1",
            sidebar: "product",
            priority: 3,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          {
            title: "بنر تبلیغاتی محصول ۲",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
            link: "https://nojast.ir/product2",
            sidebar: "product",
            priority: 2,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
          {
            title: "بنر تبلیغاتی محصول ۳",
            image_url: "https://cdn-icons-png.flaticon.com/512/1055/1055676.png",
            link: "https://nojast.ir/product3",
            sidebar: "product",
            priority: 1,
            start_date: now.toISOString(),
            end_date: nextYear.toISOString(),
            is_active: true,
          },
        ];
        supabase.from("banner_ads").insert(defaultBanners).then(() => fetchAds());
      }
    });
    // eslint-disable-next-line
  }, [])

  const onSubmit = async (values: BannerAdForm) => {
    setLoading(true)
    const { error } = await supabase.from("banner_ads").insert({
      ...values,
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
    })
    if (!error) {
      toast({ title: "تبلیغ با موفقیت افزوده شد" })
      form.reset()
      fetchAds()
    } else {
      toast({ title: "خطا", description: error.message, variant: "destructive" })
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    const { error } = await supabase.from("banner_ads").delete().eq("id", id)
    if (!error) {
      toast({ title: "حذف شد" })
      fetchAds()
    } else {
      toast({ title: "خطا", description: error.message, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">مدیریت تبلیغات سایدبار</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-gray-900 p-4 rounded-lg border">
        <div>
          <label className="block mb-1">عنوان</label>
          <Input {...form.register("title")} required />
        </div>
        <div>
          <label className="block mb-1">لینک بنر</label>
          <Input {...form.register("link")} required type="url" />
        </div>
        <div>
          <label className="block mb-1">آدرس تصویر بنر</label>
          <Input {...form.register("image_url")} required type="url" />
        </div>
        <div>
          <label className="block mb-1">سایدبار</label>
          <Select {...form.register("sidebar")} defaultValue="main-left">
            <SelectTrigger>
              <SelectValue placeholder="انتخاب سایدبار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main-left">سایدبار چپ صفحه اصلی</SelectItem>
              <SelectItem value="main-right">سایدبار راست صفحه اصلی</SelectItem>
              <SelectItem value="product">سایدبار صفحه محصول</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block mb-1">اولویت نمایش</label>
          <Input {...form.register("priority")} type="number" min={0} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1">تاریخ شروع</label>
            <Input {...form.register("start_date")} type="date" required />
          </div>
          <div className="flex-1">
            <label className="block mb-1">تاریخ پایان</label>
            <Input {...form.register("end_date")} type="date" required />
          </div>
        </div>
        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...form.register("is_active")} defaultChecked /> فعال باشد
          </label>
        </div>
        <Button type="submit" disabled={loading} className="w-full">افزودن تبلیغ</Button>
      </form>
      <div>
        <h2 className="text-lg font-semibold mb-2">لیست تبلیغات</h2>
        {loading && <div>در حال بارگذاری...</div>}
        <ul className="space-y-2">
          {ads.map(ad => (
            <li key={ad.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded border">
              <div>
                <div className="font-bold">{ad.title}</div>
                <div className="text-xs text-gray-500">{ad.sidebar} | اولویت: {ad.priority}</div>
                <div className="text-xs">{format(new Date(ad.start_date), 'yyyy/MM/dd')} - {format(new Date(ad.end_date), 'yyyy/MM/dd')}</div>
                <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">مشاهده لینک</a>
              </div>
              <div className="flex items-center gap-2">
                <img src={ad.image_url} alt={ad.title} className="w-16 h-10 object-contain rounded border" />
                <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)} disabled={loading}>حذف</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 