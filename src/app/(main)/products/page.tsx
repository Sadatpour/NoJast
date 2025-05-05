import Link from "next/link"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

import { Button } from "@/components/ui/button"
import { CategoryFilter } from "@/components/products/CategoryFilter"
import { SortOptions } from "@/components/products/SortOptions"
import { ProductCard, type Product } from "@/components/products/ProductCard"

export const metadata: Metadata = {
  title: "محصولات | نوجَست",
  description: "کشف و معرفی محصولات و خدمات ایرانی",
}

const getProducts = async (
  category: string = "all",
  sort: string = "newest"
): Promise<Product[]> => {
  const supabase = await createClient()
  
  // First get the user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // Start building our query
  let query = supabase
    .from('products')
    .select(`
      id,
      title,
      description,
      slug,
      thumbnail_url,
      website_url,
      categories,
      created_at,
      profiles(id, full_name, avatar_url),
      (select count(*) from product_upvotes where product_id = products.id) as upvotes_count
    `)
  
  // Apply category filter if not "all"
  if (category !== "all") {
    query = query.contains('categories', [category])
  }
  
  // Apply sorting
  if (sort === "newest") {
    query = query.order('created_at', { ascending: false })
  } else if (sort === "popular") {
    query = query.order('upvotes_count', { ascending: false })
  }
  
  // Limit to 20 products
  query = query.limit(20)
  
  // Get products
  const { data: productsData, error } = await query
  
  if (error) {
    console.error("Error fetching products:", error)
    return []
  }
  
  // Get upvotes for logged in user
  let userUpvotes: Record<string, boolean> = {}
  
  if (user) {
    const { data: upvotesData } = await supabase
      .from('product_upvotes')
      .select('product_id')
      .eq('user_id', user.id)
    
    if (upvotesData) {
      userUpvotes = upvotesData.reduce((acc, upvote) => {
        acc[upvote.product_id] = true
        return acc
      }, {} as Record<string, boolean>)
    }
  }
  
  // Format products
  return productsData.map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    slug: product.slug,
    thumbnailUrl: product.thumbnail_url,
    websiteUrl: product.website_url,
    categories: product.categories,
    upvotes: product.upvotes_count,
    hasUpvoted: !!userUpvotes[product.id],
    createdAt: product.created_at,
    user: {
      id: product.profiles.id,
      name: product.profiles.full_name,
      avatarUrl: product.profiles.avatar_url,
    }
  }))
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : 'all'
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest'
  
  const products = await getProducts(category, sort)

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">محصولات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            کشف و معرفی محصولات و خدمات ایرانی
          </p>
        </div>
        <Button asChild>
          <Link href="/submit-product">
            ثبت محصول جدید
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CategoryFilter />
        <SortOptions />
      </div>

      <div className="space-y-4">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">محصولی یافت نشد</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              محصولی با معیارهای انتخاب شده یافت نشد. معیارهای جستجو را تغییر دهید یا محصول جدیدی اضافه کنید.
            </p>
            <Button asChild>
              <Link href="/submit-product">
                ثبت محصول جدید
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 