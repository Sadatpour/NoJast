"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound, redirect } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { type ProductWithDetails, type CommentWithUser } from '@/types/database';
import { useRouter } from 'next/navigation';
import { AdminPanel } from "@/components/admin/AdminPanel"

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
  const [error, setError] = useState<string | null>(null);
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
            id,
            title,
            description,
            website_url,
            thumbnail_url,
            slug,
            status,
            created_at,
            category_id,
            user_id,
            profiles (
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (productsError) {
          console.error('Error details:', {
            message: productsError.message,
            details: productsError.details,
            hint: productsError.hint,
            code: productsError.code,
            error: productsError
          });
          setError(`Failed to fetch products: ${productsError.message}`);
          return;
        }

        // Get upvote counts for each product
        const upvoteCounts: Record<string, number> = {};
        if (productsData && productsData.length > 0) {
          const { data: upvotesData, error: upvoteError } = await supabase
            .from('product_upvotes')
            .select('product_id')
            .in('product_id', productsData.map(p => p.id));

          if (upvoteError) {
            console.error('Error fetching upvotes:', upvoteError);
          } else if (upvotesData) {
            // Count upvotes for each product
            upvotesData.forEach(upvote => {
              upvoteCounts[upvote.product_id] = (upvoteCounts[upvote.product_id] || 0) + 1;
            });
          }
        }
        
        // Process data for display
        const processedProducts = productsData?.map((product: any) => ({
          ...product,
          category: { id: product.category_id }, // Simplified for now
          upvote_count: upvoteCounts[product.id] || 0,
          user: product.profiles
        })) || [];

        // Fetch user's upvoted products
        const { data: upvotedData, error: upvotedError } = await supabase
          .from('product_upvotes')
          .select('product_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (upvotedError) {
          console.error('Error fetching upvoted products:', {
            message: upvotedError.message,
            details: upvotedError.details,
            hint: upvotedError.hint,
            code: upvotedError.code,
            error: upvotedError
          });
          setError(`Failed to fetch upvoted products: ${upvotedError.message}`);
          return;
        }

        // Fetch details of upvoted products
        let processedUpvotedProducts: any[] = [];
        if (upvotedData && upvotedData.length > 0) {
          const { data: upvotedProductsData, error: upvotedProductsError } = await supabase
            .from('products')
            .select(`
              id,
              title,
              description,
              website_url,
              thumbnail_url,
              slug,
              status,
              created_at,
              category_id,
              user_id,
              profiles (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .in('id', upvotedData.map(u => u.product_id));

          if (upvotedProductsError) {
            console.error('Error fetching upvoted products details:', upvotedProductsError);
          } else if (upvotedProductsData) {
            processedUpvotedProducts = upvotedProductsData.map(product => ({
              ...product,
              user: product.profiles,
              category: { id: product.category_id },
              user_has_upvoted: true
            }));
          }
        }
        
        // Fetch user's comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            products (id, title)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (commentsError) {
          const errorDetails = {
            message: commentsError.message,
            details: commentsError.details,
            hint: commentsError.hint,
            code: commentsError.code
          };
          console.error('Error fetching comments:', errorDetails);
          setError(`Failed to fetch comments: ${commentsError.message}`);
          return;
        }
        
        const processedComments = commentsData?.map((comment: any) => ({
          ...comment,
          product: comment.products
        })) || [];
        
        setProducts(processedProducts);
        setUpvotedProducts(processedUpvotedProducts);
        setComments(processedComments);
      } catch (error: any) {
        console.error('Error in dashboard:', {
          message: error.message,
          stack: error.stack
        });
        setError(error.message || 'An unexpected error occurred');
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
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-red-500 mb-2">خطا در بارگذاری اطلاعات</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }
  
  // If user is admin, show admin panel
  if (profile.is_admin) {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold">پنل مدیریت</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-4 mb-6">
          مدیریت محتوا و کاربران سایت
        </p>
        <AdminPanel />
      </div>
    )
  }

  // For regular users, show their dashboard
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">داشبورد</h1>
      
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