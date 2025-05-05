"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Mail, UserCog, Shield, Lock, User } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface User {
  id: string
  email: string
  full_name: string
  username: string
  avatar_url: string | null
  is_admin: boolean
  is_blocked: boolean
  created_at: string
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Apply filter
      if (filter === "admin") {
        query = query.eq('is_admin', true)
      } else if (filter === "blocked") {
        query = query.eq('is_blocked', true)
      } else if (filter === "regular") {
        query = query.eq('is_admin', false).eq('is_blocked', false)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    
    // Set up realtime subscription for users
    const channel = supabase
      .channel('admin-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchUsers()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const handleMakeAdmin = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: "کاربر مدیر شد",
        description: "کاربر با موفقیت به عنوان مدیر تعیین شد.",
      })
      
      fetchUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در ارتقاء کاربر پیش آمده است.",
      })
    }
  }

  const handleRemoveAdmin = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: "دسترسی مدیر حذف شد",
        description: "دسترسی مدیریت با موفقیت از کاربر گرفته شد.",
      })
      
      fetchUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در حذف دسترسی مدیر پیش آمده است.",
      })
    }
  }

  const handleBlockUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: true })
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: "کاربر مسدود شد",
        description: "کاربر با موفقیت مسدود شد.",
      })
      
      fetchUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در مسدود کردن کاربر پیش آمده است.",
      })
    }
  }

  const handleUnblockUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: false })
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: "کاربر آزاد شد",
        description: "کاربر با موفقیت از حالت مسدود خارج شد.",
      })
      
      fetchUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در آزاد کردن کاربر پیش آمده است.",
      })
    }
  }

  const getUserStatusBadge = (user: User) => {
    if (user.is_blocked) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          مسدود شده
        </Badge>
      )
    } else if (user.is_admin) {
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          مدیر
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          کاربر عادی
        </Badge>
      )
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">مدیریت کاربران</h2>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه کاربران</SelectItem>
            <SelectItem value="admin">مدیران</SelectItem>
            <SelectItem value="regular">کاربران عادی</SelectItem>
            <SelectItem value="blocked">کاربران مسدود</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">آواتار</TableHead>
              <TableHead>نام</TableHead>
              <TableHead>نام کاربری</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>تاریخ عضویت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                  <TableCell>@{user.username || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                      locale: fa,
                    })}
                  </TableCell>
                  <TableCell>
                    {getUserStatusBadge(user)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDialogOpen(true)
                        }}
                      >
                        <UserCog className="h-4 w-4" />
                        <span className="sr-only">مدیریت</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/u/${user.username}`)}
                      >
                        <User className="h-4 w-4" />
                        <span className="sr-only">پروفایل</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  هیچ کاربری یافت نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>مدیریت کاربر</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {selectedUser.avatar_url ? (
                    <Image
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium">{selectedUser.full_name || '-'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{selectedUser.username || '-'}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Mail className="mr-1 h-3 w-3" />
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {selectedUser.is_admin ? (
                  <Button 
                    variant="outline" 
                    onClick={() => handleRemoveAdmin(selectedUser.id)}
                    className="justify-start"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    حذف دسترسی مدیر
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => handleMakeAdmin(selectedUser.id)}
                    className="justify-start"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    تعیین به عنوان مدیر
                  </Button>
                )}
                
                {selectedUser.is_blocked ? (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUnblockUser(selectedUser.id)}
                    className="justify-start"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    رفع مسدودی کاربر
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => handleBlockUser(selectedUser.id)}
                    className="justify-start text-red-600 hover:text-red-700"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    مسدود کردن کاربر
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/u/${selectedUser.username}`)}
                  className="justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  مشاهده پروفایل
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 