import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { type ProductWithDetails, type CommentWithUser } from '@/types/database';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const locale = getLocale();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (!profile) {
    // This could happen if the user signed up but their profile wasn't created
    notFound();
  }
  
  // Fetch user's products
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, name_en, slug),
      upvotes (count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  // Fetch user's upvoted products
  const { data: upvotedProducts } = await supabase
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
  
  // Fetch user's comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      products (id, title, title_en)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  // Process data for display
  const processedProducts: ProductWithDetails[] = products?.map((product: any) => ({
    ...product,
    category: product.categories,
    upvote_count: product.upvotes?.count || 0,
  })) || [];
  
  const processedUpvotedProducts: ProductWithDetails[] = upvotedProducts?.map((upvote: any) => ({
    ...upvote.products,
    user: upvote.products.users,
    category: upvote.products.categories,
    upvote_count: upvote.products.upvotes?.count || 0,
    user_has_upvoted: true
  })) || [];
  
  const processedComments: CommentWithUser[] = comments?.map((comment: any) => ({
    ...comment,
    product: comment.products
  })) || [];
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {locale === 'fa' ? 'داشبورد' : 'Dashboard'}
      </h1>
      
      <DashboardTabs 
        profile={profile}
        products={processedProducts}
        upvotedProducts={processedUpvotedProducts}
        comments={processedComments}
        activeTab={searchParams.tab || 'products'}
      />
    </div>
  );
} 