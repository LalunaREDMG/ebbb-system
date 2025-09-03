import { createClient } from '@supabase/supabase-js'
import { ChefHat, ArrowLeft, Star, Filter } from 'lucide-react'
import Link from 'next/link'
import MenuPageClient from '@/components/MenuPageClient'

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

// Server-side data fetching
async function getData() {
  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not configured')
    return {
      products: [],
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

    return {
      products: productsData || [],
      error: null
    }
    } catch (error) {
      console.error('Error fetching data:', error)
    return {
      products: [],
      error: error instanceof Error ? error.message : 'Failed to load data'
    }
  }
}

export default async function MenuPage() {
  const { products, error } = await getData()

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <MenuPageClient 
      products={products}
      groupedProducts={groupedProducts}
      error={error}
    />
  )
} 