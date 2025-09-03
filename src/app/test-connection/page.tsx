'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestConnection() {
  const [status, setStatus] = useState('Testing connection...')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError('Environment variables not configured')
          setStatus('Failed')
          return
        }

        setStatus('Creating Supabase client...')
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        setStatus('Testing database connection...')
        const { data, error } = await supabase
          .from('products')
          .select('count')
          .limit(1)

        if (error) {
          setError(`Database error: ${error.message}`)
          setStatus('Failed')
          return
        }

        setData(data)
        setStatus('Connection successful!')
      } catch (err) {
        setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setStatus('Failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Status:</h2>
            <p className="text-sm">{status}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-red-800">Error:</h2>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {data && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-green-800">Success:</h2>
              <p className="text-sm text-green-700">Database connection working!</p>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-yellow-800">Environment Variables:</h2>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
