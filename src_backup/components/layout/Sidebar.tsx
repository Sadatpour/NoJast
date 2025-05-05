import Link from "next/link"
import Image from "next/image"
import { User } from "@supabase/supabase-js"

interface Banner {
  imageUrl: string
  linkUrl: string
  altText: string
}

interface SidebarProps {
  user?: User | null
}

export function Sidebar({ user }: SidebarProps) {
  // بنرهای نمایشی در سایدبار
  const sidebarBanners = [
    { 
      imageUrl: '/banners/banner1.jpg',
      linkUrl: 'https://example.com/sponsor1',
      altText: 'Sponsor Banner 1'
    },
    {
      imageUrl: '/banners/banner2.jpg',
      linkUrl: 'https://example.com/sponsor2',
      altText: 'Sponsor Banner 2'
    }
  ]

  return (
    <aside className="hidden md:block sticky top-20 h-fit">
      <div className="flex flex-col space-y-4">
        {/* منوی اصلی */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-4">
          <nav className="space-y-2">
            <Link href="/" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
              خانه
            </Link>
            <Link href="/products" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
              محصولات
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                  داشبورد
                </Link>
                <Link href="/submit-product" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                  ثبت محصول
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* بنرهای تبلیغاتی */}
        {sidebarBanners.map((banner, index) => (
          <Link 
            key={index} 
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.altText}
              width={280}
              height={180}
              className="w-full h-auto object-cover"
            />
          </Link>
        ))}
      </div>
    </aside>
  )
} 