"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { type Category } from '@/types/database';
import { useLanguage } from '@/components/LanguageProvider';

// Define form schema with zod
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }).max(100),
  title_en: z.string().max(100).optional(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(1000),
  description_en: z.string().max(1000).optional(),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  category_id: z.string({
    required_error: "Please select a category.",
  }),
  tags: z.string().optional(),
});

interface ProductFormProps {
  userId: string;
  categories: Category[];
}

export function ProductForm({ userId, categories }: ProductFormProps) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      title_en: "",
      description: "",
      description_en: "",
      url: "",
      category_id: "",
      tags: "",
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!thumbnailFile) {
      toast({
        title: "Error",
        description: "Please upload a thumbnail image",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload the thumbnail to storage
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, thumbnailFile);
        
      if (uploadError) {
        throw new Error('Error uploading thumbnail: ' + uploadError.message);
      }
      
      // 2. Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      // 3. Process tags if provided
      const tagsList = values.tags ? 
        values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : 
        [];
      
      // 4. Insert the product into the database
      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          title: values.title,
          title_en: values.title_en || null,
          description: values.description,
          description_en: values.description_en || null,
          url: values.url,
          thumbnail_url: publicUrl,
          category_id: values.category_id,
          user_id: userId,
          tags: tagsList.length > 0 ? tagsList : null,
        })
        .select('id')
        .single();
        
      if (insertError) {
        throw new Error('Error creating product: ' + insertError.message);
      }
      
      toast({
        title: "Success",
        description: "Product submitted successfully!",
      });
      
      // Redirect to the product page
      router.push(`/products/${product.id}`);
      router.refresh();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productTitle')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {locale === 'fa' 
                  ? 'عنوان اصلی محصول به فارسی' 
                  : 'Main product title in Persian'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* English Title (optional) */}
        <FormField
          control={form.control}
          name="title_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productTitleEn')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {locale === 'fa' 
                  ? 'عنوان محصول به انگلیسی (اختیاری)' 
                  : 'Product title in English (optional)'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productDescription')}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                {locale === 'fa' 
                  ? 'توضیحات محصول به فارسی' 
                  : 'Product description in Persian'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* English Description (optional) */}
        <FormField
          control={form.control}
          name="description_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productDescriptionEn')}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                {locale === 'fa' 
                  ? 'توضیحات محصول به انگلیسی (اختیاری)' 
                  : 'Product description in English (optional)'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* URL */}
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productUrl')}</FormLabel>
              <FormControl>
                <Input {...field} type="url" />
              </FormControl>
              <FormDescription>
                {locale === 'fa' 
                  ? 'آدرس وب‌سایت محصول یا لینک دانلود' 
                  : 'Product website URL or download link'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productCategory')}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      locale === 'fa' 
                      ? 'یک دسته‌بندی انتخاب کنید' 
                      : 'Select a category'
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {locale === 'fa' ? category.name : category.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productTags')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {locale === 'fa' 
                  ? 'برچسب‌ها را با کاما جدا کنید' 
                  : 'Separate tags with commas'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Thumbnail */}
        <div className="space-y-3">
          <FormLabel>{t('productThumbnail')}</FormLabel>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="max-w-sm"
            />
            {thumbnailPreview && (
              <div className="relative w-24 h-24 overflow-hidden rounded-md border">
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {locale === 'fa' 
              ? 'حداکثر اندازه: 5 مگابایت. تصویر با نسبت 16:9 توصیه می‌شود.' 
              : 'Max size: 5MB. 16:9 aspect ratio recommended.'}
          </p>
        </div>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            locale === 'fa' ? 'ثبت محصول' : 'Submit Product'
          )}
        </Button>
      </form>
    </Form>
  );
} 