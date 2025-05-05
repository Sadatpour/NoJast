"use client";

import { createClient } from '@/lib/supabase/client';

const updateSchema = async () => {
  const supabase = createClient();
  console.log('Updating database schema...');
  
  try {
    // Add is_approved column to products table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_string: 'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;'
    });
    
    if (alterError) {
      console.error('Error adding is_approved column:', alterError);
      throw alterError;
    }
    
    console.log('Added is_approved column to products table');
    
    // Create admin policies
    const adminUpdatePolicyQuery = `
      CREATE POLICY IF NOT EXISTS "Admins can update product approval status" 
      ON public.products 
      FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid() AND users.is_admin = true
        )
      );
    `;
    
    const { error: policyError1 } = await supabase.rpc('exec_sql', {
      sql_string: adminUpdatePolicyQuery
    });
    
    if (policyError1) {
      console.error('Error creating admin update policy:', policyError1);
      // Don't throw here, we can continue with the next policy
    } else {
      console.log('Created admin update policy');
    }
    
    const adminViewPolicyQuery = `
      CREATE POLICY IF NOT EXISTS "Admins can view all products" 
      ON public.products 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid() AND users.is_admin = true
        )
      );
    `;
    
    const { error: policyError2 } = await supabase.rpc('exec_sql', {
      sql_string: adminViewPolicyQuery
    });
    
    if (policyError2) {
      console.error('Error creating admin view policy:', policyError2);
    } else {
      console.log('Created admin view policy');
    }
    
    console.log('Schema update completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Schema update failed:', error);
    return { success: false, error };
  }
};

export default updateSchema; 