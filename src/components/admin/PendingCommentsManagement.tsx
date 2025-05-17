"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import fa from '@/lib/date-locale'
import { useToast } from "@/components/ui/use-toast";
import { Check, X, Eye } from "lucide-react";

interface PendingComment {
  id: string;
  user_id: string;
  product_id: string;
  text: string;
  created_at: string;
  is_approved: boolean;
  products: {
    id: string;
    title: string;
    slug: string;
  };
  users: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

export function PendingCommentsManagement() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, products(id, title, slug), users(id, full_name, username, avatar_url)`)
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // realtime update
    const channel = supabase
      .channel("admin-pending-comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchComments()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "نظر تایید شد", description: "نظر با موفقیت تایید شد." });
      fetchComments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در تایید نظر پیش آمده است.",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "نظر حذف شد", description: "نظر با موفقیت حذف شد." });
      fetchComments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در حذف نظر پیش آمده است.",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">نظرات در انتظار تایید</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>محصول</TableHead>
              <TableHead>متن نظر</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : comments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  هیچ نظری در انتظار تایید نیست
                </TableCell>
              </TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>{comment.users?.full_name || comment.users?.username || "-"}</TableCell>
                  <TableCell>{comment.products?.title || "-"}</TableCell>
                  <TableCell>{comment.text}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: fa,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleApprove(comment.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">تایید</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => handleReject(comment.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">رد</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 