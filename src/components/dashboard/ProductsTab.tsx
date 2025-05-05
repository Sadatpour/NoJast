"use client";

import { type ProductWithDetails } from "@/types/database";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductsTabProps {
  products: ProductWithDetails[];
}

export function ProductsTab({ products }: ProductsTabProps) {
  const { t, locale } = useLanguage();
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-xl font-semibold">
          {locale === 'fa' 
            ? 'هنوز محصولی ثبت نکرده‌اید!'
            : 'You haven\'t submitted any products yet!'
          }
        </h3>
        <p className="text-muted-foreground">
          {locale === 'fa' 
            ? 'محصول جدیدی ثبت کنید تا در اینجا نمایش داده شود.'
            : 'Submit a new product to see it listed here.'
          }
        </p>
        <Button asChild>
          <Link href="/submit-product">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('submit')}
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {locale === 'fa' 
            ? 'محصولات من'
            : 'My Products'
          } ({products.length})
        </h3>
        <Button asChild>
          <Link href="/submit-product">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('submit')}
          </Link>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === 'fa' ? 'تصویر' : 'Image'}</TableHead>
              <TableHead>{locale === 'fa' ? 'عنوان' : 'Title'}</TableHead>
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
                    <div className="relative w-12 h-12 overflow-hidden rounded-md">
                      <Image
                        src={product.thumbnail_url}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/products/${product.id}`}
                      className="hover:underline font-medium"
                    >
                      {title}
                    </Link>
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