import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { SidebarBannerAds } from '@/components/sidebar/SidebarBannerAds';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <div className="flex-1 flex flex-col items-center">
        <div className="w-[85vw] max-w-[1600px] mx-auto hidden md:grid grid-cols-[300px_1fr_300px] gap-6 py-8 items-start">
          {/* سایدبار چپ */}
          <aside>
            <SidebarBannerAds sidebar="main-left" />
          </aside>
          {/* فقط محصولات وسط */}
          <main className="w-full max-w-full min-h-[70vh] flex flex-col items-center">
            {children}
          </main>
          {/* سایدبار راست */}
          <aside>
            <SidebarBannerAds sidebar="main-right" />
          </aside>
        </div>
        {/* فقط محتوای اصلی در موبایل */}
        <div className="md:hidden px-2 w-full">
          <main className="relative py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 