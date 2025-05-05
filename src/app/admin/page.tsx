"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    products: 0,
    users: 0,
    pendingProducts: 0,
    activeAds: 0
  });
  const supabase = createClient();
  const { locale } = useLanguage();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const { data } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        setIsAdmin(!!data?.is_admin);
        
        if (data?.is_admin) {
          // Fetch counts
          const [
            { count: productsCount }, 
            { count: usersCount },
            { count: pendingProductsCount },
            { count: adsCount }
          ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_approved', false),
            supabase.from('banner_ads').select('*', { count: 'exact', head: true }).eq('is_active', true)
          ]);
          
          setCounts({
            products: productsCount || 0,
            users: usersCount || 0,
            pendingProducts: pendingProductsCount || 0,
            activeAds: adsCount || 0
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {locale === 'fa' ? "دسترسی محدود" : "Access Denied"}
        </AlertTitle>
        <AlertDescription>
          {locale === 'fa' 
            ? "شما دسترسی به پنل مدیریت را ندارید. لطفاً با مدیر سیستم تماس بگیرید."
            : "You don't have access to the admin panel. Please contact the system administrator."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">
        {locale === 'fa' ? "داشبورد مدیریت" : "Admin Dashboard"}
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {counts.products}
            </CardTitle>
            <CardDescription>
              {locale === 'fa' ? "محصولات" : "Products"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products">
                {locale === 'fa' ? "مدیریت محصولات" : "Manage Products"}
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {counts.pendingProducts}
            </CardTitle>
            <CardDescription>
              {locale === 'fa' ? "محصولات در انتظار تایید" : "Pending Products"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/direct-approve">
                {locale === 'fa' ? "تایید مستقیم" : "Direct Approval"}
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {counts.activeAds}
            </CardTitle>
            <CardDescription>
              {locale === 'fa' ? "تبلیغات فعال" : "Active Ads"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/banner-ads">
                {locale === 'fa' ? "مدیریت تبلیغات" : "Manage Ads"}
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {counts.users}
            </CardTitle>
            <CardDescription>
              {locale === 'fa' ? "کاربران" : "Users"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {locale === 'fa' ? "تعداد کل کاربران در سیستم" : "Total users in the system"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 