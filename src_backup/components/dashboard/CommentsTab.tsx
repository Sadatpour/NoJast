"use client";

import { type CommentWithUser } from "@/types/database";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CommentsTabProps {
  comments: CommentWithUser[];
}

export function CommentsTab({ comments }: CommentsTabProps) {
  const { locale } = useLanguage();
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold">
          {locale === 'fa' 
            ? 'هنوز نظری ثبت نکرده‌اید!'
            : 'You haven\'t commented on any products yet!'
          }
        </h3>
        <p className="text-muted-foreground mt-2">
          {locale === 'fa' 
            ? 'نظرات شما در مورد محصولات در اینجا نمایش داده خواهند شد.'
            : 'Your comments on products will be listed here.'
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">
        {locale === 'fa' 
          ? 'نظرات من'
          : 'My Comments'
        } ({comments.length})
      </h3>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === 'fa' ? 'محصول' : 'Product'}</TableHead>
              <TableHead>{locale === 'fa' ? 'نظر' : 'Comment'}</TableHead>
              <TableHead className="text-right">{locale === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => {
              const productTitle = locale === 'fa' 
                ? comment.product.title 
                : (comment.product.title_en || comment.product.title);
              
              return (
                <TableRow key={comment.id}>
                  <TableCell>
                    <Link 
                      href={`/products/${comment.product_id}#comments`}
                      className="hover:underline font-medium"
                    >
                      {productTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{comment.content}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate(comment.created_at, locale)}
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