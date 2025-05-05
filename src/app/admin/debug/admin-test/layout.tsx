import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Layout for test page - minimal check to ensure user is logged in
export default async function AdminTestLayout({
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
    <div className="container py-8">
      <div className="mx-auto max-w-5xl">
        {children}
      </div>
    </div>
  );
} 