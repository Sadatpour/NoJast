"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound, redirect } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { type ProductWithDetails, type CommentWithUser } from '@/types/database';
import { useRouter } from 'next/navigation';

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [upvotedProducts, setUpvotedProducts] = useState<ProductWithDetails[]>([]);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { locale } = useLanguage();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          router.push('/404');
          return;
        }
        
        setProfile(profileData);
        
        // Fetch user's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories (id, name, name_en, slug),
            upvotes (count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (productsError) {
          console.error('Error fetching products:', productsError);
        }
        
        // Fetch user's upvoted products
        const { data: upvotedData, error: upvotedError } = await supabase
          .from('upvotes')
          .select(`
            products (
              *,
              users (id, full_name, username, avatar_url),
              categories (id, name, name_en, slug),
              upvotes (count)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (upvotedError) {
          console.error('Error fetching upvoted products:', upvotedError);
        }
        
        // Fetch user's comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            products (id, title, title_en)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
        }
        
        // Process data for display
        const processedProducts = productsData?.map((product: any) => ({
          ...product,
          category: product.categories,
          upvote_count: product.upvotes?.count || 0,
        })) || [];
        
        const processedUpvotedProducts = upvotedData?.map((upvote: any) => ({
          ...upvote.products,
          user: upvote.products.users,
          category: upvote.products.categories,
          upvote_count: upvote.products.upvotes?.count || 0,
          user_has_upvoted: true
        })) || [];
        
        const processedComments = commentsData?.map((comment: any) => ({
          ...comment,
          product: comment.products
        })) || [];
        
        setProducts(processedProducts);
        setUpvotedProducts(processedUpvotedProducts);
        setComments(processedComments);
      } catch (error) {
        console.error('Error in dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router, supabase]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {locale === 'fa' ? 'داشبورد' : 'Dashboard'}
      </h1>
      
      <DashboardTabs 
        profile={profile}
        products={products}
        upvotedProducts={upvotedProducts}
        comments={comments}
        activeTab={searchParams.tab || 'products'}
      />
    </div>
  );
} 