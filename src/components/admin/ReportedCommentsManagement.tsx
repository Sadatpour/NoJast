"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Check, X, Flag, ExternalLink } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { fa } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"

interface ReportedComment {
  id: string
  report_id: string
  report_reason: string
  reported_at: string
  comment_id: string
  comment_text: string
  comment_created_at: string
  product_id: string
  product_title: string
  product_slug: string
  user_id: string
  user_full_name: string
  user_avatar_url: string | null
  reporter_id: string
  reporter_full_name: string
}

export function ReportedCommentsManagement() {
  const [reports, setReports] = useState<ReportedComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("pending")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      // Using a custom view/function to join all the needed tables
      let query = supabase
        .rpc('get_reported_comments')
        
      // Apply filter
      if (filter === "pending") {
        query = query.eq('status', 'pending')
      } else if (filter === "resolved") {
        query = query.eq('status', 'resolved')
      } else if (filter === "rejected") {
        query = query.eq('status', 'rejected')
      }
      
      const { data, error } = await query
        .order('reported_at', { ascending: false })
      
      if (error) throw error
      
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reported comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
    
    // Set up realtime subscription
    const channel = supabase
      .channel('admin-reported-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_reports',
        },
        () => {
          fetchReports()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const handleApproveReport = async (reportId: string, commentId: string) => {
    try {
      // Begin transaction
      // 1. Update the report status
      const { error: reportError } = await supabase
        .from('comment_reports')
        .update({ status: 'resolved' })
        .eq('id', reportId)
      
      if (reportError) throw reportError
      
      // 2. Delete the reported comment
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
      
      if (deleteError) throw deleteError
      
      toast({
        title: "گزارش تایید شد",
        description: "گزارش تایید و نظر حذف شد.",
      })
      
      fetchReports()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در تایید گزارش پیش آمده است.",
      })
    }
  }

  const handleRejectReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('comment_reports')
        .update({ status: 'rejected' })
        .eq('id', reportId)
      
      if (error) throw error
      
      toast({
        title: "گزارش رد شد",
        description: "گزارش رد شد و نظر در سایت باقی می‌ماند.",
      })
      
      fetchReports()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در رد گزارش پیش آمده است.",
      })
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }
  
  const statusLabels = {
    pending: "در انتظار بررسی",
    resolved: "تایید شده",
    rejected: "رد شده",
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">مدیریت نظرات گزارش شده</h2>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">در انتظار بررسی</SelectItem>
            <SelectItem value="resolved">تایید شده</SelectItem>
            <SelectItem value="rejected">رد شده</SelectItem>
            <SelectItem value="all">همه گزارش‌ها</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>متن نظر</TableHead>
              <TableHead>دلیل گزارش</TableHead>
              <TableHead>محصول</TableHead>
              <TableHead>کاربر</TableHead>
              <TableHead>گزارش‌دهنده</TableHead>
              <TableHead>تاریخ گزارش</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report.report_id}>
                  <TableCell className="font-medium max-w-[200px]">
                    {truncateText(report.comment_text, 50)}
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {truncateText(report.report_reason, 30)}
                  </TableCell>
                  <TableCell>
                    <a 
                      href={`/products/${report.product_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary"
                    >
                      {truncateText(report.product_title, 20)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <div className="relative h-6 w-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {report.user_avatar_url ? (
                        <Image
                          src={report.user_avatar_url}
                          alt={report.user_full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 dark:bg-gray-700"></div>
                      )}
                    </div>
                    <span>{truncateText(report.user_full_name, 15)}</span>
                  </TableCell>
                  <TableCell>{truncateText(report.reporter_full_name, 15)}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(report.reported_at), {
                      addSuffix: true,
                      locale: fa,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[report.status]}>
                      {statusLabels[report.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() => handleApproveReport(report.report_id, report.comment_id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">تایید</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleRejectReport(report.report_id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">رد</span>
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/products/${report.product_slug}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">مشاهده</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  هیچ گزارشی یافت نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 