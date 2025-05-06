import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfileRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch username from users table
  const { data: profile } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single();

  if (!profile?.username) {
    // If no username, create a new user record with default values
    const defaultUsername = `user_${user.id.substring(0, 8)}`;
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        username: defaultUsername,
        full_name: user.user_metadata.full_name || defaultUsername,
        avatar_url: user.user_metadata.avatar_url || null,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating user profile:', error);
      // Handle error, maybe redirect to an error page
      redirect('/error');
    }

    redirect(`/u/${defaultUsername}`);
  }

  redirect(`/u/${profile.username}`);
  return null;
} 