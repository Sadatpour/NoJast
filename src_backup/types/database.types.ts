export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          name_en: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string
          slug?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          user_id: string
          product_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          product_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          product_id?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          title: string
          title_en: string | null
          description: string
          description_en: string | null
          url: string
          thumbnail_url: string
          user_id: string
          category_id: string
          created_at: string
          updated_at: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          title: string
          title_en?: string | null
          description: string
          description_en?: string | null
          url: string
          thumbnail_url: string
          user_id: string
          category_id: string
          created_at?: string
          updated_at?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          title_en?: string | null
          description?: string
          description_en?: string | null
          url?: string
          thumbnail_url?: string
          user_id?: string
          category_id?: string
          created_at?: string
          updated_at?: string | null
          tags?: string[] | null
        }
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          username: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Define common types for use throughout the application
export type User = Tables<'users'>
export type Product = Tables<'products'>
export type Category = Tables<'categories'>
export type Comment = Tables<'comments'>
export type Upvote = Tables<'upvotes'>

// Define composite types
export type ProductWithDetails = Product & {
  user: Pick<User, 'id' | 'full_name' | 'username' | 'avatar_url'> | null
  upvote_count: number
  category: Pick<Category, 'id' | 'name' | 'name_en' | 'slug'>
  user_has_upvoted?: boolean
}

export type CommentWithUser = Comment & {
  user: Pick<User, 'id' | 'full_name' | 'username' | 'avatar_url'>
} 