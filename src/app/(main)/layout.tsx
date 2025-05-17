import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';

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
        <div className="w-[80%] max-w-[85%] mx-auto py-8 space-y-8">
          <main className="w-full min-h-[70vh] flex flex-col items-center">
            {children}
          </main>
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