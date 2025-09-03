'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDBPage() {
  const [dbStatus, setDbStatus] = useState('Testing...')
  const [adminUser, setAdminUser] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const testDatabase = async () => {
      try {
        if (!supabase) {
          setError('Supabase client is not configured')
          setDbStatus('Supabase not configured')
          return
        }

        setDbStatus('Testing database connection...')
        
        // Test 1: Check if we can connect to Supabase
        const { data: testData, error: testError } = await supabase
          .from('admin_users')
          .select('count')
          .limit(1)
        
        if (testError) {
          setError(`Database connection failed: ${testError.message}`)
          setDbStatus('Failed to connect to database')
          return
        }
        
        setDbStatus('Database connected, checking admin user...')
        
        // Test 2: Check if admin user exists
        const { data: user, error: userError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', 'admin')
          .single()
        
        if (userError) {
          setError(`Admin user not found: ${userError.message}`)
          setDbStatus('Admin user does not exist')
          return
        }
        
        setAdminUser(user)
        setDbStatus('Admin user found!')
        
      } catch (error) {
        console.error('Database test error:', error)
        setError(`Test failed: ${error}`)
        setDbStatus('Test failed')
      }
    }

    testDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Database Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Database Status:</h2>
            <p className="text-sm">{dbStatus}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-red-800">Error:</h2>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {adminUser && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-green-800">Admin User Found:</h2>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Username:</strong> {adminUser.username}</p>
                <p><strong>Email:</strong> {adminUser.email}</p>
                <p><strong>Full Name:</strong> {adminUser.full_name}</p>
                <p><strong>Role:</strong> {adminUser.role}</p>
                <p><strong>Active:</strong> {adminUser.is_active ? 'Yes' : 'No'}</p>
                <p><strong>Password Hash:</strong> {adminUser.password_hash ? 'Set' : 'Not set'}</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-yellow-800">Next Steps:</h2>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>If admin user is not found, run the database setup script</li>
              <li>If admin user exists but login fails, check password hashing</li>
              <li>Check browser console for detailed error messages</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 