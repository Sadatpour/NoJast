import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { createServerClient } from '@supabase/ssr'

// تنظیمات محدودیت نرخ درخواست
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 10000, // افزایش سقف برای تست
}

// ذخیره‌سازی درخواست‌ها
const requestStore = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(request: NextRequest) {
  // اگر کاربر ادمین است، محدودیت اعمال نشود
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {}
      }
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // فرض بر این که نقش کاربر در user.role ذخیره شده است
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (userData && userData.role === 'admin') {
      return null; // بدون محدودیت برای ادمین
    }
  }

  const ip = request.ip ?? 'anonymous'
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowMs

  // پاک کردن درخواست‌های قدیمی
  for (const [key, value] of requestStore.entries()) {
    if (value.resetTime < windowStart) {
      requestStore.delete(key)
    }
  }

  // بررسی محدودیت نرخ درخواست
  const requestData = requestStore.get(ip) ?? { count: 0, resetTime: now }
  
  if (requestData.count >= RATE_LIMIT.max) {
    logger.warn(`محدودیت نرخ درخواست برای IP: ${ip}`)
    return new NextResponse(
      JSON.stringify({
        error: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '900', // 15 دقیقه
        },
      }
    )
  }

  // افزایش شمارنده درخواست
  requestStore.set(ip, {
    count: requestData.count + 1,
    resetTime: now,
  })

  return null
} 