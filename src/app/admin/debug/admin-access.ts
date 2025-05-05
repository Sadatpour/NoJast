import { createClient } from '@/lib/supabase/server';

export async function checkAdminAccess(userId: string) {
  console.log('Starting admin access check...');
  
  try {
    // Create Supabase client
    const supabase = await createClient();
    console.log('Supabase client created successfully');
    
    // Get the user from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.error('Error fetching user from auth:', authError);
      return { success: false, error: 'Auth error', details: authError };
    }
    
    console.log('Auth user fetched successfully:', authUser?.user?.email);
    
    // Check user in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, username, is_admin')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      return { success: false, error: 'User data error', details: userError };
    }
    
    if (!userData) {
      console.error('User not found in users table');
      return { success: false, error: 'User not found' };
    }
    
    console.log('User data fetched successfully:', {
      id: userData.id,
      name: userData.full_name,
      username: userData.username,
      is_admin: userData.is_admin
    });
    
    // Check if is_admin column exists and is set
    if (userData.is_admin === undefined) {
      console.error('is_admin column does not exist or is null');
      return { success: false, error: 'is_admin column issue' };
    }
    
    if (!userData.is_admin) {
      console.error('User is not an admin');
      return { success: false, error: 'Not admin', user: userData };
    }
    
    // User is admin!
    console.log('User is confirmed as admin');
    return { success: true, user: userData };
    
  } catch (error) {
    console.error('Unexpected error during admin check:', error);
    return { success: false, error: 'Unexpected error', details: error };
  }
} 