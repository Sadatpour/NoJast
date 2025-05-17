-- Create tables for Nojast application

-- Create users table to store user profiles
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Create upvotes table
CREATE TABLE public.upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- جدول تبلیغات سایدبار
CREATE TABLE if not exists banner_ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link text not null,
  sidebar text not null check (sidebar in ('main-left', 'main-right', 'product')),
  priority int not null default 0,
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default true,
  type text default 'banner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert initial categories
INSERT INTO public.categories (name, name_en, slug) VALUES
  ('هوش مصنوعی', 'AI', 'ai'),
  ('ابزارها', 'Tools', 'tools'),
  ('بازی‌ها', 'Games', 'games'),
  ('طراحی', 'Design', 'design'),
  ('توسعه', 'Development', 'development');

-- Create functions and triggers
-- Function to create a user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after signup
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users are viewable by everyone" 
ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE USING (auth.uid() = id);

-- Category policies
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- Product policies
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" 
ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Upvote policies
CREATE POLICY "Upvotes are viewable by everyone" 
ON public.upvotes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own upvotes" 
ON public.upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" 
ON public.upvotes FOR DELETE USING (auth.uid() = user_id);

-- Comment policies
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" 
ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create views and functions for better querying
-- Create a view to get products with upvote counts
CREATE OR REPLACE VIEW product_with_votes AS
SELECT 
  p.*,
  COUNT(u.id) AS upvote_count
FROM 
  products p
LEFT JOIN 
  upvotes u ON p.id = u.product_id
GROUP BY 
  p.id;

-- Function to check if a user has upvoted a product
CREATE OR REPLACE FUNCTION has_user_upvoted(product_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM upvotes
    WHERE product_id = product_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 