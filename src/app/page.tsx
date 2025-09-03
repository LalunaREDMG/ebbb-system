import Link from 'next/link'
import { ChefHat, Menu, X, Star, Clock, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import MobileMenu from '@/components/MobileMenu'
import HomePageClient from '@/components/HomePageClient'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  image_path: string | null
  category: string
  available: boolean
}

interface Announcement {
  id: string
  title: string
  content: string
  image_url: string | null
  published: boolean
  created_at: string
}

// Server-side data fetching
async function getData() {
  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not configured')
    return {
      products: [],
      announcements: [],
      error: 'Database connection not configured'
    }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Fetch products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })

    if (productsError) throw productsError

    // Fetch announcements
    const { data: announcementsData, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (announcementsError) throw announcementsError

    return {
      products: productsData || [],
      announcements: announcementsData || [],
      error: null
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      products: [],
      announcements: [],
      error: error instanceof Error ? error.message : 'Failed to load data'
    }
  }
}

export default async function HomePage() {
  const { products, announcements, error } = await getData()

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <HomePageClient 
      products={products}
      announcements={announcements}
      groupedProducts={groupedProducts}
      error={error}
    />
  )
}