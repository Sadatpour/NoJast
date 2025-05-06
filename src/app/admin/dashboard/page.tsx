import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // دریافت اطلاعات ادمین
  const { data: adminProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single();

  if (!user || !(adminProfile?.role === 'admin' || adminProfile?.is_admin)) {
    redirect('/');
  }

  // آمار کلی
  const { count: usersCount } = await supabase.from('users').select('id', { count: 'exact', head: true });
  const { count: productsCount } = await supabase.from('products').select('id', { count: 'exact', head: true });
  const { count: pendingProductsCount } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_approved', false);
  const { count: pendingCommentsCount } = await supabase.from('comments').select('id', { count: 'exact', head: true }).eq('is_approved', false);
  const { count: adsCount } = await supabase.from('ads').select('id', { count: 'exact', head: true });

  // محصولات در انتظار تایید
  const { data: pendingProducts } = await supabase.from('products').select('*').eq('is_approved', false);
  // نظرات در انتظار تایید
  const { data: pendingComments } = await supabase.from('comments').select('*').eq('is_approved', false);
  // تبلیغات
  const { data: ads } = await supabase.from('ads').select('*');

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">داشبورد مدیریت</h1>
      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold">{usersCount ?? 0}</span>
          <span className="text-gray-500 text-sm">تعداد کاربران</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold">{productsCount ?? 0}</span>
          <span className="text-gray-500 text-sm">تعداد محصولات</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold">{pendingProductsCount ?? 0}</span>
          <span className="text-gray-500 text-sm">محصولات در انتظار تایید</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-lg font-bold">{pendingCommentsCount ?? 0}</span>
          <span className="text-gray-500 text-sm">نظرات در انتظار تایید</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center col-span-2 md:col-span-1">
          <span className="text-lg font-bold">{adsCount ?? 0}</span>
          <span className="text-gray-500 text-sm">تعداد تبلیغات</span>
        </div>
      </div>

      {/* مدیریت محصولات */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">محصولات در انتظار تایید</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="p-2">عنوان محصول</th>
                <th className="p-2">کاربر ثبت‌کننده</th>
                <th className="p-2">تاریخ ثبت</th>
                <th className="p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts?.length ? pendingProducts.map(product => (
                <tr key={product.id} className="border-b">
                  <td className="p-2">{product.title}</td>
                  <td className="p-2">{product.user_id}</td>
                  <td className="p-2">{new Date(product.created_at).toLocaleDateString('fa-IR')}</td>
                  <td className="p-2 flex gap-2">
                    <form action={`/api/admin/products/approve?id=${product.id}`} method="POST">
                      <Button type="submit" size="sm" variant="success">تایید</Button>
                    </form>
                    <form action={`/api/admin/products/reject?id=${product.id}`} method="POST">
                      <Button type="submit" size="sm" variant="destructive">رد</Button>
                    </form>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center p-4">محصولی در انتظار تایید نیست.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* مدیریت نظرات */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">نظرات در انتظار تایید</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="p-2">متن نظر</th>
                <th className="p-2">کاربر ثبت‌کننده</th>
                <th className="p-2">محصول مربوطه</th>
                <th className="p-2">تاریخ ثبت</th>
                <th className="p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pendingComments?.length ? pendingComments.map(comment => (
                <tr key={comment.id} className="border-b">
                  <td className="p-2">{comment.text}</td>
                  <td className="p-2">{comment.user_id}</td>
                  <td className="p-2">{comment.product_id}</td>
                  <td className="p-2">{new Date(comment.created_at).toLocaleDateString('fa-IR')}</td>
                  <td className="p-2 flex gap-2">
                    <form action={`/api/admin/comments/approve?id=${comment.id}`} method="POST">
                      <Button type="submit" size="sm" variant="success">تایید</Button>
                    </form>
                    <form action={`/api/admin/comments/reject?id=${comment.id}`} method="POST">
                      <Button type="submit" size="sm" variant="destructive">رد</Button>
                    </form>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center p-4">نظری در انتظار تایید نیست.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* مدیریت تبلیغات */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">مدیریت تبلیغات</h2>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="p-2">عنوان تبلیغ</th>
                <th className="p-2">لینک تبلیغ</th>
                <th className="p-2">تصویر تبلیغ</th>
                <th className="p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {ads?.length ? ads.map(ad => (
                <tr key={ad.id} className="border-b">
                  <td className="p-2">{ad.title}</td>
                  <td className="p-2"><a href={ad.link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">مشاهده</a></td>
                  <td className="p-2">
                    {ad.image_url && <img src={ad.image_url} alt={ad.title} className="w-16 h-10 object-cover rounded" />}
                  </td>
                  <td className="p-2">
                    <form action={`/api/admin/ads/delete?id=${ad.id}`} method="POST">
                      <Button type="submit" size="sm" variant="destructive">حذف</Button>
                    </form>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center p-4">تبلیغی ثبت نشده است.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* فرم افزودن تبلیغ */}
        <form action="/api/admin/ads/add" method="POST" className="flex flex-col md:flex-row gap-2 items-center">
          <input name="title" placeholder="عنوان تبلیغ" className="input input-bordered" required />
          <input name="link" placeholder="لینک تبلیغ" className="input input-bordered" required />
          <input name="image_url" placeholder="آدرس تصویر تبلیغ" className="input input-bordered" required />
          <Button type="submit" variant="primary">افزودن تبلیغ</Button>
        </form>
      </section>
    </div>
  );
} 