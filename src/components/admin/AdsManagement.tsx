"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, UploadCloud } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link: string;
  placement: string;
  created_at: string;
}

const placementOptions = [
  { value: "home_left", label: "سایدبار چپ صفحه اصلی" },
  { value: "home_right", label: "سایدبار راست صفحه اصلی" },
  { value: "product_left", label: "سایدبار چپ صفحات محصول" },
  { value: "product_right", label: "سایدبار راست صفحات محصول" },
];

export function AdsManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ title: "", link: "", placement: "home_right" });
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    // realtime update
    const channel = supabase
      .channel("admin-ads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ads" },
        () => fetchAds()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `ads/${fileName}`;
    const { data, error } = await supabase.storage.from('public').upload(filePath, file, { upsert: true });
    if (error) {
      toast({ variant: "destructive", title: "خطا", description: "آپلود تصویر انجام نشد." });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: "تصویر با موفقیت آپلود شد." });
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.link || !imageUrl || !form.placement) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "همه فیلدها و تصویر الزامی هستند.",
      });
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase
        .from("ads")
        .insert({ ...form, image_url: imageUrl });
      if (error) throw error;
      toast({ title: "تبلیغ اضافه شد", description: "تبلیغ جدید با موفقیت اضافه شد." });
      setForm({ title: "", link: "", placement: "home_right" });
      setImageUrl("");
      fetchAds();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در افزودن تبلیغ پیش آمده است.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "تبلیغ حذف شد", description: "تبلیغ با موفقیت حذف شد." });
      fetchAds();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در حذف تبلیغ پیش آمده است.",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">مدیریت تبلیغات</h2>
      <form onSubmit={handleAddAd} className="flex flex-col md:flex-row gap-4 mb-8 items-end">
        <Input
          name="title"
          placeholder="عنوان تبلیغ"
          value={form.title}
          onChange={handleInputChange}
          className="md:w-1/5"
        />
        <Input
          name="link"
          placeholder="لینک تبلیغ"
          value={form.link}
          onChange={handleInputChange}
          className="md:w-1/4"
        />
        <select
          name="placement"
          value={form.placement}
          onChange={handleInputChange}
          className="md:w-1/4 border rounded px-3 py-2 text-sm"
        >
          {placementOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="flex flex-col gap-2 md:w-1/4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <UploadCloud className="ml-2 h-4 w-4" />
            {uploading ? "در حال آپلود..." : imageUrl ? "تغییر تصویر" : "آپلود بنر"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          {imageUrl && (
            <img src={imageUrl} alt="بنر" className="h-10 w-24 object-cover rounded border mt-1" />
          )}
        </div>
        <Button type="submit" disabled={adding} className="md:w-32">
          {adding ? "در حال افزودن..." : "افزودن تبلیغ"}
        </Button>
      </form>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>تصویر</TableHead>
              <TableHead>لینک</TableHead>
              <TableHead>محل نمایش</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  هیچ تبلیغی ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>{ad.title}</TableCell>
                  <TableCell>
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="h-10 w-20 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {ad.link}
                    </a>
                  </TableCell>
                  <TableCell>
                    {placementOptions.find(opt => opt.value === ad.placement)?.label || ad.placement}
                  </TableCell>
                  <TableCell>{new Date(ad.created_at).toLocaleDateString("fa-IR")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">حذف</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 