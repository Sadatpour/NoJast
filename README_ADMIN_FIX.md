# اصلاح مشکل دسترسی پنل ادمین

برای حل مشکل دسترسی به پنل ادمین، باید ستون های مورد نیاز به جداول دیتابیس در Supabase اضافه شوند و سپس کاربر مورد نظر به عنوان ادمین تعیین شود.

## مراحل اصلاح

### ۱. اضافه کردن ستون‌های لازم به دیتابیس

1. به پنل ادمین Supabase در آدرس زیر بروید:
   https://supabase.com/dashboard/project/xfckkfrfkwiymksbqnjn/sql

2. یک Query جدید ایجاد کنید و کد SQL زیر را در آن قرار دهید:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;
```

3. دکمه Run را بزنید تا کوئری اجرا شود.

### ۲. تعیین کاربر به عنوان ادمین

1. به بخش Table Editor در Supabase بروید:
   https://supabase.com/dashboard/project/xfckkfrfkwiymksbqnjn/editor

2. جدول `users` را انتخاب کنید.

3. کاربری که می‌خواهید ادمین باشد را پیدا کنید و ستون `is_admin` آن را به `true` تغییر دهید.

4. تغییرات را ذخیره کنید.

### ۳. تست پنل ادمین

پس از انجام تغییرات بالا، به آدرس زیر بروید:
   `https://your-website.com/admin`

اکنون باید بتوانید به پنل ادمین دسترسی داشته باشید و تمام بخش‌های آن را مشاهده کنید.

## نکات مهم

1. در برنامه شما دو مسیر مختلف برای پنل ادمین وجود دارد:
   - مسیر `/admin` (پنل ادمین اصلی با داشبورد)
   - مسیر `/(admin)/admin` (مسیر گروه‌بندی شده)

2. بعد از اجرای SQL و تنظیم کاربر ادمین، هر دو مسیر باید به درستی کار کنند.

3. اگر هنوز مشکل دارید، مطمئن شوید که:
   - مرورگر خود را رفرش کرده‌اید
   - از اکانتی که `is_admin` آن به `true` تغییر داده شده، استفاده می‌کنید
   - کوکی‌های مرورگر خود را پاک کرده و دوباره لاگین کرده‌اید

## علت خطا

مشکل به دلیل ناهماهنگی بین کد برنامه و ساختار دیتابیس رخ داده بود. در کد برنامه، بررسی دسترسی ادمین با استفاده از فیلد `is_admin` در جدول `users` انجام می‌شد، اما این فیلد در دیتابیس وجود نداشت. 