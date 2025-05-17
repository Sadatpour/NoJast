import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/products/ProductCard';
import { type ProductWithDetails } from '@/types/database.types';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { SortOptions } from '@/components/products/SortOptions';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: 'newest' | 'popular' }
}) {
  const supabase = await createClient();
  
  // Get locale from cookies on the server side
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');
  const locale = (localeCookie ? localeCookie.value : 'fa') as Locale;
  
  const categorySlug = searchParams?.category;
  const sortOption = searchParams?.sort || 'newest';

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // Build product query - simplified to troubleshoot
  let query = supabase
    .from('products')
    .select(`
      *,
      profiles:user_id (id, full_name, username, avatar_url)
    `)
    .eq('status', 'approved'); // Only show approved products

  // Apply category filter
  if (categorySlug && categorySlug !== 'all') {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
      
    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  // Apply sorting
  if (sortOption === 'popular') {
    // For now, just order by created_at since we're troubleshooting
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
  }

  // Fetch upvote counts separately for each product
  const processedProducts: ProductWithDetails[] = [];
  
  if (products && products.length > 0) {
    for (const product of products) {
      const { count: upvoteCount } = await supabase
        .from('product_upvotes')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', product.id);

      // Ensure the date is in ISO format
      const createdAt = new Date(product.created_at).toISOString();
      
      processedProducts.push({
        ...product,
        user: {
          id: product.profiles.id,
          name: product.profiles.full_name || 'Unknown User',
          avatarUrl: product.profiles.avatar_url,
        },
        upvote_count: upvoteCount || 0,
        createdAt, // Use the formatted date
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter categories={categories || []} selectedCategory={categorySlug} />
        <SortOptions selectedOption={sortOption} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {processedProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            locale={locale}
          />
        ))}
      </div>

      {processedProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold">
            {locale === 'fa' ? 'محصولی یافت نشد!' : 'No products found!'}
          </h3>
          <p className="text-muted-foreground mt-2">
            {locale === 'fa' 
              ? 'با تغییر فیلترها محصولات بیشتری را مشاهده کنید یا محصول جدیدی ثبت کنید.'
              : 'Try changing the filters or submit a new product.'
            }
          </p>
        </div>
      )}
    </div>
  );
} 