import { createClient } from '@supabase/supabase-js'
import ReservationsPageClient from '@/components/ReservationsPageClient'

// Server-side data fetching for any initial data
async function getData() {
  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not configured')
    return {
      error: 'Database connection not configured'
    }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Any initial data fetching can go here
    return {
      error: null
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to load data'
    }
  }
}

export default async function ReservationsPage() {
  const { error } = await getData()

  return (
    <ReservationsPageClient error={error} />
  )
}