"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { ProductsTab } from "@/components/dashboard/ProductsTab";
import { UpvotesTab } from "@/components/dashboard/UpvotesTab";
import { CommentsTab } from "@/components/dashboard/CommentsTab";
import { type ProductWithDetails, type CommentWithUser, type User } from "@/types/database";

interface DashboardTabsProps {
  profile: User;
  products: ProductWithDetails[];
  upvotedProducts: ProductWithDetails[];
  comments: CommentWithUser[];
  activeTab: string;
}

export function DashboardTabs({
  profile,
  products,
  upvotedProducts,
  comments,
  activeTab,
}: DashboardTabsProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };
  
  const handleTabChange = (value: string) => {
    router.push(`${pathname}?${createQueryString('tab', value)}`);
  };
  
  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
        <TabsTrigger value="products">{t('products')}</TabsTrigger>
        <TabsTrigger value="upvotes">{t('upvote')}</TabsTrigger>
        <TabsTrigger value="comments">{t('comments')}</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileTab profile={profile} />
      </TabsContent>
      <TabsContent value="products">
        <ProductsTab products={products} />
      </TabsContent>
      <TabsContent value="upvotes">
        <UpvotesTab upvotedProducts={upvotedProducts} />
      </TabsContent>
      <TabsContent value="comments">
        <CommentsTab comments={comments} />
      </TabsContent>
    </Tabs>
  );
} 