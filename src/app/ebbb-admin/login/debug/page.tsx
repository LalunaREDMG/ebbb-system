'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState<string>('Checking...')
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...')

  useEffect(() => {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      setEnvStatus('✅ Environment variables are set')
    } else {
      setEnvStatus('❌ Environment variables are missing')
    }

    // Check if Supabase client can be created
    try {
      const { createClient } = require('@supabase/supabase-js')
      if (supabaseUrl && supabaseKey) {
        const client = createClient(supabaseUrl, supabaseKey)
        setSupabaseStatus('✅ Supabase client created successfully')
      } else {
        setSupabaseStatus('❌ Cannot create Supabase client - missing env vars')
      }
    } catch (error) {
      setSupabaseStatus(`❌ Error creating Supabase client: ${error}`)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Environment Variables</h2>
            <p>{envStatus}</p>
            <p className="text-sm text-gray-600 mt-2">
              NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold mb-2">Supabase Client</h2>
            <p>{supabaseStatus}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold mb-2">Instructions</h2>
            <p className="text-sm">
              To fix the blank login page, you need to:
            </p>
            <ol className="text-sm list-decimal list-inside mt-2 space-y-1">
              <li>Create a <code>.env.local</code> file in the project root</li>
              <li>Add your Supabase credentials:</li>
              <li className="ml-4">
                <code>NEXT_PUBLIC_SUPABASE_URL=your-project-url</code>
              </li>
              <li className="ml-4">
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</code>
              </li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 