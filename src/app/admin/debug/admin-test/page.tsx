"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";

// Page for testing admin access - should be accessible by any logged in user
export default function AdminTestPage() {
  const [userId, setUserId] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [env, setEnv] = useState<any>({});
  const pathname = usePathname();
  const supabase = createClient();
  const { locale } = useLanguage();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        console.log("Fetching current user...");
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error fetching user:", error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        const user = data?.user;
        console.log("User data:", user);
        
        if (user) {
          setCurrentUser(user);
          setUserId(user.id);
          
          // Automatically test the current user's admin status when page loads
          testUserAdmin(user.id);
        } else {
          setError("No user found - not logged in");
          setLoading(false);
        }
        
        // Get environment info
        setEnv({
          url: window.location.href,
          pathname,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + "..." || "Not set",
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });
        
      } catch (error: any) {
        console.error("Error in useEffect:", error);
        setError(error.message || "Unknown error occurred");
        setLoading(false);
      }
    };
    
    getCurrentUser();
  }, [pathname]);

  const testUserAdmin = async (id: string) => {
    if (!id) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      console.log("Testing admin status for user:", id);
      
      // Check user in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, username, is_admin')
        .eq('id', id)
        .single();
      
      if (userError) {
        console.error("User data fetch error:", userError);
        setResult({
          success: false,
          error: 'Error fetching user data',
          details: userError
        });
        setLoading(false);
        return;
      }
      
      if (!userData) {
        console.error("User not found in database");
        setResult({
          success: false,
          error: 'User not found in users table'
        });
        setLoading(false);
        return;
      }
      
      console.log("User data:", userData);
      
      // User data retrieved successfully
      setResult({
        success: true,
        message: 'User details retrieved',
        user: userData,
        is_admin: !!userData.is_admin
      });
      
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setResult({
        success: false,
        error: 'Unexpected error',
        details: error.message || error
      });
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      console.log("Setting user as admin:", userId);
      const { data, error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error("Error making user admin:", error);
        setResult({
          success: false,
          error: 'Error making user admin',
          details: error
        });
      } else {
        console.log("Admin update successful:", data);
        setResult({
          success: true,
          message: 'User successfully made admin',
          data
        });
        
        // Refresh test
        testUserAdmin(userId);
      }
    } catch (error: any) {
      console.error("Unexpected error making admin:", error);
      setResult({
        success: false,
        error: 'Unexpected error making user admin',
        details: error.message || error
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !result && !error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {locale === 'fa' ? 'تست دسترسی ادمین' : 'Admin Access Test'}
      </h1>
      
      <div className="p-4 bg-green-50 text-green-700 rounded-md mb-4">
        <p className="font-bold">
          {locale === 'fa' 
            ? 'اگر شما این صفحه را می‌بینید، یعنی صفحه تست در دسترس است!' 
            : 'If you can see this page, the test page is accessible!'}
        </p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
          <p className="font-bold">{locale === 'fa' ? 'خطا' : 'Error'}</p>
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'fa' ? 'اطلاعات محیط' : 'Environment Info'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-50 p-4 rounded text-xs whitespace-pre-wrap">
            {JSON.stringify(env, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'fa' ? 'اطلاعات کاربر فعلی' : 'Current User Info'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {currentUser.id}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              {result && result.user && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p><strong>Username:</strong> {result.user.username}</p>
                  <p><strong>Full Name:</strong> {result.user.full_name}</p>
                  <p><strong>Admin Status:</strong> {result.user.is_admin ? '✅ Yes' : '❌ No'}</p>
                </div>
              )}
            </div>
          ) : (
            <p>{locale === 'fa' ? 'کاربری وارد سیستم نشده است' : 'No user logged in'}</p>
          )}
        </CardContent>
      </Card>
      
      {result && (
        <Card className={result.success ? "border-green-500" : "border-red-500"}>
          <CardHeader className="py-2">
            <CardTitle className="text-base">
              {result.success 
                ? (locale === 'fa' ? 'موفقیت' : 'Success')
                : (locale === 'fa' ? 'خطا' : 'Error')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-2 rounded-md overflow-auto text-xs whitespace-pre-wrap max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {currentUser && (!result?.user?.is_admin) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'fa' ? 'تبدیل به ادمین' : 'Make Admin'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={makeUserAdmin} disabled={loading}>
              {locale === 'fa' ? 'ادمین کردن' : 'Make Admin'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 