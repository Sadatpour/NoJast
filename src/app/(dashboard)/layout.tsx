import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <div className="container flex-1 py-8">
        <main className="relative py-6">
          {children}
        </main>
      </div>
    </div>
  );
} 