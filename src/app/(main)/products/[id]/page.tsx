import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { formatDistanceToNow } from "date-fns"
import { fa } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductUpvoteButton } from "@/components/products/ProductUpvoteButton"
import { CommentsSection } from "@/components/comments/CommentsSection"
import { createClient } from "@/lib/supabase/server"
import { SidebarBannerAds } from '@/components/sidebar/SidebarBannerAds'

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('title, description')
    .eq('slug', params.id)
    .single()
  
  if (!product) {
    return {
      title: "محصول یافت نشد | نوجَست",
      description: "محصول مورد نظر یافت نشد",
    }
  }

  return {
    title: `${product.title} | نوجَست`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = await createClient()
  
  // Get current user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // Get product data
  const { data: product } = await supabase
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
    .eq('slug', params.id)
    .single()
  
  if (!product) {
    notFound()
  }
  
  // Check if the user has upvoted this product
  let hasUpvoted = false
  
  if (user) {
    const { data: upvoteData } = await supabase
      .from('product_upvotes')
      .select('id')
      .match({ 
        user_id: user.id,
        product_id: product.id 
      })
      .maybeSingle()
    
    hasUpvoted = !!upvoteData
  }
  
  // Format date
  const timeAgo = formatDistanceToNow(new Date(product.created_at), { 
    addSuffix: true,
    locale: fa,
  })

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="relative h-80 w-full">
              <Image 
                src={product.thumbnail_url} 
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{product.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                      {product.profiles.avatar_url ? (
                        <Image 
                          src={product.profiles.avatar_url} 
                          alt={product.profiles.full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-xs font-semibold">
                          {product.profiles.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {product.profiles.full_name} • {timeAgo}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ProductUpvoteButton 
                    productId={product.id} 
                    initialUpvotes={product.upvotes_count}
                    initialHasUpvoted={hasUpvoted}
                  />
                  
                  <Button asChild variant="default">
                    <a href={product.website_url} target="_blank" rel="noopener noreferrer">
                      مشاهده محصول
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 my-4">
                {product.categories.map((category: string) => (
                  <Link 
                    key={category} 
                    href={`/products?category=${category}`}
                  >
                    <Badge variant="secondary">
                      {category}
                    </Badge>
                  </Link>
                ))}
              </div>
              
              <div className="mt-6 prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <CommentsSection productId={product.id} />
          </div>
        </div>
        
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">محصولات مشابه</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              به زودی...
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">محصول خود را ثبت کنید</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              محصول یا خدمت خود را ثبت کنید تا هزاران کاربر آن را ببینند و امتیاز دهند.
            </p>
            <Button asChild variant="neumorphic" className="w-full">
              <Link href="/submit-product">
                ثبت محصول جدید
              </Link>
            </Button>
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-1">
          <SidebarBannerAds sidebar="product" />
        </div>
      </div>
    </div>
  )
} 