-- Add is_approved column to products table with default value of false
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Update existing products to have is_approved set to true (if you want them all approved)
-- Comment this out if you want all existing products to remain unapproved
-- UPDATE public.products SET is_approved = true;

-- Create an admin RLS policy to allow admins to update approval status
CREATE POLICY "Admins can update product approval status" 
ON public.products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- Display all products for admin users
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
); 