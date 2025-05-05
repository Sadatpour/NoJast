import Image from "next/image"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ProductCard, type Product } from "@/components/products/ProductCard"
import { UserFollowButton } from "@/components/profile/UserFollowButton"
import { ExternalLink, MapPin, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface PageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('username', params.username)
    .single()
  
  if (!profile) {
    return {
      title: "کاربر یافت نشد | نوجَست",
      description: "کاربر مورد نظر یافت نشد",
    }
  }

  return {
    title: `${profile.full_name} | نوجَست`,
    description: `مشاهده پروفایل ${profile.full_name} در نوجَست`,
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = params
  const supabase = await createClient()
  
  // Get current user if logged in
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  
  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (profileError || !profile) {
    notFound()
  }
  
  // Get user's products
  const { data: productsData } = await supabase
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
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
  
  // Get user's upvoted products
  const { data: upvotedProductIds } = await supabase
    .from('product_upvotes')
    .select('product_id')
    .eq('user_id', profile.id)
  
  const upvotedIds = upvotedProductIds?.map(item => item.product_id) || []
  
  // Get upvoted products
  const { data: upvotedProductsData } = await supabase
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
    .in('id', upvotedIds.length > 0 ? upvotedIds : ['no-results'])
    .order('created_at', { ascending: false })
  
  // Get current user's upvotes
  let currentUserUpvotes: Record<string, boolean> = {}
  
  if (currentUser) {
    const { data: upvotesData } = await supabase
      .from('product_upvotes')
      .select('product_id')
      .eq('user_id', currentUser.id)
    
    if (upvotesData) {
      currentUserUpvotes = upvotesData.reduce((acc, upvote) => {
        acc[upvote.product_id] = true
        return acc
      }, {} as Record<string, boolean>)
    }
  }
  
  // Format products
  const formatProducts = (data: any[] | null): Product[] => {
    if (!data) return []
    
    return data.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      slug: product.slug,
      thumbnailUrl: product.thumbnail_url,
      websiteUrl: product.website_url,
      categories: product.categories,
      upvotes: product.upvotes_count,
      hasUpvoted: !!currentUserUpvotes[product.id],
      createdAt: product.created_at,
      user: {
        id: product.profiles.id,
        name: product.profiles.full_name,
        avatarUrl: product.profiles.avatar_url,
      }
    }))
  }
  
  const userProducts = formatProducts(productsData)
  const upvotedProducts = formatProducts(upvotedProductsData)
  
  // Check if the current user is following this user
  let isFollowing = false
  
  if (currentUser) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    
    isFollowing = !!followData
  }
  
  // Get follower/following counts
  const { data: followerCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', profile.id)
  
  const { data: followingCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', profile.id)
  
  const joinDate = new Date(profile.created_at)
  const formattedJoinDate = formatDate(joinDate)

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 relative mb-4">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {profile.full_name[0]}
                  </div>
                )}
              </div>
              
              <h1 className="text-xl font-bold mb-1">{profile.full_name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-sm mb-4 whitespace-pre-line">{profile.bio}</p>
              )}
              
              <div className="flex gap-4 mb-4 text-sm">
                <div>
                  <span className="font-semibold">{userProducts.length}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">محصول</span>
                </div>
                <div>
                  <span className="font-semibold">{followerCount?.count || 0}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">دنبال‌کننده</span>
                </div>
                <div>
                  <span className="font-semibold">{followingCount?.count || 0}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">دنبال شده</span>
                </div>
              </div>
              
              {currentUser && currentUser.id !== profile.id && (
                <UserFollowButton
                  userId={currentUser.id}
                  targetUserId={profile.id}
                  initialIsFollowing={isFollowing}
                />
              )}
              
              <div className="mt-6 w-full border-t border-gray-200 dark:border-gray-800 pt-4">
                <ul className="space-y-2 text-sm">
                  {profile.location && (
                    <li className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </li>
                  )}
                  {profile.website && (
                    <li className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <ExternalLink className="h-4 w-4" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>عضویت از {formattedJoinDate}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <Tabs defaultValue="products" className="mb-6">
            <TabsList>
              <TabsTrigger value="products">محصولات ({userProducts.length})</TabsTrigger>
              <TabsTrigger value="upvoted">پسندیده‌ها ({upvotedProducts.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-6">
              <div className="space-y-4">
                {userProducts.length > 0 ? (
                  userProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-medium mb-2">هیچ محصولی یافت نشد</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      این کاربر هنوز محصولی ثبت نکرده است.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upvoted" className="mt-6">
              <div className="space-y-4">
                {upvotedProducts.length > 0 ? (
                  upvotedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-medium mb-2">هیچ محصولی یافت نشد</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      این کاربر هنوز هیچ محصولی را نپسندیده است.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 