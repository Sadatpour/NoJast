"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/layout/Header";
import { User } from "@supabase/supabase-js";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        setForm((prev) => ({
          ...prev,
          name: data.user.user_metadata.full_name || "",
          email: data.user.email || "",
        }));
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "همه فیلدها الزامی هستند.",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert({ name: form.name, email: form.email, phone: form.phone, message: form.message, user_id: user?.id || null });
      if (error) throw error;
      setSuccess(true);
      setForm({ name: user?.user_metadata.full_name || "", email: user?.email || "", phone: "", message: "" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "مشکلی در ارسال پیام پیش آمده است.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background" style={{height: '90vh'}}>
      <Header user={user} />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg mx-auto py-12 px-4">
          {success ? (
            <div className="bg-green-100 text-green-800 rounded p-4 text-center mb-6">
              پیام شما با موفقیت ارسال شد. با تشکر!
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">ارتباط با ما</h1>
            <Input
              name="name"
              placeholder="نام شما"
              value={form.name}
              onChange={handleChange}
              disabled={loading || !!user}
            />
            <Input
              name="email"
              type="email"
              placeholder="ایمیل شما"
              value={form.email}
              onChange={handleChange}
              disabled={loading || !!user}
            />
            <Input
              name="phone"
              type="tel"
              placeholder="شماره تماس (اختیاری)"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
              className="text-right"
            />
            <Textarea
              name="message"
              placeholder="متن پیام شما"
              value={form.message}
              onChange={handleChange}
              rows={5}
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "در حال ارسال..." : "ارسال پیام"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
} 