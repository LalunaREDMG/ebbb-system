'use server'

import { createClient } from '@supabase/supabase-js'

interface ReservationData {
  name: string
  email: string
  phone: string
  date: string
  time: string
  party_size: number
  special_requests: string
}

export async function createReservation(data: ReservationData) {
  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not configured')
    return { 
      success: false, 
      error: 'Database connection not configured' 
    }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const { error } = await supabase
      .from('reservations')
      .insert([data])

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error creating reservation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create reservation' 
    }
  }
} 