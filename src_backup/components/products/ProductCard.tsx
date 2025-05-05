'use client'

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowBigUp, MessageSquare, ExternalLink } from "lucide-react";
import { type ProductWithDetails } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { getInitials } from "@/lib/utils";
import { type Locale } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { formatDistanceToNow as formatDistanceToNowJalali } from "date-fns-jalali";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductUpvoteButton } from "@/components/products/ProductUpvoteButton";

export type Product = {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string;
  websiteUrl: string;
  categories: string[];
  upvotes: number;
  hasUpvoted: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

interface ProductCardProps {
  product: Product;
  className?: string;
  locale?: Locale;
}

export function ProductCard({ product, className, locale = 'fa' }: ProductCardProps) {
  const timeAgo = locale === 'fa' 
    ? formatDistanceToNowJalali(new Date(product.createdAt), { addSuffix: true })
    : formatDistanceToNow(new Date(product.createdAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex-shrink-0">
        <Link href={`/products/${product.slug}`}>
          <div className="relative h-40 w-full sm:w-40 rounded-md overflow-hidden">
            <Image
              src={product.thumbnailUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="group">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <ProductUpvoteButton
              productId={product.id}
              initialUpvotes={product.upvotes}
              initialHasUpvoted={product.hasUpvoted}
            />
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {product.categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-gray-200">
              {product.user.avatarUrl ? (
                <Image
                  src={product.user.avatarUrl}
                  alt={product.user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-xs font-semibold">
                  {product.user.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {product.user.name} • {timeAgo}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            asChild
          >
            <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
              {locale === 'fa' ? 'مشاهده' : 'Visit'}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
} 