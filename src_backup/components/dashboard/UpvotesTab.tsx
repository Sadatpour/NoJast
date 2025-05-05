"use client";

import { type ProductWithDetails } from "@/types/database";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface UpvotesTabProps {
  products: ProductWithDetails[];
}

export function UpvotesTab({ products }: UpvotesTabProps) {
  const { locale } = useLanguage();
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold">
          {locale === 'fa' 
            ? 'هنوز به محصولی رای نداده‌اید!'
            : 'You haven\'t upvoted any products yet!'
          }
        </h3>
        <p className="text-muted-foreground mt-2">
          {locale === 'fa' 
            ? 'به محصولات مورد علاقه خود رای دهید تا در اینجا نمایش داده شوند.'
            : 'Upvote products you like to see them listed here.'
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">
        {locale === 'fa' 
          ? 'محصولات مورد علاقه من'
          : 'My Upvoted Products'
        } ({products.length})
      </h3>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === 'fa' ? 'محصول' : 'Product'}</TableHead>
              <TableHead>{locale === 'fa' ? 'سازنده' : 'Creator'}</TableHead>
              <TableHead>{locale === 'fa' ? 'دسته‌بندی' : 'Category'}</TableHead>
              <TableHead className="text-right">{locale === 'fa' ? 'آرا' : 'Upvotes'}</TableHead>
              <TableHead className="text-right">{locale === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const title = locale === 'fa' ? product.title : (product.title_en || product.title);
              const categoryName = locale === 'fa' ? product.category.name : (product.category.name_en || product.category.name);
              
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 overflow-hidden rounded-md">
                        <Image
                          src={product.thumbnail_url}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Link 
                        href={`/products/${product.id}`}
                        className="hover:underline font-medium"
                      >
                        {title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.user && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage 
                            src={product.user.avatar_url || undefined} 
                            alt={product.user.full_name || ''}
                          />
                          <AvatarFallback>
                            {getInitials(product.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{product.user.full_name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{categoryName}</TableCell>
                  <TableCell className="text-right">{product.upvote_count}</TableCell>
                  <TableCell className="text-right">
                    {formatDate(product.created_at, locale)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 