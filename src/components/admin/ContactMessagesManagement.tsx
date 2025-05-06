"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function ContactMessagesManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const supabase = createClient();

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("contact_messages")
        .select("*")
        .order("is_read", { ascending: true })
        .order("id", { ascending: false });
      if (filter === 'read') query = query.eq('is_read', true);
      if (filter === 'unread') query = query.eq('is_read', false);
      const { data, error } = await query;
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // realtime update
    const channel = supabase
      .channel("admin-contact-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => fetchMessages()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [filter]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      alert("خطا در حذف پیام");
    }
  };

  const handleToggleRead = async (id: string, isRead: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: !isRead })
        .eq("id", id);
      if (error) throw error;
      setMessages((prev) => prev.map((msg) => msg.id === id ? { ...msg, is_read: !isRead } : msg));
    } catch (error) {
      alert("خطا در تغییر وضعیت خوانده شده");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">پیام‌های ارتباط با ما</h2>
      <div className="flex gap-2 mb-4 items-center">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>همه</Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>خوانده نشده</Button>
        <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('read')}>خوانده شده</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>شماره تماس</TableHead>
              <TableHead>پیام</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
              <TableHead>تاریخ ارسال</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  هیچ پیامی ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.id} className={!msg.is_read ? "bg-yellow-50" : ""}>
                  <TableCell>{msg.name}</TableCell>
                  <TableCell>{msg.email}</TableCell>
                  <TableCell>{msg.phone || '-'}</TableCell>
                  <TableCell className="max-w-xs whitespace-pre-line break-words">
                    {msg.message.length > 100 && !expanded[msg.id] ? (
                      <>
                        {msg.message.slice(0, 100)}
                        <span className="block mt-1">
                          <button
                            type="button"
                            className="text-blue-600 hover:underline focus:outline-none"
                            style={{ fontSize: 14 }}
                            onClick={() => setExpanded(prev => ({ ...prev, [msg.id]: true }))}
                          >
                            مشاهده بیشتر
                          </button>
                        </span>
                      </>
                    ) : msg.message.length > 100 && expanded[msg.id] ? (
                      <>
                        {msg.message}
                        <span className="block mt-1">
                          <button
                            type="button"
                            className="text-blue-600 hover:underline focus:outline-none"
                            style={{ fontSize: 14 }}
                            onClick={() => setExpanded(prev => ({ ...prev, [msg.id]: false }))}
                          >
                            بستن
                          </button>
                        </span>
                      </>
                    ) : (
                      msg.message
                    )}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button
                      variant={msg.is_read ? "outline" : "default"}
                      size="sm"
                      className={msg.is_read ? "h-8 w-8 p-0" : "h-8 w-8 p-0 bg-blue-600 text-white"}
                      onClick={() => handleToggleRead(msg.id, msg.is_read)}
                      title={msg.is_read ? "علامت به عنوان خوانده نشده" : "علامت به عنوان خوانده شده"}
                    >
                      {msg.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">حذف</span>
                    </Button>
                  </TableCell>
                  <TableCell>{new Date(msg.created_at).toLocaleDateString("fa-IR")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 