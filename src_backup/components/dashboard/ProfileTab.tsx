"use client";

import { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/components/LanguageProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { type User } from '@/types/database';

// Define form schema
const formSchema = z.object({
  username: z.string().min(3).max(20),
  full_name: z.string().min(2).max(50),
  bio: z.string().max(160).optional(),
});

interface ProfileTabProps {
  profile: User;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile.username,
      full_name: profile.full_name,
      bio: profile.bio || '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    
    try {
      let avatarUrl = profile.avatar_url;
      
      // Upload new avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
          
        if (uploadError) {
          throw new Error('Error uploading avatar: ' + uploadError.message);
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrl;
      }
      
      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: values.username,
          full_name: values.full_name,
          bio: values.bio || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
        
      if (updateError) {
        throw new Error('Error updating profile: ' + updateError.message);
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarPreview || undefined} alt={profile.full_name} />
          <AvatarFallback className="text-2xl">
            {getInitials(profile.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="text-2xl font-bold">{profile.full_name}</h2>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar upload */}
          <FormItem>
            <FormLabel>{locale === 'fa' ? 'تصویر پروفایل' : 'Profile Picture'}</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </FormControl>
            <FormDescription>
              {locale === 'fa' 
                ? 'حداکثر اندازه: 2 مگابایت. تصویر مربعی توصیه می‌شود.' 
                : 'Max size: 2MB. Square image recommended.'}
            </FormDescription>
          </FormItem>
          
          {/* Full Name */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{locale === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{locale === 'fa' ? 'نام کاربری' : 'Username'}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  {locale === 'fa' 
                    ? 'نام کاربری باید بین 3 تا 20 کاراکتر باشد.' 
                    : 'Username must be between 3-20 characters.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{locale === 'fa' ? 'بیوگرافی' : 'Bio'}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder={locale === 'fa' ? 'درباره خودت بنویس...' : 'Write about yourself...'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 