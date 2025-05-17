import { Metadata } from "next"
import { ProductCard, type Product } from "@/components/products/ProductCard"
import { createClient } from "@/lib/supabase/server"

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: "جستجو | نوجَست",
  description: "جستجوی محصولات در نوجَست",
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  
  const supabase = await createClient()
  
  // First get the user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // Get search results
  let products: Product[] = []
  
  if (q) {
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
        users(id, full_name, avatar_url),
        (select count(*) from product_upvotes where product_id = products.id) as upvotes_count
      `)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20)
    
    // Get products
    const { data: productsData, error } = await query
    
    if (error) {
      console.error("Error fetching products:", error)
    } else if (productsData) {
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
      products = productsData.map(product => ({
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
          id: product.users.id,
          name: product.users.full_name,
          avatarUrl: product.users.avatar_url,
        }
      }))
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {q ? `نتایج جستجو برای "${q}"` : 'جستجو'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {products.length > 0 
            ? `${products.length} محصول یافت شد` 
            : q 
              ? 'محصولی یافت نشد' 
              : 'عبارت مورد نظر خود را جستجو کنید'
          }
        </p>
      </div>

      <div className="space-y-4">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : q ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">محصولی یافت نشد</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              محصولی با عبارت جستجو شده یافت نشد. لطفاً عبارت دیگری را جستجو کنید یا محصول جدیدی اضافه کنید.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">جستجو کنید</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              برای یافتن محصولات مورد نظر، عبارتی را در کادر جستجو وارد کنید.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 