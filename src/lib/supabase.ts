import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Database types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  image_path: string | null
  category: string
  menu_type?: string | null
  size_variants?: Record<string, number> | null
  is_signature?: boolean
  available: boolean
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  image_url: string | null
  image_path: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  party_size: number
  special_requests: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  username: string
  email: string
  full_name: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface AdminSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Database type definitions for Supabase
export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      announcements: {
        Row: Announcement
        Insert: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>
      }
      reservations: {
        Row: Reservation
        Insert: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Reservation, 'id' | 'created_at' | 'updated_at'>>
      }
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'> & { password_hash: string }
        Update: Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>
      }
      admin_sessions: {
        Row: AdminSession
        Insert: Omit<AdminSession, 'id' | 'created_at'>
        Update: Partial<Omit<AdminSession, 'id' | 'created_at'>>
      }
    }
  }
}