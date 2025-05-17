"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Check, X, AlertTriangle, Eye } from "lucide-react"

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
import fa from '@/lib/date-locale'
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  title: string
  slug: string
  thumbnail_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string
  users: {
    full_name: string
  }
}

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          slug,
          thumbnail_url,
          status,
          created_at,
          user_id,
          users:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
      
      // Apply filter
      if (filter !== "all") {
        query = query.eq('status', filter)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setProducts(data || [])
    } catch (error: any) {
      console.error('Error fetching products:', error.message, error.details, error.hint)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    
    // Set up realtime subscription for products
    const channel = supabase
      .channel('admin-products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchProducts()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'approved' })
        .eq('id', id)
      
      if (error) throw error
      
      // Get product and user details for notification
      const { data: product } = await supabase
        .from('products')
        .select('user_id, title, slug')
        .eq('id', id)
        .single()
      
      if (product) {
        // Create notification
        await supabase.from('notifications').insert({
          user_id: product.user_id,
          type: 'system',
          message: `محصول شما "${product.title}" تایید شد!`,
          link_url: `/products/${product.slug}`,
          is_read: false
        })
      }
      
      toast({
        title: "محصول تایید شد",
        description: "محصول با موفقیت تایید شد و در سایت نمایش داده خواهد شد.",
      })
      
      fetchProducts()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در تایید محصول پیش آمده است.",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'rejected' })
        .eq('id', id)
      
      if (error) throw error
      
      // Get product and user details for notification
      const { data: product } = await supabase
        .from('products')
        .select('user_id, title, slug')
        .eq('id', id)
        .single()
      
      if (product) {
        // Create notification
        await supabase.from('notifications').insert({
          user_id: product.user_id,
          type: 'system',
          message: `محصول شما "${product.title}" رد شد.`,
          link_url: `/products/${product.slug}`,
          is_read: false
        })
      }
      
      toast({
        title: "محصول رد شد",
        description: "محصول با موفقیت رد شد و در سایت نمایش داده نخواهد شد.",
      })
      
      fetchProducts()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در رد محصول پیش آمده است.",
      })
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }
  
  const statusLabels = {
    pending: "در انتظار تایید",
    approved: "تایید شده",
    rejected: "رد شده",
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">مدیریت محصولات</h2>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه محصولات</SelectItem>
            <SelectItem value="pending">در انتظار تایید</SelectItem>
            <SelectItem value="approved">تایید شده</SelectItem>
            <SelectItem value="rejected">رد شده</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">تصویر</TableHead>
              <TableHead>عنوان</TableHead>
              <TableHead>ارسال کننده</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 rounded-md overflow-hidden">
                      <Image
                        src={product.thumbnail_url || "https://placehold.co/100"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.users.full_name}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(product.created_at), {
                      addSuffix: true,
                      locale: fa,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[product.status]}>
                      {statusLabels[product.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/products/${product.slug}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">مشاهده</span>
                      </Button>
                      
                      {product.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() => handleApprove(product.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">تایید</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleReject(product.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">رد</span>
                          </Button>
                        </>
                      )}
                      
                      {product.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => handleReject(product.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">رد</span>
                        </Button>
                      )}
                      
                      {product.status === 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={() => handleApprove(product.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">تایید</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-right">
                  هیچ محصولی یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 